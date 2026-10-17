from datetime import date

from . import rules
from .models import Demanda, Usuario
from .rules import ROTULO_ETAPA
from .schemas import DemandaDetalhe, DemandaResumo, DocumentoOut, MovimentacaoOut, UsuarioOut


def resumo(d: Demanda, hoje: date | None = None) -> DemandaResumo:
    return DemandaResumo(
        id=d.id,
        codigo=d.codigo,
        origem=d.origem,
        tipo_ocorrencia=d.tipo_ocorrencia,
        orgao_demandante=d.orgao_demandante,
        municipio=d.municipio,
        empresa=d.empresa,
        prioridade=d.prioridade,
        etapa=d.etapa,
        etapa_rotulo=ROTULO_ETAPA[d.etapa],
        data_entrada=d.data_entrada,
        prazo_legal=d.prazo_legal,
        dias_restantes=rules.dias_restantes(d.prazo_legal, hoje),
        saude=rules.classificar_prazo(d.prazo_legal, d.etapa, hoje),
        prazo_texto="Concluída" if d.concluida_em else rules.texto_prazo(d.prazo_legal, hoje),
        responsavel=UsuarioOut.model_validate(d.responsavel) if d.responsavel else None,
    )


def detalhe(d: Demanda, usuario: Usuario) -> DemandaDetalhe:
    ator = rules.Ator(perfil=usuario.perfil, eh_responsavel=d.responsavel_id == usuario.id)
    return DemandaDetalhe(
        **resumo(d).model_dump(),
        numero_sei=d.numero_sei,
        ramo_atividade=d.ramo_atividade,
        descricao=d.descricao,
        concluida_em=d.concluida_em,
        movimentacoes=[
            MovimentacaoOut(
                id=m.id,
                etapa=m.etapa,
                rotulo=ROTULO_ETAPA[m.etapa] if m.etapa else "Observação",
                descricao=m.descricao,
                autor=m.autor.nome if m.autor else "Sistema",
                criada_em=m.criada_em,
            )
            for m in d.movimentacoes
        ],
        documentos=[
            DocumentoOut(
                id=x.id,
                nome=x.nome,
                tamanho=x.tamanho,
                autor=x.autor.nome if x.autor else "Sistema",
                criado_em=x.criado_em,
            )
            for x in d.documentos
        ],
        etapas_permitidas=rules.etapas_permitidas(d.etapa, ator),
        pode_atribuir=rules.pode_atribuir(usuario.perfil) and d.etapa.value != "CONCLUIDA",
    )
