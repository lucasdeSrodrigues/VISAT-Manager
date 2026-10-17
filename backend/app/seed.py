"""Popula o banco com dados FICTÍCIOS para demonstração (LGPD: nenhum dado real).

    python -m backend.app.seed          # recria o banco do zero

As datas são relativas a HOJE, para que o Radar de Prazos sempre tenha
demandas em todas as faixas, em qualquer dia em que a demo for feita.
"""

from datetime import date, datetime, time, timedelta

from . import config
from .database import Base, SessionLocal, engine
from .models import Etapa, Movimentacao, Origem, Perfil, Prioridade, Usuario
from .models import TipoOcorrencia as T
from .rules import ROTULO_ETAPA, proxima_etapa
from .security import hash_senha
from .services import registrar_entrada

SENHA_DEMO = "visat123"

USUARIOS = [
    ("Helena Cavalcanti", "gestor@visat.demo", Perfil.GESTOR),
    ("Rodrigo Albuquerque", "rodrigo@visat.demo", Perfil.INSPETOR),
    ("Camila Freitas", "camila@visat.demo", Perfil.INSPETOR),
    ("Tiago Moura", "tiago@visat.demo", Perfil.INSPETOR),
    ("Juliana Barros", "juliana@visat.demo", Perfil.INSPETOR),
]

# (origem, nº SEI, tipo, órgão, empresa, município, descrição, prioridade,
#  dias desde a entrada, dias até o prazo (rel. a hoje), etapa final, inspetor, concluiu no prazo?)
DEMANDAS = [
    (
        Origem.SEI,
        "21000.009812/2026-11",
        T.ACIDENTE_GRAVE_FATAL,
        "Ministério Público do Trabalho",
        "Pré-Moldados Guararapes Ltda",
        "Jaboatão dos Guararapes",
        "Esmagamento de membro superior em prensa hidráulica.",
        Prioridade.ALTA,
        12,
        -4,
        Etapa.INSPECAO_REALIZADA,
        "rodrigo",
        None,
    ),
    (
        Origem.SEI,
        "21000.009877/2026-30",
        T.REQUISICAO_MPT,
        "Ministério Público do Trabalho",
        "Frigorífico Vale do Ipojuca S.A.",
        "Recife",
        "Requisição de relatório sobre exposição ao frio em câmaras frigoríficas.",
        Prioridade.ALTA,
        17,
        -2,
        Etapa.INSPETOR_DESIGNADO,
        "camila",
        None,
    ),
    (
        Origem.MANUAL,
        None,
        T.DENUNCIA_SINDICAL,
        "Sindicato dos Comerciários",
        "Supermercados Boa Praça Ltda",
        "Recife",
        "Denúncia de trabalho em pé sem assentos para descanso em caixas.",
        Prioridade.MEDIA,
        14,
        1,
        Etapa.INSPETOR_DESIGNADO,
        "tiago",
        None,
    ),
    (
        Origem.SEI,
        "21000.009950/2026-02",
        T.ACIDENTE_GRAVE_FATAL,
        "Unidade de Pronto Atendimento Imbiribeira",
        "Transportadora Rota Nordeste Ltda",
        "Recife",
        "Queimadura grave durante abastecimento de caminhão.",
        Prioridade.ALTA,
        4,
        2,
        Etapa.TRIAGEM,
        None,
        None,
    ),
    (
        Origem.SEI,
        "21000.009961/2026-77",
        T.INSPECAO_AMBIENTE,
        "Sindicato dos Trabalhadores em Saúde",
        "Hospital Santa Clara (rede privada)",
        "Recife",
        "Avaliação de riscos biológicos e descarte de perfurocortantes.",
        Prioridade.MEDIA,
        26,
        3,
        Etapa.RELATORIO,
        "juliana",
        None,
    ),
    (
        Origem.MANUAL,
        None,
        T.SOLICITACAO_INFORMACAO,
        "Câmara Municipal do Recife",
        None,
        "Recife",
        "Pedido de dados sobre inspeções em canteiros de obras no semestre.",
        Prioridade.BAIXA,
        5,
        5,
        Etapa.RECEBIDA,
        None,
        None,
    ),
    (
        Origem.SEI,
        "21000.010004/2026-58",
        T.DOENCA_TRABALHO,
        "Centro de Referência em Saúde do Trabalhador",
        "Call Center Atende Bem Ltda",
        "Olinda",
        "Agrupamento de casos de disfonia em operadores de teleatendimento.",
        Prioridade.MEDIA,
        23,
        6,
        Etapa.INSPETOR_DESIGNADO,
        "camila",
        None,
    ),
    (
        Origem.SEI,
        "21000.010017/2026-90",
        T.DEMANDA_CONSELHO_SAUDE,
        "Conselho Municipal de Saúde",
        None,
        "Recife",
        "Apresentação de indicadores de acidentes de trabalho notificados no SINAN.",
        Prioridade.MEDIA,
        13,
        7,
        Etapa.TRIAGEM,
        None,
        None,
    ),
    (
        Origem.MANUAL,
        None,
        T.INSPECAO_AMBIENTE,
        "Sindicato dos Trabalhadores da Limpeza Urbana",
        "Ambiental Recife Serviços Ltda",
        "Recife",
        "Condições de higiene e pontos de apoio para garis.",
        Prioridade.MEDIA,
        9,
        12,
        Etapa.INSPETOR_DESIGNADO,
        "rodrigo",
        None,
    ),
    (
        Origem.SEI,
        "21000.010066/2026-14",
        T.REQUISICAO_MPT,
        "Ministério Público do Trabalho",
        "Têxtil Agreste Ltda",
        "Camaragibe",
        "Requisição de vistoria em setor de tinturaria (exposição química).",
        Prioridade.ALTA,
        3,
        18,
        Etapa.TRIAGEM,
        None,
        None,
    ),
    (
        Origem.MANUAL,
        None,
        T.DENUNCIA_SINDICAL,
        "Sindicato dos Rodoviários",
        "Viação Capibaribe Ltda",
        "Recife",
        "Ausência de banheiros nos pontos finais de linhas de ônibus.",
        Prioridade.MEDIA,
        2,
        13,
        Etapa.RECEBIDA,
        None,
        None,
    ),
    (
        Origem.SEI,
        "21000.010101/2026-45",
        T.DOENCA_TRABALHO,
        "Unidade de Saúde da Família Brasília Teimosa",
        "Pescados Atlântico ME",
        "Recife",
        "Casos de dermatite em trabalhadoras do beneficiamento de pescado.",
        Prioridade.MEDIA,
        6,
        24,
        Etapa.INSPETOR_DESIGNADO,
        "juliana",
        None,
    ),
    # concluídas (alimentam tempo médio de resposta e % no prazo)
    (
        Origem.SEI,
        "21000.008420/2026-63",
        T.ACIDENTE_GRAVE_FATAL,
        "Ministério Público do Trabalho",
        "Construtora Recife Alto Ltda",
        "Recife",
        "Queda de andaime com óbito.",
        Prioridade.ALTA,
        40,
        -33,
        Etapa.CONCLUIDA,
        "rodrigo",
        True,
    ),
    (
        Origem.MANUAL,
        None,
        T.SOLICITACAO_INFORMACAO,
        "Ministério Público do Trabalho",
        None,
        "Recife",
        "Informações sobre notificações de intoxicação por agrotóxico.",
        Prioridade.BAIXA,
        35,
        -25,
        Etapa.CONCLUIDA,
        "camila",
        True,
    ),
    (
        Origem.SEI,
        "21000.008733/2026-18",
        T.INSPECAO_AMBIENTE,
        "Sindicato dos Metalúrgicos",
        "Metalúrgica Boa Viagem Ltda",
        "Recife",
        "Ruído excessivo e ausência de protetores auriculares.",
        Prioridade.MEDIA,
        55,
        -25,
        Etapa.CONCLUIDA,
        "tiago",
        False,
    ),
    (
        Origem.SEI,
        "21000.008901/2026-07",
        T.DENUNCIA_SINDICAL,
        "Sindicato dos Vigilantes",
        "Segurança Total Vigilância Ltda",
        "Paulista",
        "Jornada de 24h sem intervalo em postos de vigilância.",
        Prioridade.MEDIA,
        30,
        -12,
        Etapa.CONCLUIDA,
        "juliana",
        True,
    ),
]


def popular(db) -> None:
    usuarios = {}
    for nome, email, perfil in USUARIOS:
        u = Usuario(nome=nome, email=email, perfil=perfil, senha_hash=hash_senha(SENHA_DEMO))
        db.add(u)
        usuarios[email.split("@")[0]] = u
    db.flush()
    gestor, hoje = usuarios["gestor"], date.today()

    for origem, sei, tipo, orgao, empresa, mun, desc, prio, idade, prazo_rel, etapa_final, insp, no_prazo in DEMANDAS:
        entrada = hoje - timedelta(days=idade)
        d = registrar_entrada(
            db,
            origem=origem,
            numero_sei=sei,
            tipo=tipo,
            orgao=orgao,
            empresa=empresa,
            municipio=mun,
            descricao=desc,
            prioridade=prio,
            data_entrada=entrada,
            prazo_legal=hoje + timedelta(days=prazo_rel),
            autor=None if origem == Origem.SEI else gestor,
            commit=False,
        )
        d.movimentacoes[0].criada_em = datetime.combine(entrada, time(9, 0))
        if etapa_final == Etapa.CONCLUIDA:
            fim = d.prazo_legal - timedelta(days=2) if no_prazo else d.prazo_legal + timedelta(days=6)
            d.concluida_em = limite = min(fim, hoje)
        else:
            limite = hoje
        n_passos = list(Etapa).index(etapa_final)
        passo = max(1, (limite - entrada).days // max(1, n_passos))
        etapa, dia = Etapa.RECEBIDA, entrada
        while etapa != etapa_final:
            etapa = proxima_etapa(etapa)
            dia = min(dia + timedelta(days=passo), limite)
            if etapa == Etapa.INSPETOR_DESIGNADO:
                d.responsavel_id = usuarios[insp].id
            if etapa == Etapa.CONCLUIDA:
                dia = limite
            autor = usuarios[insp] if etapa in (Etapa.INSPECAO_REALIZADA, Etapa.RELATORIO) else gestor
            texto = {Etapa.INSPETOR_DESIGNADO: f"Inspetor designado: {usuarios[insp].nome if insp else ''}."}.get(
                etapa, f"Etapa '{ROTULO_ETAPA[etapa]}' registrada."
            )
            d.movimentacoes.append(
                Movimentacao(
                    etapa=etapa,
                    descricao=texto,
                    autor_id=autor.id,
                    criada_em=datetime.combine(dia, time(10 + len(d.movimentacoes), 0)),
                )
            )
        d.etapa = etapa_final
    db.commit()


def main() -> None:
    if config.DATABASE_URL.startswith("sqlite:///") and not config.DATABASE_URL.endswith(":memory:"):
        caminho = config.DATABASE_URL.replace("sqlite:///", "")
        engine.dispose()
        import os

        if os.path.exists(caminho):
            os.remove(caminho)
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        popular(db)
    print(f"[seed] Banco recriado com {len(USUARIOS)} usuários e {len(DEMANDAS)} demandas fictícias.")
    print(f"[seed] Login gestor: gestor@visat.demo / {SENHA_DEMO}")
    print(f"[seed] Login inspetor: rodrigo@visat.demo / {SENHA_DEMO}")


if __name__ == "__main__":
    main()
