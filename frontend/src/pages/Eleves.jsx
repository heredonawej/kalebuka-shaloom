import { useEffect, useState } from 'react'
import { API_URL } from '../api'
import {
  Users,
  Search,
  Check,
  X,
  MessageSquare,
  Save,
  CalendarDays,
  Clock3,
} from 'lucide-react'

const JOURS = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi']

const CRENEAUX = [
  { heure_debut: '07:30', heure_fin: '08:15' },
  { heure_debut: '08:15', heure_fin: '09:00' },
  { heure_debut: '09:00', heure_fin: '09:45' },
  { recreation: true, heure_debut: '09:45', heure_fin: '10:00' },
  { heure_debut: '10:00', heure_fin: '10:45' },
  { heure_debut: '10:45', heure_fin: '11:30' },
  { heure_debut: '11:30', heure_fin: '12:15' },
]

function Eleves() {

  // =====================================================
  // UTILISATEUR CONNECTÉ
  // =====================================================

  const [utilisateur] = useState(() => {
    const sauvegarde =
      localStorage.getItem('utilisateur')

    return sauvegarde
      ? JSON.parse(sauvegarde)
      : null
  })


  // =====================================================
  // CLASSE DE L'ENSEIGNANT
  // =====================================================

  const classeSelectionnee =
    utilisateur?.classe_id || ''

  const nomClasse =
    utilisateur?.classe_nom || 'Classe non définie'


  // =====================================================
  // DONNÉES
  // =====================================================

  const [eleves, setEleves] = useState([])

  const [recherche, setRecherche] =
    useState('')

  const [chargement, setChargement] =
    useState(false)

  const [presences, setPresences] =
    useState({})

  const [appreciations, setAppreciations] =
    useState({})

  const [onglet, setOnglet] = useState('eleves')
  const [horaires, setHoraires] = useState([])
  const [chargementHoraire, setChargementHoraire] = useState(false)


  // =====================================================
  // CHARGER LES ÉLÈVES DE LA CLASSE
  // =====================================================

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

        if (!reponse.ok) {
          throw new Error(
            'Impossible de charger les élèves.'
          )
        }

        const donnees =
          await reponse.json()

        setEleves(donnees)


        // Par défaut : présents
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

      } finally {

        setChargement(false)

      }

    }

    chargerEleves()

  }, [classeSelectionnee])


  // =====================================================
// CHARGER L'HORAIRE LORSQU'ON OUVRE L'ONGLET
// =====================================================

useEffect(() => {
  if (onglet !== 'horaire') return
  if (!classeSelectionnee) return

  const chargerHoraire = async () => {
    setChargementHoraire(true)

    try {
      const url =
        `${API_URL}/api/horaires/classe/${classeSelectionnee}`

      console.log('📅 Chargement horaire :', url)

      const reponse = await fetch(url)

      if (!reponse.ok) {
        throw new Error(
          `Erreur serveur : ${reponse.status}`
        )
      }

      const donnees = await reponse.json()

      console.log('📅 Horaires reçus :', donnees)

      setHoraires(
        Array.isArray(donnees)
          ? donnees
          : []
      )

    } catch (erreur) {
      console.error(
        '❌ Erreur chargement horaire :',
        erreur
      )

      setHoraires([])
    } finally {
      setChargementHoraire(false)
    }
  }

  chargerHoraire()

}, [onglet, classeSelectionnee])

  // =====================================================
  // CHANGER PRÉSENCE
  // =====================================================

  const changerPresence = (
    eleveId,
    present
  ) => {

    setPresences((anciennes) => ({
      ...anciennes,
      [eleveId]: present,
    }))

  }


  // =====================================================
  // CHANGER APPRÉCIATION
  // =====================================================

  const changerAppreciation = (
    eleveId,
    texte
  ) => {

    setAppreciations((anciennes) => ({
      ...anciennes,
      [eleveId]: texte,
    }))

  }


  // =====================================================
  // RECHERCHE
  // =====================================================

  const elevesFiltres = eleves.filter(
    (eleve) => {

      const nomComplet =
        `${eleve.prenom} ${eleve.nom}`
          .toLowerCase()

      return nomComplet.includes(
        recherche.toLowerCase()
      )

    }
  )


  // =====================================================
  // STATISTIQUES
  // =====================================================

  const totalPresents =
    eleves.filter(
      (eleve) =>
        presences[eleve.id]
    ).length

  const totalAbsents =
    eleves.length - totalPresents


  // =====================================================
  // ENREGISTRER L'APPEL
  // =====================================================

  const enregistrerAppel = async () => {

    if (!utilisateur) {

      alert(
        'Utilisateur non connecté.'
      )

      return

    }


    if (!classeSelectionnee) {

      alert(
        'Aucune classe n’est associée à votre compte.'
      )

      return

    }


    const donneesPresences =
      eleves.map((eleve) => ({

        eleve_id: eleve.id,

        statut:
          presences[eleve.id]
            ? 'present'
            : 'absent',

      }))


    try {

      const reponse = await fetch(
        `${API_URL}/api/presences`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({

            enseignant_id:
              utilisateur.id,

            classe_id:
              Number(classeSelectionnee),

            presences:
              donneesPresences,

          }),
        }
      )


      const donnees =
        await reponse.json()


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


  // =====================================================
  // AFFICHAGE
  // =====================================================

  return (

    <div className="space-y-6">

      {/* =================================================
          EN-TÊTE
      ================================================= */}

      <div>

        <p className="text-sm font-medium text-blue-600">
          Gestion scolaire
        </p>

        <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
          Mes élèves
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Gérez les présences et le suivi pédagogique de vos élèves.
        </p>

      </div>


      {/* =================================================
          MA CLASSE
      ================================================= */}

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 sm:p-6">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              Ma classe
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              {nomClasse}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Cette classe vous a été attribuée par l'administration.
            </p>

          </div>


          <div className="flex gap-2">

            <div className="rounded-xl bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-700">
              🟢 {totalPresents} présents
            </div>

            <div className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600">
              🔴 {totalAbsents} absents
            </div>

          </div>

        </div>

      </div>


      {classeSelectionnee && (
        <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setOnglet('eleves')} className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${onglet === 'eleves' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}>
              <Users size={18} />
              Élèves
            </button>
            <button type="button" onClick={() => setOnglet('horaire')} className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${onglet === 'horaire' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}>
              <CalendarDays size={18} />
              Horaire
            </button>
          </div>
        </div>
      )}


      {/* =================================================
          SI AUCUNE CLASSE
      ================================================= */}

      {!classeSelectionnee && (

        <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100">

            <Users
              size={30}
              className="text-red-500"
            />

          </div>

          <h2 className="mt-4 text-lg font-bold text-slate-800">
            Aucune classe attribuée
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Votre compte n'est associé à aucune classe.
            Veuillez contacter l'administration.
          </p>

        </div>

      )}


      {/* =================================================
          CHARGEMENT
      ================================================= */}

      {onglet === 'eleves' && chargement && (

        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">

          <p className="text-sm text-slate-500">
            Chargement des élèves...
          </p>

        </div>

      )}


      {/* =================================================
          LISTE DES ÉLÈVES
      ================================================= */}

      {onglet === 'eleves' && classeSelectionnee &&
        !chargement && (

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

          {/* EN-TÊTE */}

          <div className="border-b border-slate-100 p-4 sm:p-6">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <h2 className="font-bold text-slate-900">
                  Liste des élèves
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {eleves.length} élève(s) dans {nomClasse}
                </p>

              </div>


              {/* RECHERCHE */}

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
                    setRecherche(
                      e.target.value
                    )
                  }
                  className="h-10 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-sm outline-none focus:border-blue-500 sm:w-64"
                />

              </div>

            </div>

          </div>


          {/* ÉLÈVES */}

          <div className="divide-y divide-slate-100">

            {elevesFiltres.map(
              (eleve, index) => {

                const present =
                  presences[eleve.id]

                return (

                  <div
                    key={eleve.id}
                    className="p-4 sm:p-5"
                  >

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">

                      {/* ÉLÈVE */}

                      <div className="flex items-center gap-3 lg:w-1/4">

                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-600">

                          {index + 1}

                        </div>

                        <div>

                          <p className="font-semibold text-slate-800">
                            {eleve.prenom}{' '}
                            {eleve.nom}
                          </p>

                          <p className="text-xs text-slate-400">
                            Élève #{eleve.id}
                          </p>

                        </div>

                      </div>


                      {/* PRÉSENCE */}

                      <div className="flex gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            changerPresence(
                              eleve.id,
                              true
                            )
                          }
                          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                            present
                              ? 'bg-green-100 text-green-700 ring-2 ring-green-500/20'
                              : 'bg-slate-100 text-slate-500 hover:bg-green-50 hover:text-green-600'
                          }`}
                        >

                          <Check size={17} />

                          Présent

                        </button>


                        <button
                          type="button"
                          onClick={() =>
                            changerPresence(
                              eleve.id,
                              false
                            )
                          }
                          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                            !present
                              ? 'bg-red-100 text-red-700 ring-2 ring-red-500/20'
                              : 'bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600'
                          }`}
                        >

                          <X size={17} />

                          Absent

                        </button>

                      </div>


                      {/* APPRÉCIATION */}

                      <div className="flex-1">

                        <div className="relative">

                          <MessageSquare
                            size={17}
                            className="absolute left-3 top-3 text-slate-400"
                          />

                          <input
                            type="text"
                            value={
                              appreciations[
                                eleve.id
                              ] || ''
                            }
                            onChange={(e) =>
                              changerAppreciation(
                                eleve.id,
                                e.target.value
                              )
                            }
                            placeholder="Ajouter une appréciation..."
                            className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                          />

                        </div>

                      </div>

                    </div>

                  </div>

                )

              }
            )}


            {elevesFiltres.length === 0 && (

              <div className="p-10 text-center">

                <p className="text-sm text-slate-500">
                  Aucun élève trouvé.
                </p>

              </div>

            )}

          </div>


          {/* BOUTON */}

          {eleves.length > 0 && (

            <div className="flex justify-end border-t border-slate-100 p-4 sm:p-6">

              <button
                type="button"
                onClick={enregistrerAppel}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 sm:w-auto"
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