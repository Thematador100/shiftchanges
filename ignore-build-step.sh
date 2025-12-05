#!/bin/bash

# Vercel Ignored Build Step Script
# This script determines whether a build should be skipped to avoid rate limiting

echo "🔍 Checking if build should proceed..."

# Get current branch
BRANCH=${VERCEL_GIT_COMMIT_REF:-$(git rev-parse --abbrev-ref HEAD)}
echo "Branch: $BRANCH"

# Always build on main/master branch
if [[ "$BRANCH" == "main" ]] || [[ "$BRANCH" == "master" ]]; then
  echo "✅ Building: main/master branch always builds"
  exit 1
fi

# Skip builds for claude/* branches (development branches)
if [[ "$BRANCH" == claude/* ]]; then
  echo "⏭️  Skipping: claude/* development branches don't auto-deploy"
  exit 0
fi

# Get commit message
COMMIT_MSG=$(git log -1 --pretty=%B)
echo "Commit: $COMMIT_MSG"

# Skip if commit message indicates docs/config only
if [[ "$COMMIT_MSG" =~ ^(docs|chore|style): ]] || \
   [[ "$COMMIT_MSG" =~ (README|documentation|typo|formatting) ]]; then
  echo "⏭️  Skipping: commit is docs/config only"
  exit 0
fi

# Check if only ignored files changed
CHANGED_FILES=$(git diff HEAD^ HEAD --name-only)
echo "Changed files: $CHANGED_FILES"

# If only markdown or config files changed, skip
if echo "$CHANGED_FILES" | grep -qvE '\.(md|txt|json|yml|yaml)$'; then
  echo "✅ Building: source code files changed"
  exit 1
else
  echo "⏭️  Skipping: only documentation/config files changed"
  exit 0
fi
