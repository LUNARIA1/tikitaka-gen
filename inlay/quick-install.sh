#!/bin/bash
# RisuAI Inlay File System - Quick Installer
# Usage: curl -fsSL https://raw.githubusercontent.com/LUNARIA1/tikitaka-gen/main/inlay/quick-install.sh | bash

set -e

REPO="LUNARIA1/tikitaka-gen"
BRANCH="main"
SUBDIR="inlay"  # 서브디렉토리

# Termux 환경 감지
IS_TERMUX=0
if [ -d "/data/data/com.termux" ] || [ -n "$TERMUX_VERSION" ]; then
    IS_TERMUX=1
    TEMP_DIR="$HOME/.cache/risuai-inlay-fs-$$"
    echo "🤖 Termux environment detected"
else
    TEMP_DIR="/tmp/risuai-inlay-fs-$$"
fi

echo "========================================"
echo "RisuAI Inlay File System Installer"
echo "========================================"
echo ""

# RisuAI 디렉토리 찾기
RISUAI_DIR=""

# Termux 환경 우선 확인
if [ $IS_TERMUX -eq 1 ]; then
    if [ -d "$HOME/Risu-AI" ]; then
        RISUAI_DIR="$HOME/Risu-AI"
        echo "✓ Found RisuAI (Termux): $RISUAI_DIR"
    elif [ -d "$HOME/RisuAI" ]; then
        RISUAI_DIR="$HOME/RisuAI"
        echo "✓ Found RisuAI (Termux): $RISUAI_DIR"
    fi
fi

# 일반 환경에서 찾기
if [ -z "$RISUAI_DIR" ]; then
    if [ -d "./RisuAI" ]; then
        RISUAI_DIR="./RisuAI"
    elif [ -d "../RisuAI" ]; then
        RISUAI_DIR="../RisuAI"
    elif [ -d "./Risu-AI" ]; then
        RISUAI_DIR="./Risu-AI"
    elif [ -d "../Risu-AI" ]; then
        RISUAI_DIR="../Risu-AI"
    elif [ -d "$HOME/RisuAI" ]; then
        RISUAI_DIR="$HOME/RisuAI"
    elif [ -d "$HOME/Risu-AI" ]; then
        RISUAI_DIR="$HOME/Risu-AI"
    else
        echo "⚠️  RisuAI directory not found!"
        echo "Please run this script from RisuAI parent directory or specify path:"
        read -p "Enter RisuAI path: " RISUAI_DIR
    fi
fi

if [ ! -d "$RISUAI_DIR" ]; then
    echo "❌ Invalid RisuAI directory: $RISUAI_DIR"
    exit 1
fi

echo "✓ Found RisuAI: $RISUAI_DIR"
echo ""

# 원본 파일 확인
INLAY_FILE="$RISUAI_DIR/src/ts/process/files/inlays.ts"
if [ ! -f "$INLAY_FILE" ]; then
    echo "❌ Original inlays.ts not found!"
    exit 1
fi

# 백업 생성
echo "[1/5] Creating backup..."
cp "$INLAY_FILE" "$INLAY_FILE.backup"
echo "   ✓ Backup created"

# 임시 디렉토리 생성
echo "[2/5] Downloading files..."
if [ $IS_TERMUX -eq 1 ]; then
    mkdir -p "$HOME/.cache"
fi
mkdir -p "$TEMP_DIR"
cd "$TEMP_DIR"

# GitHub에서 파일 다운로드
curl -fsSL "https://raw.githubusercontent.com/$REPO/$BRANCH/$SUBDIR/inlays.ts" -o inlays.ts
if [ $? -ne 0 ]; then
    echo "   ❌ Failed to download inlays.ts"
    rm -rf "$TEMP_DIR"
    exit 1
fi
echo "   ✓ Downloaded inlays.ts"

# 파일 설치
echo "[3/5] Installing new implementation..."
cp inlays.ts "$INLAY_FILE"
echo "   ✓ File installed"

# RisuAI 디렉토리로 이동
cd "$RISUAI_DIR"

# 빌드
echo "[4/5] Building RisuAI..."
echo "   This may take a few minutes..."

# 빌드 명령어 선택 (pnpm 우선, npm fallback)
BUILD_CMD="npm run build"
if command -v pnpm &> /dev/null; then
    BUILD_CMD="pnpm run build"
    echo "   Using pnpm..."
fi

$BUILD_CMD > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   ✓ Build completed"
else
    echo "   ❌ Build failed"
    echo ""
    echo "Rolling back..."
    cp "$INLAY_FILE.backup" "$INLAY_FILE"
    $BUILD_CMD > /dev/null 2>&1
    echo "Rollback complete."
    rm -rf "$TEMP_DIR"
    exit 1
fi

# 정리
echo "[5/5] Cleaning up..."
rm -rf "$TEMP_DIR"
echo "   ✓ Cleanup complete"

echo ""
echo "========================================"
echo "✅ Installation Complete!"
echo "========================================"
echo ""
echo "Inlay images will now be saved to:"
echo "   $(pwd)/inlays/"
echo ""
echo "Backup file saved at:"
echo "   $INLAY_FILE.backup"
echo ""
echo "To rollback:"
echo "   cp $INLAY_FILE.backup $INLAY_FILE"
echo "   npm run build"
echo ""
