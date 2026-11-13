import { useEffect, useState } from 'react'
import {
  NavLink,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import CentralAlertas from './CentralAlertas.jsx'

import {
  useDemandas,
} from '../context/DemandasContext.jsx'

import {
  useAuth,
} from '../context/AuthContext.jsx'

import {
  estaComPrazoProximo,
} from '../utils/prioridade.js'

import './Layout.css'

const CHAVE_ULTIMO_ALERTA =
  'visat-ultimo-alerta-prazo'

function obterDataAtual() {
  const hoje = new Date()

  const ano =
    hoje.getFullYear()

  const mes = String(
    hoje.getMonth() + 1,
  ).padStart(
    2,
    '0',
  )

  const dia = String(
    hoje.getDate(),
  ).padStart(
    2,
    '0',
  )

  return `${ano}-${mes}-${dia}`
}

function formatarNomeUsuario(usuario) {
  if (!usuario) {
    return 'Usuário'
  }

  const nomeBase =
    usuario.nome ||
    usuario.email?.split('@')[0] ||
    'Usuário'

  return nomeBase
    .replace(
      /[._-]+/g,
      ' ',
    )
    .replace(
      /\b\w/g,
      (letra) =>
        letra.toUpperCase(),
    )
}

function formatarPerfil(perfil) {
  if (perfil === 'gestor') {
    return 'Gestor'
  }

  if (perfil === 'inspetor') {
    return 'Inspetor'
  }

  return 'Perfil não identificado'
}

function Layout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()

  const {
    demandas,
  } = useDemandas()

  const {
    usuario,
    perfil,
    usuarioEhGestor,
    usuarioEhInspetor,
    sair: encerrarSessao,
  } = useAuth()

  const [
    centralAlertasAberta,
    setCentralAlertasAberta,
  ] = useState(false)

  const [
    encerrandoSessao,
    setEncerrandoSessao,
  ] = useState(false)

  const [
    erroAoSair,
    setErroAoSair,
  ] = useState('')

  const demandasComPrazoProximo =
    demandas.filter(
      (demanda) =>
        estaComPrazoProximo(
          demanda.prazoResposta,
        ),
    )

  const quantidadeAlertas =
    demandasComPrazoProximo.length

  const nomeUsuario =
    formatarNomeUsuario(
      usuario,
    )

  const nomePerfil =
    formatarPerfil(
      perfil,
    )

  useEffect(() => {
    const estaNoDashboard =
      location.pathname ===
      '/dashboard'

    if (
      !estaNoDashboard ||
      quantidadeAlertas === 0
    ) {
      return
    }

    const dataAtual =
      obterDataAtual()

    const ultimoAlertaExibido =
      localStorage.getItem(
        CHAVE_ULTIMO_ALERTA,
      )

    if (
      ultimoAlertaExibido !==
      dataAtual
    ) {
      setCentralAlertasAberta(
        true,
      )

      localStorage.setItem(
        CHAVE_ULTIMO_ALERTA,
        dataAtual,
      )
    }
  }, [
    location.pathname,
    quantidadeAlertas,
  ])

  async function sair() {
    if (encerrandoSessao) {
      return
    }

    try {
      setEncerrandoSessao(true)
      setErroAoSair('')

      await encerrarSessao()

      navigate(
        '/',
        {
          replace: true,
        },
      )
    } catch (erro) {
      console.error(
        'Erro ao sair:',
        erro,
      )

      setErroAoSair(
        erro.message ||
          'Não foi possível encerrar a sessão.',
      )
    } finally {
      setEncerrandoSessao(false)
    }
  }

  function abrirDashboard() {
    navigate('/dashboard')
  }

  function abrirCentralAlertas() {
    setCentralAlertasAberta(
      true,
    )
  }

  function fecharCentralAlertas() {
    setCentralAlertasAberta(
      false,
    )
  }

  function dispensarAlertasPorHoje() {
    localStorage.setItem(
      CHAVE_ULTIMO_ALERTA,
      obterDataAtual(),
    )

    setCentralAlertasAberta(
      false,
    )
  }

  return (
    <div
      className="layout"
      data-perfil={perfil || undefined}
    >
      <aside className="sidebar">
        <button
          className="sidebar-brand"
          type="button"
          onClick={abrirDashboard}
          aria-label="Ir para o Dashboard"
        >
          VISAT Manager
        </button>

        <div className="sidebar-usuario">
          <div
            className="sidebar-usuario-avatar"
            aria-hidden="true"
          >
            {nomeUsuario
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="sidebar-usuario-dados">
            <strong title={nomeUsuario}>
              {nomeUsuario}
            </strong>

            <span
              className={
                `sidebar-perfil ` +
                `sidebar-perfil-${perfil}`
              }
            >
              {nomePerfil}
            </span>
          </div>
        </div>

        <nav
          className="menu"
          aria-label="Navegação principal"
        >
          <NavLink
            to="/dashboard"
            className={({
              isActive,
            }) =>
              isActive
                ? 'active'
                : ''
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/demandas"
            className={({
              isActive,
            }) =>
              isActive
                ? 'active'
                : ''
            }
          >
            Demandas
          </NavLink>

          <NavLink
            to="/cadastro"
            className={({
              isActive,
            }) =>
              isActive
                ? 'active'
                : ''
            }
          >
            Nova demanda
          </NavLink>
        </nav>

        <div className="sidebar-sessao">
          <span className="sidebar-sessao-texto">
            Sessão ativa como
          </span>

          <strong>
            {usuarioEhGestor &&
              'Gestor'}

            {usuarioEhInspetor &&
              'Inspetor'}
          </strong>
        </div>

        {erroAoSair && (
          <p
            className="sidebar-erro-sessao"
            role="alert"
          >
            {erroAoSair}
          </p>
        )}

        <button
          className="logout-button"
          type="button"
          onClick={sair}
          disabled={encerrandoSessao}
        >
          {encerrandoSessao
            ? 'Saindo...'
            : 'Sair'}
        </button>
      </aside>

      <section className="content">
        <header className="header">
          <div className="header-titulo">
            <h2>
              Vigilância em Saúde do Trabalhador
            </h2>

            <span className="header-perfil">
              Perfil: {nomePerfil}
            </span>
          </div>

          <button
            className="alertas-button"
            type="button"
            onClick={
              abrirCentralAlertas
            }
            aria-label={
              quantidadeAlertas === 0
                ? (
                  'Abrir Central de Alertas. ' +
                  'Nenhum alerta de prazo.'
                )
                : (
                  'Abrir Central de Alertas. ' +
                  `${quantidadeAlertas} ` +
                  'alertas de prazo.'
                )
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
        aberta={
          centralAlertasAberta
        }
        onFechar={
          fecharCentralAlertas
        }
        onDispensar={
          dispensarAlertasPorHoje
        }
      />
    </div>
  )
}

export default Layout