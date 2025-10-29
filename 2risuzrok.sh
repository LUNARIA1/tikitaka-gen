#!/data/data/com.termux/files/usr/bin/bash
set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}╔════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   🌐 Risu-AI zrok 터널링 설정   ║${NC}"
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

# zrok 설치 확인
if ! command -v zrok &> /dev/null; then
    echo -e "${BLUE}📦 zrok 설치 중...${NC}"
    
    # 아키텍처 확인
    ARCH=$(uname -m)
    echo "감지된 아키텍처: $ARCH"
    
    # aarch64용 바이너리 다운로드
    if [ "$ARCH" = "aarch64" ]; then
        ZROK_FILE="zrok_1.0.6_linux_arm64.tar.gz"
        ZROK_URL="https://github.com/openziti/zrok/releases/download/v1.0.6/$ZROK_FILE"
    else
        echo -e "${RED}❌ 이 스크립트는 aarch64 전용입니다.${NC}"
        echo "현재 아키텍처: $ARCH"
        exit 1
    fi
    
    cd ~
    echo "다운로드 중: $ZROK_FILE"
    
    # curl로 다운로드
    if ! curl -L -o zrok.tar.gz "$ZROK_URL"; then
        echo -e "${RED}❌ 다운로드 실패${NC}"
        exit 1
    fi
    
    echo "압축 해제 중..."
    tar -xf zrok.tar.gz
    
    # bin 디렉토리 생성 및 이동
    mkdir -p $HOME/bin
    mv zrok $HOME/bin/
    chmod +x $HOME/bin/zrok
    rm zrok.tar.gz
    
    # PATH 추가
    if ! grep -q 'export PATH=$HOME/bin:$PATH' ~/.bashrc; then
        echo 'export PATH=$HOME/bin:$PATH' >> ~/.bashrc
    fi
    export PATH=$HOME/bin:$PATH
    
    # 설치 확인
    if $HOME/bin/zrok version &> /dev/null; then
        echo -e "${GREEN}✅ zrok 설치 완료!${NC}"
    else
        echo -e "${RED}❌ zrok 설치는 되었으나 실행 오류${NC}"
        echo "파일 정보:"
        file $HOME/bin/zrok
        exit 1
    fi
    echo ""
fi

# zrok 활성화 확인
ZROK_CONFIG="$HOME/.zrok/environment.json"
if [ ! -f "$ZROK_CONFIG" ]; then
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}🔑 zrok 계정 활성화${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "1. 브라우저에서 https://zrok.io 방문"
    echo "2. 무료 계정 생성 (이메일 인증 필요)"
    echo "3. 로그인 후 대시보드에서 토큰 복사"
    echo ""
    read -p "zrok 토큰을 입력하세요: " ZROK_TOKEN
    
    if [ -z "$ZROK_TOKEN" ]; then
        echo -e "${RED}❌ 토큰이 입력되지 않았습니다.${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}📡 계정 활성화 중...${NC}"
    if ! zrok enable "$ZROK_TOKEN"; then
        echo -e "${RED}❌ 계정 활성화 실패${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ 계정 활성화 완료!${NC}"
    echo ""
fi

# 고유 이름 설정
UNIQUE_NAME_FILE="$HOME/.zrok-risu-name"
if [ -f "$UNIQUE_NAME_FILE" ]; then
    UNIQUE_NAME=$(cat "$UNIQUE_NAME_FILE")
    echo -e "${GREEN}📌 기존 공유 이름: ${CYAN}$UNIQUE_NAME${NC}"
    echo ""
    read -p "새로운 이름으로 변경하시겠습니까? (y/n): " CHANGE_NAME
    if [ "$CHANGE_NAME" = "y" ]; then
        read -p "새로운 공유 이름: " NEW_NAME
        if [ ! -z "$NEW_NAME" ]; then
            UNIQUE_NAME="$NEW_NAME"
            echo "$UNIQUE_NAME" > "$UNIQUE_NAME_FILE"
        fi
    fi
else
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}🎯 공유 이름 설정${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "고유한 이름을 입력하세요 (영문/숫자/하이픈만)"
    echo "예: risu-john, my-risu-ai"
    echo ""
    read -p "공유 이름 (Enter=자동생성): " UNIQUE_NAME
    
    if [ -z "$UNIQUE_NAME" ]; then
        UNIQUE_NAME="risu-$(date +%s | tail -c 8)"
        echo -e "${BLUE}자동 생성: ${CYAN}$UNIQUE_NAME${NC}"
    fi
    
    echo "$UNIQUE_NAME" > "$UNIQUE_NAME_FILE"
    echo ""
fi

# 예약된 공유 설정
echo -e "${BLUE}🔍 공유 예약 확인 중...${NC}"
RESERVE_NEEDED=true

# 기존 예약 확인
if zrok status 2>/dev/null | grep -q "$UNIQUE_NAME"; then
    echo -e "${GREEN}✅ 이미 예약되어 있습니다.${NC}"
    RESERVE_NEEDED=false
fi

# 새로 예약
if [ "$RESERVE_NEEDED" = true ]; then
    echo -e "${YELLOW}📝 공유 예약 중...${NC}"
    if ! zrok reserve public --backend-mode proxy --unique-name "$UNIQUE_NAME" http://localhost:6001; then
        echo -e "${RED}❌ 예약 실패${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ 예약 완료!${NC}"
fi
echo ""

# 관리 스크립트 생성
echo -e "${BLUE}📝 관리 스크립트 생성 중...${NC}"

# 1. 터널 시작 스크립트
cat > $HOME/bin/risu-tunnel-start << 'SCRIPT1'
#!/data/data/com.termux/files/usr/bin/bash
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ ! -f "$HOME/.zrok-risu-name" ]; then
    echo -e "${RED}❌ 설정이 필요합니다. zroktunnel.sh를 먼저 실행하세요.${NC}"
    exit 1
fi

UNIQUE_NAME=$(cat $HOME/.zrok-risu-name)
PID_FILE="$HOME/.zrok-tunnel.pid"

# 이미 실행 중인지 확인
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if kill -0 "$PID" 2>/dev/null; then
        echo -e "${YELLOW}⚠️  터널이 이미 실행 중입니다. (PID: $PID)${NC}"
        echo -e "${BLUE}📍 URL: https://$UNIQUE_NAME.share.zrok.io${NC}"
        exit 0
    fi
fi

echo -e "${BLUE}🚀 백그라운드에서 터널 시작 중...${NC}"
nohup zrok share reserved "$UNIQUE_NAME" > ~/zrok-tunnel.log 2>&1 &
echo $! > "$PID_FILE"

sleep 3

if kill -0 $(cat "$PID_FILE") 2>/dev/null; then
    echo -e "${GREEN}✅ 터널 시작 완료!${NC}"
    echo ""
    echo -e "🌐 공유 이름: ${GREEN}$UNIQUE_NAME${NC}"
    echo -e "📍 공개 URL: ${BLUE}https://$UNIQUE_NAME.share.zrok.io${NC}"
    echo ""
    echo "📋 로그 확인: tail -f ~/zrok-tunnel.log"
else
    echo -e "${RED}❌ 터널 시작 실패${NC}"
    echo "로그 확인:"
    tail -n 10 ~/zrok-tunnel.log
    rm -f "$PID_FILE"
    exit 1
fi
SCRIPT1

# 2. 터널 중지 스크립트
cat > $HOME/bin/risu-tunnel-stop << 'SCRIPT2'
#!/data/data/com.termux/files/usr/bin/bash
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

PID_FILE="$HOME/.zrok-tunnel.pid"

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
SCRIPT2

# 3. 터널 상태 확인 스크립트
cat > $HOME/bin/risu-tunnel-status << 'SCRIPT3'
#!/data/data/com.termux/files/usr/bin/bash
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BLUE='\033[0;34m'
NC='\033[0m'

PID_FILE="$HOME/.zrok-tunnel.pid"

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🌐 Risu-AI 터널 상태${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ -f "$HOME/.zrok-risu-name" ]; then
    UNIQUE_NAME=$(cat $HOME/.zrok-risu-name)
    echo -e "🎯 공유 이름: ${BLUE}$UNIQUE_NAME${NC}"
    echo -e "🌍 공개 URL: ${BLUE}https://$UNIQUE_NAME.share.zrok.io${NC}"
    echo ""
fi

if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if kill -0 "$PID" 2>/dev/null; then
        echo -e "${GREEN}✅ 터널 실행 중 (PID: $PID)${NC}"
        echo ""
        echo "최근 로그 (마지막 10줄):"
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        tail -n 10 ~/zrok-tunnel.log 2>/dev/null || echo "로그 없음"
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
echo "  시작: risu-tunnel-start"
echo "  중지: risu-tunnel-stop"
echo "  재시작: risu-tunnel-restart"
echo "  로그: tail -f ~/zrok-tunnel.log"
SCRIPT3

# 4. 터널 재시작 스크립트
cat > $HOME/bin/risu-tunnel-restart << 'SCRIPT4'
#!/data/data/com.termux/files/usr/bin/bash
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔄 터널 재시작 중...${NC}"
risu-tunnel-stop
sleep 2
risu-tunnel-start
SCRIPT4

# 실행 권한 부여
chmod +x $HOME/bin/risu-tunnel-*

echo -e "${GREEN}✅ 관리 스크립트 생성 완료!${NC}"
echo ""

# 완료 메시지
echo -e "${GREEN}╔════════════════════════════════════╗${NC}"
echo -e "${GREEN}║      ✅ 설치 완료!               ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}📍 공유 이름:${NC} $UNIQUE_NAME"
echo -e "${CYAN}🌍 공개 URL:${NC} https://$UNIQUE_NAME.share.zrok.io"
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}사용 가능한 명령어:${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}risu-tunnel-start${NC}    - 터널 시작 (백그라운드)"
echo -e "${GREEN}risu-tunnel-stop${NC}     - 터널 중지"
echo -e "${GREEN}risu-tunnel-status${NC}   - 터널 상태 확인"
echo -e "${GREEN}risu-tunnel-restart${NC}  - 터널 재시작"
echo ""
echo -e "${CYAN}📋 로그 실시간 보기:${NC} tail -f ~/zrok-tunnel.log"
echo ""
echo -e "${YELLOW}💡 지금 바로 시작:${NC} risu-tunnel-start"
echo ""