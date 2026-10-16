import './Layout.css'

function Layout({ children }) {
  return (
    <div className="layout">

      <aside className="sidebar">
        <h1>VISAT Manager</h1>

        <nav>
          <p>Dashboard</p>
          <p>Demandas</p>
          <p>Cadastrar demanda</p>
        </nav>
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