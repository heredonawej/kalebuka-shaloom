import { useState } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'

import Connexion from './pages/Connexion'
import AccueilPublic from './pages/AccueilPublic'

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
import ClassesAdmin from './pages/ClassesAdmin'
import ElevesAdmin from './pages/ElevesAdmin'
import PreparationsAdmin from './pages/PreparationsAdmin'
import PreparationsAdminDetail from './pages/PreparationsAdminDetail'
import RapportsAdmin from './pages/RapportsAdmin'
import HorairesAdmin from './pages/HorairesAdmin';
import MatieresAdmin from './pages/MatieresAdmin'
import RegistreAppelAdmin from './pages/RegistreAppelAdmin'

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
  // APPLICATION
  // ===============================

  return (

    <BrowserRouter>

      <Routes>

        {/* =================================
            SITE PUBLIC
        ================================= */}

        <Route
          path="/"
          element={<AccueilPublic />}
        />


        {/* =================================
            CONNEXION
        ================================= */}

        <Route
          path="/connexion"
          element={
            utilisateur ? (
              <Navigate
                to={
                  utilisateur?.role === 'admin'
                    ? '/admin'
                    : '/enseignant'
                }
                replace
              />
            ) : (
              <Connexion
                onConnexion={handleConnexion}
              />
            )
          }
        />


        {/* =================================
            ESPACE ENSEIGNANT
        ================================= */}

        {utilisateur?.role === 'enseignant' && (

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

        {utilisateur?.role === 'admin' && (

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

            <Route
              path="classes"
              element={<ClassesAdmin />}
            />
            <Route path="horaires" element={<HorairesAdmin />} />

            <Route
              path="eleves"
              element={<ElevesAdmin />}
            />
            <Route path="matieres" element={<MatieresAdmin />} />
            <Route
  path="registre-appel"
  element={<RegistreAppelAdmin />}
/>

            <Route
              path="preparations"
              element={<PreparationsAdmin />}
            />

            <Route
              path="preparations/:id"
              element={<PreparationsAdminDetail />}
            />

            <Route
              path="rapports"
              element={<RapportsAdmin />}
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
                utilisateur?.role === 'admin'
                  ? '/admin'
                  : utilisateur?.role === 'enseignant'
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