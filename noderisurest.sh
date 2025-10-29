#!/data/data/com.termux/files/usr/bin/bash

echo "========================================="
echo "  Risu-AI Google Drive 백업 복원"
echo "  for Termux"
echo "========================================="
echo ""

# 1. 패키지 설치
echo "[1/6] 필요한 패키지 설치 중..."
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

# 2. Google Drive 연결
echo ""
echo "[2/6] Google Drive 연결"
echo ""

if rclone listremotes | grep -q "gdrive:"; then
    echo "✓ Google Drive가 이미 연결되어 있습니다."
    GDRIVE_REMOTE="gdrive"
else
    echo "Google Drive 연결이 필요합니다."
    echo ""
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
    echo "    → 브라우저가 열리면 백업한 Google 계정으로 로그인!"
    echo "11. Team Drive: 'n' 입력"
    echo "12. 'y' 입력 (설정 확인)"
    echo "13. 'q' 입력 (종료)"
    echo ""
    read -p "준비되셨으면 Enter를 눌러 rclone config를 실행합니다..."
    
    rclone config
    
    if rclone listremotes | grep -q "gdrive:"; then
        echo "✓ Google Drive 연결 성공!"
        GDRIVE_REMOTE="gdrive"
    else
        echo "❌ Google Drive 연결에 실패했습니다."
        exit 1
    fi
fi

# 3. 백업 폴더 찾기
echo ""
echo "[3/6] Google Drive에서 백업 폴더 찾기"
echo ""
echo "Google Drive 내 백업 폴더들:"
rclone lsd ${GDRIVE_REMOTE}:

echo ""
read -p "백업 폴더 이름 입력 (기본값: RisuBackup): " GDRIVE_FOLDER
GDRIVE_FOLDER="${GDRIVE_FOLDER:-RisuBackup}"

BACKUP_REPO="rclone:${GDRIVE_REMOTE}:${GDRIVE_FOLDER}"

# 4. 비밀번호 입력
echo ""
echo "[4/6] 백업 비밀번호 입력"
echo ""
read -sp "백업 생성 시 사용한 Restic 비밀번호: " RESTIC_PASS
echo ""

export RESTIC_PASSWORD="$RESTIC_PASS"

# 비밀번호 확인 (백업 목록 조회)
echo ""
echo "Google Drive에 연결 중... (시간이 좀 걸릴 수 있습니다)"
if ! restic -r "$BACKUP_REPO" snapshots &>/dev/null; then
    echo "❌ 백업에 접근할 수 없습니다."
    echo "   - 비밀번호가 틀렸거나"
    echo "   - 백업 폴더 이름이 잘못되었거나"
    echo "   - 해당 Google 계정에 백업이 없을 수 있습니다."
    exit 1
fi

# 5. 백업 목록 표시 및 선택
echo ""
echo "[5/6] 사용 가능한 백업 목록"
echo "========================================="
restic -r "$BACKUP_REPO" snapshots
echo "========================================="
echo ""
echo "복원 옵션:"
echo "1) 최신 백업 복원 (latest)"
echo "2) 특정 백업 선택 (ID 입력)"
echo ""
read -p "선택 (1 또는 2): " RESTORE_OPTION

if [ "$RESTORE_OPTION" = "2" ]; then
    read -p "복원할 백업 ID (짧은 ID도 가능, 예: 43ce3f4f): " SNAPSHOT_ID
    RESTORE_TARGET="$SNAPSHOT_ID"
else
    RESTORE_TARGET="latest"
fi

# 복원 경로 설정
echo ""
read -p "복원할 경로 (기본값: ~/Risu-AI): " RESTORE_PATH
RESTORE_PATH="${RESTORE_PATH:-$HOME/Risu-AI}"
RESTORE_PATH="${RESTORE_PATH/#\~/$HOME}"

# 경로 확인
if [ -d "$RESTORE_PATH" ] && [ "$(ls -A $RESTORE_PATH)" ]; then
    echo "⚠️  경고: $RESTORE_PATH 폴더에 이미 파일이 있습니다."
    read -p "덮어쓰시겠습니까? (y/N): " OVERWRITE
    if [[ ! "$OVERWRITE" =~ ^[Yy]$ ]]; then
        echo "복원을 취소합니다."
        exit 1
    fi
fi

# 6. 복원 실행
echo ""
echo "[6/6] 백업 복원 중..."
echo "Google Drive에서 다운로드하므로 시간이 걸릴 수 있습니다."
echo ""

mkdir -p "$RESTORE_PATH"
restic -r "$BACKUP_REPO" restore "$RESTORE_TARGET" --target "$RESTORE_PATH"

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================="
    echo "  ✓ 복원 완료!"
    echo "========================================="
    echo ""
    echo "복원 정보:"
    echo "  - 복원 위치: $RESTORE_PATH"
    echo "  - 백업 출처: Google Drive/$GDRIVE_FOLDER"
    echo ""
    
    # 자동 백업 설정 제안
    read -p "이 기기에서도 자동 백업을 설정하시겠습니까? (y/N): " SETUP_AUTO
    if [[ "$SETUP_AUTO" =~ ^[Yy]$ ]]; then
        echo ""
        echo "자동 백업 스크립트 생성 중..."
        
        # 환경 변수 설정
        if ! grep -q "RESTIC_REPOSITORY" ~/.bashrc; then
            echo "" >> ~/.bashrc
            echo "# Restic Auto Backup Settings (Google Drive)" >> ~/.bashrc
            echo "export RESTIC_REPOSITORY=\"$BACKUP_REPO\"" >> ~/.bashrc
            echo "export RESTIC_PASSWORD=\"$RESTIC_PASS\"" >> ~/.bashrc
        fi
        
        # 백업 스크립트 생성
        mkdir -p ~/bin
        
        cat > ~/bin/backup-risuai.sh << EOF
#!/data/data/com.termux/files/usr/bin/bash

export TZ='Asia/Seoul'
export RESTIC_REPOSITORY="$BACKUP_REPO"
export RESTIC_PASSWORD="$RESTIC_PASS"

cd $RESTORE_PATH

restic backup save --tag "\$(date +%Y%m%d_%H%M)"

restic forget \\
  --keep-within 24h \\
  --keep-daily 7 \\
  --keep-weekly 4 \\
  --prune

echo "[\$(date)] Backup completed" >> \$HOME/risuai-backup.log
EOF
        
        chmod +x ~/bin/backup-risuai.sh
        
        # Cron 설정
        if ! command -v crond &> /dev/null; then
            pkg install cronie termux-services -y
            sv-enable crond
        fi
        
        (crontab -l 2>/dev/null | grep -v "backup-risuai.sh"; echo "*/10 * * * * ~/bin/backup-risuai.sh") | crontab -
        
        echo ""
        echo "✓ 자동 백업 설정 완료!"
        echo "  - 10분마다 Google Drive로 자동 백업됩니다."
        echo "  - 백업 목록: restic snapshots"
    fi
    
    echo ""
    echo "유용한 명령어:"
    echo "  백업 목록 보기: restic snapshots"
    echo "  다른 백업 복원: restic restore <ID> --target $RESTORE_PATH"
    echo "  수동 백업: ~/bin/backup-risuai.sh"
    echo ""
else
    echo ""
    echo "❌ 복원 중 오류가 발생했습니다."
    echo "   위 오류 메시지를 확인해주세요."
    exit 1
fi