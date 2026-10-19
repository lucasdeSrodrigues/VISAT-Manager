import { createContext, useContext, useState } from 'react'

const DemandasContext = createContext()

const PRIORIDADES_VALIDAS = ['Baixa', 'Média', 'Alta']

function carregarDemandasSalvas() {
  const demandasSalvas = localStorage.getItem('visat-demandas')

  if (!demandasSalvas) {
    return []
  }

  try {
    return JSON.parse(demandasSalvas)
  } catch {
    return []
  }
}

export function DemandasProvider({ children }) {
  const [demandas, setDemandas] = useState(carregarDemandasSalvas)

  function salvarDemandas(demandasAtualizadas) {
    setDemandas(demandasAtualizadas)

    localStorage.setItem(
      'visat-demandas',
      JSON.stringify(demandasAtualizadas),
    )
  }

  function cadastrarDemanda(novaDemanda) {
    const demandaCadastrada = {
      ...novaDemanda,
      id: crypto.randomUUID(),
      origem: 'Manual',
      dataCadastro: new Date().toISOString(),
    }

    const demandasAtualizadas = [
      ...demandas,
      demandaCadastrada,
    ]

    salvarDemandas(demandasAtualizadas)

    return demandaCadastrada
  }

  function buscarDemandaPorId(id) {
    return demandas.find((demanda) => demanda.id === id)
  }

  function excluirDemanda(id) {
    const demandaExiste = demandas.some(
      (demanda) => demanda.id === id,
    )

    if (!demandaExiste) {
      return false
    }

    const demandasAtualizadas = demandas.filter(
      (demanda) => demanda.id !== id,
    )

    salvarDemandas(demandasAtualizadas)

    return true
  }

  function alterarPrioridade(
    id,
    novaPrioridade,
    justificativa,
  ) {
    const prioridadeValida =
      PRIORIDADES_VALIDAS.includes(novaPrioridade)

    const justificativaTratada = justificativa.trim()

    if (!prioridadeValida) {
      return false
    }

    const demandaExiste = demandas.some(
      (demanda) => demanda.id === id,
    )

    if (!demandaExiste) {
      return false
    }

    const demandasAtualizadas = demandas.map((demanda) => {
      if (demanda.id !== id) {
        return demanda
      }

      return {
        ...demanda,
        prioridadeManual: novaPrioridade,
        justificativaPrioridade: justificativaTratada || null,
        dataAlteracaoPrioridade: new Date().toISOString(),
      }
    })

    salvarDemandas(demandasAtualizadas)

    return true
  }

  function restaurarPrioridadeAutomatica(id) {
    const demandaExiste = demandas.some(
      (demanda) => demanda.id === id,
    )

    if (!demandaExiste) {
      return false
    }

    const demandasAtualizadas = demandas.map((demanda) => {
      if (demanda.id !== id) {
        return demanda
      }

      const {
        prioridadeManual,
        justificativaPrioridade,
        dataAlteracaoPrioridade,
        ...demandaSemPrioridadeManual
      } = demanda

      return demandaSemPrioridadeManual
    })

    salvarDemandas(demandasAtualizadas)

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
      }}
    >
      {children}
    </DemandasContext.Provider>
  )
}

export function useDemandas() {
  const contexto = useContext(DemandasContext)

  if (!contexto) {
    throw new Error(
      'useDemandas deve ser utilizado dentro de DemandasProvider.',
    )
  }

  return contexto
}