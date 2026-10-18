import { NavLink, useNavigate } from 'react-router-dom'
import './Layout.css'

function Layout({ children }) {
  const navigate = useNavigate()
  
  function sair() {
  navigate('/')
  }

  return (
    <div className="layout">

      <aside className="sidebar">
        <h1>VISAT Manager</h1>

        <nav className="menu">

          <NavLink
            to="/dashboard"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/demandas"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Demandas
          </NavLink>

          <NavLink
            to="/cadastro"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Nova demanda
          </NavLink>

        </nav>

        <button
          className="logout-button"
          onClick={sair}
        >
          Sair
        </button>

      </aside>


      <section className="content">

        <header className="header">
          <h2>Vigilância em Saúde do Trabalhador</h2>
        </header>


        <main>
          {children}
        </main>

      </section>

    </div>
  )
}

export default Layout