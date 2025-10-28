#!/data/data/com.termux/files/usr/bin/bash

set -e

echo "📦 RisuAI 경량 백업 (node_modules 제외)"
echo ""

# zip 설치 확인
if ! command -v zip &> /dev/null; then
    echo "📥 zip 설치 중..."
    pkg install -y zip
fi

# 저장소 권한 확인
if [ ! -d "$HOME/storage" ]; then
    echo "📱 저장소 권한 설정 중..."
    termux-setup-storage
    sleep 2
fi

# RisuAI 디렉토리 확인
if [ ! -d "$HOME/Risu-AI" ]; then
    echo "❌ Risu-AI가 설치되지 않았습니다."
    exit 1
fi

# 백업 파일명 (날짜 포함)
BACKUP_NAME="risu-light-$(date +%Y%m%d_%H%M%S).zip"

echo "🗜️  압축 중... (node_modules 제외)"
cd ~
zip -r "$BACKUP_NAME" Risu-AI \
    -x "*/node_modules/*" \
    -x "*/.git/*" \
    -x "*/dist/*" \
    -x "*/.pm2/*" \
    -x "*/.npm/*" \
    -x "*/.cache/*"

# 다운로드 폴더로 복사
echo "📂 다운로드 폴더로 복사 중..."
cp "$BACKUP_NAME" ~/storage/downloads/

# 원본 삭제 (선택)
read -p "Termux 내부의 압축 파일을 삭제하시겠습니까? (y/N): " DELETE
if [ "$DELETE" = "y" ] || [ "$DELETE" = "Y" ]; then
    rm "$BACKUP_NAME"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 경량 백업 완료!"
echo ""
echo "📍 저장 위치: 다운로드/$BACKUP_NAME"
echo "📱 '내 파일' 앱에서 확인하세요!"
echo ""

# 파일 크기 확인
SIZE=$(du -h ~/storage/downloads/"$BACKUP_NAME" | cut -f1)
echo "📦 파일 크기: $SIZE"
echo ""
echo "💡 복구 시 필요한 작업:"
echo "   1. 압축 해제"
echo "   2. cd ~/Risu-AI"
echo "   3. pnpm install"
echo "   4. pm2 start server/node/server.cjs"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"