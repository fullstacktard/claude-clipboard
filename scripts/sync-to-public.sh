#!/bin/bash
# Sync claude-clipboard (private) → public GitHub repo
# This script creates a temporary staging area with filtered files,
# then pushes to the public repo

set -e  # Exit on error

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PRIVATE_DIR="$(dirname "$SCRIPT_DIR")"  # Parent of scripts/ directory
TEMP_PUBLIC_DIR="/tmp/claude-clipboard-public-$$"
PUBLIC_REPO_URL="git@github.com:fullstacktard/claude-clipboard.git"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== Syncing to Public Repo ===${NC}"
echo "Private repo: $PRIVATE_DIR"
echo "Public repo: $PUBLIC_REPO_URL"
echo ""

# Check we're in the right directory
if [ ! -f "$PRIVATE_DIR/package.json" ]; then
    echo -e "${RED}ERROR: Not in claude-clipboard directory${NC}"
    exit 1
fi

# Check for uncommitted changes
cd "$PRIVATE_DIR"
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}WARNING: You have uncommitted changes in private repo${NC}"
    echo "Commit them first? (y/n)"
    read -r response
    if [ "$response" = "y" ]; then
        git status
        exit 1
    fi
fi

echo -e "${YELLOW}Creating temporary staging area...${NC}"
rm -rf "$TEMP_PUBLIC_DIR"
mkdir -p "$TEMP_PUBLIC_DIR"

echo -e "${YELLOW}Copying public files only...${NC}"

# Copy only distribution files
rsync -av --relative \
  ./lib \
  ./templates \
  ./bin \
  ./package.json \
  ./package-lock.json \
  ./README.md \
  ./LICENSE \
  ./.npmignore \
  ./.gitignore \
  "$TEMP_PUBLIC_DIR/"

# Copy index.js if it exists
if [ -f "./index.js" ]; then
    rsync -av --relative ./index.js "$TEMP_PUBLIC_DIR/"
fi

echo -e "${GREEN}✓ Files copied to staging${NC}"

# Show what was copied
echo ""
echo "Public distribution contains:"
find "$TEMP_PUBLIC_DIR" -type f ! -path "*/\.*" | sed "s|$TEMP_PUBLIC_DIR/||" | sort

# Verify NO private files
echo ""
echo -e "${YELLOW}Verifying no private files...${NC}"

PRIVATE_FILES_FOUND=0

# Check for private directories
for dir in ".claude" "backlog" "tests" "scripts" "docs" "data"; do
    if [ -d "$TEMP_PUBLIC_DIR/$dir" ]; then
        echo -e "${RED}ERROR: Found private directory: $dir${NC}"
        PRIVATE_FILES_FOUND=1
    fi
done

# Check for private files
for file in "CLAUDE.md" "CLAUDE_PROJECT.md" "README-DEV.md" "vitest.config.js"; do
    if [ -f "$TEMP_PUBLIC_DIR/$file" ]; then
        echo -e "${RED}ERROR: Found private file: $file${NC}"
        PRIVATE_FILES_FOUND=1
    fi
done

# Check for hardcoded private paths
if grep -r "claude-clipboard-dev" "$TEMP_PUBLIC_DIR" 2>/dev/null | grep -v node_modules; then
    echo -e "${RED}ERROR: Found references to 'claude-clipboard-dev'${NC}"
    PRIVATE_FILES_FOUND=1
fi

if [ $PRIVATE_FILES_FOUND -eq 1 ]; then
    echo -e "${RED}ABORT: Private files detected in public staging${NC}"
    rm -rf "$TEMP_PUBLIC_DIR"
    exit 1
fi

echo -e "${GREEN}✓ No private files detected${NC}"

# Get version from package.json
VERSION=$(node -p "require('$TEMP_PUBLIC_DIR/package.json').version")
echo ""
echo -e "${BLUE}Preparing release: v$VERSION${NC}"

# Initialize git in temp directory
cd "$TEMP_PUBLIC_DIR"

if [ ! -d .git ]; then
    echo -e "${YELLOW}Initializing git...${NC}"
    git init
    git remote add origin "$PUBLIC_REPO_URL"
fi

# Try to fetch existing repo
echo -e "${YELLOW}Checking if public repo exists...${NC}"
if git ls-remote --exit-code origin &>/dev/null; then
    echo -e "${GREEN}✓ Public repo exists${NC}"
    # Just create branch, we'll force push anyway
    git checkout -b main
else
    echo -e "${YELLOW}Public repo doesn't exist yet - will create on first push${NC}"
    git checkout -b main
fi

# Stage all files
git add -A

# Check if there are changes
if git diff --staged --quiet; then
    echo -e "${YELLOW}No changes to commit${NC}"
else
    echo -e "${YELLOW}Committing changes...${NC}"
    git commit -m "Release: v$VERSION"
    echo -e "${GREEN}✓ Committed${NC}"
fi

echo ""
echo -e "${GREEN}=== Ready to Push ===${NC}"
echo ""
echo "Staging directory: $TEMP_PUBLIC_DIR"
echo "Version: v$VERSION"
echo "Public repo: $PUBLIC_REPO_URL"
echo ""

# Check if public repo exists on GitHub
echo -e "${YELLOW}Checking if public repo exists on GitHub...${NC}"
if gh repo view fullstacktard/claude-clipboard &>/dev/null; then
    echo -e "${GREEN}✓ Public repo exists${NC}"
else
    echo -e "${YELLOW}Public repo doesn't exist. Create it? (y/n)${NC}"
    read -r create_repo
    if [ "$create_repo" = "y" ]; then
        echo -e "${YELLOW}Creating public repo...${NC}"
        gh repo create fullstacktard/claude-clipboard \
            --public \
            --description "Smart clipboard integration for Claude Code - paste screenshots and images directly from clipboard" \
            --source="$TEMP_PUBLIC_DIR" \
            --remote=origin \
            --push
        echo -e "${GREEN}✓ Public repo created and pushed${NC}"
    else
        echo -e "${YELLOW}Skipping repo creation${NC}"
    fi
fi

# Offer to push automatically
echo ""
echo -e "${YELLOW}Push to public repo now? (y/n)${NC}"
read -r do_push
if [ "$do_push" = "y" ]; then
    echo -e "${YELLOW}Pushing to public repo...${NC}"
    git push origin main -f
    echo -e "${GREEN}✓ Pushed to public repo${NC}"

    # Offer to publish to npm
    echo ""
    echo -e "${YELLOW}Publish to npm now? (y/n)${NC}"
    read -r do_publish
    if [ "$do_publish" = "y" ]; then
        echo -e "${YELLOW}Publishing to npm...${NC}"
        npm publish
        echo -e "${GREEN}✓ Published to npm${NC}"
        echo ""
        echo -e "${GREEN}=== Release Complete! ===${NC}"
        echo "Package: claude-clipboard@$VERSION"
        echo "GitHub: https://github.com/fullstacktard/claude-clipboard"
        echo "npm: https://www.npmjs.com/package/claude-clipboard"
    else
        echo ""
        echo "To publish later:"
        echo "  cd $TEMP_PUBLIC_DIR && npm publish"
    fi
else
    echo ""
    echo "Manual steps:"
    echo "  1. cd $TEMP_PUBLIC_DIR"
    echo "  2. git push origin main"
    echo "  3. npm publish"
fi

echo ""
echo -e "${YELLOW}Temporary staging will be cleaned up on next sync${NC}"
