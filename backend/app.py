from datetime import datetime, timedelta, timezone
import sqlite3

from flask import Flask, jsonify, request
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

DATABASE = "database.db"
DIAS_PARA_ARQUIVAR = 30

PRIORIDADES_VALIDAS = {
    "Baixa",
    "Média",
    "Alta",
}

RESPONSAVEIS_VALIDOS = {
    "Integrante 1",
    "Integrante 2",
    "Integrante 3",
    "Integrante 4",
    "Integrante 5",
}

STATUS_VALIDOS = {
    "Em andamento",
    "Em revisão",
    "Finalizada",
}


def obter_conexao():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row

    conn.execute(
        "PRAGMA foreign_keys = ON"
    )

    return conn


def data_hora_atual():
    return datetime.now(
        timezone.utc
    ).isoformat()


def registrar_historico(
    cursor,
    demanda_id,
    tipo_acao,
    descricao,
    usuario,
    status_anterior=None,
    status_posterior=None,
):
    cursor.execute("""
        INSERT INTO historico (
            demanda_id,
            data_hora,
            tipo_acao,
            descricao,
            usuario,
            status_anterior,
            status_posterior
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        demanda_id,
        data_hora_atual(),
        tipo_acao,
        descricao,
        usuario or
        "Usuário não identificado",
        status_anterior,
        status_posterior,
    ))


def buscar_demanda(cursor, demanda_id):
    cursor.execute("""
        SELECT *
        FROM demandas
        WHERE id = ?
    """, (demanda_id,))

    return cursor.fetchone()


def buscar_historico(cursor, demanda_id):
    cursor.execute("""
        SELECT
            id,
            demanda_id,
            data_hora,
            tipo_acao,
            descricao,
            usuario,
            status_anterior,
            status_posterior
        FROM historico
        WHERE demanda_id = ?
        ORDER BY data_hora ASC, id ASC
    """, (demanda_id,))

    return [
        dict(registro)
        for registro in cursor.fetchall()
    ]


def arquivar_demandas_vencidas(cursor):
    limite = (
        datetime.now(timezone.utc) -
        timedelta(
            days=DIAS_PARA_ARQUIVAR
        )
    ).isoformat()

    agora = data_hora_atual()

    cursor.execute("""
        UPDATE demandas
        SET
            arquivada = 1,
            data_arquivamento = ?
        WHERE status = 'Finalizada'
          AND arquivada = 0
          AND data_finalizacao IS NOT NULL
          AND data_finalizacao <= ?
    """, (
        agora,
        limite,
    ))


@app.route("/")
def home():
    return {
        "mensagem":
            "VISAT Manager Backend funcionando!"
    }


@app.route("/api/health")
def health():
    return {
        "status": "ok"
    }


@app.route(
    "/api/demandas",
    methods=["GET"],
)
def listar_demandas():
    conn = obter_conexao()
    cursor = conn.cursor()

    arquivar_demandas_vencidas(cursor)
    conn.commit()

    cursor.execute("""
        SELECT *
        FROM demandas
        WHERE arquivada = 0
        ORDER BY id DESC
    """)

    demandas = []

    for registro in cursor.fetchall():
        demanda = dict(registro)

        demanda["historico"] = (
            buscar_historico(
                cursor,
                demanda["id"],
            )
        )

        demandas.append(demanda)

    conn.close()

    return jsonify(demandas)


@app.route(
    "/api/demandas/<int:demanda_id>",
    methods=["GET"],
)
def detalhar_demanda(demanda_id):
    conn = obter_conexao()
    cursor = conn.cursor()

    registro = buscar_demanda(
        cursor,
        demanda_id,
    )

    if not registro:
        conn.close()

        return {
            "mensagem":
                "Demanda não encontrada."
        }, 404

    demanda = dict(registro)

    demanda["historico"] = (
        buscar_historico(
            cursor,
            demanda_id,
        )
    )

    conn.close()

    return jsonify(demanda)


@app.route(
    "/api/demandas",
    methods=["POST"],
)
def criar_demanda():
    dados = request.get_json(
        silent=True
    ) or {}

    campos_obrigatorios = [
        "orgao_solicitante",
        "municipio",
        "bairro",
        "tipo_ocorrencia",
        "data_entrada",
        "prazo_resposta",
        "descricao",
        "status",
        "origem",
        "data_cadastro",
    ]

    campos_ausentes = [
        campo
        for campo in campos_obrigatorios
        if not dados.get(campo)
    ]

    if campos_ausentes:
        return {
            "mensagem":
                "Preencha todos os campos obrigatórios.",
            "campos_ausentes":
                campos_ausentes,
        }, 400

    status = dados.get("status")

    if status not in STATUS_VALIDOS:
        return {
            "mensagem":
                "Status inválido."
        }, 400

    prioridade = dados.get(
        "prioridade_manual"
    )

    if (
        prioridade is not None and
        prioridade not in
        PRIORIDADES_VALIDAS
    ):
        return {
            "mensagem":
                "Prioridade inválida."
        }, 400

    responsavel = dados.get(
        "responsavel"
    )

    if (
        responsavel is not None and
        responsavel not in
        RESPONSAVEIS_VALIDOS
    ):
        return {
            "mensagem":
                "Responsável inválido."
        }, 400

    data_finalizacao = None

    if status == "Finalizada":
        data_finalizacao = (
            data_hora_atual()
        )

    conn = obter_conexao()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO demandas (
            numero_processo,
            orgao_solicitante,
            municipio,
            bairro,
            tipo_ocorrencia,
            data_entrada,
            prazo_resposta,
            descricao,
            prioridade_manual,
            justificativa_prioridade,
            data_alteracao_prioridade,
            responsavel,
            status,
            origem,
            data_cadastro,
            data_finalizacao,
            arquivada,
            data_arquivamento
        )
        VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?, ?, 0, NULL
        )
    """, (
        dados.get("numero_processo"),
        dados.get("orgao_solicitante"),
        dados.get("municipio"),
        dados.get("bairro"),
        dados.get("tipo_ocorrencia"),
        dados.get("data_entrada"),
        dados.get("prazo_resposta"),
        dados.get("descricao"),
        prioridade,
        dados.get(
            "justificativa_prioridade"
        ),
        dados.get(
            "data_alteracao_prioridade"
        ),
        responsavel,
        status,
        dados.get("origem"),
        dados.get("data_cadastro"),
        data_finalizacao,
    ))

    demanda_id = cursor.lastrowid

    registrar_historico(
        cursor=cursor,
        demanda_id=demanda_id,
        tipo_acao=
            "Cadastro da demanda",
        descricao=(
            "Demanda cadastrada "
            "manualmente no VISAT Manager."
        ),
        usuario="Sistema",
        status_anterior=None,
        status_posterior=status,
    )

    conn.commit()

    demanda = buscar_demanda(
        cursor,
        demanda_id,
    )

    resultado = dict(demanda)

    resultado["historico"] = (
        buscar_historico(
            cursor,
            demanda_id,
        )
    )

    conn.close()

    return jsonify(resultado), 201


@app.route(
    "/api/demandas/<int:demanda_id>",
    methods=["PUT"],
)
def atualizar_demanda(demanda_id):
    dados = request.get_json(
        silent=True
    ) or {}

    conn = obter_conexao()
    cursor = conn.cursor()

    registro = buscar_demanda(
        cursor,
        demanda_id,
    )

    if not registro:
        conn.close()

        return {
            "mensagem":
                "Demanda não encontrada."
        }, 404

    demanda_atual = dict(registro)

    responsavel_atual = (
        demanda_atual["responsavel"]
    )

    status_atual = (
        demanda_atual["status"]
    )

    prioridade_atual = (
        demanda_atual[
            "prioridade_manual"
        ]
    )

    novo_responsavel = (
        dados.get(
            "responsavel",
            responsavel_atual,
        )
    )

    novo_status = dados.get(
        "status",
        status_atual,
    )

    nova_prioridade = dados.get(
        "prioridade_manual",
        prioridade_atual,
    )

    justificativa_prioridade = (
        dados.get(
            "justificativa_prioridade",
            demanda_atual[
                "justificativa_prioridade"
            ],
        )
    )

    data_alteracao_prioridade = (
        dados.get(
            "data_alteracao_prioridade",
            demanda_atual[
                "data_alteracao_prioridade"
            ],
        )
    )

    if (
        novo_responsavel is not None and
        novo_responsavel not in
        RESPONSAVEIS_VALIDOS
    ):
        conn.close()

        return {
            "mensagem":
                "Responsável inválido."
        }, 400

    if novo_status not in STATUS_VALIDOS:
        conn.close()

        return {
            "mensagem":
                "Status inválido."
        }, 400

    if (
        nova_prioridade is not None and
        nova_prioridade not in
        PRIORIDADES_VALIDAS
    ):
        conn.close()

        return {
            "mensagem":
                "Prioridade inválida."
        }, 400

    data_finalizacao = (
        demanda_atual[
            "data_finalizacao"
        ]
    )

    arquivada = (
        demanda_atual["arquivada"]
    )

    data_arquivamento = (
        demanda_atual[
            "data_arquivamento"
        ]
    )

    if (
        novo_status == "Finalizada" and
        status_atual != "Finalizada"
    ):
        data_finalizacao = (
            data_hora_atual()
        )

        arquivada = 0
        data_arquivamento = None

    if (
        status_atual == "Finalizada" and
        novo_status != "Finalizada"
    ):
        data_finalizacao = None
        arquivada = 0
        data_arquivamento = None

    cursor.execute("""
        UPDATE demandas
        SET
            responsavel = ?,
            status = ?,
            prioridade_manual = ?,
            justificativa_prioridade = ?,
            data_alteracao_prioridade = ?,
            data_finalizacao = ?,
            arquivada = ?,
            data_arquivamento = ?
        WHERE id = ?
    """, (
        novo_responsavel,
        novo_status,
        nova_prioridade,
        justificativa_prioridade,
        data_alteracao_prioridade,
        data_finalizacao,
        arquivada,
        data_arquivamento,
        demanda_id,
    ))

    usuario = (
        dados.get("usuario") or
        novo_responsavel or
        responsavel_atual or
        "Usuário não identificado"
    )

    if (
        responsavel_atual !=
        novo_responsavel
    ):
        anterior = (
            responsavel_atual or
            "Sem responsável"
        )

        posterior = (
            novo_responsavel or
            "Sem responsável"
        )

        tipo_acao = (
            "Atribuição de responsável"
            if novo_responsavel
            else "Remoção de responsável"
        )

        descricao = (
            f"Responsável alterado de "
            f"{anterior} para {posterior}."
            if novo_responsavel
            else
            f"O responsável {anterior} "
            f"foi removido da demanda."
        )

        registrar_historico(
            cursor=cursor,
            demanda_id=demanda_id,
            tipo_acao=tipo_acao,
            descricao=descricao,
            usuario=usuario,
            status_anterior=status_atual,
            status_posterior=
                novo_status,
        )

    if status_atual != novo_status:
        registrar_historico(
            cursor=cursor,
            demanda_id=demanda_id,
            tipo_acao=
                "Alteração de status",
            descricao=(
                f"Status alterado de "
                f"{status_atual} para "
                f"{novo_status}."
            ),
            usuario=usuario,
            status_anterior=status_atual,
            status_posterior=
                novo_status,
        )

    if (
        prioridade_atual !=
        nova_prioridade
    ):
        if nova_prioridade is None:
            tipo_acao = (
                "Restauração da prioridade"
            )

            descricao = (
                "Prioridade automática "
                "restaurada com base no prazo "
                "da demanda."
            )
        else:
            tipo_acao = (
                "Alteração de prioridade"
            )

            descricao = (
                "Prioridade alterada "
                f"manualmente para "
                f"{nova_prioridade}."
            )

        registrar_historico(
            cursor=cursor,
            demanda_id=demanda_id,
            tipo_acao=tipo_acao,
            descricao=descricao,
            usuario=usuario,
            status_anterior=status_atual,
            status_posterior=
                novo_status,
        )

    conn.commit()

    demanda_atualizada = dict(
        buscar_demanda(
            cursor,
            demanda_id,
        )
    )

    demanda_atualizada["historico"] = (
        buscar_historico(
            cursor,
            demanda_id,
        )
    )

    conn.close()

    return jsonify(
        demanda_atualizada
    )


@app.route(
    "/api/demandas/<int:demanda_id>",
    methods=["DELETE"],
)
def excluir_demanda(demanda_id):
    conn = obter_conexao()
    cursor = conn.cursor()

    registro = buscar_demanda(
        cursor,
        demanda_id,
    )

    if not registro:
        conn.close()

        return {
            "mensagem":
                "Demanda não encontrada."
        }, 404

    cursor.execute("""
        DELETE FROM historico
        WHERE demanda_id = ?
    """, (demanda_id,))

    cursor.execute("""
        DELETE FROM demandas
        WHERE id = ?
    """, (demanda_id,))

    conn.commit()
    conn.close()

    return {
        "mensagem":
            "Demanda removida com sucesso!"
    }


@app.route(
    "/api/demandas/<int:demanda_id>/historico",
    methods=["GET"],
)
def listar_historico(demanda_id):
    conn = obter_conexao()
    cursor = conn.cursor()

    registro = buscar_demanda(
        cursor,
        demanda_id,
    )

    if not registro:
        conn.close()

        return {
            "mensagem":
                "Demanda não encontrada."
        }, 404

    historico = buscar_historico(
        cursor,
        demanda_id,
    )

    conn.close()

    return jsonify(historico)


if __name__ == "__main__":
    app.run(debug=True)