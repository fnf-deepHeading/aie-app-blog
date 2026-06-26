#!/usr/bin/env node
/**
 * 블로그 이미지 → DCS AI S3 업로드 (작성자 도구)
 *
 * 이미지는 git 에 넣지 않는다. 이 스크립트로 S3 에 올리고, 출력된 URL 을
 * 마크다운에 그대로 붙여 쓴다.  (텍스트 글은 계속 git 에 둔다 — 결정 A)
 *
 * 저장 위치 : s3://svc-fnf-dcs-ai-s3/aie-app-agent/blog/<하위경로>/<이름>-<해시>.<ext>
 * 서빙       : 버킷 객체가 public-read → 직접 URL 로 <img> 로드 (확인 완료 2026-06-26)
 * 인증       : AWS SSO 프로파일 `aws-prcs-sso-dt` (별도 API 키 불필요)
 *
 * 사용법:
 *   node scripts/upload-image.mjs <로컬-이미지경로> [하위경로]
 *
 * 예:
 *   node scripts/upload-image.mjs ~/Desktop/arch.png
 *   node scripts/upload-image.mjs ./diagram.png offline-sync   # blog/offline-sync/ 밑에
 *
 * SSO 토큰 만료 시:  aws sso login --profile aws-prcs-sso-dt  (브라우저 — 쿠키가 직접)
 */
import { readFile } from 'node:fs/promises';
import { basename, extname } from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const BUCKET = 'svc-fnf-dcs-ai-s3';
const BASE_PREFIX = 'aie-app-agent/blog';
const REGION = 'ap-northeast-2';
const PROFILE = process.env.AWS_PROFILE || 'aws-prcs-sso-dt';

const CONTENT_TYPES = {
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.svg': 'image/svg+xml', '.webp': 'image/webp',
  '.avif': 'image/avif',
};

function die(msg) {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
}

const [, , filePath, subdir = ''] = process.argv;
if (!filePath) die('사용법: node scripts/upload-image.mjs <이미지경로> [하위경로]');

const ext = extname(filePath).toLowerCase();
const contentType = CONTENT_TYPES[ext];
if (!contentType) die(`지원하지 않는 확장자: ${ext} (png/jpg/gif/svg/webp/avif)`);

const body = await readFile(filePath).catch(() => die(`파일을 못 읽음: ${filePath}`));

// 내용 해시 8자 + 원본 파일명(슬러그화) — 캐시 안전 + 충돌 방지
const hash = createHash('sha1').update(body).digest('hex').slice(0, 8);
const slug = basename(filePath, ext).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'img';
const cleanSub = subdir.toLowerCase()
  .replace(/[^a-z0-9/-]+/g, '-')
  .replace(/^[/-]+|[/-]+$/g, '');
const key = `${BASE_PREFIX}/${cleanSub ? cleanSub + '/' : ''}${slug}-${hash}${ext}`;
const s3uri = `s3://${BUCKET}/${key}`;

try {
  execFileSync('aws', [
    's3', 'cp', filePath, s3uri,
    '--profile', PROFILE,
    '--content-type', contentType,
    // 파일명에 내용 해시가 박혀 있어 안전하게 영구 캐시
    '--cache-control', 'public, max-age=31536000, immutable',
  ], { stdio: ['ignore', 'ignore', 'pipe'] });
} catch (e) {
  const err = String(e.stderr || e.message || '');
  if (/token|expired|sso|credential/i.test(err)) {
    die(`AWS SSO 인증 만료. 먼저 실행하세요:\n  aws sso login --profile ${PROFILE}`);
  }
  die(`S3 업로드 실패:\n${err}`);
}

const publicUrl = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
console.log(`\n✓ 업로드 완료`);
console.log(`  S3  : ${s3uri}`);
console.log(`  URL : ${publicUrl}`);
console.log(`\n마크다운에 붙여넣기:`);
console.log(`  ![설명](${publicUrl})\n`);
