#!/usr/bin/env bash

set -e  # 에러 발생 시 중단

echo "🚀 RisuAI 설치를 시작합니다 (WSL/Ubuntu)..."

# apt 패키지 리스트 업데이트 및 업그레이드
echo "📦 패키지 업데이트 중... (sudo 비밀번호를 입력해야 할 수 있습니다)"
sudo apt update -y
sudo apt upgrade -y

# 필요한 패키지 설치
echo "📦 필수 패키지(nodejs, git) 설치 중..."
sudo apt install -y nodejs npm git

# pnpm 설치
echo "📥 pnpm 설치 중..."
sudo npm install -g pnpm

# Git 클론 (현재 디렉토리에 RisuAI 폴더 생성)
INSTALL_DIR="RisuAI"
echo "📥 RisuAI 다운로드 중 (${INSTALL_DIR})..."
if [ -d "$INSTALL_DIR" ]; then
    echo "⚠️  이미 설치된 디렉토리가 있습니다. 삭제 후 다시 설치합니다..."
    rm -rf "$INSTALL_DIR"
fi
git clone "https://github.com/kwaroran/RisuAI.git" "$INSTALL_DIR"
cd "$INSTALL_DIR"

# NODE_OPTIONS 환경변수 설정 (현재 쉘과 .bashrc에 모두 적용)
echo "⚙️  환경변수 설정 중..."
if ! grep -q "NODE_OPTIONS=--max_old_space_size=4096" "$HOME/.bashrc"; then
    echo 'export NODE_OPTIONS=--max_old_space_size=4096' >> "$HOME/.bashrc"
    echo ".bashrc에 환경변수가 추가되었습니다. 새 터미널부터 적용됩니다."
fi
# 현재 세션에도 즉시 적용
export NODE_OPTIONS=--max_old_space_size=4096

# 의존성 설치
echo "📦 의존성 설치 중..."
pnpm install

# PM2 설치
echo "📦 PM2 설치 중..."
sudo npm install -g pm2@latest

# 빌드
echo "🔨 빌드 중..."
pnpm run build

# PM2로 서버 시작
echo "🚀 서버 시작 중..."
pm2 start server/node/server.cjs --name risuai

echo ""
echo "✅ 설치 완료!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📍 설치 위치: $(pwd)"
echo "🔍 서버 상태: pm2 status"
echo "📋 서버 로그: pm2 logs risuai"
echo "🔄 서버 재시작: pm2 restart risuai"
echo "⏹️  서버 중지: pm2 stop risuai"
echo "💾 PM2 프로세스 목록 저장: pm2 save"