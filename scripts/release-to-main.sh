#!/bin/bash
set -e

# 릴리즈 대상 경로
# SHARED_FILES="src index.ts tsconfig.json"
SHARED_FILES="src README.md scripts"
RELEASE_LOG_FILE="release-log.md"

# 날짜 및 커밋 해시 정보
RELEASE_DATE=$(date +%Y-%m-%d)
LATEST_HASH=$(git rev-parse --short dev)

echo "🔁 dev → main: 공유 파일 반영 시작"

# 1. dev 브랜치 최신 상태로

git checkout dev
git pull origin dev

# 2. main 브랜치 최신 상태로
git checkout main
git pull origin main

# 3. 공유 대상 파일만 dev → main으로 가져오기
git checkout dev -- $SHARED_FILES

# 4. 릴리즈 로그 업데이트
echo "📝 release-log.md 업데이트"
if [ ! -f "$RELEASE_LOG_FILE" ]; then
  echo "| 버전 | 기준 커밋 (dev) | 반영 일자 | 설명 |" > "$RELEASE_LOG_FILE"
  echo "|------|-----------------|-----------|------|" >> "$RELEASE_LOG_FILE"
fi

echo "|      | $LATEST_HASH | $RELEASE_DATE | 공유 디렉토리 반영 |" >> "$RELEASE_LOG_FILE"

# 5. 커밋
git add $SHARED_FILES $RELEASE_LOG_FILE
git commit -m "release: 공유 디렉토리 반영 from dev @ $LATEST_HASH"
git push origin main

echo "✅ 반영 완료: main 브랜치에 src 및 공유 파일이 적용되었습니다."
