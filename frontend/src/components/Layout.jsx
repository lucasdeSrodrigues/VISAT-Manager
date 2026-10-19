import { useEffect, useState } from 'react'
import {
  NavLink,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import CentralAlertas from './CentralAlertas.jsx'
import { useDemandas } from '../context/DemandasContext.jsx'
import { estaComPrazoProximo } from '../utils/prioridade.js'

import './Layout.css'

const CHAVE_ULTIMO_ALERTA = 'visat-ultimo-alerta-prazo'

function obterDataAtual() {
  const hoje = new Date()
  const ano = hoje.getFullYear()
  const mes = String(hoje.getMonth() + 1).padStart(2, '0')
  const dia = String(hoje.getDate()).padStart(2, '0')

  return `${ano}-${mes}-${dia}`
}

function Layout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { demandas } = useDemandas()

  const [centralAlertasAberta, setCentralAlertasAberta] =
    useState(false)

  const demandasComPrazoProximo = demandas.filter((demanda) =>
    estaComPrazoProximo(demanda.prazoResposta),
  )

  const quantidadeAlertas = demandasComPrazoProximo.length

  useEffect(() => {
    const estaNoDashboard = location.pathname === '/dashboard'

    if (!estaNoDashboard || quantidadeAlertas === 0) {
      return
    }

    const dataAtual = obterDataAtual()
    const ultimoAlertaExibido = localStorage.getItem(
      CHAVE_ULTIMO_ALERTA,
    )

    if (ultimoAlertaExibido !== dataAtual) {
      setCentralAlertasAberta(true)

      localStorage.setItem(
        CHAVE_ULTIMO_ALERTA,
        dataAtual,
      )
    }
  }, [location.pathname, quantidadeAlertas])

  function sair() {
    navigate('/')
  }

  function abrirDashboard() {
    navigate('/dashboard')
  }

  function abrirCentralAlertas() {
    setCentralAlertasAberta(true)
  }

  function fecharCentralAlertas() {
    setCentralAlertasAberta(false)
  }

  function dispensarAlertasPorHoje() {
    localStorage.setItem(
      CHAVE_ULTIMO_ALERTA,
      obterDataAtual(),
    )

    setCentralAlertasAberta(false)
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <button
          className="sidebar-brand"
          type="button"
          onClick={abrirDashboard}
          aria-label="Ir para o Dashboard"
        >
          VISAT Manager
        </button>

        <nav className="menu" aria-label="Navegação principal">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive ? 'active' : ''
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/demandas"
            className={({ isActive }) =>
              isActive ? 'active' : ''
            }
          >
            Demandas
          </NavLink>

          <NavLink
            to="/cadastro"
            className={({ isActive }) =>
              isActive ? 'active' : ''
            }
          >
            Nova demanda
          </NavLink>
        </nav>

        <button
          className="logout-button"
          type="button"
          onClick={sair}
        >
          Sair
        </button>
      </aside>

      <section className="content">
        <header className="header">
          <h2>Vigilância em Saúde do Trabalhador</h2>

          <button
            className="alertas-button"
            type="button"
            onClick={abrirCentralAlertas}
            aria-label={
              quantidadeAlertas === 0
                ? 'Abrir Central de Alertas. Nenhum alerta de prazo.'
                : `Abrir Central de Alertas. ${quantidadeAlertas} alertas de prazo.`
            }
            title="Central de alertas"
          >
            <span
              className="alertas-button-icon"
              aria-hidden="true"
            >
              🔔
            </span>

            <span className="alertas-button-text">
              Alertas
            </span>

            {quantidadeAlertas > 0 && (
              <span className="alertas-button-count">
                {quantidadeAlertas > 99
                  ? '99+'
                  : quantidadeAlertas}
              </span>
            )}
          </button>
        </header>

        <main>
          {children}
        </main>
      </section>

      <CentralAlertas
        aberta={centralAlertasAberta}
        onFechar={fecharCentralAlertas}
        onDispensar={dispensarAlertasPorHoje}
      />
    </div>
  )
}

export default Layout