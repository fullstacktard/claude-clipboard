#!/bin/bash

# Release script for claude-clipboard
# Bumps version, commits, pushes to GitHub, and publishes to npm
#
# NOTE: This publishes directly from the private repo.
# For public repo release, use: ./scripts/sync-to-public.sh

set -e  # Exit on error

echo "Starting release process..."
echo ""
echo "IMPORTANT: This will publish from the private repo."
echo "For public repo workflow, use: ./scripts/sync-to-public.sh"
echo ""
read -p "Continue with direct publish? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled. Use ./scripts/sync-to-public.sh for public repo release."
    exit 0
fi

# Check if working directory is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "Error: Working directory is not clean. Please commit or stash changes first."
    exit 1
fi

# Check if on master branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "master" ] && [ "$CURRENT_BRANCH" != "main" ]; then
    echo "Error: Not on master/main branch. Currently on: $CURRENT_BRANCH"
    echo "Please switch to master/main branch first"
    exit 1
fi

# Pull latest changes
echo "Pulling latest changes..."
git pull origin $CURRENT_BRANCH

# Bump version (patch by default, or pass major/minor/patch as argument)
VERSION_TYPE=${1:-patch}
echo "Bumping version ($VERSION_TYPE)..."
NEW_VERSION=$(npm version $VERSION_TYPE --no-git-tag-version)

# Commit version bump
echo "Committing version bump..."
git add package.json package-lock.json
git commit -m "Release $NEW_VERSION

Generated with Claude Code"

# Push to GitHub
echo "Pushing to GitHub..."
git push origin $CURRENT_BRANCH

# Publish to npm
echo "Publishing to npm..."
npm publish

echo ""
echo "Release $NEW_VERSION completed successfully!"
echo "   - Git repository updated"
echo "   - Package published to npm"
echo ""
echo "View on npm: https://www.npmjs.com/package/claude-clipboard"
