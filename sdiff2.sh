#!/data/data/com.termux/files/usr/bin/bash
set -e

echo "🚀 RisuAI stableDiff.ts 업데이트 및 재시작을 시작합니다..."

INSTALL_DIR="$HOME/Risu-AI"
TARGET_FILE_PATH="$INSTALL_DIR/src/ts/process/stableDiff.ts"
NEW_FILE_URL="https://raw.githubusercontent.com/LUNARIA1/tikitaka-gen/refs/heads/main/stableDiff.ts"

# 디렉토리 존재 확인
if [ ! -d "$INSTALL_DIR" ]; then
    echo "❌ RisuAI 설치 디렉토리를 찾을 수 없습니다"
    exit 1
fi

cd "$INSTALL_DIR"

# 🔴 먼저 PM2 서버 중지
echo "⏸️  서버 중지 중..."
pm2 stop server || true

# 백업 생성
echo "💾 기존 파일 백업 중..."
cp "$TARGET_FILE_PATH" "$TARGET_FILE_PATH.backup"

# 새 파일 다운로드
echo "📥 새로운 stableDiff.ts 다운로드 중..."
curl -o "$TARGET_FILE_PATH" "$NEW_FILE_URL"

# 메모리 설정 확인
export NODE_OPTIONS=--max_old_space_size=4096

# 캐시 정리
echo "🧹 캐시 정리 중..."
pnpm store prune || true

# 빌드 시도
echo "🔨 빌드 중..."
if ! pnpm run build; then
    echo "❌ 빌드 실패! 백업 파일로 복원합니다..."
    cp "$TARGET_FILE_PATH.backup" "$TARGET_FILE_PATH"
    pnpm run build
fi

# 서버 재시작
echo "🔄 서버 재시작 중..."
pm2 restart server

echo "✅ 완료!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 상태: pm2 status"
echo "📋 로그: pm2 logs"