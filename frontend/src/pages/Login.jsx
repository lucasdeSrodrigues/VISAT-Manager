import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext.jsx'

import './Login.css'

function Login() {
  const navigate = useNavigate()

  const {
    autenticado,
    entrar,
    limparErroAutenticacao,
  } = useAuth()

  const [
    email,
    setEmail,
  ] = useState('')

  const [
    senha,
    setSenha,
  ] = useState('')

  const [
    perfilSelecionado,
    setPerfilSelecionado,
  ] = useState('inspetor')

  const [
    erro,
    setErro,
  ] = useState('')

  const [
    entrando,
    setEntrando,
  ] = useState(false)

  useEffect(() => {
    limparErroAutenticacao()
  }, [limparErroAutenticacao])

  useEffect(() => {
    if (autenticado) {
      navigate(
        '/dashboard',
        {
          replace: true,
        },
      )
    }
  }, [
    autenticado,
    navigate,
  ])

  async function realizarLogin(evento) {
    evento.preventDefault()

    if (entrando) {
      return
    }

    const emailTratado =
      email.trim().toLowerCase()

    if (
      !emailTratado ||
      !senha
    ) {
      setErro(
        'Preencha o e-mail e a senha.',
      )

      return
    }

    if (
      perfilSelecionado !== 'gestor' &&
      perfilSelecionado !== 'inspetor'
    ) {
      setErro(
        'Selecione um perfil válido.',
      )

      return
    }

    try {
      setEntrando(true)
      setErro('')

      await entrar(
        emailTratado,
        senha,
        perfilSelecionado,
      )

      navigate(
        '/dashboard',
        {
          replace: true,
        },
      )
    } catch (erroLogin) {
      setErro(
        erroLogin.message ||
          'Não foi possível realizar o login.',
      )
    } finally {
      setEntrando(false)
    }
  }

  function alterarEmail(evento) {
    setEmail(
      evento.target.value,
    )

    if (erro) {
      setErro('')
    }
  }

  function alterarSenha(evento) {
    setSenha(
      evento.target.value,
    )

    if (erro) {
      setErro('')
    }
  }

  function selecionarPerfil(perfil) {
    if (entrando) {
      return
    }

    setPerfilSelecionado(
      perfil,
    )

    if (erro) {
      setErro('')
    }
  }

  return (
    <div className="login-container">
      <div className="login-background-shape login-background-shape-one" />

      <div className="login-background-shape login-background-shape-two" />

      <main className="login-panel">
        <section className="login-apresentacao">
          <div className="login-apresentacao-conteudo">
            <div className="login-marca">
              <div
                className="login-marca-icone"
                aria-hidden="true"
              >
                VM
              </div>

              <span>
                VISAT Manager
              </span>
            </div>

            <div className="login-apresentacao-texto">
              <span className="login-apresentacao-label">
                Gestão integrada
              </span>

              <h1>
                Demandas organizadas, prazos acompanhados.
              </h1>

              <p>
                Uma plataforma desenvolvida para apoiar a
                gestão das demandas da Vigilância em Saúde
                do Trabalhador.
              </p>
            </div>

            <div className="login-beneficios">
              <div className="login-beneficio">
                <span
                  className="login-beneficio-icone"
                  aria-hidden="true"
                >
                  ✓
                </span>

                <div>
                  <strong>
                    Gestão centralizada
                  </strong>

                  <small>
                    Consulte e acompanhe todas as demandas
                    em um único ambiente.
                  </small>
                </div>
              </div>

              <div className="login-beneficio">
                <span
                  className="login-beneficio-icone"
                  aria-hidden="true"
                >
                  ✓
                </span>

                <div>
                  <strong>
                    Controle de prazos
                  </strong>

                  <small>
                    Visualize prioridades e receba alertas
                    sobre demandas próximas do vencimento.
                  </small>
                </div>
              </div>

              <div className="login-beneficio">
                <span
                  className="login-beneficio-icone"
                  aria-hidden="true"
                >
                  ✓
                </span>

                <div>
                  <strong>
                    Histórico completo
                  </strong>

                  <small>
                    Acompanhe as alterações e movimentações
                    realizadas durante todo o processo.
                  </small>
                </div>
              </div>
            </div>
          </div>

          <p className="login-apresentacao-rodape">
            Vigilância em Saúde do Trabalhador
          </p>
        </section>

        <section className="login-acesso">
          <div className="login-acesso-conteudo">
            <header className="login-acesso-header">
              <span className="login-acesso-label">
                Acesso ao sistema
              </span>

              <h2>
                Boas-vindas
              </h2>

              <p>
                Selecione seu perfil e informe as
                credenciais para continuar.
              </p>
            </header>

            <form
              className="login-form"
              onSubmit={realizarLogin}
            >
              <fieldset
                className="perfil-fieldset"
                disabled={entrando}
              >
                <legend>
                  Perfil de acesso
                </legend>

                <div className="perfil-opcoes">
                  <label
                    className={
                      perfilSelecionado ===
                      'gestor'
                        ? (
                          'perfil-opcao ' +
                          'perfil-selecionado'
                        )
                        : 'perfil-opcao'
                    }
                  >
                    <input
                      type="radio"
                      name="perfil"
                      value="gestor"
                      checked={
                        perfilSelecionado ===
                        'gestor'
                      }
                      onChange={() =>
                        selecionarPerfil(
                          'gestor',
                        )
                      }
                    />

                    <span className="perfil-opcao-icone">
                      G
                    </span>

                    <span className="perfil-opcao-conteudo">
                      <strong>
                        Gestor
                      </strong>

                      <small>
                        Acesso administrativo
                      </small>
                    </span>
                  </label>

                  <label
                    className={
                      perfilSelecionado ===
                      'inspetor'
                        ? (
                          'perfil-opcao ' +
                          'perfil-selecionado'
                        )
                        : 'perfil-opcao'
                    }
                  >
                    <input
                      type="radio"
                      name="perfil"
                      value="inspetor"
                      checked={
                        perfilSelecionado ===
                        'inspetor'
                      }
                      onChange={() =>
                        selecionarPerfil(
                          'inspetor',
                        )
                      }
                    />

                    <span className="perfil-opcao-icone">
                      I
                    </span>

                    <span className="perfil-opcao-conteudo">
                      <strong>
                        Inspetor
                      </strong>

                      <small>
                        Acesso operacional
                      </small>
                    </span>
                  </label>
                </div>

                <small className="perfil-orientacao">
                  O perfil selecionado deve corresponder às
                  credenciais informadas.
                </small>
              </fieldset>

              <div className="login-form-field">
                <label htmlFor="email">
                  E-mail
                </label>

                <div className="login-input-container">
                  <span
                    className="login-input-icone"
                    aria-hidden="true"
                  >
                    @
                  </span>

                  <input
                    id="email"
                    type="email"
                    placeholder="Digite seu e-mail"
                    value={email}
                    onChange={alterarEmail}
                    autoComplete="email"
                    disabled={entrando}
                    required
                  />
                </div>
              </div>

              <div className="login-form-field">
                <label htmlFor="senha">
                  Senha
                </label>

                <div className="login-input-container">
                  <span
                    className="login-input-icone"
                    aria-hidden="true"
                  >
                    ●
                  </span>

                  <input
                    id="senha"
                    type="password"
                    placeholder="Digite sua senha"
                    value={senha}
                    onChange={alterarSenha}
                    autoComplete="current-password"
                    disabled={entrando}
                    required
                  />
                </div>
              </div>

              {erro && (
                <p
                  className="login-erro"
                  role="alert"
                  aria-live="assertive"
                >
                  {erro}
                </p>
              )}

              <button
                className="login-submit-button"
                type="submit"
                disabled={entrando}
              >
                <span>
                  {entrando
                    ? 'Entrando...'
                    : (
                      perfilSelecionado ===
                      'gestor'
                        ? 'Entrar como Gestor'
                        : 'Entrar como Inspetor'
                    )}
                </span>

                {!entrando && (
                  <span
                    className="login-submit-seta"
                    aria-hidden="true"
                  >
                    →
                  </span>
                )}
              </button>
            </form>
          </div>

          <p className="login-acesso-rodape">
            Acesso restrito a usuários autorizados
          </p>
        </section>
      </main>
    </div>
  )
}

export default Login