#!/data/data/com.termux/files/usr/bin/bash

set -e

echo "🌐 RisuAI LocalTunnel (PM2) 시작..."

# localtunnel 설치 확인
if ! command -v lt &> /dev/null; then
    echo "📥 localtunnel 설치 중..."
    npm install -g localtunnel
    echo "✅ localtunnel 설치 완료!"
fi

# 포트 자동 감지
echo "🔍 서버 포트 확인 중..."
PORT=$(pm2 logs server --nostream --lines 100 2>/dev/null | grep -oP '(?<=port |:)\d{4,5}' | tail -1)

if [ -z "$PORT" ]; then
    # netstat로 Node.js 포트 찾기
    PORT=$(netstat -tlnp 2>/dev/null | grep node | grep -oP ':\K\d+' | head -1)
fi

if [ -z "$PORT" ]; then
    PORT=3000
    echo "⚠️  포트를 찾을 수 없어 기본값 3000 사용"
else
    echo "✅ 포트 $PORT 감지됨"
fi

# 기존 터널 중지
pm2 delete tunnel 2>/dev/null || true

# PM2로 터널 시작
echo "🚀 백그라운드에서 터널 시작 중..."
pm2 start lt --name tunnel -- --port $PORT

# 잠시 대기 후 로그 확인
sleep 5
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 터널이 실행 중입니다! (포트: $PORT)"
echo ""
echo "📋 URL 확인: pm2 logs tunnel"
echo "⏹️  터널 중지: pm2 stop tunnel"
echo "🔄 터널 재시작: pm2 restart tunnel"
echo "🗑️  터널 삭제: pm2 delete tunnel"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 접속 URL (10초 후 확인):"
sleep 5
pm2 logs tunnel --lines 50 --nostream | grep -oE "https://[a-z0-9-]+\.loca\.lt" | tail -1 || echo "잠시 후 'pm2 logs tunnel'로 URL을 확인하세요"