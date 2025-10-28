#!/data/data/com.termux/files/usr/bin/bash

set -e

echo "🌐 RisuAI Cloudflare Tunnel (PM2) 시작..."

# cloudflared 설치 확인
if ! command -v cloudflared &> /dev/null; then
    echo "📥 cloudflared 설치 중..."
    pkg install -y wget
    
    ARCH=$(uname -m)
    if [[ "$ARCH" == "aarch64" ]]; then
        CLOUDFLARED_URL="https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64"
    else
        CLOUDFLARED_URL="https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm"
    fi
    
    wget -O cloudflared "$CLOUDFLARED_URL"
    chmod +x cloudflared
    mv cloudflared $PREFIX/bin/
    echo "✅ cloudflared 설치 완료!"
fi

# 포트 감지
PORT=$(pm2 info server 2>/dev/null | grep -oP '(?<=localhost:)\d+' | head -1)
if [ -z "$PORT" ]; then
    PORT=3000
fi

# 기존 터널 중지
pm2 delete tunnel 2>/dev/null || true

# PM2로 터널 시작
echo "🚀 백그라운드에서 터널 시작 중..."
pm2 start cloudflared --name tunnel -- tunnel --url http://localhost:$PORT

# 잠시 대기 후 로그 확인
sleep 3
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 터널이 백그라운드에서 실행 중입니다!"
echo ""
echo "📋 URL 확인: pm2 logs tunnel"
echo "⏹️  터널 중지: pm2 stop tunnel"
echo "🔄 터널 재시작: pm2 restart tunnel"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
pm2 logs tunnel --lines 20 --nostream