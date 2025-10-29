#!/data/data/com.termux/files/usr/bin/bash

echo "========================================="
echo "  Risu-AI Restic 자동백업 설치 스크립트"
echo "  for Termux"
echo "========================================="
echo ""

# 1. Restic 설치 확인 및 설치
echo "[1/8] Restic 설치 중..."
if ! command -v restic &> /dev/null; then
    pkg update -y
    pkg install restic -y
else
    echo "✓ Restic이 이미 설치되어 있습니다."
fi

# 2. 사용자 입력 받기
echo ""
echo "[2/8] 백업 설정 정보 입력"
read -p "Risu-AI 설치 경로 (예: ~/risuai): " RISUAI_PATH
RISUAI_PATH="${RISUAI_PATH/#\~/$HOME}"

read -p "백업 저장 경로 (기본값: ~/backup/risuai): " BACKUP_PATH
BACKUP_PATH="${BACKUP_PATH:-$HOME/backup/risuai}"
BACKUP_PATH="${BACKUP_PATH/#\~/$HOME}"

read -sp "Restic 비밀번호 (백업 암호화용, 꼭 기억하세요!): " RESTIC_PASS
echo ""

# 3. 백업 폴더 생성
echo ""
echo "[3/8] 백업 폴더 생성 중..."
mkdir -p "$BACKUP_PATH"

# 4. Restic 저장소 초기화
echo ""
echo "[4/8] Restic 저장소 초기화 중..."
if [ ! -f "$BACKUP_PATH/config" ]; then
    export RESTIC_PASSWORD="$RESTIC_PASS"
    restic init --repo "$BACKUP_PATH"
else
    echo "✓ 이미 초기화된 저장소가 있습니다."
fi

# 5. 환경 변수 설정
echo ""
echo "[5/8] 환경 변수 설정 중..."
if ! grep -q "RESTIC_REPOSITORY" ~/.bashrc; then
    echo "" >> ~/.bashrc
    echo "# Restic Auto Backup Settings" >> ~/.bashrc
    echo "export RESTIC_REPOSITORY=\"$BACKUP_PATH\"" >> ~/.bashrc
    echo "export RESTIC_PASSWORD=\"$RESTIC_PASS\"" >> ~/.bashrc
fi

# 6. 백업 스크립트 생성
echo ""
echo "[6/8] 백업 스크립트 생성 중..."
mkdir -p ~/bin

cat > ~/bin/backup-risuai.sh << EOF
#!/data/data/com.termux/files/usr/bin/bash

export TZ='Asia/Seoul'
export RESTIC_REPOSITORY="$BACKUP_PATH"
export RESTIC_PASSWORD="$RESTIC_PASS"

cd $RISUAI_PATH

restic backup save --tag "\$(date +%Y%m%d_%H%M)"

restic forget \\
  --keep-within 24h \\
  --keep-daily 7 \\
  --keep-weekly 4 \\
  --prune

echo "[\$(date)] Backup completed" >> $HOME/risuai-backup.log
EOF

chmod +x ~/bin/backup-risuai.sh

# 7. Cronie 설치 및 설정
echo ""
echo "[7/8] Cron 설정 중..."
if ! command -v crond &> /dev/null; then
    pkg install cronie termux-services -y
    sv-enable crond
else
    echo "✓ Cronie가 이미 설치되어 있습니다."
fi

# Crontab 설정
(crontab -l 2>/dev/null | grep -v "backup-risuai.sh"; echo "*/10 * * * * ~/bin/backup-risuai.sh") | crontab -

# 8. 첫 백업 테스트
echo ""
echo "[8/8] 첫 백업 테스트 중..."
export RESTIC_REPOSITORY="$BACKUP_PATH"
export RESTIC_PASSWORD="$RESTIC_PASS"
cd "$RISUAI_PATH"
restic backup save --tag "$(date +%Y%m%d_%H%M)_initial"

echo ""
echo "========================================="
echo "  ✓ 설치 완료!"
echo "========================================="
echo ""
echo "설정 정보:"
echo "  - Risu-AI 경로: $RISUAI_PATH"
echo "  - 백업 저장 위치: $BACKUP_PATH"
echo "  - 백업 주기: 10분마다"
echo ""
echo "백업 관리 명령어:"
echo "  백업 목록 보기: restic snapshots"
echo "  백업 복원: restic restore latest --target $RISUAI_PATH"
echo "  특정 백업 복원: restic restore <ID> --target $RISUAI_PATH"
echo ""
echo "⚠️  주의사항:"
echo "  - Termux 앱이 백그라운드에서 종료되지 않도록 설정하세요"
echo "  - 배터리 최적화에서 Termux를 제외하세요"
echo "  - 비밀번호를 꼭 안전한 곳에 보관하세요!"
echo ""