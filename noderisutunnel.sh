#!/data/data/com.termux/files/usr/bin/bash

set -e

echo "🌐 RisuAI Serveo Tunnel 시작..."

# SSH 설치 확인
if ! command -v ssh &> /dev/null; then
    echo "📥 openssh 설치 중..."
    pkg install -y openssh
fi

# 포트 자동 감지
echo "🔍 서버 포트 확인 중..."
PORT=$(pm2 logs server --nostream --lines 100 2>/dev/null | grep -oP '(?<=port |:)\d{4,5}' | tail -1)

if [ -z "$PORT" ]; then
    PORT=6001
    echo "⚠️  포트를 찾을 수 없어 6001 사용"
else
    echo "✅ 포트 $PORT 감지됨"
fi

# 기존 터널 중지
pm2 delete tunnel 2>/dev/null || true

# PM2로 Serveo 터널 시작
echo "🚀 터널 시작 중..."
pm2 start ssh --name tunnel -- -o StrictHostKeyChecking=no -o ServerAliveInterval=60 -R 80:localhost:$PORT serveo.net

sleep 5
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 터널이 실행 중입니다! (포트: $PORT)"
echo ""
echo "📋 URL 확인: pm2 logs tunnel"
echo "⏹️  터널 중지: pm2 stop tunnel"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
pm2 logs tunnel --lines 20 --nostream