import { createContext, useContext, useState } from 'react'

const DemandasContext = createContext()

function carregarDemandasSalvas() {
  const demandasSalvas = localStorage.getItem('visat-demandas')

  if (demandasSalvas) {
    return JSON.parse(demandasSalvas)
  }

  return []
}

export function DemandasProvider({ children }) {
  const [demandas, setDemandas] = useState(carregarDemandasSalvas)

  function cadastrarDemanda(novaDemanda) {
    const demandaCadastrada = {
      ...novaDemanda,
      id: crypto.randomUUID(),
      origem: 'Manual',
      dataCadastro: new Date().toISOString(),
    }

    const demandasAtualizadas = [...demandas, demandaCadastrada]

    setDemandas(demandasAtualizadas)

    localStorage.setItem(
      'visat-demandas',
      JSON.stringify(demandasAtualizadas),
    )

    return demandaCadastrada
  }

  return (
    <DemandasContext.Provider
      value={{
        demandas,
        cadastrarDemanda,
      }}
    >
      {children}
    </DemandasContext.Provider>
  )
}

export function useDemandas() {
  return useContext(DemandasContext)
}