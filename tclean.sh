#!/data/data/com.termux/files/usr/bin/bash

echo "⚠️  Termux 완전 초기화를 시작합니다!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "정말 진행하시겠습니까? 모든 데이터가 삭제됩니다! (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "❌ 취소되었습니다."
    exit 0
fi

echo ""
echo "🧹 PM2 프로세스 중지..."
pm2 kill 2>/dev/null || true

echo "🧹 npm 전역 패키지 제거 중..."
npm ls -g --depth=0 2>/dev/null | grep -v npm | cut -d' ' -f2 | cut -d@ -f1 | xargs npm uninstall -g 2>/dev/null || true

echo "🧹 홈 디렉토리 삭제 중..."
cd ~
rm -rf Risu-AI .pm2 .npm .nvm .node* .bashrc .bash_history .cache

echo "🧹 패키지 캐시 정리..."
pkg clean

echo ""
echo "✅ 초기화 완료!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Termux를 재시작하면 깨끗한 상태가 됩니다."
echo ""
echo "💡 완전 초기화를 원하시면:"
echo "   Android 설정 → 앱 → Termux → 데이터 삭제"