import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'

function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [perfil, setPerfil] = useState('inspetor')
  const [erro, setErro] = useState('')

  function entrar(event) {
    event.preventDefault()

    const emailTratado = email.trim()

    if (!emailTratado || !senha) {
      setErro('Preencha o e-mail e a senha.')
      return
    }

    const usuario = {
      email: emailTratado,
      perfil,
      nome: emailTratado.split('@')[0],
    }

    localStorage.setItem('visat_usuario', JSON.stringify(usuario))

    setErro('')
    navigate('/dashboard')
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>VISAT Manager</h1>

        <p>
          Gerenciamento de demandas da
          Vigilância em Saúde do Trabalhador
        </p>

        <form onSubmit={entrar}>
          <label htmlFor="email">E-mail</label>

          <input
            id="email"
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
          />

          <label htmlFor="senha">Senha</label>

          <input
            id="senha"
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
            autoComplete="current-password"
          />

          <fieldset className="perfil-fieldset">
            <legend>Selecione o perfil</legend>

            <div className="perfil-opcoes">
              <label
                className={`perfil-opcao ${
                  perfil === 'gestor' ? 'perfil-selecionado' : ''
                }`}
              >
                <input
                  type="radio"
                  name="perfil"
                  value="gestor"
                  checked={perfil === 'gestor'}
                  onChange={(event) => setPerfil(event.target.value)}
                />

                <span>
                  <strong>Gestor</strong>
                  <small>Acesso administrativo</small>
                </span>
              </label>

              <label
                className={`perfil-opcao ${
                  perfil === 'inspetor' ? 'perfil-selecionado' : ''
                }`}
              >
                <input
                  type="radio"
                  name="perfil"
                  value="inspetor"
                  checked={perfil === 'inspetor'}
                  onChange={(event) => setPerfil(event.target.value)}
                />

                <span>
                  <strong>Inspetor</strong>
                  <small>Acesso operacional</small>
                </span>
              </label>
            </div>
          </fieldset>

          {erro && (
            <p className="login-erro" role="alert">
              {erro}
            </p>
          )}

          <button type="submit">
            Entrar como {perfil === 'gestor' ? 'Gestor' : 'Inspetor'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login