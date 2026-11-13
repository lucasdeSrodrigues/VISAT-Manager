import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Demandas from './pages/Demandas'
import CadastroDemanda from './pages/CadastroDemanda'
import DetalhesDemanda from './pages/DetalhesDemanda'
import HistoricoCompleto from './pages/HistoricoCompleto'

import Layout from './components/Layout'

import { useAuth } from './context/AuthContext.jsx'

import './App.css'

function RotaProtegida({ children }) {
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
    return (
      <Navigate
        to="/"
        replace
      />
    )
  }

  return children
}

function RotaLogin() {
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

  if (autenticado) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    )
  }

  return <Login />
}

function PaginaComLayout({ children }) {
  return (
    <RotaProtegida>
      <Layout>
        {children}
      </Layout>
    </RotaProtegida>
  )
}

function RotaNaoEncontrada() {
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

  if (autenticado) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    )
  }

  return (
    <Navigate
      to="/"
      replace
    />
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<RotaLogin />}
        />

        <Route
          path="/dashboard"
          element={
            <PaginaComLayout>
              <Dashboard />
            </PaginaComLayout>
          }
        />

        <Route
          path="/demandas"
          element={
            <PaginaComLayout>
              <Demandas />
            </PaginaComLayout>
          }
        />

        <Route
          path="/demandas/:id"
          element={
            <PaginaComLayout>
              <DetalhesDemanda />
            </PaginaComLayout>
          }
        />

        <Route
          path="/demandas/:id/historico"
          element={
            <PaginaComLayout>
              <HistoricoCompleto />
            </PaginaComLayout>
          }
        />

        <Route
          path="/cadastro"
          element={
            <PaginaComLayout>
              <CadastroDemanda />
            </PaginaComLayout>
          }
        />

        <Route
          path="*"
          element={<RotaNaoEncontrada />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App