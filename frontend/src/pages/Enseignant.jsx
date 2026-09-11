function Enseignant() {
  return (
    <div className="enseignant-page">

      <div className="page-header">
        <div>
          <p className="page-small-title">
            Espace enseignant
          </p>

          <h1>
            Gestion de mes cours
          </h1>

          <p>
            Préparez, soumettez et suivez vos préparations de cours.
          </p>
        </div>

        <button className="primary-button">
          + Nouvelle préparation
        </button>
      </div>


      {/* Statistiques */}
      <div className="stats-grid">

        <div className="stat-card">
          <span className="stat-icon">📝</span>

          <div>
            <strong>0</strong>
            <span>Préparations</span>
          </div>
        </div>


        <div className="stat-card">
          <span className="stat-icon">⏳</span>

          <div>
            <strong>0</strong>
            <span>En attente</span>
          </div>
        </div>


        <div className="stat-card">
          <span className="stat-icon">✅</span>

          <div>
            <strong>0</strong>
            <span>Validées</span>
          </div>
        </div>


        <div className="stat-card">
          <span className="stat-icon">❌</span>

          <div>
            <strong>0</strong>
            <span>Rejetées</span>
          </div>
        </div>

      </div>


      {/* Préparations */}
      <div className="content-card">

        <div className="content-card-header">

          <div>
            <h2>
              Mes préparations
            </h2>

            <p>
              Retrouvez ici toutes vos préparations de cours.
            </p>
          </div>

        </div>


        <div className="empty-state">

          <div className="empty-icon">
            📝
          </div>

          <h3>
            Aucune préparation
          </h3>

          <p>
            Vous n'avez encore créé aucune préparation de cours.
          </p>

          <button className="primary-button">
            Créer ma première préparation
          </button>

        </div>

      </div>

    </div>
  )
}

export default Enseignant