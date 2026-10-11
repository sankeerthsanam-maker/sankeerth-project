"""Download the pinned assistant weights only into the project cache."""
import json
import os
import subprocess
import sys
from pathlib import Path
from huggingface_hub import snapshot_download
root=Path(__file__).resolve().parents[1]
subprocess.run([sys.executable,str(root/'scripts/preflight-local.py')],check=True)
config=json.loads((root/'apps/voice-service/assistant-model.json').read_text())
cache=Path(os.environ['HF_HUB_CACHE']).resolve()
if not any(parent.samefile(root) for parent in (cache, *cache.parents) if parent.exists()):raise RuntimeError('Model cache must remain inside sankeeproject')
print(snapshot_download(config['repo'],revision=config['revision'],cache_dir=cache,allow_patterns=['*.json','*.safetensors','*.jinja','*.txt','*.model'],max_workers=2,token=False))
