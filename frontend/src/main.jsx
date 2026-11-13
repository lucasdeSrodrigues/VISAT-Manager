import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.jsx'

import {
  AuthProvider,
  useAuth,
} from './context/AuthContext.jsx'

import {
  DemandasProvider,
} from './context/DemandasContext.jsx'

import './index.css'

function Aplicacao() {
  const {
    autenticado,
    verificandoAutenticacao,
  } = useAuth()

  if (verificandoAutenticacao) {
    return (
      <div
        className="carregamento-inicial"
        role="status"
        aria-live="polite"
      >
        Verificando autenticação...
      </div>
    )
  }

  if (!autenticado) {
    return <App />
  }

  return (
    <DemandasProvider>
      <App />
    </DemandasProvider>
  )
}

createRoot(
  document.getElementById('root'),
).render(
  <StrictMode>
    <AuthProvider>
      <Aplicacao />
    </AuthProvider>
  </StrictMode>,
)