#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Tick API – dev spuštění
#   - Host 0.0.0.0  → přístupný z jiných PC ve stejné síti
#   - --reload      → automatický restart při změně kódu
# ---------------------------------------------------------------------------
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo ">  Spouštím Tick API (dev)…"
echo "   Lokálně:  http://127.0.0.1:8000"
echo "   V síti:   http://$(ipconfig getifaddr en0 2>/dev/null || hostname -I | awk '{print $1}'):8000"
echo "   Docs:     /docs   |  Admin: /admin"
echo ""

uvicorn src.main:app \
    --host 0.0.0.0 \
    --port 8000 \
    --reload \
    --reload-dir src
