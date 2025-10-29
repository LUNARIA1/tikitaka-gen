#!/data/data/com.termux/files/usr/bin/bash

echo "========================================="
echo "  Risu-AI Restic 자동백업 설치 스크립트"
echo "  Google Drive 연동 버전"
echo "  for Termux"
echo "========================================="
echo ""

# 1. 패키지 설치
echo "[1/9] 필요한 패키지 설치 중..."
if ! command -v restic &> /dev/null; then
    pkg update -y
    pkg install restic -y
else
    echo "✓ Restic이 이미 설치되어 있습니다."
fi

if ! command -v rclone &> /dev/null; then
    pkg install rclone -y
else
    echo "✓ Rclone이 이미 설치되어 있습니다."
fi

# 2. Risu-AI 경로 설정
echo ""
echo "[2/9] Risu-AI 설정"
read -p "Risu-AI 설치 경로 (기본값: ~/Risu-AI, Enter만 치면 기본값): " RISUAI_PATH
RISUAI_PATH="${RISUAI_PATH:-$HOME/Risu-AI}"
RISUAI_PATH="${RISUAI_PATH/#\~/$HOME}"

# 경로 존재 확인
if [ ! -d "$RISUAI_PATH" ]; then
    echo "⚠️  경고: $RISUAI_PATH 폴더가 존재하지 않습니다."
    read -p "그래도 계속하시겠습니까? (y/N): " CONTINUE
    if [[ ! "$CONTINUE" =~ ^[Yy]$ ]]; then
        echo "설치를 취소합니다."
        exit 1
    fi
fi

# 3. Google Drive 설정
echo ""
echo "[3/9] Google Drive 연결 설정"
echo ""
echo "이제 Google Drive에 연결합니다."
echo "브라우저가 자동으로 열리면 Google 계정으로 로그인하고"
echo "Rclone 접근을 허용해주세요."
echo ""
read -p "준비되셨으면 Enter를 눌러주세요..."

# Rclone 설정 확인
if rclone listremotes | grep -q "gdrive:"; then
    echo "✓ Google Drive가 이미 연결되어 있습니다."
    read -p "기존 연결을 사용하시겠습니까? (Y/n): " USE_EXISTING
    if [[ ! "$USE_EXISTING" =~ ^[Nn]$ ]]; then
        GDRIVE_REMOTE="gdrive"
    else
        echo "새로 설정합니다..."
        SETUP_GDRIVE=true
    fi
else
    SETUP_GDRIVE=true
fi

if [ "$SETUP_GDRIVE" = true ]; then
    echo ""
    echo "Google Drive 자동 설정을 시작합니다..."
    echo "다음 단계를 따라주세요:"
    echo ""
    echo "1. 'n' 입력 (새 리모트)"
    echo "2. 이름: 'gdrive' 입력"
    echo "3. Storage 선택: 'drive' 또는 번호 입력 (Google Drive)"
    echo "4. Client ID: 그냥 Enter (비워두기)"
    echo "5. Client Secret: 그냥 Enter (비워두기)"
    echo "6. Scope: '1' 입력 (Full access)"
    echo "7. Root folder ID: 그냥 Enter"
    echo "8. Service Account: 그냥 Enter"
    echo "9. Advanced config: 'n' 입력"
    echo "10. Auto config: 'y' 입력"
    echo "    → 브라우저가 열리면 Google 로그인 후 허용"
    echo "11. Team Drive: 'n' 입력"
    echo "12. 'y' 입력 (설정 확인)"
    echo "13. 'q' 입력 (종료)"
    echo ""
    read -p "위 내용을 확인했으면 Enter를 눌러 rclone config를 실행합니다..."
    
    rclone config
    
    # 설정 확인
    if rclone listremotes | grep -q "gdrive:"; then
        echo "✓ Google Drive 연결 성공!"
        GDRIVE_REMOTE="gdrive"
    else
        echo "❌ Google Drive 연결에 실패했습니다."
        echo "rclone config를 다시 실행해서 수동으로 설정해주세요."
        exit 1
    fi
fi

# 4. Google Drive 백업 폴더 설정
echo ""
echo "[4/9] Google Drive 백업 폴더 설정"
read -p "Google Drive 내 백업 폴더 이름 (기본값: RisuBackup): " GDRIVE_FOLDER
GDRIVE_FOLDER="${GDRIVE_FOLDER:-RisuBackup}"

BACKUP_REPO="rclone:${GDRIVE_REMOTE}:${GDRIVE_FOLDER}"

# 5. Restic 비밀번호 설정
echo ""
echo "[5/9] 백업 암호화 비밀번호 설정"
echo ""
read -sp "Restic 비밀번호 (백업 암호화용, 꼭 기억하세요!): " RESTIC_PASS
echo ""
read -sp "비밀번호 확인 (다시 입력): " RESTIC_PASS_CONFIRM
echo ""

if [ "$RESTIC_PASS" != "$RESTIC_PASS_CONFIRM" ]; then
    echo "❌ 비밀번호가 일치하지 않습니다. 다시 실행해주세요."
    exit 1
fi

# 6. Restic 저장소 초기화
echo ""
echo "[6/9] Restic 저장소 초기화 중..."
echo "Google Drive에 연결하는 중... (시간이 좀 걸릴 수 있습니다)"
export RESTIC_PASSWORD="$RESTIC_PASS"

if ! restic -r "$BACKUP_REPO" snapshots &>/dev/null; then
    echo "새 저장소를 초기화합니다..."
    restic init -r "$BACKUP_REPO"
else
    echo "✓ 이미 초기화된 저장소가 있습니다."
fi

# 7. 환경 변수 설정
echo ""
echo "[7/9] 환경 변수 설정 중..."
if ! grep -q "RESTIC_REPOSITORY" ~/.bashrc; then
    echo "" >> ~/.bashrc
    echo "# Restic Auto Backup Settings (Google Drive)" >> ~/.bashrc
    echo "export RESTIC_REPOSITORY=\"$BACKUP_REPO\"" >> ~/.bashrc
    echo "export RESTIC_PASSWORD=\"$RESTIC_PASS\"" >> ~/.bashrc
    echo "✓ 환경 변수를 .bashrc에 추가했습니다."
else
    # 기존 설정 업데이트
    sed -i '/RESTIC_REPOSITORY/d' ~/.bashrc
    sed -i '/RESTIC_PASSWORD/d' ~/.bashrc
    echo "export RESTIC_REPOSITORY=\"$BACKUP_REPO\"" >> ~/.bashrc
    echo "export RESTIC_PASSWORD=\"$RESTIC_PASS\"" >> ~/.bashrc
    echo "✓ 환경 변수를 업데이트했습니다."
fi

# 8. 백업 스크립트 생성
echo ""
echo "[8/9] 백업 스크립트 생성 중..."
mkdir -p ~/bin

cat > ~/bin/backup-risuai.sh << EOF
#!/data/data/com.termux/files/usr/bin/bash

export TZ='Asia/Seoul'
export RESTIC_REPOSITORY="$BACKUP_REPO"
export RESTIC_PASSWORD="$RESTIC_PASS"

cd $RISUAI_PATH

restic backup save --tag "\$(date +%Y%m%d_%H%M)"

restic forget \\
  --keep-within 24h \\
  --keep-daily 7 \\
  --keep-weekly 4 \\
  --prune

echo "[\$(date)] Backup completed" >> \$HOME/risuai-backup.log
EOF

chmod +x ~/bin/backup-risuai.sh
echo "✓ 백업 스크립트를 생성했습니다."

# 9. Cronie 설치 및 설정
echo ""
echo "[9/9] Cron 설정 중..."
if ! command -v crond &> /dev/null; then
    pkg install cronie termux-services -y
    sv-enable crond
    echo "✓ Cronie를 설치하고 활성화했습니다."
else
    echo "✓ Cronie가 이미 설치되어 있습니다."
fi

# Crontab 설정 (중복 방지)
(crontab -l 2>/dev/null | grep -v "backup-risuai.sh"; echo "*/10 * * * * ~/bin/backup-risuai.sh") | crontab -
echo "✓ 10분마다 자동 백업되도록 설정했습니다."

# 10. 첫 백업 테스트
echo ""
echo "첫 백업 테스트를 시작합니다..."
echo "Google Drive에 업로드하므로 시간이 걸릴 수 있습니다."
export RESTIC_REPOSITORY="$BACKUP_REPO"
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
echo "  - 백업 저장 위치: Google Drive/$GDRIVE_FOLDER"
echo "  - 백업 주기: 10분마다"
echo ""
echo "백업 보관 정책:"
echo "  - 최근 24시간: 10분마다 보관"
echo "  - 1일~7일: 하루 1개"
echo "  - 7일~4주: 일주일 1개"
echo "  - 4주 이상: 자동 삭제 (Google Drive에서도 삭제됨)"
echo ""
echo "백업 관리 명령어:"
echo "  백업 목록 보기: restic snapshots"
echo "  최신 백업 복원: restic restore latest --target $RISUAI_PATH"
echo "  특정 백업 복원: restic restore <ID> --target $RISUAI_PATH"
echo "  Google Drive 용량 확인: rclone about ${GDRIVE_REMOTE}:"
echo ""
echo "⚠️  주의사항:"
echo "  - Termux 앱이 백그라운드에서 종료되지 않도록 설정하세요"
echo "  - 배터리 최적화에서 Termux를 제외하세요"
echo "  - 비밀번호를 꼭 안전한 곳에 보관하세요!"
echo "  - Google Drive 용량을 주기적으로 확인하세요 (무료 15GB)"
echo ""