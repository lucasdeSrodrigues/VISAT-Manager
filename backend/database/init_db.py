import sqlite3


def adicionar_coluna_se_necessario(
    cursor,
    tabela,
    coluna,
    definicao,
):
    cursor.execute(
        f"PRAGMA table_info({tabela})"
    )

    colunas_existentes = {
        registro[1]
        for registro in cursor.fetchall()
    }

    if coluna not in colunas_existentes:
        cursor.execute(
            f"""
            ALTER TABLE {tabela}
            ADD COLUMN {coluna} {definicao}
            """
        )


conn = sqlite3.connect("database.db")
cursor = conn.cursor()

cursor.execute("PRAGMA foreign_keys = ON")

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
    status TEXT NOT NULL DEFAULT 'Em andamento',
    origem TEXT NOT NULL DEFAULT 'Manual',
    data_cadastro TEXT NOT NULL,
    data_finalizacao TEXT,
    arquivada INTEGER NOT NULL DEFAULT 0,
    data_arquivamento TEXT
)
""")

# Atualiza bancos já existentes sem apagar os dados.
adicionar_coluna_se_necessario(
    cursor,
    "demandas",
    "bairro",
    "TEXT",
)

adicionar_coluna_se_necessario(
    cursor,
    "demandas",
    "descricao",
    "TEXT",
)

adicionar_coluna_se_necessario(
    cursor,
    "demandas",
    "justificativa_prioridade",
    "TEXT",
)

adicionar_coluna_se_necessario(
    cursor,
    "demandas",
    "data_alteracao_prioridade",
    "TEXT",
)

adicionar_coluna_se_necessario(
    cursor,
    "demandas",
    "data_cadastro",
    "TEXT",
)

adicionar_coluna_se_necessario(
    cursor,
    "demandas",
    "data_finalizacao",
    "TEXT",
)

adicionar_coluna_se_necessario(
    cursor,
    "demandas",
    "arquivada",
    "INTEGER NOT NULL DEFAULT 0",
)

adicionar_coluna_se_necessario(
    cursor,
    "demandas",
    "data_arquivamento",
    "TEXT",
)

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
        REFERENCES demandas(id)
        ON DELETE CASCADE
)
""")

# Atualiza a tabela historico caso ela tenha sido criada
# anteriormente com nomes diferentes.
adicionar_coluna_se_necessario(
    cursor,
    "historico",
    "tipo_acao",
    "TEXT",
)

adicionar_coluna_se_necessario(
    cursor,
    "historico",
    "descricao",
    "TEXT",
)

adicionar_coluna_se_necessario(
    cursor,
    "historico",
    "status_anterior",
    "TEXT",
)

adicionar_coluna_se_necessario(
    cursor,
    "historico",
    "status_posterior",
    "TEXT",
)

conn.commit()
conn.close()

print("Banco atualizado com sucesso!")