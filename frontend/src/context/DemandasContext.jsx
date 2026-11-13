import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

const DemandasContext = createContext()

const API_BASE_URL =
  import.meta.env.VITE_API_URL

const API_URL =
  `${API_BASE_URL}/api/demandas`

const PRIORIDADES_VALIDAS = [
  'Baixa',
  'Média',
  'Alta',
]

const STATUS_VALIDOS = [
  'Em andamento',
  'Em revisão',
  'Finalizada',
]

function formatarEventoHistorico(
  evento,
) {
  return {
    id: String(evento.id),
    demandaId: String(
      evento.demanda_id,
    ),
    dataHora: evento.data_hora,
    tipoAcao: evento.tipo_acao,
    descricao: evento.descricao,
    usuario: evento.usuario,
    statusAnterior:
      evento.status_anterior,
    statusPosterior:
      evento.status_posterior,
  }
}

function formatarDemanda(demanda) {
  return {
    id: String(demanda.id),
    numeroProcesso:
      demanda.numero_processo,
    orgaoSolicitante:
      demanda.orgao_solicitante,
    municipio: demanda.municipio,
    bairro: demanda.bairro,
    tipoOcorrencia:
      demanda.tipo_ocorrencia,
    dataEntrada:
      demanda.data_entrada,
    prazoResposta:
      demanda.prazo_resposta,
    descricao: demanda.descricao,
    prioridadeManual:
      demanda.prioridade_manual,
    justificativaPrioridade:
      demanda.justificativa_prioridade,
    dataAlteracaoPrioridade:
      demanda.data_alteracao_prioridade,
    responsavel:
      demanda.responsavel,
    status:
      demanda.status ||
      'Em andamento',
    origem: demanda.origem,
    dataCadastro:
      demanda.data_cadastro,
    dataFinalizacao:
      demanda.data_finalizacao,
    arquivada:
      Boolean(demanda.arquivada),
    dataArquivamento:
      demanda.data_arquivamento,
    historico: (
      demanda.historico || []
    ).map(formatarEventoHistorico),
  }
}

async function obterResultadoResposta(
  resposta,
) {
  const tipoConteudo =
    resposta.headers.get(
      'content-type',
    ) || ''

  if (
    tipoConteudo.includes(
      'application/json',
    )
  ) {
    return resposta.json()
  }

  return {}
}

function obterMensagemErro(
  resposta,
  resultado,
  mensagemPadrao,
) {
  if (resultado?.mensagem) {
    return resultado.mensagem
  }

  if (resposta.status === 401) {
    return (
      'Sua sessão expirou ou não foi iniciada. ' +
      'Entre novamente no sistema.'
    )
  }

  if (resposta.status === 403) {
    return (
      'Você não possui permissão ' +
      'para realizar esta ação.'
    )
  }

  return mensagemPadrao
}

export function DemandasProvider({
  children,
}) {
  const [demandas, setDemandas] =
    useState([])

  const [
    carregandoDemandas,
    setCarregandoDemandas,
  ] = useState(true)

  const [
    erroAoCarregar,
    setErroAoCarregar,
  ] = useState('')

  useEffect(() => {
    async function carregarDemandas() {
      try {
        setCarregandoDemandas(true)
        setErroAoCarregar('')

        const resposta = await fetch(
          API_URL,
          {
            method: 'GET',
            credentials: 'include',
          },
        )

        const resultado =
          await obterResultadoResposta(
            resposta,
          )

        if (!resposta.ok) {
          throw new Error(
            obterMensagemErro(
              resposta,
              resultado,
              'Não foi possível carregar as demandas.',
            ),
          )
        }

        if (!Array.isArray(resultado)) {
          throw new Error(
            'A resposta recebida ao carregar as demandas é inválida.',
          )
        }

        setDemandas(
          resultado.map(
            formatarDemanda,
          ),
        )
      } catch (erro) {
        console.error(
          'Erro ao carregar demandas:',
          erro,
        )

        setDemandas([])

        setErroAoCarregar(
          erro.message ||
            'Não foi possível carregar as demandas. Verifique se o backend está funcionando.',
        )
      } finally {
        setCarregandoDemandas(false)
      }
    }

    carregarDemandas()
  }, [])

  const responsaveis = [
    ...new Set(
      demandas
        .map(
          (demanda) =>
            demanda.responsavel?.trim(),
        )
        .filter(Boolean),
    ),
  ].sort((responsavelA, responsavelB) =>
    responsavelA.localeCompare(
      responsavelB,
      'pt-BR',
    ),
  )

  function substituirDemanda(
    demandaAtualizada,
  ) {
    const demandaFormatada =
      formatarDemanda(
        demandaAtualizada,
      )

    setDemandas((demandasAtuais) =>
      demandasAtuais.map((demanda) =>
        demanda.id ===
        demandaFormatada.id
          ? demandaFormatada
          : demanda,
      ),
    )

    return demandaFormatada
  }

  async function cadastrarDemanda(
    novaDemanda,
  ) {
    const dataCadastro =
      new Date().toISOString()

    const responsavelTratado =
      novaDemanda.responsavel?.trim() ||
      null

    const dadosParaApi = {
      numero_processo:
        novaDemanda.numeroProcesso ||
        null,
      orgao_solicitante:
        novaDemanda.orgaoSolicitante,
      municipio:
        novaDemanda.municipio,
      bairro: novaDemanda.bairro,
      tipo_ocorrencia:
        novaDemanda.tipoOcorrencia,
      data_entrada:
        novaDemanda.dataEntrada,
      prazo_resposta:
        novaDemanda.prazoResposta,
      descricao:
        novaDemanda.descricao,
      prioridade_manual:
        novaDemanda.prioridadeManual ||
        null,
      justificativa_prioridade:
        novaDemanda
          .justificativaPrioridade ||
        null,
      data_alteracao_prioridade:
        novaDemanda
          .dataAlteracaoPrioridade ||
        null,
      responsavel:
        responsavelTratado,
      status:
        novaDemanda.status ||
        'Em andamento',
      origem: 'Manual',
      data_cadastro: dataCadastro,
    }

    const resposta = await fetch(
      API_URL,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify(
          dadosParaApi,
        ),
      },
    )

    const resultado =
      await obterResultadoResposta(
        resposta,
      )

    if (!resposta.ok) {
      throw new Error(
        obterMensagemErro(
          resposta,
          resultado,
          'Não foi possível cadastrar a demanda.',
        ),
      )
    }

    const demandaCadastrada =
      formatarDemanda(resultado)

    setDemandas((demandasAtuais) => [
      ...demandasAtuais,
      demandaCadastrada,
    ])

    return demandaCadastrada
  }

  function buscarDemandaPorId(id) {
    return demandas.find(
      (demanda) =>
        demanda.id === String(id),
    )
  }

  async function atualizarDemanda(
    id,
    dados,
  ) {
    const idTratado = String(id)

    const resposta = await fetch(
      `${API_URL}/${idTratado}`,
      {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify(dados),
      },
    )

    const resultado =
      await obterResultadoResposta(
        resposta,
      )

    if (!resposta.ok) {
      console.error(
        'Erro retornado pelo backend:',
        resultado,
      )

      throw new Error(
        obterMensagemErro(
          resposta,
          resultado,
          'Não foi possível atualizar a demanda.',
        ),
      )
    }

    return substituirDemanda(
      resultado,
    )
  }

  async function excluirDemanda(id) {
    const idTratado = String(id)

    const demandaExiste =
      demandas.some(
        (demanda) =>
          demanda.id === idTratado,
      )

    if (!demandaExiste) {
      return false
    }

    const resposta = await fetch(
      `${API_URL}/${idTratado}`,
      {
        method: 'DELETE',
        credentials: 'include',
      },
    )

    const resultado =
      await obterResultadoResposta(
        resposta,
      )

    if (!resposta.ok) {
      throw new Error(
        obterMensagemErro(
          resposta,
          resultado,
          'Não foi possível excluir a demanda.',
        ),
      )
    }

    setDemandas((demandasAtuais) =>
      demandasAtuais.filter(
        (demanda) =>
          demanda.id !== idTratado,
      ),
    )

    return true
  }

  async function alterarPrioridade(
    id,
    novaPrioridade,
    justificativa,
  ) {
    if (
      !PRIORIDADES_VALIDAS.includes(
        novaPrioridade,
      )
    ) {
      return false
    }

    const demanda =
      buscarDemandaPorId(id)

    if (!demanda) {
      return false
    }

    const justificativaTratada =
      justificativa.trim()

    await atualizarDemanda(id, {
      prioridade_manual:
        novaPrioridade,
      justificativa_prioridade:
        justificativaTratada ||
        null,
      data_alteracao_prioridade:
        new Date().toISOString(),
    })

    return true
  }

  async function restaurarPrioridadeAutomatica(
    id,
  ) {
    const demanda =
      buscarDemandaPorId(id)

    if (!demanda) {
      return false
    }

    await atualizarDemanda(id, {
      prioridade_manual: null,
      justificativa_prioridade: null,
      data_alteracao_prioridade:
        null,
    })

    return true
  }

  async function atribuirResponsavel(
    id,
    novoResponsavel,
  ) {
    const responsavelTratado =
      novoResponsavel?.trim() || null

    if (
      responsavelTratado &&
      responsavelTratado.length > 100
    ) {
      throw new Error(
        'O nome do responsável deve possuir no máximo 100 caracteres.',
      )
    }

    const demanda =
      buscarDemandaPorId(id)

    if (!demanda) {
      return false
    }

    await atualizarDemanda(id, {
      responsavel:
        responsavelTratado,
    })

    return true
  }

  async function alterarStatus(
    id,
    novoStatus,
  ) {
    if (
      !STATUS_VALIDOS.includes(
        novoStatus,
      )
    ) {
      return false
    }

    const demanda =
      buscarDemandaPorId(id)

    if (!demanda) {
      return false
    }

    await atualizarDemanda(id, {
      status: novoStatus,
    })

    return true
  }

  async function editarDemanda(
    id,
    dadosAtualizados,
  ) {
    const demanda =
      buscarDemandaPorId(id)

    if (!demanda) {
      return false
    }

    const orgaoSolicitante =
      dadosAtualizados.orgaoSolicitante.trim()

    const municipio =
      dadosAtualizados.municipio.trim()

    const bairro =
      dadosAtualizados.bairro.trim()

    const tipoOcorrencia =
      dadosAtualizados.tipoOcorrencia.trim()

    const prazoResposta =
      dadosAtualizados.prazoResposta

    const descricao =
      dadosAtualizados.descricao.trim()

    if (
      !orgaoSolicitante ||
      !municipio ||
      !bairro ||
      !tipoOcorrencia ||
      !prazoResposta ||
      !descricao
    ) {
      throw new Error(
        'Preencha todos os campos antes de salvar.',
      )
    }

    await atualizarDemanda(id, {
      orgao_solicitante:
        orgaoSolicitante,
      municipio,
      bairro,
      tipo_ocorrencia:
        tipoOcorrencia,
      prazo_resposta:
        prazoResposta,
      descricao,
    })

    return true
  }

  return (
    <DemandasContext.Provider
      value={{
        demandas,
        responsaveis,
        carregandoDemandas,
        erroAoCarregar,
        cadastrarDemanda,
        buscarDemandaPorId,
        excluirDemanda,
        alterarPrioridade,
        restaurarPrioridadeAutomatica,
        atribuirResponsavel,
        alterarStatus,
        editarDemanda,
      }}
    >
      {children}
    </DemandasContext.Provider>
  )
}

export function useDemandas() {
  const contexto = useContext(
    DemandasContext,
  )

  if (!contexto) {
    throw new Error(
      'useDemandas deve ser utilizado dentro de DemandasProvider.',
    )
  }

  return contexto
}