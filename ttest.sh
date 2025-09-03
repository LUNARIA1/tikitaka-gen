#!/bin/bash

# --- 스크립트 시작부분 ---

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
echo "기존 zrok 제거 완료."
echo "-----------------------------------------------------"
sleep 1

# 4. zrok 최신 버전 자동 설치
echo "[3/8] zrok 최신 버전을 설치합니다..."
cd /tmp # 임시 폴더에서 작업

# 최신 버전 자동 감지 및 다운로드
ZROK_VERSION=$(curl -sSf https://api.github.com/repos/openziti/zrok/releases/latest | jq -r '.tag_name')
echo "감지된 최신 버전: $ZROK_VERSION"

# 아키텍처 감지
case $(uname -m) in
  x86_64) GOXARCH=amd64 ;;
  aarch64|arm64) GOXARCH=arm64 ;;
  arm*) GOXARCH=armv7 ;;
  *) echo "ERROR: unknown arch '$(uname -m)'" >&2; exit 1 ;;
esac

# 다운로드 및 설치
wget -q "https://github.com/openziti/zrok/releases/download/${ZROK_VERSION}/zrok_${ZROK_VERSION#v}_linux_${GOXARCH}.tar.gz"
if [ $? -ne 0 ]; then
    echo "[오류] zrok 다운로드에 실패했습니다."
    exit 1
fi

tar -xf "zrok_${ZROK_VERSION#v}_linux_${GOXARCH}.tar.gz"
sudo install -o root -g root ./zrok /usr/local/bin/
rm "zrok_${ZROK_VERSION#v}_linux_${GOXARCH}.tar.gz"
echo "zrok 설치 완료."
echo "-----------------------------------------------------"
sleep 1

# 5. 설치된 zrok 버전 확인
echo "[4/8] 설치된 zrok 버전을 확인합니다..."
INSTALLED_VERSION=$(zrok version)
echo "설치된 버전: $INSTALLED_VERSION"
echo "버전 확인 완료."
echo "-----------------------------------------------------"
sleep 1

# 6. zrok 활성화 (인자로 받은 토큰 사용)
echo "[5/8] zrok 계정을 활성화합니다..."
# 기존 zrok 설정 파일 제거하여 완벽하게 초기화
rm -rf ~/.zrok
zrok enable $ZROK_TOKEN
if [ $? -ne 0 ]; then
    echo "[오류] zrok 활성화에 실패했습니다. 토큰이 정확한지, zrok 서비스가 정상인지 확인해주세요."
    echo "또는 zrok 서비스 엔드포인트를 확인해 보세요:"
    echo "  zrok config set apiEndpoint https://api.zrok.io"
    exit 1
fi

# 활성화 상태 확인
if ! zrok status | grep -q "Enabled"; then
    echo "[오류] zrok 활성화 확인에 실패했습니다."
    exit 1
fi

echo "zrok 활성화가 완료되었습니다."
echo "-----------------------------------------------------"
sleep 1

# 7. SillyTavern 설치 및 실행 스크립트 생성
echo "[6/8] SillyTavern (staging)을 설치하고 실행 스크립트를 생성합니다..."
cd ~
rm -rf SillyTavern
git clone https://github.com/SillyTavern/SillyTavern.git
cd SillyTavern
git checkout staging
echo "npm install을 실행합니다. 시간이 매우 오래 걸릴 수 있습니다..."
npm install

cat << EOF > ~/run_silly.sh
#!/bin/bash
cd ~/SillyTavern
node server.js &
ST_PID=\$!
echo "SillyTavern 서버 시작 (PID: \$ST_PID). 10초 후 zrok 터널을 시작합니다."
sleep 10
zrok share public http://localhost:8000 --headless
kill \$ST_PID
EOF
chmod +x ~/run_silly.sh
echo "SillyTavern 설치 및 스크립트 생성 완료."
echo "-----------------------------------------------------"
sleep 1

# 8. screen을 사용하여 백그라운드에서 실행
echo "[7/8] screen 세션(${SCREEN_NAME})을 생성하여 서버를 백그라운드에서 실행합니다."
screen -dmS ${SCREEN_NAME} ~/run_silly.sh

echo ""
echo "🎉 모든 설치 및 실행 과정이 완료되었습니다! 🎉"
echo ""
echo "터미널을 닫아도 서버는 계속 실행됩니다."
echo "접속 주소를 확인하려면 10~20초 정도 기다린 후, 아래 명령어를 입력하세요."
echo ""
echo "👉 screen -r ${SCREEN_NAME}"
echo ""
echo "위 명령어로 접속 후 나오는 'public URL'을 휴대폰에서 사용하세요."
echo "터미널로 돌아오려면 Ctrl + A 누른 후 D 키를 누르세요."
echo ""

# --- 스크립트 끝 ---
