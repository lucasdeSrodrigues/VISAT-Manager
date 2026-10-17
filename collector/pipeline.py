"""Pipeline de sincronização: coletar → normalizar → deduplicar → gravar.

É a etapa "SEI → Sincronização → Sistema/banco de dados" do Fluxo de Dados oficial.
"""

from dataclasses import dataclass, field

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app import services
from backend.app.models import Demanda

from .normalizer import RegistroInvalido, normalizar
from .sources.base import FonteDeDemandas


@dataclass
class ResultadoSync:
    lidos: int = 0
    novos: int = 0
    duplicados: int = 0
    invalidos: int = 0
    erros: list[str] = field(default_factory=list)
    ids_novos: list[str] = field(default_factory=list)


def sincronizar(db: Session, fonte: FonteDeDemandas) -> ResultadoSync:
    res = ResultadoSync()
    brutos = fonte.coletar()
    res.lidos = len(brutos)
    existentes = set(db.scalars(select(Demanda.id).where(Demanda.origem == "SEI")))
    for bruto in brutos:
        try:
            n = normalizar(bruto)
        except RegistroInvalido as e:
            res.invalidos += 1
            res.erros.append(str(e))
            continue
        if n.id_sei in existentes:  # idempotência: rodar de novo não duplica
            res.duplicados += 1
            continue
        services.registrar_sei(
            db,
            id_sei=n.id_sei,
            titulo=n.titulo,
            tipo=n.tipo,
            estabelecimento=n.estabelecimento,
            prioridade=n.prioridade,
            municipio=n.municipio,
            bairro=n.bairro,
            autuacao=n.autuacao,
        )
        existentes.add(n.id_sei)
        res.novos += 1
        res.ids_novos.append(n.id_sei)
    services.set_param(db, "ultima_sync", services.agora().strftime("%Y-%m-%dT%H:%M"))
    db.commit()
    return res
