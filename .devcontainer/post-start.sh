#!/bin/bash
set -e

echo "==> Checking Claude mounts..."
ERRORS=0

if [ ! -d "$HOME/.claude" ]; then
  echo "ERROR: ~/.claude directory is not mounted"
  ERRORS=$((ERRORS + 1))
else
  echo "OK: ~/.claude directory is mounted"
fi

if [ "$ERRORS" -gt 0 ]; then
  echo "WARNING: $ERRORS mount(s) missing. Claude Code may not work correctly."
fi

echo "==> Updating Claude Code..."
curl -fsSL https://claude.ai/install.sh | bash
claude --version
