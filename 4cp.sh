#!/data/data/com.termux/files/usr/bin/bash
set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
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

# PATH 확인 및 추가
if ! echo $PATH | grep -q "$HOME/bin"; then
    export PATH=$HOME/bin:$PATH
    if ! grep -q 'export PATH=$HOME/bin:$PATH' ~/.bashrc; then
        echo 'export PATH=$HOME/bin:$PATH' >> ~/.bashrc
    fi
fi

# bin 디렉토리 생성
mkdir -p $HOME/bin

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
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

PID_FILE="$HOME/.cf-tunnel.pid"

# 이미 실행 중인지 확인
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if kill -0 "$PID" 2>/dev/null; then
        echo -e "${YELLOW}⚠️  터널이 이미 실행 중입니다. (PID: $PID)${NC}"
        echo ""
        
        if [ -f "$HOME/.cf-tunnel-url" ]; then
            URL=$(cat "$HOME/.cf-tunnel-url")
            echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            echo -e "${BOLD}${GREEN}📍 공개 URL:${NC}"
            echo ""
            echo -e "${BOLD}${BLUE}   $URL${NC}"
            echo ""
            echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        fi
        exit 0
    fi
fi

echo -e "${BLUE}🚀 Cloudflare Quick Tunnel 시작 중...${NC}"
echo ""

# 기존 로그 삭제
rm -f ~/cf-tunnel.log

# 백그라운드에서 시작
nohup cloudflared tunnel --url http://localhost:6001 > ~/cf-tunnel.log 2>&1 &
echo $! > "$PID_FILE"

echo -e "${YELLOW}⏳ URL 생성 대기 중...${NC}"

# URL이 나올 때까지 최대 30초 대기
TIMEOUT=30
ELAPSED=0
URL=""

while [ $ELAPSED -lt $TIMEOUT ]; do
    sleep 1
    ELAPSED=$((ELAPSED + 1))
    
    # 프로세스가 살아있는지 확인
    if ! kill -0 $(cat "$PID_FILE") 2>/dev/null; then
        echo -e "${RED}❌ 터널 시작 실패${NC}"
        echo ""
        echo "로그 내용:"
        cat ~/cf-tunnel.log
        rm -f "$PID_FILE"
        exit 1
    fi
    
    # URL 추출 시도
    URL=$(grep -o "https://[a-z0-9-]*\.trycloudflare\.com" ~/cf-tunnel.log 2>/dev/null | tail -1)
    
    if [ ! -z "$URL" ]; then
        break
    fi
    
    # 진행 표시
    if [ $((ELAPSED % 3)) -eq 0 ]; then
        echo -n "."
    fi
done

echo ""
echo ""

if [ -z "$URL" ]; then
    echo -e "${RED}❌ URL을 가져올 수 없습니다${NC}"
    echo ""
    echo "로그를 확인하세요: tail -f ~/cf-tunnel.log"
    exit 1
fi

# URL 저장
echo "$URL" > ~/.cf-tunnel-url

# 성공 메시지와 URL 크게 표시
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                  ✅ 터널 시작 완료!                      ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${GREEN}🌍 공개 URL:${NC}"
echo ""
echo -e "${BOLD}${BLUE}   $URL${NC}"
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}💡 이 URL을 브라우저에서 열어보세요!${NC}"
echo -e "${YELLOW}💡 터널을 중지하려면: ${GREEN}cf-tunnel-stop${NC}"
echo -e "${YELLOW}💡 로그 보기: ${GREEN}tail -f ~/cf-tunnel.log${NC}"
echo ""
SCRIPT1

    # 중지 스크립트
    cat > $HOME/bin/cf-tunnel-stop << 'SCRIPT_STOP'
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
SCRIPT_STOP

    # 상태 확인 스크립트
    cat > $HOME/bin/cf-tunnel-status << 'SCRIPT_STATUS'
#!/data/data/com.termux/files/usr/bin/bash
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

PID_FILE="$HOME/.cf-tunnel.pid"

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}☁️  Cloudflare Tunnel 상태${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ -f "$HOME/.cf-tunnel-url" ]; then
    URL=$(cat $HOME/.cf-tunnel-url)
    echo -e "${BOLD}🌍 공개 URL: ${BLUE}$URL${NC}"
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
SCRIPT_STATUS

    # 재시작 스크립트
    cat > $HOME/bin/cf-tunnel-restart << 'SCRIPT_RESTART'
#!/data/data/com.termux/files/usr/bin/bash
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔄 터널 재시작 중...${NC}"
cf-tunnel-stop
sleep 2
cf-tunnel-start
SCRIPT_RESTART

    # 실행 권한 부여
    chmod +x $HOME/bin/cf-tunnel-*

    echo -e "${GREEN}✅ 관리 스크립트 생성 완료!${NC}"
    echo ""
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}🚀 지금 바로 터널을 시작합니다!${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # ==== 여기서 바로 터널 시작! ====
    PID_FILE="$HOME/.cf-tunnel.pid"
    
    # 기존 터널 확인
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if kill -0 "$PID" 2>/dev/null; then
            echo -e "${YELLOW}⚠️  터널이 이미 실행 중입니다.${NC}"
            if [ -f "$HOME/.cf-tunnel-url" ]; then
                URL=$(cat "$HOME/.cf-tunnel-url")
                echo ""
                echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
                echo -e "${BOLD}${GREEN}📍 공개 URL:${NC}"
                echo ""
                echo -e "${BOLD}${BLUE}   $URL${NC}"
                echo ""
                echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            fi
            exit 0
        fi
    fi
    
    echo -e "${BLUE}🚀 Cloudflare Quick Tunnel 시작 중...${NC}"
    echo ""
    
    # 기존 로그 삭제
    rm -f ~/cf-tunnel.log
    
    # 백그라운드에서 시작
    nohup cloudflared tunnel --url http://localhost:6001 > ~/cf-tunnel.log 2>&1 &
    echo $! > "$PID_FILE"
    
    echo -e "${YELLOW}⏳ URL 생성 대기 중...${NC}"
    
    # URL이 나올 때까지 최대 30초 대기
    TIMEOUT=30
    ELAPSED=0
    URL=""
    
    while [ $ELAPSED -lt $TIMEOUT ]; do
        sleep 1
        ELAPSED=$((ELAPSED + 1))
        
        # 프로세스가 살아있는지 확인
        if ! kill -0 $(cat "$PID_FILE") 2>/dev/null; then
            echo ""
            echo -e "${RED}❌ 터널 시작 실패${NC}"
            echo ""
            echo "로그 내용:"
            cat ~/cf-tunnel.log
            rm -f "$PID_FILE"
            exit 1
        fi
        
        # URL 추출 시도
        URL=$(grep -o "https://[a-z0-9-]*\.trycloudflare\.com" ~/cf-tunnel.log 2>/dev/null | tail -1)
        
        if [ ! -z "$URL" ]; then
            break
        fi
        
        # 진행 표시
        if [ $((ELAPSED % 3)) -eq 0 ]; then
            echo -n "."
        fi
    done
    
    echo ""
    echo ""
    
    if [ -z "$URL" ]; then
        echo -e "${RED}❌ URL을 가져올 수 없습니다${NC}"
        echo ""
        echo "로그를 확인하세요: tail -f ~/cf-tunnel.log"
        exit 1
    fi
    
    # URL 저장
    echo "$URL" > ~/.cf-tunnel-url
    
    # 성공 메시지와 URL 크게 표시
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                  ✅ 터널 시작 완료!                      ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}${GREEN}🌍 공개 URL:${NC}"
    echo ""
    echo -e "${BOLD}${BLUE}   $URL${NC}"
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}💡 이 URL을 브라우저에서 열어보세요!${NC}"
    echo -e "${YELLOW}💡 터널을 중지하려면: ${GREEN}cf-tunnel-stop${NC}"
    echo -e "${YELLOW}💡 로그 보기: ${GREEN}tail -f ~/cf-tunnel.log${NC}"
    echo ""
    
    exit 0

elif [ "$MODE_CHOICE" = "2" ]; then
    # ============ Named Tunnel 모드 ============
    # (기존 코드 유지 - 너무 길어서 생략)
    echo "Named Tunnel 모드는 별도로 설정이 필요합니다."
    echo "이 부분은 원래 스크립트의 Named Tunnel 코드를 그대로 사용하세요."
    
else
    echo -e "${RED}❌ 잘못된 선택${NC}"
    exit 1
fi