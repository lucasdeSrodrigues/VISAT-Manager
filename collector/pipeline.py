"""Pipeline de sincronização: coletar → normalizar → deduplicar → gravar.

É a etapa "SEI → Sincronização → Sistema/banco de dados" do Fluxo de Dados oficial.
"""

from dataclasses import dataclass, field

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app import services
from backend.app.models import Demanda, Origem

from .normalizer import RegistroInvalido, normalizar
from .sources.base import FonteDeDemandas


@dataclass
class ResultadoSync:
    lidos: int = 0
    novos: int = 0
    duplicados: int = 0
    invalidos: int = 0
    erros: list[str] = field(default_factory=list)
    codigos_novos: list[str] = field(default_factory=list)


def sincronizar(db: Session, fonte: FonteDeDemandas) -> ResultadoSync:
    res = ResultadoSync()
    brutos = fonte.coletar()
    res.lidos = len(brutos)
    existentes = set(db.scalars(select(Demanda.numero_sei).where(Demanda.numero_sei.is_not(None))))
    for bruto in brutos:
        try:
            n = normalizar(bruto)
        except RegistroInvalido as e:
            res.invalidos += 1
            res.erros.append(str(e))
            continue
        if n.numero_sei in existentes:  # idempotência: rodar 2x não duplica
            res.duplicados += 1
            continue
        services.registrar_entrada(
            db,
            origem=Origem.SEI,
            numero_sei=n.numero_sei,
            tipo=n.tipo,
            orgao=n.orgao,
            municipio=n.municipio,
            empresa=n.empresa,
            descricao=n.descricao,
            data_entrada=n.data_entrada,
            prioridade=n.prioridade,
            commit=False,
        )
        existentes.add(n.numero_sei)
        res.novos += 1
        res.codigos_novos.append(n.numero_sei)
    db.commit()
    return res
