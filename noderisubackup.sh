#!/data/data/com.termux/files/usr/bin/bash

set -e

echo "🔄 RisuAI 안전 업데이트를 시작합니다..."
echo ""

# RisuAI 디렉토리 확인
INSTALL_DIR="$HOME/Risu-AI"

if [ ! -d "$INSTALL_DIR" ]; then
    echo "❌ RisuAI가 설치되지 않았습니다."
    exit 1
fi

cd "$INSTALL_DIR"

# 백업 생성
BACKUP_DIR="$HOME/Risu-AI-backup-$(date +%Y%m%d_%H%M%S)"
echo "💾 현재 버전 백업 중..."
cp -r "$INSTALL_DIR" "$BACKUP_DIR"
echo "✅ 백업 완료: $BACKUP_DIR"
echo ""

# Git 상태 확인
echo "📡 업데이트 확인 중..."
git fetch

LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u})

if [ "$LOCAL" = "$REMOTE" ]; then
    echo "✅ 이미 최신 버전입니다!"
    echo ""
    read -p "백업을 삭제하시겠습니까? (y/N): " DELETE_BACKUP
    if [ "$DELETE_BACKUP" = "y" ] || [ "$DELETE_BACKUP" = "Y" ]; then
        rm -rf "$BACKUP_DIR"
        echo "🗑️  백업 삭제됨"
    fi
    exit 0
fi

echo "📥 새 업데이트가 있습니다!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Git Pull
echo "📥 최신 코드 다운로드 중..."
if ! git pull; then
    echo "❌ 업데이트 실패!"
    echo "백업에서 복구하려면 다음 명령어를 실행하세요:"
    echo "rm -rf $INSTALL_DIR && mv $BACKUP_DIR $INSTALL_DIR"
    exit 1
fi

# 의존성 설치
echo "📦 의존성 업데이트 중..."
pnpm install

# 빌드
echo "🔨 빌드 중..."
if ! pnpm run build; then
    echo "❌ 빌드 실패!"
    echo "백업에서 복구하려면 다음 명령어를 실행하세요:"
    echo "rm -rf $INSTALL_DIR && mv $BACKUP_DIR $INSTALL_DIR"
    exit 1
fi

# PM2 재시작
echo "🔄 서버 재시작 중..."
pm2 restart server

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ 업데이트 완료!"
echo ""
echo "백업: $BACKUP_DIR"
read -p "백업을 삭제하시겠습니까? (y/N): " DELETE_BACKUP
if [ "$DELETE_BACKUP" = "y" ] || [ "$DELETE_BACKUP" = "Y" ]; then
    rm -rf "$BACKUP_DIR"
    echo "🗑️  백업 삭제됨"
else
    echo "💾 백업 유지됨"
fi
echo ""