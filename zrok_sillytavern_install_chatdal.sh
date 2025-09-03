#!/bin/bash

# 사용자에게 시작을 알림
echo "============================================================"
echo "SillyTavern 및 zrok 자동 설치를 시작합니다."
echo "이 작업은 몇 분 정도 소요될 수 있습니다. 잠시만 기다려주세요."
echo "============================================================"

# 1. 시스템 업데이트 및 필수 패키지 설치
echo "[1/6] 시스템을 업데이트하고 필수 패키지를 설치합니다..."
sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get install -y git curl wget unzip screen nodejs npm

# 2. SillyTavern 설치 (staging 브랜치)
echo "[2/6] SillyTavern (staging 브랜치)를 다운로드합니다..."
cd ~
git clone https://github.com/SillyTavern/SillyTavern.git
cd SillyTavern
git checkout staging
echo "SillyTavern 다운로드 완료."

# 3. SillyTavern 종속성 설치
echo "[3/6] SillyTavern에 필요한 파일들을 설치합니다. (npm install)"
npm install

# 4. zrok 설치 및 설정
echo "[4/6] zrok 터널링 프로그램을 설치합니다..."
wget https://github.com/openziti/zrok/releases/download/v0.4.23/zrok_0.4.23_linux_amd64.tar.gz
tar -xvf zrok_0.4.23_linux_amd64.tar.gz
rm zrok_0.4.23_linux_amd64.tar.gz

# zrok 토큰을 사용자에게 입력받음
read -p "zrok 웹사이트에서 복사한 토큰(Token)을 여기에 붙여넣고 Enter를 누르세요: " ZROK_TOKEN
./zrok enable "$ZROK_TOKEN"
echo "zrok 설정이 완료되었습니다."

# 5. screen을 사용하여 백그라운드에서 실행
echo "[5/6] SillyTavern과 zrok을 백그라운드에서 실행합니다..."
# SillyTavern 실행
screen -dmS sillytavern bash -c 'cd ~/SillyTavern && node server.js'

# zrok 실행 (SillyTavern이 8000번 포트를 사용)
screen -dmS zrok bash -c 'cd ~/SillyTavern && ./zrok share public http://localhost:8000'

# zrok이 공개 주소를 생성할 때까지 잠시 대기
echo "zrok이 외부 접속 주소를 생성 중입니다. (약 15초 소요)"
sleep 15

# 6. 최종 접속 주소 표시
echo "[6/6] 모든 설정이 완료되었습니다!"
PUBLIC_URL=$(./zrok access public $(./zrok status | grep -o 'token=[^ ]*' | sed 's/token=//'))

# zrok status --frontends | grep -o 'https://[a-zA-Z0-9-]*\.share.zrok.io'
# zrok 0.4.23 버전부터는 위의 명령어가 잘 동작하지 않을 수 있어, 아래 방식으로 URL을 가져옵니다.
ZROK_URL=$(screen -S zrok -X stuff 'zrok status'`echo -ne '\015'` && sleep 1 && screen -S zrok -p 0 -X hardcopy -h /tmp/zrok.log && cat /tmp/zrok.log | grep -o 'https://[a-zA-Z0-9-]*\.share.zrok.io' | head -n 1)


echo "============================================================"
echo "🎉 설치가 완료되었습니다! 🎉"
echo "아래 주소를 복사하여 스마트폰이나 다른 컴퓨터에서 접속하세요:"
echo "$ZROK_URL"
echo "============================================================"