"""Regras de negócio puras — a MESMA matriz de permissões do protótipo (PERMS no index.html),
agora verificada também no servidor.
"""

from dataclasses import dataclass
from datetime import date

STATUS = ["Nova", "Em análise", "Em andamento", "Aguardando documento", "Concluída"]
PRIORIDADES = ["Alta", "Média", "Baixa"]
TIPOS = ["Denúncia", "Licenciamento", "Inspeção", "Inspeção de rotina", "Reclamação", "Solicitação de informação"]
CONCLUIDA = "Concluída"


class RegraNegocioError(Exception):
    """Violação de regra (HTTP 409/422)."""


class PermissaoNegadaError(Exception):
    """Ação não permitida ao perfil (HTTP 403)."""


@dataclass(frozen=True)
class Perm:
    ver_todas: bool
    atribuir: bool
    prioridade_prazo: bool
    atribuir_no_cadastro: bool
    status_permitidos: tuple[str, ...]
    solicitar_conclusao: bool
    aprovar_conclusao: bool
    conteudo_em: str  # "todas" | "proprias"
    exportar: bool
    sincronizar_sei: bool
    equipe: bool


PERMS = {
    "gestor": Perm(
        ver_todas=True,
        atribuir=True,
        prioridade_prazo=True,
        atribuir_no_cadastro=True,
        status_permitidos=tuple(STATUS),
        solicitar_conclusao=False,
        aprovar_conclusao=True,
        conteudo_em="todas",
        exportar=True,
        sincronizar_sei=True,
        equipe=True,
    ),
    "inspetor": Perm(
        ver_todas=False,
        atribuir=False,
        prioridade_prazo=False,
        atribuir_no_cadastro=False,
        status_permitidos=("Nova", "Em análise", "Em andamento", "Aguardando documento"),
        solicitar_conclusao=True,
        aprovar_conclusao=False,
        conteudo_em="proprias",
        exportar=False,
        sincronizar_sei=False,
        equipe=False,
    ),
}

MOTIVOS = {
    "atribuir": "Somente Gestor",
    "prioridadePrazo": "Somente Gestor",
    "reabrir": "Somente Gestor pode reabrir uma demanda concluída",
    "concluir": 'Inspetor não conclui diretamente: use "Solicitar conclusão" e o Gestor aprova',
    "sincronizarSEI": "Somente Gestor",
    "exportar": "Somente Gestor",
    "conteudo": "Você só pode anexar e registrar observações nas suas próprias demandas em aberto",
    "solicitarPendente": "Conclusão já solicitada: aguardando aprovação do Gestor",
    "ver": "Você só pode ver as demandas atribuídas a você",
}


def perm(perfil: str) -> Perm:
    return PERMS[perfil]


def aberta(status: str) -> bool:
    return status != CONCLUIDA


def pode_ver(perfil: str, usuario_id: str, responsavel_id: str | None) -> bool:
    return perm(perfil).ver_todas or responsavel_id == usuario_id


def pode_conteudo(perfil: str, usuario_id: str, responsavel_id: str | None, status: str) -> bool:
    """Anexar documentos e registrar observações."""
    if perm(perfil).conteudo_em == "todas":
        return True
    return responsavel_id == usuario_id and aberta(status)


def status_permitidos(perfil: str, status_atual: str) -> tuple[str, ...]:
    p = perm(perfil)
    if not aberta(status_atual) and not p.aprovar_conclusao:
        return ()  # concluída: só o Gestor reabre
    return p.status_permitidos


def validar_mudanca_status(perfil: str, atual: str, novo: str, obs: str | None) -> str:
    """Devolve o tipo de mudança ("concluir", "reabrir" ou "simples") ou levanta erro."""
    if novo not in STATUS:
        raise RegraNegocioError(f"Status inválido: {novo}")
    if novo == atual:
        raise RegraNegocioError(f'O status já é "{novo}".')
    if novo not in status_permitidos(perfil, atual):
        raise PermissaoNegadaError(MOTIVOS["concluir"] if novo == CONCLUIDA else MOTIVOS["reabrir"])
    if novo == CONCLUIDA:
        if not (obs or "").strip():
            raise RegraNegocioError("A observação é obrigatória para concluir.")
        return "concluir"
    if not aberta(atual):
        if not (obs or "").strip():
            raise RegraNegocioError("Informe o motivo da reabertura.")
        return "reabrir"
    return "simples"


# ------------------------------------------------------------- urgência do prazo
def dias_ate(prazo: date, hoje: date | None = None) -> int:
    return (prazo - (hoje or date.today())).days


def urgencia(prazo: date, status: str, hoje: date | None = None) -> dict:
    """Mesma regra do selo de prazo do protótipo: nunca só cor (ícone + texto)."""
    if not aberta(status):
        return {"k": "neutro", "t": "Concluída"}
    n = dias_ate(prazo, hoje)
    if n < 0:
        return {"k": "venc", "t": f"Vencido há {-n} {'dia' if n == -1 else 'dias'}"}
    if n == 0:
        return {"k": "breve", "t": "Vence hoje"}
    if n <= 3:
        return {"k": "breve", "t": f"Vence em {n} {'dia' if n == 1 else 'dias'}"}
    return {"k": "ok", "t": "No prazo"}


GRAVIDADE = {"venc": 3, "breve": 2, "ok": 1, "neutro": 0}
