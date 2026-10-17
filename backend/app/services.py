"""Camada de serviços — 'Lógica da Aplicação' (item 4.3 da arquitetura).

Ponto único por onde TODA demanda entra (SEI ou manual): `registrar_entrada`.
Isso implementa o princípio 'fluxo único de acompanhamento, independentemente da origem'.
"""

from collections import Counter
from datetime import date, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from . import config, rules
from .models import Demanda, Etapa, Movimentacao, Origem, Perfil, Prioridade, TipoOcorrencia, Usuario
from .rules import ROTULO_ETAPA, Ator


# ------------------------------------------------------------------ entrada
def prazo_padrao(tipo: TipoOcorrencia, entrada: date) -> date:
    return entrada + timedelta(days=config.PRAZO_PADRAO_DIAS[tipo.value])


def proximo_codigo_manual(db: Session, ano: int) -> str:
    prefixo = f"MAN-{ano}-"
    ultimo = db.scalar(select(func.max(Demanda.codigo)).where(Demanda.codigo.like(f"{prefixo}%")))
    seq = int(ultimo.rsplit("-", 1)[1]) + 1 if ultimo else 1
    return f"{prefixo}{seq:04d}"


def registrar_entrada(
    db: Session,
    *,
    origem: Origem,
    tipo: TipoOcorrencia,
    orgao: str,
    municipio: str,
    descricao: str,
    data_entrada: date,
    prazo_legal: date | None = None,
    empresa: str | None = None,
    ramo: str | None = None,
    prioridade: Prioridade = Prioridade.MEDIA,
    numero_sei: str | None = None,
    autor: Usuario | None = None,
    commit: bool = True,
) -> Demanda:
    if origem == Origem.SEI and not numero_sei:
        raise rules.RegraNegocioError("Demanda de origem SEI exige número do processo.")
    codigo = numero_sei if origem == Origem.SEI else proximo_codigo_manual(db, data_entrada.year)
    d = Demanda(
        codigo=codigo,
        origem=origem,
        numero_sei=numero_sei,
        tipo_ocorrencia=tipo,
        orgao_demandante=orgao,
        municipio=municipio,
        empresa=empresa,
        ramo_atividade=ramo,
        descricao=descricao,
        prioridade=prioridade,
        etapa=Etapa.RECEBIDA,
        data_entrada=data_entrada,
        prazo_legal=prazo_legal or prazo_padrao(tipo, data_entrada),
        criado_por_id=autor.id if autor else None,
    )
    via = "sincronização com o SEI" if origem == Origem.SEI else "cadastro manual"
    d.movimentacoes.append(
        Movimentacao(
            etapa=Etapa.RECEBIDA, autor_id=autor.id if autor else None, descricao=f"Solicitação recebida via {via}."
        )
    )
    db.add(d)
    db.flush()  # garante que o próximo código MAN-AAAA-NNNN enxergue este registro
    if commit:
        db.commit()
        db.refresh(d)
    return d


# --------------------------------------------------------------- linha do tempo
def ator_de(usuario: Usuario, demanda: Demanda) -> Ator:
    return Ator(perfil=usuario.perfil, eh_responsavel=demanda.responsavel_id == usuario.id)


def avancar(db: Session, demanda: Demanda, destino: Etapa, usuario: Usuario, descricao: str = "") -> Demanda:
    rules.validar_transicao(demanda.etapa, destino, ator_de(usuario, demanda), demanda.responsavel_id is not None)
    demanda.etapa = destino
    if destino == Etapa.CONCLUIDA:
        demanda.concluida_em = date.today()
    texto = descricao.strip() or f"Etapa '{ROTULO_ETAPA[destino]}' registrada."
    demanda.movimentacoes.append(Movimentacao(etapa=destino, descricao=texto, autor_id=usuario.id))
    db.commit()
    db.refresh(demanda)
    return demanda


def atribuir(db: Session, demanda: Demanda, inspetor: Usuario, gestor: Usuario) -> Demanda:
    if not rules.pode_atribuir(gestor.perfil):
        raise rules.PermissaoNegadaError("Apenas o Gestor atribui responsáveis.")
    if inspetor.perfil != Perfil.INSPETOR or not inspetor.ativo:
        raise rules.RegraNegocioError("O responsável precisa ser um inspetor ativo.")
    if demanda.etapa == Etapa.CONCLUIDA:
        raise rules.RegraNegocioError("Demanda concluída não pode ser reatribuída.")
    anterior = demanda.responsavel.nome if demanda.responsavel else None
    demanda.responsavel_id = inspetor.id
    texto = (
        f"Responsável alterado de {anterior} para {inspetor.nome}."
        if anterior
        else f"{inspetor.nome} atribuído(a) como responsável."
    )
    demanda.movimentacoes.append(Movimentacao(etapa=None, descricao=texto, autor_id=gestor.id))
    db.flush()
    # Se está em triagem, a designação conclui a etapa "Inspetor designado".
    if demanda.etapa == Etapa.TRIAGEM:
        db.refresh(demanda)
        return avancar(db, demanda, Etapa.INSPETOR_DESIGNADO, gestor, f"Inspetor designado: {inspetor.nome}.")
    db.commit()
    db.refresh(demanda)
    return demanda


# ------------------------------------------------------------------- dashboard
def visao_geral(db: Session, demandas: list[Demanda], hoje: date | None = None) -> dict:
    hoje = hoje or date.today()
    abertas = [d for d in demandas if d.etapa != Etapa.CONCLUIDA]
    concluidas = [d for d in demandas if d.etapa == Etapa.CONCLUIDA]
    faixas = Counter(rules.classificar_prazo(d.prazo_legal, d.etapa, hoje) for d in abertas)
    no_prazo = [d for d in concluidas if d.concluida_em and d.concluida_em <= d.prazo_legal]
    tempos = [(d.concluida_em - d.data_entrada).days for d in concluidas if d.concluida_em]
    carga = Counter(d.responsavel.nome for d in abertas if d.responsavel)
    inspetores = db.scalars(select(Usuario).where(Usuario.perfil == Perfil.INSPETOR, Usuario.ativo)).all()
    return {
        "recebidas": len(demandas),
        "em_andamento": len(abertas),
        "concluidas": len(concluidas),
        "sem_responsavel": sum(1 for d in abertas if d.responsavel_id is None),
        "radar": {f: faixas.get(f, 0) for f in rules.FAIXAS_RADAR},
        "alertas": faixas.get(rules.VENCIDA, 0) + faixas.get(rules.URGENTE, 0),
        "pct_concluidas_no_prazo": round(100 * len(no_prazo) / len(concluidas)) if concluidas else None,
        "tempo_medio_resposta_dias": round(sum(tempos) / len(tempos), 1) if tempos else None,
        "carga_por_inspetor": sorted(
            ({"nome": u.nome, "abertas": carga.get(u.nome, 0)} for u in inspetores), key=lambda x: -x["abertas"]
        ),
        "por_tipo": Counter(d.tipo_ocorrencia.value for d in demandas).most_common(),
    }
