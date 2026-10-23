import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

const DemandasContext = createContext()

const API_URL =
  'http://127.0.0.1:5000/api/demandas'

const PRIORIDADES_VALIDAS = [
  'Baixa',
  'Média',
  'Alta',
]

const RESPONSAVEIS_VALIDOS = [
  'Integrante 1',
  'Integrante 2',
  'Integrante 3',
  'Integrante 4',
  'Integrante 5',
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

        const resposta =
          await fetch(API_URL)

        if (!resposta.ok) {
          throw new Error(
            'Não foi possível carregar as demandas.',
          )
        }

        const dados =
          await resposta.json()

        setDemandas(
          dados.map(formatarDemanda),
        )
      } catch (erro) {
        console.error(
          'Erro ao carregar demandas:',
          erro,
        )

        setErroAoCarregar(
          'Não foi possível carregar as demandas. Verifique se o backend está funcionando.',
        )
      } finally {
        setCarregandoDemandas(false)
      }
    }

    carregarDemandas()
  }, [])

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
        novaDemanda.responsavel ||
        null,
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
        headers: {
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify(
          dadosParaApi,
        ),
      },
    )

    if (!resposta.ok) {
      throw new Error(
        'Não foi possível cadastrar a demanda.',
      )
    }

    const resultado =
      await resposta.json()

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
        headers: {
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify(dados),
      },
    )

    if (!resposta.ok) {
      throw new Error(
        'Não foi possível atualizar a demanda.',
      )
    }

    const resultado =
      await resposta.json()

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
      },
    )

    if (!resposta.ok) {
      throw new Error(
        'Não foi possível excluir a demanda.',
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
      usuario:
        demanda.responsavel ||
        'Usuário não identificado',
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
      usuario:
        demanda.responsavel ||
        'Usuário não identificado',
    })

    return true
  }

  async function atribuirResponsavel(
    id,
    novoResponsavel,
  ) {
    const responsavelTratado =
      novoResponsavel || null

    if (
      responsavelTratado !== null &&
      !RESPONSAVEIS_VALIDOS.includes(
        responsavelTratado,
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
      responsavel:
        responsavelTratado,
      usuario:
        responsavelTratado ||
        demanda.responsavel ||
        'Usuário não identificado',
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
      usuario:
        demanda.responsavel ||
        'Usuário não identificado',
    })

    return true
  }

  return (
    <DemandasContext.Provider
      value={{
        demandas,
        carregandoDemandas,
        erroAoCarregar,
        cadastrarDemanda,
        buscarDemandaPorId,
        excluirDemanda,
        alterarPrioridade,
        restaurarPrioridadeAutomatica,
        atribuirResponsavel,
        alterarStatus,
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