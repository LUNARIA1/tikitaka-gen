#!/bin/bash

# --- SillyTavern + zrok 자동 설치 스크립트 (v1.1.3 호환) ---

# 1. 명령어 인자(argument) 확인 및 변수 설정
ZROK_TOKEN=$1
SCREEN_NAME=$2

if [ -z "$ZROK_TOKEN" ] || [ -z "$SCREEN_NAME" ]; then
  echo "[오류] zrok 토큰과 서버 이름을 함께 입력해야 합니다."
  echo "사용 예시: curl ... | bash -s -- YOUR_ZROK_TOKEN my-silly-server"
  exit 1
fi

echo "SillyTavern + zrok 자동 설치를 시작합니다."
echo "zrok 토큰: ${ZROK_TOKEN:0:4}..." # 토큰 일부만 표시
echo "서버(screen) 이름: ${SCREEN_NAME}"
echo "-----------------------------------------------------"
sleep 4

# 2. 시스템 패키지 업데이트 및 필수 도구 설치
echo "[1/8] 시스템을 업데이트하고 필수 패키지를 설치합니다..."
sudo apt-get update
sudo apt-get install -y git nodejs npm screen wget jq curl
echo "패키지 설치 완료."
echo "-----------------------------------------------------"
sleep 1

# 3. 기존 zrok 파일 강제 삭제 (유령 퇴치)
echo "[2/8] 시스템에 남아있을 수 있는 이전 버전의 zrok을 제거합니다..."
sudo rm -f /usr/local/bin/zrok /usr/bin/zrok
rm -rf ~/.zrok
echo "기존 zrok 제거 완료."
echo "-----------------------------------------------------"
sleep 1

# 4. zrok 최신 버전 자동 설치
echo "[3/8] zrok 최신 버전을 자동으로 설치합니다..."
cd /tmp # 임시 폴더에서 작업

# 최신 버전 자동 감지
ZROK_VERSION=$(curl -sSf https://api.github.com/repos/openziti/zrok/releases/latest | jq -r '.tag_name')
if [ -z "$ZROK_VERSION" ] || [ "$ZROK_VERSION" = "null" ]; then
    echo "[오류] 최신 zrok 버전 정보를 가져올 수 없습니다."
    exit 1
fi
echo "감지된 최신 버전: $ZROK_VERSION"

# 아키텍처 감지
case $(uname -m) in
  x86_64) GOXARCH=amd64 ;;
  aarch64|arm64) GOXARCH=arm64 ;;
  arm*) GOXARCH=armv7 ;;
  *) echo "[오류] 지원되지 않는 아키텍처 '$(uname -m)'" >&2; exit 1 ;;
esac

# 다운로드 및 설치
DOWNLOAD_URL="https://github.com/openziti/zrok/releases/download/${ZROK_VERSION}/zrok_${ZROK_VERSION#v}_linux_${GOXARCH}.tar.gz"
echo "다운로드 중: $DOWNLOAD_URL"
wget -q "$DOWNLOAD_URL"
if [ $? -ne 0 ]; then
    echo "[오류] zrok 다운로드에 실패했습니다."
    exit 1
fi

tar -xf "zrok_${ZROK_VERSION#v}_linux_${GOXARCH}.tar.gz"
if [ ! -f "zrok" ]; then
    echo "[오류] zrok 압축 해제에 실패했습니다."
    exit 1
fi

sudo install -o root -g root ./zrok /usr/local/bin/
rm "zrok_${ZROK_VERSION#v}_linux_${GOXARCH}.tar.gz" ./zrok
echo "zrok 설치 완료."
echo "-----------------------------------------------------"
sleep 1

# 5. 설치된 zrok 버전 확인
echo "[4/8] 설치된 zrok 버전을 확인합니다..."
INSTALLED_VERSION=$(zrok version 2>/dev/null | grep -o "v[0-9]\+\.[0-9]\+\.[0-9]\+" | head -1)
echo "설치된 버전: $INSTALLED_VERSION"
if [ -z "$INSTALLED_VERSION" ]; then
    echo "[경고] zrok 버전을 확인할 수 없지만 계속 진행합니다."
else
    echo "버전 확인 완료."
fi
echo "-----------------------------------------------------"
sleep 1

# 6. zrok 활성화 (인자로 받은 토큰 사용)
echo "[5/8] zrok 계정을 활성화합니다..."
zrok enable $ZROK_TOKEN
ENABLE_RESULT=$?

if [ $ENABLE_RESULT -ne 0 ]; then
    echo "[오류] zrok 활성화에 실패했습니다. 토큰이 정확한지 확인해주세요."
    echo "토큰: ${ZROK_TOKEN}"
    echo "다음 명령어를 수동으로 실행해보세요:"
    echo "  zrok enable $ZROK_TOKEN"
    exit 1
fi

# 활성화 상태 확인
sleep 2
STATUS_CHECK=$(zrok status 2>/dev/null | grep -i "enabled\|account token" | wc -l)
if [ $STATUS_CHECK -lt 1 ]; then
    echo "[경고] zrok 활성화 상태를 확인할 수 없지만 계속 진행합니다."
else
    echo "zrok 활성화가 완료되었습니다."
fi
echo "-----------------------------------------------------"
sleep 1

# 7. SillyTavern 설치 및 실행 스크립트 생성
echo "[6/8] SillyTavern (staging)을 설치하고 실행 스크립트를 생성합니다..."
cd ~
rm -rf SillyTavern
git clone https://github.com/SillyTavern/SillyTavern.git
if [ $? -ne 0 ]; then
    echo "[오류] SillyTavern 다운로드에 실패했습니다."
    exit 1
fi

cd SillyTavern
git checkout staging
echo "npm install을 실행합니다. 시간이 매우 오래 걸릴 수 있습니다..."
npm install --production
if [ $? -ne 0 ]; then
    echo "[오류] SillyTavern 의존성 설치에 실패했습니다."
    exit 1
fi

# SillyTavern 설정 파일 생성 (외부 접속 허용)
echo "SillyTavern 설정을 외부 접속 허용으로 변경합니다..."
cat << 'CONFIGEOF' > config.yaml
# SillyTavern Configuration - zrok 터널링 호환 설정
listen: true
whitelistMode: false
whitelist: []
basicAuthMode: false
enableCorsProxy: true
enableExtensions: true
securityOverride: false
avoidFfmpegForAv1: false
enableThumbnails: true
thumbnailsQuality: 95
thumbnailsType: "webp"
multiUserMode: false
users: []
enableUserWAUploads: false
enableWelcomeMessage: false
speechSynthesis:
  enabled: false
requestProxyEnabled: false
requestProxyBypass: []
classificationService: false
CONFIGEOF
echo "SillyTavern 외부 접속 설정 완료."

# 향상된 실행 스크립트 생성
cat << 'EOF' > ~/run_silly.sh
#!/bin/bash
echo "SillyTavern + zrok 터널을 시작합니다..."
echo "----------------------------------------"

cd ~/SillyTavern

# SillyTavern 서버 시작
echo "SillyTavern 서버를 시작합니다..."
node server.js &
ST_PID=$!
echo "SillyTavern 서버 시작됨 (PID: $ST_PID)"

# 서버가 완전히 시작될 때까지 대기
echo "서버 초기화를 위해 15초 대기합니다..."
sleep 15

# 서버가 정상적으로 실행되는지 확인
if ! ps -p $ST_PID > /dev/null; then
    echo "[오류] SillyTavern 서버 시작에 실패했습니다."
    exit 1
fi

echo "zrok 터널을 시작합니다..."
echo "터널이 시작되면 URL이 표시됩니다."
echo "터널을 중지하려면 Ctrl+C를 누르세요."
echo "----------------------------------------"

# zrok 터널 시작 (헤드리스 모드)
zrok share public http://localhost:8000 --headless

# 정리 작업
echo "터널이 종료되었습니다. SillyTavern 서버를 종료합니다..."
kill $ST_PID 2>/dev/null
wait $ST_PID 2>/dev/null
echo "서버 종료 완료."
EOF

chmod +x ~/run_silly.sh
echo "SillyTavern 설치 및 스크립트 생성 완료."
echo "-----------------------------------------------------"
sleep 1

# 8. screen을 사용하여 백그라운드에서 실행
echo "[7/8] screen 세션(${SCREEN_NAME})을 생성하여 서버를 백그라운드에서 실행합니다."
screen -dmS ${SCREEN_NAME} ~/run_silly.sh
sleep 2

# screen 세션이 정상적으로 생성되었는지 확인
if screen -list | grep -q "${SCREEN_NAME}"; then
    echo "screen 세션이 성공적으로 생성되었습니다."
else
    echo "[경고] screen 세션 생성을 확인할 수 없습니다."
fi

echo ""
echo "🎉 모든 설치 및 실행 과정이 완료되었습니다! 🎉"
echo ""
echo "다음 명령어들을 사용할 수 있습니다:"
echo ""
echo "📱 터널 URL 확인하기:"
echo "   screen -r ${SCREEN_NAME}"
echo "   (나가려면: Ctrl + A, 그다음 D)"
echo ""
echo "🔄 서버 재시작하기:"
echo "   screen -S ${SCREEN_NAME} -X quit"
echo "   screen -dmS ${SCREEN_NAME} ~/run_silly.sh"
echo ""
echo "📊 실행중인 screen 세션 목록:"
echo "   screen -list"
echo ""
echo "⏹️  서버 완전히 중지하기:"
echo "   screen -S ${SCREEN_NAME} -X quit"
echo ""
echo "터미널을 닫아도 서버는 계속 실행됩니다."
echo "URL 확인을 위해 15-30초 정도 기다린 후 screen 명령어를 사용하세요."
echo ""

# --- 스크립트 끝 ---
