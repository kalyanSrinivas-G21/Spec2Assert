#!/usr/bin/env bash
# Usage: ./scripts/log.sh STEP "Created FastAPI app skeleton"
TAG="${1:?tag required (STEP|CMD|PROBLEM|FIX|DECISION|VERIFY|PROMPT|NOTE)}"
MSG="${2:?message required}"
printf '\n### %s [%s] %s\n' "$(date '+%Y-%m-%d %H:%M')" "$TAG" "$MSG" >> BUILD_LOG.md
echo "logged: [$TAG] $MSG"
