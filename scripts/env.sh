# Source before running project commands.
export SANKEE_ROOT="/Volumes/EXTERNAL_US/sankeeproject"
if [ ! -d "$SANKEE_ROOT/.local/runtimes" ]; then return 1; fi
export PATH="/Volumes/EXTERNAL_US/sankeeproject/.local/runtimes/node-v24.21.0-darwin-arm64/bin:$SANKEE_ROOT/.local/tools/node_modules/.bin:$PATH"
export npm_config_cache="$SANKEE_ROOT/.local/caches/npm"
export npm_config_prefix="$SANKEE_ROOT/.local/tools"
export TMPDIR="$SANKEE_ROOT/.local/caches/tmp"

# Local voice runtime and all model/package caches.
export UV_CACHE_DIR="$SANKEE_ROOT/.local/caches/uv"
export UV_PYTHON_INSTALL_DIR="$SANKEE_ROOT/.local/runtimes/python"
export UV_TOOL_DIR="$SANKEE_ROOT/.local/tools/uv-tools"
export UV_TOOL_BIN_DIR="$SANKEE_ROOT/.local/tools/bin"
export HF_HOME="$SANKEE_ROOT/.local/caches/huggingface"
export HF_HUB_CACHE="$HF_HOME/hub"
export XDG_CACHE_HOME="$SANKEE_ROOT/.local/caches/xdg"
export PIP_CACHE_DIR="$SANKEE_ROOT/.local/caches/pip"
export PYTHONPYCACHEPREFIX="$SANKEE_ROOT/.local/caches/pycache"
export HF_HUB_DISABLE_TELEMETRY=1
