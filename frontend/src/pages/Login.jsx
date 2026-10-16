import { useNavigate } from 'react-router-dom'
import './Login.css'

function Login() {
    const navigate = useNavigate()
    return (
    <div className="login-container">
      <div className="login-card">

        <h1>VISAT Manager</h1>

        <p>
          Gerenciamento de demandas da
          Vigilância em Saúde do Trabalhador
        </p>

        <input
          type="email"
          placeholder="E-mail"
        />

        <input
          type="password"
          placeholder="Senha"
        />

        <button onClick={() => navigate('/dashboard')}>
         Entrar
        </button>

      </div>
    </div>
  )
}

export default Login