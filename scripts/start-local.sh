#!/bin/zsh
set -eu
cd /Volumes/EXTERNAL_US/sankeeproject
source scripts/env.sh
"$SANKEE_ROOT/.local/venvs/voice/bin/python" scripts/preflight-local.py
exec "$SANKEE_ROOT/.local/venvs/voice/bin/python" -m uvicorn server:app --app-dir "$SANKEE_ROOT/apps/voice-service" --host 127.0.0.1 --port 8000 --workers 1
