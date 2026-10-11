from pathlib import Path
import sys
root = Path("/Volumes/EXTERNAL_US/sankeeproject")
if not Path("/Volumes/EXTERNAL_US").is_mount() or not root.is_dir():
    sys.exit("Reconnect EXTERNAL_US before running this project.")
for name in ("HF_HOME", "HF_HUB_CACHE", "UV_CACHE_DIR", "PYTHONPYCACHEPREFIX", "TMPDIR"):
    import os
    value = os.environ.get(name)
    if not value or not Path(value).resolve().is_relative_to(root.resolve()):
        sys.exit(f"{name} must point inside sankeeproject; source scripts/env.sh")
print("External project and cache paths verified.")
