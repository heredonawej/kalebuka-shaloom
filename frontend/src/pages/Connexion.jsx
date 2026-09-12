import { useState } from 'react'
import { LogIn, GraduationCap, Eye, EyeOff } from 'lucide-react'
import { API_URL } from '../api'

function Connexion({ onConnexion }) {
  const [matricule, setMatricule] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [afficherMotDePasse, setAfficherMotDePasse] = useState(false)
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)

  const handleConnexion = async (e) => {
    e.preventDefault()

    setErreur('')

    if (!matricule || !motDePasse) {
      setErreur('Veuillez remplir tous les champs.')
      return
    }

    try {
      setChargement(true)

      const response = await fetch(
  `${API_URL}/api/auth/connexion`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            matricule: matricule.trim(),
            mot_de_passe: motDePasse,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setErreur(
          data.erreur || 'Matricule ou mot de passe incorrect.'
        )
        return
      }

      localStorage.setItem(
        'utilisateur',
        JSON.stringify(data.utilisateur)
      )

      onConnexion(data.utilisateur)
    } catch (err) {
      console.error('Erreur connexion :', err)

      setErreur(
        'Impossible de contacter le serveur. Vérifiez que le backend est démarré.'
      )
    } finally {
      setChargement(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-8">

      <div className="w-full max-w-md">

        {/* Logo et titre */}
        <div className="text-center mb-8">

          <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
            <GraduationCap
              size={34}
              className="text-white"
            />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            Kalebuka Shaloom
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Plateforme de gestion scolaire
          </p>

        </div>

        {/* Carte connexion */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8">

          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              Connexion
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Connectez-vous avec votre matricule
            </p>
          </div>

          <form
            onSubmit={handleConnexion}
            className="space-y-5"
          >

            {/* Matricule */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Matricule
              </label>

              <input
                type="text"
                value={matricule}
                onChange={(e) =>
                  setMatricule(e.target.value)
                }
                placeholder="Ex : ENS-****-0001"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                autoComplete="username"
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Mot de passe
              </label>

              <div className="relative">

                <input
                  type={
                    afficherMotDePasse
                      ? 'text'
                      : 'password'
                  }
                  value={motDePasse}
                  onChange={(e) =>
                    setMotDePasse(e.target.value)
                  }
                  placeholder="Votre mot de passe"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setAfficherMotDePasse(
                      !afficherMotDePasse
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {afficherMotDePasse ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>

              </div>
            </div>

            {/* Erreur */}
            {erreur && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
                {erreur}
              </div>
            )}

            {/* Bouton */}
            <button
              type="submit"
              disabled={chargement}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 rounded-xl transition shadow-lg shadow-blue-100"
            >
              <LogIn size={19} />

              {chargement
                ? 'Connexion...'
                : 'Se connecter'}
            </button>

          </form>

        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          © {new Date().getFullYear()} Kalebuka Shaloom
        </p>

      </div>

    </div>
  )
}

export default Connexion