import { useState } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'

import Connexion from './pages/Connexion'

// ===============================
// ESPACE ENSEIGNANT
// ===============================
import LayoutEnseignant from './pages/LayoutEnseignant'
import AccueilEnseignant from './pages/AccueilEnseignant'
import Preparations from './pages/Preparations'
import NouvellePreparation from './pages/NouvellePreparation'
import ModifierPreparation from './pages/ModifierPreparation'
import Profil from './pages/Profil'
import Eleves from './pages/Eleves'
import Evaluations from './pages/Evaluations'
import ConsulterPreparation from './pages/ConsulterPreparation'

// ===============================
// ESPACE ADMIN
// ===============================
import LayoutAdmin from './pages/LayoutAdmin'
import DashboardAdmin from './pages/DashboardAdmin'
import EnseignantsAdmin from './pages/EnseignantsAdmin'

function App() {

  const [utilisateur, setUtilisateur] = useState(() => {

    const sauvegarde =
      localStorage.getItem('utilisateur')

    return sauvegarde
      ? JSON.parse(sauvegarde)
      : null
  })


  // ===============================
  // CONNEXION
  // ===============================

  const handleConnexion = (utilisateurConnecte) => {

    setUtilisateur(utilisateurConnecte)

  }


  // ===============================
  // DECONNEXION
  // ===============================

  const handleDeconnexion = () => {

    localStorage.removeItem('utilisateur')

    setUtilisateur(null)

  }


  // ===============================
  // UTILISATEUR NON CONNECTÉ
  // ===============================

  if (!utilisateur) {

    return (
      <BrowserRouter>

        <Connexion
          onConnexion={handleConnexion}
        />

      </BrowserRouter>
    )
  }


  // ===============================
  // APPLICATION
  // ===============================

  return (

    <BrowserRouter>

      <Routes>

        {/* =================================
            ESPACE ENSEIGNANT
        ================================= */}

        {utilisateur.role === 'enseignant' && (

          <Route
            path="/enseignant"
            element={
              <LayoutEnseignant
                utilisateur={utilisateur}
                onDeconnexion={handleDeconnexion}
              />
            }
          >

            <Route
              index
              element={<AccueilEnseignant />}
            />

            <Route
              path="preparations"
              element={<Preparations />}
            />

            <Route
              path="nouvelle-preparation"
              element={<NouvellePreparation />}
            />

            <Route
              path="modifier-preparation/:id"
              element={<ModifierPreparation />}
            />
            <Route
  path="consulter-preparation/:id"
  element={<ConsulterPreparation />}
/>
            <Route
              path="eleves"
              element={<Eleves />}
            />

            <Route
              path="evaluations"
              element={<Evaluations />}
            />

            <Route
              path="profil"
              element={
                <Profil
                  utilisateur={utilisateur}
                  onDeconnexion={handleDeconnexion}
                />
              }
            />

          </Route>

        )}


        {/* =================================
            ESPACE ADMIN
        ================================= */}

        {utilisateur.role === 'admin' && (

          <Route
            path="/admin"
            element={
              <LayoutAdmin
                utilisateur={utilisateur}
                onDeconnexion={handleDeconnexion}
              />
            }
          >

            <Route
              index
              element={<DashboardAdmin />}
            />
            <Route
  path="enseignants"
  element={<EnseignantsAdmin />}
/>

          </Route>

        )}


        {/* =================================
            REDIRECTION PAR ROLE
        ================================= */}

        <Route
          path="*"
          element={
            <Navigate
              to={
                utilisateur.role === 'admin'
                  ? '/admin'
                  : utilisateur.role === 'enseignant'
                    ? '/enseignant'
                    : '/'
              }
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>

  )
}

export default App