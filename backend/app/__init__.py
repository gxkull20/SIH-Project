import sys
from pathlib import Path

# Ensure both backend/ and the repository root are in sys.path so that
# `app.*` and `ml.*` packages resolve automatically regardless of how or where
# python/uvicorn is launched.
_backend_root = Path(__file__).resolve().parents[1]
_repo_root = Path(__file__).resolve().parents[2]

if str(_backend_root) not in sys.path:
    sys.path.insert(0, str(_backend_root))
if str(_repo_root) not in sys.path:
    sys.path.insert(0, str(_repo_root))
