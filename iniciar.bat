@echo off
REM VISAT Manager - inicia no Windows (primeira vez cria o ambiente e o banco de demonstracao)
if not exist .venv (
  py -m venv .venv
  call .venv\Scripts\activate
  pip install -r requirements.txt
  python -m backend.app.seed
) else (
  call .venv\Scripts\activate
)
echo.
echo  Abra http://localhost:8000  (gestor@visat.demo / visat123)
echo.
python -m uvicorn backend.app.main:app --reload
