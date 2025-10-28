#!/bin/bash

set -e  # 에러 발생 시 중단

echo "🚀 RisuAI 설치를 시작합니다..."

# 시스템 업데이트
echo "📦 시스템 업데이트 중..."
sudo apt-get update -y
sudo apt-get upgrade -y

# NVM 설치
echo "📥 NVM 설치 중..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# NVM 로드
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Node.js 설치
echo "📥 Node.js 설치 중..."
nvm install node

# pnpm 설치
echo "📥 pnpm 설치 중..."
npm install -g pnpm

# Git 클론 (디렉토리 자동 생성)
INSTALL_DIR="$HOME/Risu-AI"
echo "📥 RisuAI 다운로드 중..."
git clone "https://github.com/kwaroran/RisuAI.git" "$INSTALL_DIR"
cd "$INSTALL_DIR"

# NODE_OPTIONS 환경변수 설정 (.bashrc에 추가)
echo "⚙️  환경변수 설정 중..."
if ! grep -q "NODE_OPTIONS=--max_old_space_size=4096" "$HOME/.bashrc"; then
    echo 'export NODE_OPTIONS=--max_old_space_size=4096' >> "$HOME/.bashrc"
fi

# 환경변수 즉시 적용
export NODE_OPTIONS=--max_old_space_size=4096

# 의존성 설치
echo "📦 의존성 설치 중..."
pnpm install

# PM2 설치
echo "📦 PM2 설치 중..."
npm install -g pm2@latest

# 빌드
echo "🔨 빌드 중..."
pnpm run build

# PM2로 서버 시작
echo "🚀 서버 시작 중..."
pm2 start server/node/server.cjs

echo ""
echo "✅ 설치 완료!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📍 설치 위치: $INSTALL_DIR"
echo "🔍 서버 상태: pm2 status"
echo "📋 서버 로그: pm2 logs"
echo "🔄 서버 재시작: pm2 restart server"
echo "⏹️  서버 중지: pm2 stop server"
