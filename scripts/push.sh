#!/bin/bash

# Simple push script - commits and pushes changes

set -e

if [ -z "$(git status --porcelain)" ]; then
    echo "Nothing to commit - working directory clean"
    exit 0
fi

echo "📝 Committing changes..."
git add .
git commit -m "${1:-Update files

🤖 Generated with Claude Code}"

echo "⬆️  Pushing to GitHub..."
git push

echo "✅ Changes pushed successfully!"
