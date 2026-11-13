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
      <div className="login-card">
        <h1>
          VISAT Manager
        </h1>

        <p>
          Gerenciamento de demandas da
          Vigilância em Saúde do Trabalhador
        </p>

        <form onSubmit={realizarLogin}>
          <fieldset
            className="perfil-fieldset"
            disabled={entrando}
          >
            <legend>
              Selecione o perfil de acesso
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
          </fieldset>

          <label htmlFor="email">
            E-mail
          </label>

          <input
            id="email"
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={alterarEmail}
            autoComplete="email"
            disabled={entrando}
            required
          />

          <label htmlFor="senha">
            Senha
          </label>

          <input
            id="senha"
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={alterarSenha}
            autoComplete="current-password"
            disabled={entrando}
            required
          />

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
            type="submit"
            disabled={entrando}
          >
            {entrando
              ? 'Entrando...'
              : (
                perfilSelecionado ===
                'gestor'
                  ? 'Entrar como Gestor'
                  : 'Entrar como Inspetor'
              )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
