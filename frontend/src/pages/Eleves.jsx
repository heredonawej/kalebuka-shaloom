import { useEffect, useState } from 'react'
import { API_URL } from '../api'
import {
  Users,
  Search,
  Check,
  X,
  MessageSquare,
  Save,
  UserCheck,
  UserX,
} from 'lucide-react'

function Eleves() {
  const [classes, setClasses] = useState([])
  const [classeSelectionnee, setClasseSelectionnee] = useState('')
  const [eleves, setEleves] = useState([])
  const [recherche, setRecherche] = useState('')
  const [chargement, setChargement] = useState(false)

  const [presences, setPresences] = useState({})
  const [appreciations, setAppreciations] = useState({})

  // Charger les classes
  useEffect(() => {
    const chargerClasses = async () => {
      try {
        const reponse = await fetch
          (`${API_URL}/api/classes`)

        const donnees = await reponse.json()

        setClasses(donnees)
      } catch (erreur) {
        console.error(
          'Erreur chargement classes :',
          erreur
        )
      }
    }

    chargerClasses()
  }, [])

  // Charger les élèves de la classe
  useEffect(() => {
    if (!classeSelectionnee) {
      setEleves([])
      return
    }

    const chargerEleves = async () => {
      setChargement(true)

      try {
        const reponse = await fetch(
          `${API_URL}/api/classes/${classeSelectionnee}/eleves`
        )

        const donnees = await reponse.json()

        setEleves(donnees)

        // Par défaut : présent
        const nouvellesPresences = {}

        donnees.forEach((eleve) => {
          nouvellesPresences[eleve.id] = true
        })

        setPresences(nouvellesPresences)

      } catch (erreur) {
        console.error(
          'Erreur chargement élèves :',
          erreur
        )
      }

      setChargement(false)
    }

    chargerEleves()
  }, [classeSelectionnee])

  const changerPresence = (eleveId, present) => {
    setPresences((anciennes) => ({
      ...anciennes,
      [eleveId]: present,
    }))
  }

  const changerAppreciation = (eleveId, texte) => {
    setAppreciations((anciennes) => ({
      ...anciennes,
      [eleveId]: texte,
    }))
  }

  const elevesFiltres = eleves.filter((eleve) => {

    const nomComplet =
      `${eleve.prenom} ${eleve.nom}`.toLowerCase()

    return nomComplet.includes(
      recherche.toLowerCase()
    )
  })

  const totalPresents = eleves.filter(
    (eleve) => presences[eleve.id]
  ).length

  const totalAbsents = eleves.length - totalPresents

  const enregistrerAppel = async () => {

  const utilisateur = JSON.parse(
    localStorage.getItem('utilisateur')
  )

  if (!utilisateur) {
    alert('Utilisateur non connecté.')
    return
  }

  if (!classeSelectionnee) {
    alert('Veuillez sélectionner une classe.')
    return
  }

  const donneesPresences = eleves.map((eleve) => ({
    eleve_id: eleve.id,
    statut: presences[eleve.id]
      ? 'present'
      : 'absent',
  }))

  try {

    const reponse = await fetch(
      '${API_URL}/api/presences',
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          enseignant_id: utilisateur.id,
          classe_id: Number(classeSelectionnee),
          presences: donneesPresences,
        }),
      }
    )

    const donnees = await reponse.json()

    if (!reponse.ok) {
      alert(
        donnees.erreur ||
        'Erreur lors de l’enregistrement.'
      )
      return
    }

    alert(
      '✅ Présences enregistrées avec succès !'
    )

  } catch (erreur) {

    console.error(erreur)

    alert(
      'Impossible de contacter le serveur.'
    )
  }
}

  return (
    <div className="space-y-6">

      {/* En-tête */}
      <div>

        <p className="text-sm font-medium text-blue-600">
          Gestion scolaire
        </p>

        <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900">
          Mes élèves
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Gérez les présences et le suivi pédagogique de vos élèves.
        </p>

      </div>

      {/* Sélection classe */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6">

        <div className="flex flex-col sm:flex-row sm:items-end gap-4">

          <div className="flex-1">

            <label className="block text-sm font-medium text-slate-700 mb-2">
              Classe
            </label>

            <select
              value={classeSelectionnee}
              onChange={(e) =>
                setClasseSelectionnee(e.target.value)
              }
              className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            >

              <option value="">
                Sélectionner une classe
              </option>

              {classes.map((classe) => (
                <option
                  key={classe.id}
                  value={classe.id}
                >
                  {classe.nom} — {classe.section}
                </option>
              ))}

            </select>

          </div>

          {classeSelectionnee && (
            <div className="flex gap-2">

              <div className="px-4 py-2.5 rounded-xl bg-green-50 text-green-700 text-sm font-semibold">
                🟢 {totalPresents} présents
              </div>

              <div className="px-4 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm font-semibold">
                🔴 {totalAbsents} absents
              </div>

            </div>
          )}

        </div>

      </div>

      {/* Aucun choix */}
      {!classeSelectionnee && (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">

          <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
            <Users
              size={30}
              className="text-blue-500"
            />
          </div>

          <h2 className="mt-4 text-lg font-bold text-slate-800">
            Sélectionnez une classe
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Choisissez une classe pour afficher la liste de vos élèves.
          </p>

        </div>
      )}

      {/* Chargement */}
      {chargement && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">

          <p className="text-sm text-slate-500">
            Chargement des élèves...
          </p>

        </div>
      )}

      {/* Liste élèves */}
      {classeSelectionnee && !chargement && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">

          {/* En-tête */}
          <div className="p-4 sm:p-6 border-b border-slate-100">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

              <div>

                <h2 className="font-bold text-slate-900">
                  Liste des élèves
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  {eleves.length} élève(s) dans cette classe
                </p>

              </div>

              <div className="relative">

                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  placeholder="Rechercher un élève..."
                  value={recherche}
                  onChange={(e) =>
                    setRecherche(e.target.value)
                  }
                  className="w-full sm:w-64 h-10 pl-10 pr-4 rounded-xl border border-slate-200 outline-none text-sm focus:border-blue-500"
                />

              </div>

            </div>

          </div>

          {/* Élèves */}
          <div className="divide-y divide-slate-100">

            {elevesFiltres.map((eleve, index) => {

              const present = presences[eleve.id]

              return (
                <div
                  key={eleve.id}
                  className="p-4 sm:p-5"
                >

                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">

                    {/* Élève */}
                    <div className="flex items-center gap-3 lg:w-1/4">

                      <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                        {index + 1}
                      </div>

                      <div>
                        <p className="font-semibold text-slate-800">
                          {eleve.prenom} {eleve.nom}
                        </p>

                        <p className="text-xs text-slate-400">
                          Élève #{eleve.id}
                        </p>
                      </div>

                    </div>

                    {/* Présence */}
                    <div className="flex gap-2">

                      <button
                        onClick={() =>
                          changerPresence(
                            eleve.id,
                            true
                          )
                        }
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                          present
                            ? 'bg-green-100 text-green-700 ring-2 ring-green-500/20'
                            : 'bg-slate-100 text-slate-500 hover:bg-green-50 hover:text-green-600'
                        }`}
                      >

                        <Check size={17} />

                        Présent

                      </button>

                      <button
                        onClick={() =>
                          changerPresence(
                            eleve.id,
                            false
                          )
                        }
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                          !present
                            ? 'bg-red-100 text-red-700 ring-2 ring-red-500/20'
                            : 'bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600'
                        }`}
                      >

                        <X size={17} />

                        Absent

                      </button>

                    </div>

                    {/* Appréciation */}
                    <div className="flex-1">

                      <div className="relative">

                        <MessageSquare
                          size={17}
                          className="absolute left-3 top-3 text-slate-400"
                        />

                        <input
                          type="text"
                          value={
                            appreciations[eleve.id] || ''
                          }
                          onChange={(e) =>
                            changerAppreciation(
                              eleve.id,
                              e.target.value
                            )
                          }
                          placeholder="Ajouter une appréciation..."
                          className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 outline-none text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                        />

                      </div>

                    </div>

                  </div>

                </div>
              )
            })}

            {elevesFiltres.length === 0 && (
              <div className="p-10 text-center">

                <p className="text-sm text-slate-500">
                  Aucun élève trouvé.
                </p>

              </div>
            )}

          </div>

          {/* Bouton */}
          {eleves.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-slate-100 flex justify-end">

              <button
                onClick={enregistrerAppel}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition"
              >

                <Save size={18} />

                Enregistrer l'appel

              </button>

            </div>
          )}

        </div>
      )}

    </div>
  )
}

export default Eleves