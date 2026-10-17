"""CLI do coletor:  python -m collector.run [--arquivo caminho.html]"""

import argparse

from backend.app import config
from backend.app.database import Base, SessionLocal, engine

from .pipeline import sincronizar
from .sources.sei_mock import SeiMockSource


def main() -> None:
    ap = argparse.ArgumentParser(description="Sincroniza demandas do SEI com o VISAT Manager.")
    ap.add_argument("--arquivo", default=str(config.SEI_EXPORT_PATH), help="exportação HTML do SEI")
    args = ap.parse_args()
    Base.metadata.create_all(engine)
    fonte = SeiMockSource(args.arquivo)
    print(f"[collector] Fonte: {fonte.nome}  ->  {args.arquivo}")
    with SessionLocal() as db:
        r = sincronizar(db, fonte)
    print(f"[collector] Lidos: {r.lidos} | Novos: {r.novos} | Duplicados: {r.duplicados} | Inválidos: {r.invalidos}")
    for c in r.ids_novos:
        print(f"  + {c}")
    for e in r.erros:
        print(f"  ! {e}")


if __name__ == "__main__":
    main()
