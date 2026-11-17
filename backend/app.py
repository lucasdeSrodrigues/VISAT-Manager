from datetime import datetime, timedelta, timezone
from functools import wraps
from pathlib import Path
import mimetypes
import os
import sqlite3
import uuid

from flask import Flask, jsonify, request, send_file, session
from flask_cors import CORS
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename


app = Flask(__name__)

app.config["SECRET_KEY"] = os.getenv(
    "SECRET_KEY",
    "visat-manager-chave-local-de-desenvolvimento",
)

app.config["SESSION_COOKIE_HTTPONLY"] = True

app.config["SESSION_COOKIE_SAMESITE"] = os.getenv(
    "SESSION_COOKIE_SAMESITE",
    "Lax",
)

app.config["SESSION_COOKIE_SECURE"] = (
    os.getenv(
        "SESSION_COOKIE_SECURE",
        "false",
    ).lower() == "true"
)

app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(
    hours=8
)

app.config["MAX_CONTENT_LENGTH"] = (
    10 * 1024 * 1024
)

FRONTEND_URL = os.getenv("FRONTEND_URL")

if not FRONTEND_URL:
    raise RuntimeError(
        "A variável de ambiente FRONTEND_URL não foi configurada."
    )

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": [
                FRONTEND_URL,
            ],
        },
    },
    supports_credentials=True,
)

BASE_DIR = Path(__file__).resolve().parent
DATABASE = BASE_DIR / "database.db"

DIRETORIO_ANEXOS = Path(
    os.getenv(
        "DIRETORIO_ANEXOS",
        str(BASE_DIR / "uploads"),
    )
)

DIRETORIO_ANEXOS.mkdir(
    parents=True,
    exist_ok=True,
)

DIAS_PARA_ARQUIVAR = 30

TAMANHO_MAXIMO_ANEXO = (
    10 * 1024 * 1024
)

PRIORIDADES_VALIDAS = {
    "Baixa",
    "Média",
    "Alta",
}

STATUS_VALIDOS = {
    "Em andamento",
    "Em revisão",
    "Finalizada",
}

STATUS_GARGALO_VALIDOS = {
    "Aberto",
    "Resolvido",
}

PERFIS_VALIDOS = {
    "gestor",
    "inspetor",
}

TIPOS_DOCUMENTO_VALIDOS = {
    "Relatório",
    "Laudo",
    "Foto",
    "Ofício",
    "Planilha",
    "Outro",
}

EXTENSOES_ANEXO_PERMITIDAS = {
    "pdf",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "png",
    "jpg",
    "jpeg",
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


def criar_usuario_inicial(
    cursor,
    nome,
    email,
    senha,
    perfil,
):
    cursor.execute(
        """
        SELECT id
        FROM usuarios
        WHERE email = ?
        """,
        (
            email.lower(),
        ),
    )

    if cursor.fetchone():
        return

    cursor.execute(
        """
        INSERT INTO usuarios (
            nome,
            email,
            senha_hash,
            perfil,
            ativo,
            data_cadastro
        )
        VALUES (?, ?, ?, ?, 1, ?)
        """,
        (
            nome,
            email.lower(),
            generate_password_hash(senha),
            perfil,
            data_hora_atual(),
        ),
    )


def inicializar_banco():
    conn = obter_conexao()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            senha_hash TEXT NOT NULL,
            perfil TEXT NOT NULL,
            ativo INTEGER NOT NULL DEFAULT 1,
            data_cadastro TEXT NOT NULL,
            CHECK (
                perfil IN (
                    'gestor',
                    'inspetor'
                )
            )
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS demandas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            numero_processo TEXT,
            orgao_solicitante TEXT NOT NULL,
            municipio TEXT NOT NULL,
            bairro TEXT NOT NULL,
            tipo_ocorrencia TEXT NOT NULL,
            data_entrada TEXT NOT NULL,
            prazo_resposta TEXT NOT NULL,
            descricao TEXT NOT NULL,
            prioridade_manual TEXT,
            justificativa_prioridade TEXT,
            data_alteracao_prioridade TEXT,
            responsavel TEXT,
            status TEXT NOT NULL,
            origem TEXT NOT NULL,
            data_cadastro TEXT NOT NULL,
            data_finalizacao TEXT,
            arquivada INTEGER NOT NULL DEFAULT 0,
            data_arquivamento TEXT
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS historico (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            demanda_id INTEGER NOT NULL,
            data_hora TEXT NOT NULL,
            tipo_acao TEXT NOT NULL,
            descricao TEXT NOT NULL,
            usuario TEXT NOT NULL,
            status_anterior TEXT,
            status_posterior TEXT,
            FOREIGN KEY (demanda_id)
                REFERENCES demandas (id)
                ON DELETE CASCADE
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS gargalos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            demanda_id INTEGER NOT NULL,
            descricao TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'Aberto',
            usuario_registro TEXT NOT NULL,
            perfil_registro TEXT NOT NULL,
            data_registro TEXT NOT NULL,
            data_atualizacao TEXT NOT NULL,
            usuario_resolucao TEXT,
            data_resolucao TEXT,
            FOREIGN KEY (demanda_id)
                REFERENCES demandas (id)
                ON DELETE CASCADE,
            CHECK (
                status IN (
                    'Aberto',
                    'Resolvido'
                )
            ),
            CHECK (
                perfil_registro IN (
                    'gestor',
                    'inspetor'
                )
            )
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS anexos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            demanda_id INTEGER NOT NULL,
            nome_original TEXT NOT NULL,
            nome_armazenado TEXT NOT NULL UNIQUE,
            extensao TEXT NOT NULL,
            tipo_documento TEXT NOT NULL,
            descricao TEXT NOT NULL,
            tamanho_bytes INTEGER NOT NULL,
            usuario_id INTEGER NOT NULL,
            usuario_nome TEXT NOT NULL,
            usuario_perfil TEXT NOT NULL,
            data_envio TEXT NOT NULL,
            data_atualizacao TEXT NOT NULL,
            FOREIGN KEY (demanda_id)
                REFERENCES demandas (id)
                ON DELETE CASCADE,
            FOREIGN KEY (usuario_id)
                REFERENCES usuarios (id),
            CHECK (
                tipo_documento IN (
                    'Relatório',
                    'Laudo',
                    'Foto',
                    'Ofício',
                    'Planilha',
                    'Outro'
                )
            ),
            CHECK (
                usuario_perfil IN (
                    'gestor',
                    'inspetor'
                )
            )
        )
    """)

    criar_usuario_inicial(
        cursor,
        os.getenv(
            "GESTOR_INICIAL_NOME",
            "Gestor VISAT",
        ),
        os.getenv(
            "GESTOR_INICIAL_EMAIL",
            "gestor@visat.com",
        ),
        os.getenv(
            "GESTOR_INICIAL_SENHA",
            "Gestor@123",
        ),
        "gestor",
    )

    criar_usuario_inicial(
        cursor,
        os.getenv(
            "INSPETOR_INICIAL_NOME",
            "Inspetor VISAT",
        ),
        os.getenv(
            "INSPETOR_INICIAL_EMAIL",
            "inspetor@visat.com",
        ),
        os.getenv(
            "INSPETOR_INICIAL_SENHA",
            "Inspetor@123",
        ),
        "inspetor",
    )

    conn.commit()
    conn.close()


inicializar_banco()


def converter_usuario_para_dict(usuario):
    return {
        "id": usuario["id"],
        "nome": usuario["nome"],
        "email": usuario["email"],
        "perfil": usuario["perfil"],
    }


def buscar_usuario_por_id(usuario_id):
    conn = obter_conexao()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT
            id,
            nome,
            email,
            perfil,
            ativo,
            data_cadastro
        FROM usuarios
        WHERE id = ?
        """,
        (
            usuario_id,
        ),
    )

    usuario = cursor.fetchone()

    conn.close()

    return usuario


def obter_usuario_autenticado():
    usuario_id = session.get(
        "usuario_id"
    )

    if not usuario_id:
        return None

    usuario = buscar_usuario_por_id(
        usuario_id
    )

    if not usuario:
        session.clear()
        return None

    if not usuario["ativo"]:
        session.clear()
        return None

    if (
        usuario["perfil"] not in
        PERFIS_VALIDOS
    ):
        session.clear()
        return None

    return usuario


def login_obrigatorio(funcao):
    @wraps(funcao)
    def funcao_protegida(
        *args,
        **kwargs,
    ):
        usuario = (
            obter_usuario_autenticado()
        )

        if not usuario:
            return {
                "mensagem":
                    "Autenticação necessária."
            }, 401

        kwargs["usuario_logado"] = (
            usuario
        )

        return funcao(
            *args,
            **kwargs,
        )

    return funcao_protegida


def perfil_obrigatorio(*perfis):
    def decorador(funcao):
        @wraps(funcao)
        def funcao_protegida(
            *args,
            **kwargs,
        ):
            usuario = (
                obter_usuario_autenticado()
            )

            if not usuario:
                return {
                    "mensagem":
                        "Autenticação necessária."
                }, 401

            if (
                usuario["perfil"] not in
                perfis
            ):
                return {
                    "mensagem": (
                        "Você não possui "
                        "permissão para "
                        "realizar esta ação."
                    )
                }, 403

            kwargs["usuario_logado"] = (
                usuario
            )

            return funcao(
                *args,
                **kwargs,
            )

        return funcao_protegida

    return decorador


def registrar_historico(
    cursor,
    demanda_id,
    tipo_acao,
    descricao,
    usuario,
    status_anterior=None,
    status_posterior=None,
):
    cursor.execute(
        """
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
        """,
        (
            demanda_id,
            data_hora_atual(),
            tipo_acao,
            descricao,
            usuario or
            "Usuário não identificado",
            status_anterior,
            status_posterior,
        ),
    )


def buscar_demanda(
    cursor,
    demanda_id,
):
    cursor.execute(
        """
        SELECT *
        FROM demandas
        WHERE id = ?
        """,
        (
            demanda_id,
        ),
    )

    return cursor.fetchone()


def buscar_historico(
    cursor,
    demanda_id,
):
    cursor.execute(
        """
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
        """,
        (
            demanda_id,
        ),
    )

    return [
        dict(registro)
        for registro in cursor.fetchall()
    ]


def buscar_gargalos(
    cursor,
    demanda_id,
):
    cursor.execute(
        """
        SELECT
            id,
            demanda_id,
            descricao,
            status,
            usuario_registro,
            perfil_registro,
            data_registro,
            data_atualizacao,
            usuario_resolucao,
            data_resolucao
        FROM gargalos
        WHERE demanda_id = ?
        ORDER BY
            CASE
                WHEN status = 'Aberto'
                THEN 0
                ELSE 1
            END,
            data_registro DESC,
            id DESC
        """,
        (
            demanda_id,
        ),
    )

    return [
        dict(registro)
        for registro in cursor.fetchall()
    ]


def buscar_gargalo(
    cursor,
    demanda_id,
    gargalo_id,
):
    cursor.execute(
        """
        SELECT *
        FROM gargalos
        WHERE demanda_id = ?
          AND id = ?
        """,
        (
            demanda_id,
            gargalo_id,
        ),
    )

    return cursor.fetchone()


def buscar_anexos(
    cursor,
    demanda_id,
):
    cursor.execute(
        """
        SELECT
            id,
            demanda_id,
            nome_original,
            extensao,
            tipo_documento,
            descricao,
            tamanho_bytes,
            usuario_id,
            usuario_nome,
            usuario_perfil,
            data_envio,
            data_atualizacao
        FROM anexos
        WHERE demanda_id = ?
        ORDER BY data_envio DESC, id DESC
        """,
        (
            demanda_id,
        ),
    )

    return [
        dict(registro)
        for registro in cursor.fetchall()
    ]


def buscar_anexo(
    cursor,
    demanda_id,
    anexo_id,
):
    cursor.execute(
        """
        SELECT *
        FROM anexos
        WHERE demanda_id = ?
          AND id = ?
        """,
        (
            demanda_id,
            anexo_id,
        ),
    )

    return cursor.fetchone()


def montar_demanda(
    cursor,
    registro,
):
    demanda = dict(registro)

    demanda["historico"] = (
        buscar_historico(
            cursor,
            demanda["id"],
        )
    )

    demanda["gargalos"] = (
        buscar_gargalos(
            cursor,
            demanda["id"],
        )
    )

    demanda["anexos"] = (
        buscar_anexos(
            cursor,
            demanda["id"],
        )
    )

    return demanda


def obter_extensao_arquivo(
    nome_arquivo,
):
    return (
        Path(nome_arquivo or "")
        .suffix
        .lower()
        .lstrip(".")
    )


def obter_caminho_anexo(
    nome_armazenado,
):
    return (
        DIRETORIO_ANEXOS /
        nome_armazenado
    )


def excluir_arquivo_anexo(
    nome_armazenado,
):
    caminho = obter_caminho_anexo(
        nome_armazenado
    )

    if (
        caminho.exists() and
        caminho.is_file()
    ):
        caminho.unlink()


def usuario_pode_excluir_anexo(
    usuario_logado,
    anexo,
):
    return (
        usuario_logado["perfil"] ==
        "gestor"
        or usuario_logado["id"] ==
        anexo["usuario_id"]
    )


def arquivar_demandas_vencidas(cursor):
    limite = (
        datetime.now(timezone.utc) -
        timedelta(
            days=DIAS_PARA_ARQUIVAR
        )
    ).isoformat()

    cursor.execute(
        """
        UPDATE demandas
        SET
            arquivada = 1,
            data_arquivamento = ?
        WHERE status = 'Finalizada'
          AND arquivada = 0
          AND data_finalizacao IS NOT NULL
          AND data_finalizacao <= ?
        """,
        (
            data_hora_atual(),
            limite,
        ),
    )


@app.errorhandler(413)
def arquivo_muito_grande(erro):
    return {
        "mensagem": (
            "O arquivo deve possuir "
            "no máximo 10 MB."
        )
    }, 413


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
    "/api/auth/login",
    methods=["POST"],
)
def login():
    dados = request.get_json(
        silent=True
    ) or {}

    email = str(
        dados.get(
            "email",
            "",
        )
    ).strip().lower()

    senha = str(
        dados.get(
            "senha",
            "",
        )
    )

    perfil_selecionado = str(
        dados.get(
            "perfil",
            "",
        )
    ).strip().lower()

    if not email or not senha:
        return {
            "mensagem":
                "Informe o e-mail e a senha."
        }, 400

    if (
        perfil_selecionado not in
        PERFIS_VALIDOS
    ):
        return {
            "mensagem":
                "Selecione um perfil válido."
        }, 400

    conn = obter_conexao()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT
            id,
            nome,
            email,
            senha_hash,
            perfil,
            ativo,
            data_cadastro
        FROM usuarios
        WHERE email = ?
        """,
        (
            email,
        ),
    )

    usuario = cursor.fetchone()

    conn.close()

    if (
        not usuario or
        not check_password_hash(
            usuario["senha_hash"],
            senha,
        )
    ):
        return {
            "mensagem":
                "E-mail ou senha inválidos."
        }, 401

    if not usuario["ativo"]:
        return {
            "mensagem":
                "Este usuário está desativado."
        }, 403

    if (
        usuario["perfil"] not in
        PERFIS_VALIDOS
    ):
        return {
            "mensagem":
                "O perfil deste usuário é inválido."
        }, 403

    if (
        usuario["perfil"] !=
        perfil_selecionado
    ):
        return {
            "mensagem": (
                "O perfil selecionado não "
                "corresponde ao perfil "
                "cadastrado para este usuário."
            )
        }, 403

    session.clear()
    session.permanent = True

    session["usuario_id"] = (
        usuario["id"]
    )

    return {
        "mensagem":
            "Login realizado com sucesso.",
        "usuario":
            converter_usuario_para_dict(
                usuario
            ),
    }


@app.route(
    "/api/auth/me",
    methods=["GET"],
)
@login_obrigatorio
def consultar_usuario_autenticado(
    usuario_logado,
):
    return {
        "usuario":
            converter_usuario_para_dict(
                usuario_logado
            )
    }


@app.route(
    "/api/auth/logout",
    methods=["POST"],
)
def logout():
    session.clear()

    return {
        "mensagem":
            "Sessão encerrada com sucesso."
    }


@app.route(
    "/api/demandas",
    methods=["GET"],
)
@login_obrigatorio
def listar_demandas(
    usuario_logado,
):
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

    registros = cursor.fetchall()

    demandas = [
        montar_demanda(
            cursor,
            registro,
        )
        for registro in registros
    ]

    conn.close()

    return jsonify(demandas)


@app.route(
    "/api/demandas/<int:demanda_id>",
    methods=["GET"],
)
@login_obrigatorio
def detalhar_demanda(
    demanda_id,
    usuario_logado,
):
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

    demanda = montar_demanda(
        cursor,
        registro,
    )

    conn.close()

    return jsonify(demanda)


@app.route(
    "/api/demandas",
    methods=["POST"],
)
@login_obrigatorio
def criar_demanda(
    usuario_logado,
):
    dados = request.get_json(
        silent=True
    ) or {}

    obrigatorios = [
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

    ausentes = [
        campo
        for campo in obrigatorios
        if not dados.get(campo)
    ]

    if ausentes:
        return {
            "mensagem":
                "Preencha todos os campos obrigatórios.",
            "campos_ausentes":
                ausentes,
        }, 400

    status = dados.get("status")

    prioridade = dados.get(
        "prioridade_manual"
    )

    if status not in STATUS_VALIDOS:
        return {
            "mensagem":
                "Status inválido."
        }, 400

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

    if responsavel is not None:
        responsavel = str(
            responsavel
        ).strip()

    responsavel = responsavel or None

    if (
        responsavel and
        usuario_logado["perfil"] !=
        "gestor"
    ):
        return {
            "mensagem": (
                "Somente usuários com perfil "
                "Gestor podem atribuir um responsável."
            )
        }, 403

    if (
        responsavel and
        len(responsavel) > 100
    ):
        return {
            "mensagem": (
                "O nome do responsável deve "
                "possuir no máximo 100 caracteres."
            )
        }, 400

    data_finalizacao = (
        data_hora_atual()
        if status == "Finalizada"
        else None
    )

    conn = obter_conexao()
    cursor = conn.cursor()

    cursor.execute(
        """
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
        """,
        (
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
        ),
    )

    demanda_id = cursor.lastrowid

    registrar_historico(
        cursor,
        demanda_id,
        "Cadastro da demanda",
        (
            "Demanda cadastrada manualmente "
            "no VISAT Manager."
        ),
        usuario_logado["nome"],
        None,
        status,
    )

    conn.commit()

    resultado = montar_demanda(
        cursor,
        buscar_demanda(
            cursor,
            demanda_id,
        ),
    )

    conn.close()

    return jsonify(resultado), 201


@app.route(
    "/api/demandas/<int:demanda_id>",
    methods=["PUT"],
)
@login_obrigatorio
def atualizar_demanda(
    demanda_id,
    usuario_logado,
):
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

    atual = dict(registro)

    status_atual = atual["status"]

    prioridade_atual = (
        atual["prioridade_manual"]
    )

    responsavel_atual = (
        atual["responsavel"]
    )

    novo_responsavel = dados.get(
        "responsavel",
        responsavel_atual,
    )

    if novo_responsavel is not None:
        novo_responsavel = str(
            novo_responsavel
        ).strip()

    novo_responsavel = (
        novo_responsavel or None
    )

    if (
        novo_responsavel !=
        responsavel_atual and
        usuario_logado["perfil"] !=
        "gestor"
    ):
        conn.close()

        return {
            "mensagem": (
                "Somente usuários com perfil Gestor "
                "podem atribuir ou remover o responsável."
            )
        }, 403

    if (
        novo_responsavel and
        len(novo_responsavel) > 100
    ):
        conn.close()

        return {
            "mensagem": (
                "O nome do responsável deve "
                "possuir no máximo 100 caracteres."
            )
        }, 400

    novo_status = dados.get(
        "status",
        status_atual,
    )

    nova_prioridade = dados.get(
        "prioridade_manual",
        prioridade_atual,
    )

    valores = {
        "orgao_solicitante":
            dados.get(
                "orgao_solicitante",
                atual["orgao_solicitante"],
            ),
        "municipio":
            dados.get(
                "municipio",
                atual["municipio"],
            ),
        "bairro":
            dados.get(
                "bairro",
                atual["bairro"],
            ),
        "tipo_ocorrencia":
            dados.get(
                "tipo_ocorrencia",
                atual["tipo_ocorrencia"],
            ),
        "prazo_resposta":
            dados.get(
                "prazo_resposta",
                atual["prazo_resposta"],
            ),
        "descricao":
            dados.get(
                "descricao",
                atual["descricao"],
            ),
    }

    if any(
        valor is None or
        not str(valor).strip()
        for valor in valores.values()
    ):
        conn.close()

        return {
            "mensagem":
                "Preencha todos os dados da demanda."
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

    dados_alterados = any(
        atual[campo] != valor
        for campo, valor
        in valores.items()
    )

    data_finalizacao = (
        atual["data_finalizacao"]
    )

    arquivada = atual["arquivada"]

    data_arquivamento = (
        atual["data_arquivamento"]
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

    elif (
        status_atual == "Finalizada" and
        novo_status != "Finalizada"
    ):
        data_finalizacao = None
        arquivada = 0
        data_arquivamento = None

    cursor.execute(
        """
        UPDATE demandas
        SET
            orgao_solicitante = ?,
            municipio = ?,
            bairro = ?,
            tipo_ocorrencia = ?,
            prazo_resposta = ?,
            descricao = ?,
            responsavel = ?,
            status = ?,
            prioridade_manual = ?,
            justificativa_prioridade = ?,
            data_alteracao_prioridade = ?,
            data_finalizacao = ?,
            arquivada = ?,
            data_arquivamento = ?
        WHERE id = ?
        """,
        (
            valores["orgao_solicitante"],
            valores["municipio"],
            valores["bairro"],
            valores["tipo_ocorrencia"],
            valores["prazo_resposta"],
            valores["descricao"],
            novo_responsavel,
            novo_status,
            nova_prioridade,
            dados.get(
                "justificativa_prioridade",
                atual[
                    "justificativa_prioridade"
                ],
            ),
            dados.get(
                "data_alteracao_prioridade",
                atual[
                    "data_alteracao_prioridade"
                ],
            ),
            data_finalizacao,
            arquivada,
            data_arquivamento,
            demanda_id,
        ),
    )

    usuario = usuario_logado["nome"]

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

        tipo = (
            "Atribuição de responsável"
            if novo_responsavel
            else "Remoção de responsável"
        )

        descricao_historico = (
            f"Responsável alterado de "
            f"{anterior} para {posterior}."
            if novo_responsavel
            else
            f"O responsável {anterior} "
            f"foi removido da demanda."
        )

        registrar_historico(
            cursor,
            demanda_id,
            tipo,
            descricao_historico,
            usuario,
            status_atual,
            novo_status,
        )

    if status_atual != novo_status:
        registrar_historico(
            cursor,
            demanda_id,
            "Alteração de status",
            (
                f"Status alterado de "
                f"{status_atual} para "
                f"{novo_status}."
            ),
            usuario,
            status_atual,
            novo_status,
        )

    if (
        prioridade_atual !=
        nova_prioridade
    ):
        if nova_prioridade is None:
            tipo = (
                "Restauração da prioridade"
            )

            descricao_historico = (
                "Prioridade automática restaurada "
                "com base no prazo da demanda."
            )
        else:
            tipo = (
                "Alteração de prioridade"
            )

            descricao_historico = (
                "Prioridade alterada manualmente "
                f"para {nova_prioridade}."
            )

        registrar_historico(
            cursor,
            demanda_id,
            tipo,
            descricao_historico,
            usuario,
            status_atual,
            novo_status,
        )

    if dados_alterados:
        registrar_historico(
            cursor,
            demanda_id,
            "Edição da demanda",
            (
                "Os dados cadastrais da "
                "demanda foram atualizados."
            ),
            usuario,
            status_atual,
            novo_status,
        )

    conn.commit()

    resultado = montar_demanda(
        cursor,
        buscar_demanda(
            cursor,
            demanda_id,
        ),
    )

    conn.close()

    return jsonify(resultado)


@app.route(
    "/api/demandas/<int:demanda_id>",
    methods=["DELETE"],
)
@perfil_obrigatorio("gestor")
def excluir_demanda(
    demanda_id,
    usuario_logado,
):
    conn = obter_conexao()
    cursor = conn.cursor()

    if not buscar_demanda(
        cursor,
        demanda_id,
    ):
        conn.close()

        return {
            "mensagem":
                "Demanda não encontrada."
        }, 404

    cursor.execute(
        """
        SELECT nome_armazenado
        FROM anexos
        WHERE demanda_id = ?
        """,
        (
            demanda_id,
        ),
    )

    arquivos = [
        registro["nome_armazenado"]
        for registro in cursor.fetchall()
    ]

    cursor.execute(
        """
        DELETE FROM demandas
        WHERE id = ?
        """,
        (
            demanda_id,
        ),
    )

    conn.commit()
    conn.close()

    for nome in arquivos:
        excluir_arquivo_anexo(nome)

    return {
        "mensagem":
            "Demanda removida com sucesso!"
    }


@app.route(
    "/api/demandas/<int:demanda_id>/historico",
    methods=["GET"],
)
@login_obrigatorio
def listar_historico(
    demanda_id,
    usuario_logado,
):
    conn = obter_conexao()
    cursor = conn.cursor()

    if not buscar_demanda(
        cursor,
        demanda_id,
    ):
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


@app.route(
    "/api/demandas/<int:demanda_id>/gargalos",
    methods=["POST"],
)
@login_obrigatorio
def registrar_gargalo(
    demanda_id,
    usuario_logado,
):
    dados = request.get_json(
        silent=True
    ) or {}

    descricao = str(
        dados.get(
            "descricao",
            "",
        )
    ).strip()

    if not descricao:
        return {
            "mensagem":
                "Informe a descrição do gargalo."
        }, 400

    if len(descricao) > 500:
        return {
            "mensagem": (
                "A descrição do gargalo deve possuir "
                "no máximo 500 caracteres."
            )
        }, 400

    conn = obter_conexao()
    cursor = conn.cursor()

    demanda = buscar_demanda(
        cursor,
        demanda_id,
    )

    if not demanda:
        conn.close()

        return {
            "mensagem":
                "Demanda não encontrada."
        }, 404

    agora = data_hora_atual()

    cursor.execute(
        """
        INSERT INTO gargalos (
            demanda_id,
            descricao,
            status,
            usuario_registro,
            perfil_registro,
            data_registro,
            data_atualizacao,
            usuario_resolucao,
            data_resolucao
        )
        VALUES (
            ?, ?, 'Aberto', ?, ?, ?,
            ?, NULL, NULL
        )
        """,
        (
            demanda_id,
            descricao,
            usuario_logado["nome"],
            usuario_logado["perfil"],
            agora,
            agora,
        ),
    )

    gargalo_id = cursor.lastrowid

    registrar_historico(
        cursor,
        demanda_id,
        "Registro de gargalo",
        f"Gargalo registrado: {descricao}",
        usuario_logado["nome"],
        demanda["status"],
        demanda["status"],
    )

    conn.commit()

    resultado = dict(
        buscar_gargalo(
            cursor,
            demanda_id,
            gargalo_id,
        )
    )

    resultado["historico"] = (
        buscar_historico(
            cursor,
            demanda_id,
        )
    )

    conn.close()

    return jsonify(resultado), 201


@app.route(
    (
        "/api/demandas/"
        "<int:demanda_id>/gargalos/"
        "<int:gargalo_id>"
    ),
    methods=["PUT"],
)
@perfil_obrigatorio("gestor")
def atualizar_gargalo(
    demanda_id,
    gargalo_id,
    usuario_logado,
):
    dados = request.get_json(
        silent=True
    ) or {}

    conn = obter_conexao()
    cursor = conn.cursor()

    demanda = buscar_demanda(
        cursor,
        demanda_id,
    )

    gargalo = buscar_gargalo(
        cursor,
        demanda_id,
        gargalo_id,
    )

    if not demanda:
        conn.close()

        return {
            "mensagem":
                "Demanda não encontrada."
        }, 404

    if not gargalo:
        conn.close()

        return {
            "mensagem":
                "Gargalo não encontrado."
        }, 404

    atual = dict(gargalo)

    descricao = str(
        dados.get(
            "descricao",
            atual["descricao"],
        )
    ).strip()

    status = dados.get(
        "status",
        atual["status"],
    )

    if not descricao:
        conn.close()

        return {
            "mensagem":
                "Informe a descrição do gargalo."
        }, 400

    if len(descricao) > 500:
        conn.close()

        return {
            "mensagem": (
                "A descrição do gargalo deve possuir "
                "no máximo 500 caracteres."
            )
        }, 400

    if (
        status not in
        STATUS_GARGALO_VALIDOS
    ):
        conn.close()

        return {
            "mensagem":
                "Status do gargalo inválido."
        }, 400

    descricao_alterada = (
        descricao != atual["descricao"]
    )

    status_alterado = (
        status != atual["status"]
    )

    agora = data_hora_atual()

    usuario_resolucao = (
        atual["usuario_resolucao"]
    )

    data_resolucao = (
        atual["data_resolucao"]
    )

    if (
        status == "Resolvido" and
        atual["status"] != "Resolvido"
    ):
        usuario_resolucao = (
            usuario_logado["nome"]
        )

        data_resolucao = agora

    elif (
        status == "Aberto" and
        atual["status"] == "Resolvido"
    ):
        usuario_resolucao = None
        data_resolucao = None

    cursor.execute(
        """
        UPDATE gargalos
        SET
            descricao = ?,
            status = ?,
            data_atualizacao = ?,
            usuario_resolucao = ?,
            data_resolucao = ?
        WHERE demanda_id = ?
          AND id = ?
        """,
        (
            descricao,
            status,
            agora,
            usuario_resolucao,
            data_resolucao,
            demanda_id,
            gargalo_id,
        ),
    )

    if descricao_alterada:
        registrar_historico(
            cursor,
            demanda_id,
            "Edição de gargalo",
            (
                "A descrição de um gargalo "
                "foi atualizada."
            ),
            usuario_logado["nome"],
            demanda["status"],
            demanda["status"],
        )

    if status_alterado:
        tipo = (
            "Resolução de gargalo"
            if status == "Resolvido"
            else "Reabertura de gargalo"
        )

        texto = (
            "Gargalo marcado como resolvido."
            if status == "Resolvido"
            else "Gargalo reaberto."
        )

        registrar_historico(
            cursor,
            demanda_id,
            tipo,
            texto,
            usuario_logado["nome"],
            demanda["status"],
            demanda["status"],
        )

    conn.commit()

    resultado = dict(
        buscar_gargalo(
            cursor,
            demanda_id,
            gargalo_id,
        )
    )

    resultado["historico"] = (
        buscar_historico(
            cursor,
            demanda_id,
        )
    )

    conn.close()

    return jsonify(resultado)


@app.route(
    (
        "/api/demandas/"
        "<int:demanda_id>/gargalos/"
        "<int:gargalo_id>"
    ),
    methods=["DELETE"],
)
@perfil_obrigatorio("gestor")
def excluir_gargalo(
    demanda_id,
    gargalo_id,
    usuario_logado,
):
    conn = obter_conexao()
    cursor = conn.cursor()

    demanda = buscar_demanda(
        cursor,
        demanda_id,
    )

    gargalo = buscar_gargalo(
        cursor,
        demanda_id,
        gargalo_id,
    )

    if not demanda:
        conn.close()

        return {
            "mensagem":
                "Demanda não encontrada."
        }, 404

    if not gargalo:
        conn.close()

        return {
            "mensagem":
                "Gargalo não encontrado."
        }, 404

    cursor.execute(
        """
        DELETE FROM gargalos
        WHERE demanda_id = ?
          AND id = ?
        """,
        (
            demanda_id,
            gargalo_id,
        ),
    )

    registrar_historico(
        cursor,
        demanda_id,
        "Exclusão de gargalo",
        (
            "Gargalo excluído: "
            f"{gargalo['descricao']}"
        ),
        usuario_logado["nome"],
        demanda["status"],
        demanda["status"],
    )

    conn.commit()

    historico = buscar_historico(
        cursor,
        demanda_id,
    )

    conn.close()

    return {
        "mensagem":
            "Gargalo excluído com sucesso.",
        "historico":
            historico,
    }


@app.route(
    "/api/demandas/<int:demanda_id>/anexos",
    methods=["POST"],
)
@login_obrigatorio
def adicionar_anexo(
    demanda_id,
    usuario_logado,
):
    arquivo = request.files.get(
        "arquivo"
    )

    tipo = str(
        request.form.get(
            "tipo_documento",
            "",
        )
    ).strip()

    descricao = str(
        request.form.get(
            "descricao",
            "",
        )
    ).strip()

    if (
        not arquivo or
        not arquivo.filename
    ):
        return {
            "mensagem":
                "Selecione um arquivo."
        }, 400

    nome_original = secure_filename(
        arquivo.filename
    )

    extensao = obter_extensao_arquivo(
        nome_original
    )

    if (
        not nome_original or
        extensao not in
        EXTENSOES_ANEXO_PERMITIDAS
    ):
        return {
            "mensagem": (
                "Formato de arquivo não permitido. "
                "Envie PDF, DOC, DOCX, XLS, XLSX, "
                "PNG, JPG ou JPEG."
            )
        }, 400

    if (
        tipo not in
        TIPOS_DOCUMENTO_VALIDOS
    ):
        return {
            "mensagem": (
                "Selecione um tipo de "
                "documento válido."
            )
        }, 400

    if not descricao:
        return {
            "mensagem":
                "Informe uma breve descrição."
        }, 400

    if len(descricao) > 300:
        return {
            "mensagem": (
                "A descrição deve possuir "
                "no máximo 300 caracteres."
            )
        }, 400

    conn = obter_conexao()
    cursor = conn.cursor()

    demanda = buscar_demanda(
        cursor,
        demanda_id,
    )

    if not demanda:
        conn.close()

        return {
            "mensagem":
                "Demanda não encontrada."
        }, 404

    nome_armazenado = (
        f"{uuid.uuid4().hex}."
        f"{extensao}"
    )

    caminho = obter_caminho_anexo(
        nome_armazenado
    )

    try:
        arquivo.save(caminho)

        tamanho = caminho.stat().st_size

        if tamanho == 0:
            excluir_arquivo_anexo(
                nome_armazenado
            )

            conn.close()

            return {
                "mensagem":
                    "O arquivo está vazio."
            }, 400

        if (
            tamanho >
            TAMANHO_MAXIMO_ANEXO
        ):
            excluir_arquivo_anexo(
                nome_armazenado
            )

            conn.close()

            return {
                "mensagem": (
                    "O arquivo deve possuir "
                    "no máximo 10 MB."
                )
            }, 413

        agora = data_hora_atual()

        cursor.execute(
            """
            INSERT INTO anexos (
                demanda_id,
                nome_original,
                nome_armazenado,
                extensao,
                tipo_documento,
                descricao,
                tamanho_bytes,
                usuario_id,
                usuario_nome,
                usuario_perfil,
                data_envio,
                data_atualizacao
            )
            VALUES (
                ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?
            )
            """,
            (
                demanda_id,
                nome_original,
                nome_armazenado,
                extensao,
                tipo,
                descricao,
                tamanho,
                usuario_logado["id"],
                usuario_logado["nome"],
                usuario_logado["perfil"],
                agora,
                agora,
            ),
        )

        anexo_id = cursor.lastrowid

        registrar_historico(
            cursor,
            demanda_id,
            "Envio de documento",
            (
                "Documento anexado: "
                f"{nome_original}."
            ),
            usuario_logado["nome"],
            demanda["status"],
            demanda["status"],
        )

        conn.commit()

        resultado = dict(
            buscar_anexo(
                cursor,
                demanda_id,
                anexo_id,
            )
        )

        resultado.pop(
            "nome_armazenado",
            None,
        )

        resultado["historico"] = (
            buscar_historico(
                cursor,
                demanda_id,
            )
        )

        conn.close()

        return jsonify(resultado), 201

    except Exception:
        conn.rollback()
        conn.close()

        excluir_arquivo_anexo(
            nome_armazenado
        )

        return {
            "mensagem": (
                "Não foi possível salvar "
                "o documento."
            )
        }, 500


@app.route(
    (
        "/api/demandas/"
        "<int:demanda_id>/anexos/"
        "<int:anexo_id>"
    ),
    methods=["PUT"],
)
@perfil_obrigatorio("gestor")
def atualizar_anexo(
    demanda_id,
    anexo_id,
    usuario_logado,
):
    dados = request.get_json(
        silent=True
    ) or {}

    conn = obter_conexao()
    cursor = conn.cursor()

    demanda = buscar_demanda(
        cursor,
        demanda_id,
    )

    anexo = buscar_anexo(
        cursor,
        demanda_id,
        anexo_id,
    )

    if not demanda:
        conn.close()

        return {
            "mensagem":
                "Demanda não encontrada."
        }, 404

    if not anexo:
        conn.close()

        return {
            "mensagem":
                "Documento não encontrado."
        }, 404

    tipo = str(
        dados.get(
            "tipo_documento",
            anexo["tipo_documento"],
        )
    ).strip()

    descricao = str(
        dados.get(
            "descricao",
            anexo["descricao"],
        )
    ).strip()

    if (
        tipo not in
        TIPOS_DOCUMENTO_VALIDOS
    ):
        conn.close()

        return {
            "mensagem": (
                "Selecione um tipo de "
                "documento válido."
            )
        }, 400

    if not descricao:
        conn.close()

        return {
            "mensagem":
                "Informe uma breve descrição."
        }, 400

    if len(descricao) > 300:
        conn.close()

        return {
            "mensagem": (
                "A descrição deve possuir "
                "no máximo 300 caracteres."
            )
        }, 400

    if (
        tipo != anexo["tipo_documento"] or
        descricao != anexo["descricao"]
    ):
        cursor.execute(
            """
            UPDATE anexos
            SET
                tipo_documento = ?,
                descricao = ?,
                data_atualizacao = ?
            WHERE demanda_id = ?
              AND id = ?
            """,
            (
                tipo,
                descricao,
                data_hora_atual(),
                demanda_id,
                anexo_id,
            ),
        )

        registrar_historico(
            cursor,
            demanda_id,
            "Edição de documento",
            (
                "Os dados do documento "
                f"{anexo['nome_original']} "
                "foram atualizados."
            ),
            usuario_logado["nome"],
            demanda["status"],
            demanda["status"],
        )

        conn.commit()

    resultado = dict(
        buscar_anexo(
            cursor,
            demanda_id,
            anexo_id,
        )
    )

    resultado.pop(
        "nome_armazenado",
        None,
    )

    resultado["historico"] = (
        buscar_historico(
            cursor,
            demanda_id,
        )
    )

    conn.close()

    return jsonify(resultado)


@app.route(
    (
        "/api/demandas/"
        "<int:demanda_id>/anexos/"
        "<int:anexo_id>/arquivo"
    ),
    methods=["GET"],
)
@login_obrigatorio
def obter_arquivo_anexo(
    demanda_id,
    anexo_id,
    usuario_logado,
):
    conn = obter_conexao()
    cursor = conn.cursor()

    if not buscar_demanda(
        cursor,
        demanda_id,
    ):
        conn.close()

        return {
            "mensagem":
                "Demanda não encontrada."
        }, 404

    anexo = buscar_anexo(
        cursor,
        demanda_id,
        anexo_id,
    )

    conn.close()

    if not anexo:
        return {
            "mensagem":
                "Documento não encontrado."
        }, 404

    caminho = obter_caminho_anexo(
        anexo["nome_armazenado"]
    )

    if not caminho.exists():
        return {
            "mensagem": (
                "O arquivo não está mais "
                "disponível no servidor."
            )
        }, 404

    tipo_mime = (
        mimetypes.guess_type(
            anexo["nome_original"]
        )[0]
        or "application/octet-stream"
    )

    baixar = (
        request.args.get(
            "download",
            "false",
        ).lower() == "true"
    )

    return send_file(
        caminho,
        mimetype=tipo_mime,
        as_attachment=baixar,
        download_name=
            anexo["nome_original"],
    )


@app.route(
    (
        "/api/demandas/"
        "<int:demanda_id>/anexos/"
        "<int:anexo_id>"
    ),
    methods=["DELETE"],
)
@login_obrigatorio
def excluir_anexo(
    demanda_id,
    anexo_id,
    usuario_logado,
):
    conn = obter_conexao()
    cursor = conn.cursor()

    demanda = buscar_demanda(
        cursor,
        demanda_id,
    )

    anexo = buscar_anexo(
        cursor,
        demanda_id,
        anexo_id,
    )

    if not demanda:
        conn.close()

        return {
            "mensagem":
                "Demanda não encontrada."
        }, 404

    if not anexo:
        conn.close()

        return {
            "mensagem":
                "Documento não encontrado."
        }, 404

    if not usuario_pode_excluir_anexo(
        usuario_logado,
        anexo,
    ):
        conn.close()

        return {
            "mensagem": (
                "Você só pode excluir documentos "
                "enviados por você."
            )
        }, 403

    cursor.execute(
        """
        DELETE FROM anexos
        WHERE demanda_id = ?
          AND id = ?
        """,
        (
            demanda_id,
            anexo_id,
        ),
    )

    registrar_historico(
        cursor,
        demanda_id,
        "Exclusão de documento",
        (
            "Documento excluído: "
            f"{anexo['nome_original']}."
        ),
        usuario_logado["nome"],
        demanda["status"],
        demanda["status"],
    )

    conn.commit()

    historico = buscar_historico(
        cursor,
        demanda_id,
    )

    conn.close()

    excluir_arquivo_anexo(
        anexo["nome_armazenado"]
    )

    return {
        "mensagem":
            "Documento excluído com sucesso.",
        "historico":
            historico,
    }


if __name__ == "__main__":
    app.run(debug=True)