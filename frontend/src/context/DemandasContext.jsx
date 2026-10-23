import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

const DemandasContext = createContext()

const API_URL = 'http://127.0.0.1:5000/api/demandas'

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

export function DemandasProvider({ children }) {
  const [demandas, setDemandas] = useState([])

  useEffect(() => {
    async function carregarDemandas() {
      try {
        const resposta = await fetch(API_URL)

        if (!resposta.ok) {
          throw new Error(
            'Não foi possível carregar as demandas.',
          )
        }

        const dados = await resposta.json()

        const demandasFormatadas = dados.map(
          (demanda) => ({
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
            status: demanda.status,
            origem: demanda.origem,
            dataCadastro:
              demanda.data_cadastro,
          }),
        )

        setDemandas(demandasFormatadas)
      } catch (erro) {
        console.error(
          'Erro ao carregar demandas:',
          erro,
        )
      }
    }

    carregarDemandas()
  }, [])

  async function cadastrarDemanda(novaDemanda) {
    const dataCadastro =
      new Date().toISOString()

    const dadosParaApi = {
      numero_processo:
        novaDemanda.numeroProcesso || null,
      orgao_solicitante:
        novaDemanda.orgaoSolicitante,
      municipio: novaDemanda.municipio,
      bairro: novaDemanda.bairro,
      tipo_ocorrencia:
        novaDemanda.tipoOcorrencia,
      data_entrada:
        novaDemanda.dataEntrada,
      prazo_resposta:
        novaDemanda.prazoResposta,
      descricao: novaDemanda.descricao,
      prioridade_manual:
        novaDemanda.prioridadeManual || null,
      justificativa_prioridade:
        novaDemanda.justificativaPrioridade ||
        null,
      data_alteracao_prioridade:
        novaDemanda.dataAlteracaoPrioridade ||
        null,
      responsavel:
        novaDemanda.responsavel || null,
      status: novaDemanda.status,
      origem: 'Manual',
      data_cadastro: dataCadastro,
    }

    const resposta = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dadosParaApi),
    })

    if (!resposta.ok) {
      throw new Error(
        'Não foi possível cadastrar a demanda.',
      )
    }

    const resultado = await resposta.json()

    const demandaCadastrada = {
      ...novaDemanda,
      id: String(resultado.id),
      origem: 'Manual',
      dataCadastro,
      responsavel:
        novaDemanda.responsavel || null,
    }

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

  async function excluirDemanda(id) {
    const idTratado = String(id)

    const demandaExiste = demandas.some(
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
    const idTratado = String(id)

    if (
      !PRIORIDADES_VALIDAS.includes(
        novaPrioridade,
      )
    ) {
      return false
    }

    const demandaExiste = demandas.some(
      (demanda) =>
        demanda.id === idTratado,
    )

    if (!demandaExiste) {
      return false
    }

    const justificativaTratada =
      justificativa.trim()

    const dataAlteracaoPrioridade =
      new Date().toISOString()

    const resposta = await fetch(
      `${API_URL}/${idTratado}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prioridade_manual:
            novaPrioridade,
          justificativa_prioridade:
            justificativaTratada || null,
          data_alteracao_prioridade:
            dataAlteracaoPrioridade,
        }),
      },
    )

    if (!resposta.ok) {
      throw new Error(
        'Não foi possível alterar a prioridade.',
      )
    }

    setDemandas((demandasAtuais) =>
      demandasAtuais.map((demanda) => {
        if (demanda.id !== idTratado) {
          return demanda
        }

        return {
          ...demanda,
          prioridadeManual:
            novaPrioridade,
          justificativaPrioridade:
            justificativaTratada || null,
          dataAlteracaoPrioridade,
        }
      }),
    )

    return true
  }

  async function restaurarPrioridadeAutomatica(
    id,
  ) {
    const idTratado = String(id)

    const demandaExiste = demandas.some(
      (demanda) =>
        demanda.id === idTratado,
    )

    if (!demandaExiste) {
      return false
    }

    const resposta = await fetch(
      `${API_URL}/${idTratado}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prioridade_manual: null,
          justificativa_prioridade: null,
          data_alteracao_prioridade: null,
        }),
      },
    )

    if (!resposta.ok) {
      throw new Error(
        'Não foi possível restaurar a prioridade automática.',
      )
    }

    setDemandas((demandasAtuais) =>
      demandasAtuais.map((demanda) => {
        if (demanda.id !== idTratado) {
          return demanda
        }

        return {
          ...demanda,
          prioridadeManual: null,
          justificativaPrioridade: null,
          dataAlteracaoPrioridade: null,
        }
      }),
    )

    return true
  }

  function atribuirResponsavel(
    id,
    novoResponsavel,
  ) {
    const idTratado = String(id)

    const responsavelTratado =
      novoResponsavel || null

    const responsavelValido =
      responsavelTratado === null ||
      RESPONSAVEIS_VALIDOS.includes(
        responsavelTratado,
      )

    if (!responsavelValido) {
      return false
    }

    const demandaExiste = demandas.some(
      (demanda) =>
        demanda.id === idTratado,
    )

    if (!demandaExiste) {
      return false
    }

    setDemandas((demandasAtuais) =>
      demandasAtuais.map((demanda) => {
        if (demanda.id !== idTratado) {
          return demanda
        }

        return {
          ...demanda,
          responsavel:
            responsavelTratado,
        }
      }),
    )

    return true
  }

  function alterarStatus(id, novoStatus) {
    const idTratado = String(id)

    if (
      !STATUS_VALIDOS.includes(novoStatus)
    ) {
      return false
    }

    const demandaExiste = demandas.some(
      (demanda) =>
        demanda.id === idTratado,
    )

    if (!demandaExiste) {
      return false
    }

    setDemandas((demandasAtuais) =>
      demandasAtuais.map((demanda) => {
        if (demanda.id !== idTratado) {
          return demanda
        }

        return {
          ...demanda,
          status: novoStatus,
        }
      }),
    )

    return true
  }

  return (
    <DemandasContext.Provider
      value={{
        demandas,
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
