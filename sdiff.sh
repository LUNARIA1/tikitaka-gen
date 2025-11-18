#!/data/data/com.termux/files/usr/bin/bash

set -e # 에러 발생 시 스크립트 중단

echo "🚀 RisuAI stableDiff.ts 업데이트 및 재시작을 시작합니다..."

# RisuAI 설치 디렉토리 및 대상 파일 경로
INSTALL_DIR="$HOME/Risu-AI"
TARGET_FILE_PATH="$INSTALL_DIR/src/ts/process/stableDiff.ts"
NEW_FILE_URL="https://raw.githubusercontent.com/LUNARIA1/tikitaka-gen/refs/heads/main/stableDiff.ts"

# RisuAI 디렉토리 존재 확인
if [ ! -d "$INSTALL_DIR" ]; then
    echo "❌ RisuAI 설치 디렉토리를 찾을 수 없습니다: $INSTALL_DIR"
    echo "먼저 nrisu.sh 스크립트로 설치를 진행해주세요."
    exit 1
fi

# RisuAI 디렉토리로 이동
cd "$INSTALL_DIR"

echo "📥 새로운 stableDiff.ts 파일을 다운로드하여 덮어씁니다..."
# curl을 사용하여 새 파일을 다운로드하고 기존 파일을 덮어쓰기
curl -o "$TARGET_FILE_PATH" "$NEW_FILE_URL"

echo "🔨 변경된 내용으로 다시 빌드합니다..."
pnpm run build

echo "🔄 PM2로 서버를 재시작합니다..."
pm2 restart server

echo ""
echo "✅ stableDiff.ts 업데이트 및 서버 재시작 완료!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 서버 상태 확인: pm2 status"
echo "📋 실시간 로그 확인: pm2 logs"