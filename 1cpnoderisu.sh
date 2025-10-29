#!/data/data/com.termux/files/usr/bin/bash
set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

echo -e "${CYAN}╔════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  ☁️  Cloudflare Tunnel 설정      ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════╝${NC}"
echo ""

# Risu-AI 실행 여부 확인
if ! command -v pm2 &> /dev/null || ! pm2 list | grep -q "server"; then
    echo -e "${YELLOW}⚠️  Risu-AI가 실행되지 않았습니다.${NC}"
    echo "먼저 Risu-AI를 시작해주세요:"
    echo "  cd ~/Risu-AI && pm2 start server/node/server.cjs"
    echo ""
    read -p "계속하시겠습니까? (y/n): " CONTINUE
    if [ "$CONTINUE" != "y" ]; then
        exit 0
    fi
fi

# cloudflared 설치 확인
if ! command -v cloudflared &> /dev/null; then
    echo -e "${BLUE}📦 cloudflared 설치 중...${NC}"
    pkg install cloudflared -y
    
    if ! command -v cloudflared &> /dev/null; then
        echo -e "${RED}❌ 설치 실패${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ cloudflared 설치 완료!${NC}"
    echo ""
fi

# 터널 모드 선택
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🎯 터널 모드 선택${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "1) 🚀 Quick Tunnel - 즉시 시작 (임시 URL, 계정 불필요)"
echo "2) 🔒 Named Tunnel - 고정 URL (Cloudflare 계정 필요)"
echo ""
read -p "선택 (1 또는 2): " MODE_CHOICE

if [ "$MODE_CHOICE" = "1" ]; then
    # ============ Quick Tunnel 모드 ============
    echo ""
    echo -e "${BLUE}🚀 Quick Tunnel 모드 선택됨${NC}"
    echo ""
    
    # 관리 스크립트 생성
    echo -e "${BLUE}📝 관리 스크립트 생성 중...${NC}"
    
    # 시작 스크립트
    cat > $HOME/bin/cf-tunnel-start << 'SCRIPT1'
#!/data/data/com.termux/files/usr/bin/bash
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PID_FILE="$HOME/.cf-tunnel.pid"

# 이미 실행 중인지 확인
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if kill -0 "$PID" 2>/dev/null; then
        echo -e "${YELLOW}⚠️  터널이 이미 실행 중입니다. (PID: $PID)${NC}"
        echo ""
        echo "URL 확인:"
        tail -n 20 ~/cf-tunnel.log | grep -o "https://.*\.trycloudflare\.com" | tail -1
        exit 0
    fi
fi

echo -e "${BLUE}🚀 Cloudflare Quick Tunnel 시작 중...${NC}"
nohup cloudflared tunnel --url http://localhost:6001 > ~/cf-tunnel.log 2>&1 &
echo $! > "$PID_FILE"

echo "터널이 준비될 때까지 5초 대기 중..."
sleep 5

if kill -0 $(cat "$PID_FILE") 2>/dev/null; then
    echo -e "${GREEN}✅ 터널 시작 완료!${NC}"
    echo ""
    
    # URL 추출
    URL=$(tail -n 50 ~/cf-tunnel.log | grep -o "https://.*\.trycloudflare\.com" | tail -1)
    
    if [ ! -z "$URL" ]; then
        echo -e "${BLUE}📍 공개 URL:${NC}"
        echo -e "${GREEN}$URL${NC}"
        echo ""
        echo "$URL" > ~/.cf-tunnel-url
    else
        echo -e "${YELLOW}URL이 아직 생성되지 않았습니다. 잠시 후 다시 확인하세요:${NC}"
        echo "tail -f ~/cf-tunnel.log"
    fi
    
    echo ""
    echo "📋 로그 확인: tail -f ~/cf-tunnel.log"
else
    echo -e "${RED}❌ 터널 시작 실패${NC}"
    echo "로그 확인:"
    tail -n 20 ~/cf-tunnel.log
    rm -f "$PID_FILE"
    exit 1
fi
SCRIPT1

elif [ "$MODE_CHOICE" = "2" ]; then
    # ============ Named Tunnel 모드 ============
    echo ""
    echo -e "${BLUE}🔒 Named Tunnel 모드 선택됨${NC}"
    echo ""
    
    # 인증 확인
    CF_CONFIG="$HOME/.cloudflared/cert.pem"
    if [ ! -f "$CF_CONFIG" ]; then
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${YELLOW}🔑 Cloudflare 계정 인증${NC}"
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo "1. 아래 명령어가 브라우저를 열 것입니다"
        echo "2. Cloudflare 계정으로 로그인하세요"
        echo "3. 인증을 완료하세요"
        echo ""
        read -p "계속하려면 Enter를 누르세요..."
        
        cloudflared tunnel login
        
        if [ ! -f "$CF_CONFIG" ]; then
            echo -e "${RED}❌ 인증 실패${NC}"
            exit 1
        fi
        
        echo -e "${GREEN}✅ 인증 완료!${NC}"
        echo ""
    fi
    
    # 터널 이름 설정
    TUNNEL_NAME_FILE="$HOME/.cf-tunnel-name"
    if [ -f "$TUNNEL_NAME_FILE" ]; then
        TUNNEL_NAME=$(cat "$TUNNEL_NAME_FILE")
        echo -e "${GREEN}📌 기존 터널 이름: ${CYAN}$TUNNEL_NAME${NC}"
        echo ""
        read -p "새로운 이름으로 변경하시겠습니까? (y/n): " CHANGE_NAME
        if [ "$CHANGE_NAME" = "y" ]; then
            read -p "새로운 터널 이름: " NEW_NAME
            if [ ! -z "$NEW_NAME" ]; then
                TUNNEL_NAME="$NEW_NAME"
                echo "$TUNNEL_NAME" > "$TUNNEL_NAME_FILE"
            fi
        fi
    else
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${YELLOW}🎯 터널 이름 설정${NC}"
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo "터널 이름을 입력하세요 (영문/숫자/하이픈만)"
        echo "예: risu-tunnel, my-app"
        echo ""
        read -p "터널 이름 (Enter=자동생성): " TUNNEL_NAME
        
        if [ -z "$TUNNEL_NAME" ]; then
            TUNNEL_NAME="risu-$(date +%s | tail -c 8)"
            echo -e "${BLUE}자동 생성: ${CYAN}$TUNNEL_NAME${NC}"
        fi
        
        echo "$TUNNEL_NAME" > "$TUNNEL_NAME_FILE"
        echo ""
    fi
    
    # 터널 생성
    echo -e "${BLUE}🔍 터널 확인 중...${NC}"
    if ! cloudflared tunnel list | grep -q "$TUNNEL_NAME"; then
        echo -e "${YELLOW}📝 터널 생성 중...${NC}"
        cloudflared tunnel create "$TUNNEL_NAME"
        echo -e "${GREEN}✅ 터널 생성 완료!${NC}"
    else
        echo -e "${GREEN}✅ 터널이 이미 존재합니다.${NC}"
    fi
    echo ""
    
    # 터널 ID 가져오기
    TUNNEL_ID=$(cloudflared tunnel list | grep "$TUNNEL_NAME" | awk '{print $1}')
    
    # DNS 설정
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}🌐 도메인 설정${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Cloudflare에 등록된 도메인이 있나요?"
    echo "예: example.com"
    echo ""
    read -p "도메인 입력 (없으면 Enter): " USER_DOMAIN
    
    if [ -z "$USER_DOMAIN" ]; then
        echo -e "${BLUE}💡 무료 .cfargotunnel.com 도메인 사용${NC}"
        TUNNEL_URL="${TUNNEL_ID}.cfargotunnel.com"
    else
        echo ""
        read -p "서브도메인 입력 (예: risu): " SUBDOMAIN
        if [ -z "$SUBDOMAIN" ]; then
            TUNNEL_URL="$USER_DOMAIN"
        else
            TUNNEL_URL="${SUBDOMAIN}.${USER_DOMAIN}"
        fi
        
        echo -e "${BLUE}📝 DNS 설정 중...${NC}"
        cloudflared tunnel route dns "$TUNNEL_NAME" "$TUNNEL_URL"
    fi
    
    echo "$TUNNEL_URL" > ~/.cf-tunnel-url
    echo ""
    
    # config.yml 생성
    mkdir -p ~/.cloudflared
    cat > ~/.cloudflared/config.yml << EOF
tunnel: $TUNNEL_ID
credentials-file: $HOME/.cloudflared/$TUNNEL_ID.json

ingress:
  - hostname: $TUNNEL_URL
    service: http://localhost:6001
  - service: http_status:404
EOF
    
    echo -e "${GREEN}✅ 설정 완료!${NC}"
    echo ""
    
    # 시작 스크립트
    cat > $HOME/bin/cf-tunnel-start << 'SCRIPT2'
#!/data/data/com.termux/files/usr/bin/bash
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PID_FILE="$HOME/.cf-tunnel.pid"

# 이미 실행 중인지 확인
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if kill -0 "$PID" 2>/dev/null; then
        echo -e "${YELLOW}⚠️  터널이 이미 실행 중입니다. (PID: $PID)${NC}"
        
        if [ -f "$HOME/.cf-tunnel-url" ]; then
            URL=$(cat "$HOME/.cf-tunnel-url")
            echo -e "${BLUE}📍 URL: https://$URL${NC}"
        fi
        exit 0
    fi
fi

if [ ! -f "$HOME/.cloudflared/config.yml" ]; then
    echo -e "${RED}❌ 설정 파일이 없습니다. cloudflare-tunnel.sh를 먼저 실행하세요.${NC}"
    exit 1
fi

echo -e "${BLUE}🚀 Cloudflare Tunnel 시작 중...${NC}"
nohup cloudflared tunnel run > ~/cf-tunnel.log 2>&1 &
echo $! > "$PID_FILE"

sleep 3

if kill -0 $(cat "$PID_FILE") 2>/dev/null; then
    echo -e "${GREEN}✅ 터널 시작 완료!${NC}"
    echo ""
    
    if [ -f "$HOME/.cf-tunnel-url" ]; then
        URL=$(cat "$HOME/.cf-tunnel-url")
        echo -e "${BLUE}📍 공개 URL:${NC}"
        echo -e "${GREEN}https://$URL${NC}"
    fi
    
    echo ""
    echo "📋 로그 확인: tail -f ~/cf-tunnel.log"
else
    echo -e "${RED}❌ 터널 시작 실패${NC}"
    echo "로그 확인:"
    tail -n 20 ~/cf-tunnel.log
    rm -f "$PID_FILE"
    exit 1
fi
SCRIPT2

else
    echo -e "${RED}❌ 잘못된 선택${NC}"
    exit 1
fi

# 공통 관리 스크립트들
# 중지 스크립트
cat > $HOME/bin/cf-tunnel-stop << 'SCRIPT3'
#!/data/data/com.termux/files/usr/bin/bash
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

PID_FILE="$HOME/.cf-tunnel.pid"

if [ ! -f "$PID_FILE" ]; then
    echo -e "${YELLOW}⚠️  실행 중인 터널이 없습니다.${NC}"
    exit 0
fi

PID=$(cat "$PID_FILE")

if kill -0 "$PID" 2>/dev/null; then
    echo -e "${YELLOW}🛑 터널 중지 중... (PID: $PID)${NC}"
    kill "$PID"
    sleep 1
    
    # 강제 종료가 필요한 경우
    if kill -0 "$PID" 2>/dev/null; then
        kill -9 "$PID"
    fi
    
    rm -f "$PID_FILE"
    echo -e "${GREEN}✅ 터널이 중지되었습니다.${NC}"
else
    echo -e "${YELLOW}⚠️  프로세스가 이미 종료되었습니다.${NC}"
    rm -f "$PID_FILE"
fi
SCRIPT3

# 상태 확인 스크립트
cat > $HOME/bin/cf-tunnel-status << 'SCRIPT4'
#!/data/data/com.termux/files/usr/bin/bash
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BLUE='\033[0;34m'
NC='\033[0m'

PID_FILE="$HOME/.cf-tunnel.pid"

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}☁️  Cloudflare Tunnel 상태${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ -f "$HOME/.cf-tunnel-url" ]; then
    URL=$(cat $HOME/.cf-tunnel-url)
    if [[ "$URL" == http* ]]; then
        echo -e "🌍 공개 URL: ${BLUE}$URL${NC}"
    else
        echo -e "🌍 공개 URL: ${BLUE}https://$URL${NC}"
    fi
    echo ""
fi

if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if kill -0 "$PID" 2>/dev/null; then
        echo -e "${GREEN}✅ 터널 실행 중 (PID: $PID)${NC}"
        echo ""
        echo "최근 로그 (마지막 10줄):"
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        tail -n 10 ~/cf-tunnel.log 2>/dev/null || echo "로그 없음"
    else
        echo -e "${RED}❌ 터널 중지됨${NC}"
        rm -f "$PID_FILE"
    fi
else
    echo -e "${YELLOW}⚠️  터널이 실행되지 않았습니다.${NC}"
fi

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "명령어:"
echo "  시작: cf-tunnel-start"
echo "  중지: cf-tunnel-stop"
echo "  재시작: cf-tunnel-restart"
echo "  로그: tail -f ~/cf-tunnel.log"
SCRIPT4

# 재시작 스크립트
cat > $HOME/bin/cf-tunnel-restart << 'SCRIPT5'
#!/data/data/com.termux/files/usr/bin/bash
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔄 터널 재시작 중...${NC}"
cf-tunnel-stop
sleep 2
cf-tunnel-start
SCRIPT5

# 실행 권한 부여
chmod +x $HOME/bin/cf-tunnel-*

echo -e "${GREEN}✅ 관리 스크립트 생성 완료!${NC}"
echo ""

# 완료 메시지
echo -e "${GREEN}╔════════════════════════════════════╗${NC}"
echo -e "${GREEN}║      ✅ 설치 완료!               ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════╝${NC}"
echo ""

if [ "$MODE_CHOICE" = "1" ]; then
    echo -e "${CYAN}📍 모드:${NC} Quick Tunnel (임시 URL)"
    echo -e "${YELLOW}⚠️  재시작 시 URL이 변경됩니다${NC}"
elif [ "$MODE_CHOICE" = "2" ]; then
    echo -e "${CYAN}📍 모드:${NC} Named Tunnel (고정 URL)"
    if [ -f "$HOME/.cf-tunnel-url" ]; then
        URL=$(cat "$HOME/.cf-tunnel-url")
        echo -e "${CYAN}🌍 URL:${NC} https://$URL"
    fi
fi

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}사용 가능한 명령어:${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}cf-tunnel-start${NC}    - 터널 시작 (백그라운드)"
echo -e "${GREEN}cf-tunnel-stop${NC}     - 터널 중지"
echo -e "${GREEN}cf-tunnel-status${NC}   - 터널 상태 확인"
echo -e "${GREEN}cf-tunnel-restart${NC}  - 터널 재시작"
echo ""
echo -e "${CYAN}📋 로그 실시간 보기:${NC} tail -f ~/cf-tunnel.log"
echo ""
echo -e "${YELLOW}💡 지금 바로 시작:${NC} cf-tunnel-start"
echo ""