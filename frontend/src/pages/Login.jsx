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

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [entrando, setEntrando] =
    useState(false)

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

  async function realizarLogin(event) {
    event.preventDefault()

    if (entrando) {
      return
    }

    const emailTratado =
      email.trim().toLowerCase()

    if (!emailTratado || !senha) {
      setErro(
        'Preencha o e-mail e a senha.',
      )

      return
    }

    try {
      setEntrando(true)
      setErro('')

      await entrar(
        emailTratado,
        senha,
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

  function alterarEmail(event) {
    setEmail(
      event.target.value,
    )

    if (erro) {
      setErro('')
    }
  }

  function alterarSenha(event) {
    setSenha(
      event.target.value,
    )

    if (erro) {
      setErro('')
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>VISAT Manager</h1>

        <p>
          Gerenciamento de demandas da
          Vigilância em Saúde do Trabalhador
        </p>

        <form onSubmit={realizarLogin}>
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
              : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login