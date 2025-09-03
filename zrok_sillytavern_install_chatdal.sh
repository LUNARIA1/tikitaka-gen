#!/bin/bash

# --- 스크립트 시작 ---

echo "SillyTavern + zrok 자동 설치를 시작합니다."
echo "이 스크립트는 Ubuntu 22.04 LTS 환경에 최적화되어 있습니다."
echo "-----------------------------------------------------"
sleep 3

# 1. 시스템 패키지 업데이트 및 필수 도구 설치
echo "[1/6] 시스템을 업데이트하고 필수 패키지(git, nodejs, npm, screen)를 설치합니다..."
sudo apt-get update
sudo apt-get install -y git nodejs npm screen curl
echo "패키지 설치 완료."
echo "-----------------------------------------------------"
sleep 1

# 2. SillyTavern (staging 브랜치) 설치
echo "[2/6] SillyTavern (staging 브랜치)를 설치합니다..."
cd ~
git clone https://github.com/SillyTavern/SillyTavern.git
cd SillyTavern
git checkout staging
echo "SillyTavern 다운로드 완료."
echo "npm으로 관련 모듈을 설치합니다. 시간이 다소 걸릴 수 있습니다..."
npm install
echo "SillyTavern 설치 완료."
echo "-----------------------------------------------------"
sleep 1

# 3. zrok 설치 (공식 스크립트로 항상 최신 버전 설치)
echo "[3/6] 최신 버전의 zrok을 자동으로 설치합니다..."
# <<< 여기가 수정된 부분입니다! >>>
curl -sSf https://get.openziti.io/install.bash | sudo bash -s zrok
echo "zrok 설치 완료."
echo "-----------------------------------------------------"
sleep 1

# 4. zrok 활성화 (사용자 입력 필요)
echo "[4/6] zrok 계정을 활성화합니다."
read -p "zrok.io에서 복사한 토큰을 여기에 붙여넣고 Enter 키를 누르세요: " ZROK_TOKEN < /dev/tty
zrok enable $ZROK_TOKEN
# 에러가 발생하면 스크립트를 중지하도록 처리
if [ $? -ne 0 ]; then
    echo "[오류] zrok 활성화에 실패했습니다. 토큰이 정확한지 확인해주세요."
    exit 1
fi
echo "zrok 활성화가 완료되었습니다."
echo "-----------------------------------------------------"
sleep 1

# 5. 실행 스크립트 생성
echo "[5/6] SillyTavern과 zrok을 동시에 실행할 스크립트를 생성합니다..."
cat << 'EOF' > ~/run_silly.sh
#!/bin/bash
echo "SillyTavern 서버를 백그라운드에서 시작합니다..."
cd ~/SillyTavern
node server.js &
ST_PID=$!

echo "SillyTavern 서버가 시작될 때까지 10초간 대기합니다..."
sleep 10

echo "zrok 터널을 시작합니다. 아래 public URL로 접속하세요."
zrok share public http://localhost:8000 --headless

# 스크립트 종료 시 SillyTavern 프로세스도 함께 종료
kill $ST_PID
EOF

chmod +x ~/run_silly.sh
echo "실행 스크립트 생성 완료."
echo "-----------------------------------------------------"
sleep 1

# 6. screen을 사용하여 백그라운드에서 실행
echo "[6/6] screen 세션을 생성하여 SillyTavern과 zrok을 백그라운드에서 실행합니다."
screen -dmS silly ~/run_silly.sh

echo ""
echo "🎉 모든 설치 및 실행 과정이 완료되었습니다! 🎉"
echo ""
echo "이제 이 터미널 창을 닫아도 서버는 계속 실행됩니다."
echo "접속 주소를 확인하려면 10초 정도 기다린 후, 아래 명령어를 입력하세요."
echo ""
echo "👉 screen -r silly"
echo ""
echo "위 명령어를 입력하면 나오는 'public URL' 주소를 복사하여 휴대폰 웹 브라우저에 붙여넣으세요."
echo "터미널로 돌아오려면 키보드에서 Ctrl + A 를 누른 후 D 키를 누르세요."
echo ""

# --- 스크립트 끝 ---
