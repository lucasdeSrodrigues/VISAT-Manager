#!/usr/bin/env bash
# VISAT Manager - inicia no Linux/macOS (primeira vez cria o ambiente e o banco de demonstração)
set -e
cd "$(dirname "$0")"
if [ ! -d .venv ]; then
  python3 -m venv .venv
  . .venv/bin/activate
  pip install -r requirements.txt
  python -m backend.app.seed
else
  . .venv/bin/activate
fi
echo "Abra http://localhost:8000  (gestor@visat.demo / visat123)"
python -m uvicorn backend.app.main:app --reload
