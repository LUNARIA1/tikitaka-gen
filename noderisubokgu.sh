#!/data/data/com.termux/files/usr/bin/bash

set -e

echo "🔙 RisuAI 백업 복구"
echo ""

# 백업 디렉토리 찾기
BACKUPS=($(ls -d "$HOME"/Risu-AI-backup-* 2>/dev/null | sort -r))

if [ ${#BACKUPS[@]} -eq 0 ]; then
    echo "❌ 백업을 찾을 수 없습니다."
    exit 1
fi

echo "📦 사용 가능한 백업:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
for i in "${!BACKUPS[@]}"; do
    BACKUP_NAME=$(basename "${BACKUPS[$i]}")
    BACKUP_DATE=$(echo "$BACKUP_NAME" | grep -oP '\d{8}_\d{6}')
    FORMATTED_DATE=$(echo "$BACKUP_DATE" | sed 's/\([0-9]\{4\}\)\([0-9]\{2\}\)\([0-9]\{2\}\)_\([0-9]\{2\}\)\([0-9]\{2\}\)\([0-9]\{2\}\)/\1-\2-\3 \4:\5:\6/')
    echo "$((i+1)). $FORMATTED_DATE"
done
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 백업 선택
read -p "복구할 백업 번호를 입력하세요 (1-${#BACKUPS[@]}): " CHOICE

if ! [[ "$CHOICE" =~ ^[0-9]+$ ]] || [ "$CHOICE" -lt 1 ] || [ "$CHOICE" -gt ${#BACKUPS[@]} ]; then
    echo "❌ 잘못된 번호입니다."
    exit 1
fi

SELECTED_BACKUP="${BACKUPS[$((CHOICE-1))]}"

echo ""
echo "⚠️  현재 RisuAI를 삭제하고 백업으로 복구합니다."
read -p "계속하시겠습니까? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "❌ 취소되었습니다."
    exit 0
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 서버 중지
echo "⏹️  서버 중지 중..."
pm2 stop server 2>/dev/null || true

# 현재 버전 삭제
echo "🗑️  현재 버전 삭제 중..."
rm -rf "$HOME/Risu-AI"

# 백업 복구
echo "📦 백업 복구 중..."
cp -r "$SELECTED_BACKUP" "$HOME/Risu-AI"

# 서버 재시작
echo "🔄 서버 재시작 중..."
cd "$HOME/Risu-AI"
pm2 restart server

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ 복구 완료!"
echo ""
echo "📍 서버 상태: pm2 status"
echo "📋 서버 로그: pm2 logs server"
echo ""