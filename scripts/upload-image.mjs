#!/usr/bin/env node
/**
 * 블로그 이미지 → DCS AI S3 업로드 (작성자 도구)
 *
 * 이미지는 git 에 넣지 않는다. 이 스크립트로 S3 에 올리고, 출력된 URL 을
 * 마크다운에 그대로 붙여 쓴다.  (텍스트 글은 계속 git 에 둔다 — 결정 A)
 *
 * 사용법:
 *   S3_API_KEY=<키> node scripts/upload-image.mjs <로컬-이미지경로> [하위경로]
 *
 * 예:
 *   S3_API_KEY=xxx node scripts/upload-image.mjs ~/Desktop/arch.png
 *   S3_API_KEY=xxx node scripts/upload-image.mjs ./diagram.png posts/offline-sync
 *
 * 의존성 없음 (Node 18+ 내장 fetch/fs 사용).
 *
 * ⚠️ S3_API_KEY 는 DCS AI 담당자에게 발급받는다 (DCS AI QnA 채널). git 에 커밋 금지.
 */
import { readFile } from 'node:fs/promises';
import { basename, extname } from 'node:path';
import { createHash } from 'node:crypto';

const S3_API_BASE = process.env.S3_API_BASE_URL
  || 'https://aviyup1kyk.execute-api.ap-northeast-2.amazonaws.com/prod';
const S3_BUCKET = process.env.S3_BUCKET || 'svc-fnf-ax-platform-pub-s3';
const S3_API_KEY = process.env.S3_API_KEY;
const SERVICE = 'aie-app-blog';
const ENV = 'prd';

const CONTENT_TYPES = {
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.svg': 'image/svg+xml', '.webp': 'image/webp',
  '.avif': 'image/avif',
};

function die(msg) {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
}

const [, , filePath, subdir = 'images'] = process.argv;
if (!filePath) die('사용법: S3_API_KEY=<키> node scripts/upload-image.mjs <이미지경로> [하위경로]');
if (!S3_API_KEY) die('S3_API_KEY 환경변수가 없습니다. DCS AI 담당자에게 발급받아 주세요.');

const ext = extname(filePath).toLowerCase();
const contentType = CONTENT_TYPES[ext];
if (!contentType) die(`지원하지 않는 확장자: ${ext} (png/jpg/gif/svg/webp/avif)`);

const body = await readFile(filePath).catch(() => die(`파일을 못 읽음: ${filePath}`));

// 내용 해시 8자 + 원본 파일명(슬러그화) — 캐시 안전 + 충돌 방지
const hash = createHash('sha1').update(body).digest('hex').slice(0, 8);
const slug = basename(filePath, ext).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const cleanSub = subdir.toLowerCase().replace(/[^a-z0-9/-]+/g, '-').replace(/^\/|\/$/g, '');
const key = `${SERVICE}/${ENV}/${cleanSub}/${slug}-${hash}${ext}`;

// 1) Presigned PUT URL 발급
const signRes = await fetch(`${S3_API_BASE}/sign`, {
  method: 'POST',
  headers: { 'content-type': 'application/json', 'x-api-key': S3_API_KEY },
  body: JSON.stringify({ bucket: S3_BUCKET, key, action: 'PUT_OBJECT' }),
});
if (!signRes.ok) die(`Presigned URL 발급 실패: ${signRes.status} ${await signRes.text()}`);
const { url: presignedUrl } = await signRes.json();

// 2) S3 직접 업로드
const putRes = await fetch(presignedUrl, {
  method: 'PUT',
  headers: { 'Content-Type': contentType },
  body,
});
if (!putRes.ok) die(`S3 업로드 실패: ${putRes.status} ${await putRes.text()}`);

const publicUrl = `https://${S3_BUCKET}.s3.ap-northeast-2.amazonaws.com/${key}`;
console.log(`\n✓ 업로드 완료`);
console.log(`  S3 key : ${key}`);
console.log(`  URL    : ${publicUrl}`);
console.log(`\n마크다운에 붙여넣기:`);
console.log(`  ![설명](${publicUrl})\n`);
console.log(`※ 위 URL 이 브라우저에서 바로 열리는지 한 번 확인하세요. 안 열리면(접근권한) 담당자에게`);
console.log(`  "svc-fnf-ax-platform-pub-s3 객체 공개읽기(public-read) 가능 여부"를 확인해야 합니다.\n`);
