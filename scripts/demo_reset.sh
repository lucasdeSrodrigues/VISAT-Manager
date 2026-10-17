#!/usr/bin/env bash
# Recria o banco de demonstração (dados fictícios). Rode com o servidor PARADO.
set -e
cd "$(dirname "$0")/.."
rm -rf uploads
python -m backend.app.seed
