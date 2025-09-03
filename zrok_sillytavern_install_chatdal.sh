#!/bin/bash

# --- 스크립트 시작 ---

# 사용자에게 시작을 알림
echo "============================================================"
echo "SillyTavern & zrok 자동 설치를 시작합니다."
echo "이 과정은 5~10분 정도 소요될 수 있습니다."
echo "============================================================"
sleep 3

# 1. 시스템 패키지 업데이트 및 필수 도구 설치
echo "\n[1/6] 시스템 업데이트 및 필수 도구(git, screen, curl) 설치 중..."
sudo apt-get update
sudo apt-get install -y git curl wget screen
echo "완료!"

# 2. Node.js 설치 (nvm 사용)
echo "\n[2/6] Node.js 설치 관리자(nvm) 및 Node.js v20 설치 중..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
nvm install 20
nvm use 20
nvm alias default 20
echo "완료!"

# 3. SillyTavern 설치 (staging 브랜치)
echo "\n[3/6] SillyTavern (staging 브랜치) 설치 중..."
cd $HOME
git clone https://github.com/SillyTavern/SillyTavern.git
cd SillyTavern
git checkout staging
npm install
echo "완료!"

# 4. zrok 설치
echo "\n[4/6] zrok 터널링 프로그램 설치 중..."
cd $HOME
wget https://github.com/openziti/zrok/releases/download/v0.4.23/zrok_0.4.23_linux_amd64.tar.gz
tar -xvf zrok_0.4.23_linux_amd64.tar.gz
sudo mv zrok /usr/local/bin/
rm zrok_0.4.23_linux_amd64.tar.gz
echo "완료!"

# 5. zrok 계정 활성화 (사용자 입력 필요)
echo "\n[5/6] zrok 계정 활성화 단계입니다."
echo "------------------------------------------------------------"
echo "1. 웹 브라우저에서 https://api.zrok.io/ 에 접속하여 가입하세요."
echo "2. 가입 후 화면에 보이는 'Your zrok enable token'을 복사하세요."
echo "   (예: abc123def456ghi... 와 같은 긴 텍스트입니다)"
echo "------------------------------------------------------------"
read -p "복사한 zrok enable token을 여기에 붙여넣고 Enter를 누르세요: " ZROK_TOKEN
zrok enable $ZROK_TOKEN
echo "zrok 활성화 완료!"

# 6. 서비스 실행 스크립트 생성 및 screen으로 실행
echo "\n[6/6] SillyTavern과 zrok을 백그라운드에서 실행합니다..."

# 실행 스크립트 생성
cat > $HOME/start_services.sh << EOL
#!/bin/bash
cd $HOME/SillyTavern
echo "SillyTavern과 zrok 터널을 시작합니다..."
# zrok을 백그라운드에서 실행하고, 로그를 파일에 저장합니다.
zrok share public http://localhost:8000 --backend-mode proxy > \$HOME/zrok.log 2>&1 &
sleep 5 # zrok이 시작되고 로그가 기록될 시간을 줍니다.
echo "SillyTavern 서버를 시작합니다..."
node server.js
EOL

# 실행 권한 부여
chmod +x $HOME/start_services.sh

# screen을 사용하여 백그라운드에서 실행
screen -S sillytavern -dm bash $HOME/start_services.sh
sleep 10 # 서비스가 완전히 시작될 때까지 대기

# 최종 결과 출력
echo "============================================================"
echo "🎉 모든 설치 및 설정이 완료되었습니다! 🎉"
echo "\nSillyTavern이 백그라운드에서 계속 실행됩니다."
echo "아래의 zrok 주소로 접속하여 모바일 데이터 환경에서 사용할 수 있습니다."
echo "이 주소를 복사하여 잘 보관하세요."
echo "\n✅ 당신의 접속 주소:"
grep -o 'https://[a-zA-Z0-9]*\.zrok\.io' $HOME/zrok.log
echo "\n============================================================"
echo "터미널 창을 닫아도 서버는 종료되지 않습니다."
echo "나중에 서버 상태를 확인하려면 'screen -r sillytavern' 명령어를 입력하세요."
echo "서버를 중지하려면 확인창에서 Ctrl+C를 누르세요."
echo "============================================================"

# --- 스크립트 끝 ---
