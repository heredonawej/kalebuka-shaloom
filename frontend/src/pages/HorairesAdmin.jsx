import { useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  Save,
  Trash2,
  RefreshCw,
  Clock,
  School,
  CheckCircle2,
} from 'lucide-react'

const API_URL = 'https://kalebuka-shaloom.onrender.com/api'

const JOURS = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
]

const CRENEAUX = [
  {
    heure_debut: '07:30',
    heure_fin: '08:15',
  },
  {
    heure_debut: '08:15',
    heure_fin: '09:00',
  },
  {
    heure_debut: '09:00',
    heure_fin: '09:45',
  },
  {
    heure_debut: '10:00',
    heure_fin: '10:45',
  },
  {
    heure_debut: '10:45',
    heure_fin: '11:30',
  },
  {
    heure_debut: '11:30',
    heure_fin: '12:15',
  },
]

function HorairesAdmin() {
  const [classes, setClasses] = useState([])
  const [classeId, setClasseId] = useState('')
  const [horaires, setHoraires] = useState([])

  const [chargementClasses, setChargementClasses] =
    useState(true)

  const [chargementHoraires, setChargementHoraires] =
    useState(false)

  const [enregistrement, setEnregistrement] =
    useState(false)

  const [suppression, setSuppression] =
    useState(false)

  const [message, setMessage] = useState('')
  const [erreur, setErreur] = useState('')

  /*
   * =====================================================
   * CHARGER LES CLASSES
   * =====================================================
   */

  const chargerClasses = async () => {
    try {
      setChargementClasses(true)
      setErreur('')

      const response = await fetch(
        `${API_URL}/classes`
      )

      if (!response.ok) {
        throw new Error(
          'Impossible de récupérer les classes.'
        )
      }

      const data = await response.json()

      setClasses(Array.isArray(data) ? data : [])

      if (
        !classeId &&
        Array.isArray(data) &&
        data.length > 0
      ) {
        setClasseId(String(data[0].id))
      }
    } catch (error) {
      console.error(error)
      setErreur(error.message)
    } finally {
      setChargementClasses(false)
    }
  }

  useEffect(() => {
    chargerClasses()
  }, [])

  /*
   * =====================================================
   * CHARGER L'EMPLOI DU TEMPS DE LA CLASSE
   * =====================================================
   */

  const chargerHoraires = async () => {
    if (!classeId) {
      setHoraires([])
      return
    }

    try {
      setChargementHoraires(true)
      setErreur('')
      setMessage('')

      const response = await fetch(
        `${API_URL}/horaires/classe/${classeId}`
      )

      if (!response.ok) {
        throw new Error(
          "Impossible de récupérer l'emploi du temps."
        )
      }

      const data = await response.json()

      setHoraires(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error(error)
      setErreur(error.message)
      setHoraires([])
    } finally {
      setChargementHoraires(false)
    }
  }

  useEffect(() => {
    chargerHoraires()
  }, [classeId])

  /*
   * =====================================================
   * CLASSE SÉLECTIONNÉE
   * =====================================================
   */

  const classeSelectionnee = useMemo(() => {
    return classes.find(
      (classe) => String(classe.id) === String(classeId)
    )
  }, [classes, classeId])

  /*
   * =====================================================
   * TROUVER UNE MATIÈRE DANS LA GRILLE
   * =====================================================
   */

  const trouverHoraire = (jour, creneau) => {
    return horaires.find(
      (horaire) =>
        horaire.jour === jour &&
        horaire.heure_debut === creneau.heure_debut &&
        horaire.heure_fin === creneau.heure_fin
    )
  }

  /*
   * =====================================================
   * MODIFIER UNE CASE
   * =====================================================
   */

  const modifierMatiere = (
    jour,
    creneau,
    nouvelleMatiere
  ) => {
    const matiere = nouvelleMatiere.trim()

    setHoraires((anciensHoraires) => {
      const index = anciensHoraires.findIndex(
        (horaire) =>
          horaire.jour === jour &&
          horaire.heure_debut ===
            creneau.heure_debut &&
          horaire.heure_fin === creneau.heure_fin
      )

      if (index !== -1) {
        const nouveauxHoraires = [...anciensHoraires]

        if (matiere) {
          nouveauxHoraires[index] = {
            ...nouveauxHoraires[index],
            matiere,
          }
        } else {
          nouveauxHoraires.splice(index, 1)
        }

        return nouveauxHoraires
      }

      if (!matiere) {
        return anciensHoraires
      }

      return [
        ...anciensHoraires,
        {
          classe_id: Number(classeId),
          jour,
          heure_debut: creneau.heure_debut,
          heure_fin: creneau.heure_fin,
          matiere,
        },
      ]
    })
  }

  /*
   * =====================================================
   * ENREGISTRER / MODIFIER
   * =====================================================
   */

  const enregistrerHoraire = async () => {
    if (!classeId) {
      setErreur('Veuillez sélectionner une classe.')
      return
    }

    try {
      setEnregistrement(true)
      setErreur('')
      setMessage('')

      const horairesAEnvoyer = horaires.map(
        (horaire) => ({
          jour: horaire.jour,
          heure_debut: horaire.heure_debut,
          heure_fin: horaire.heure_fin,
          matiere: horaire.matiere,
        })
      )

      const response = await fetch(
        `${API_URL}/horaires/grille`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            classe_id: Number(classeId),
            horaires: horairesAEnvoyer,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.erreur ||
            "Impossible d'enregistrer l'emploi du temps."
        )
      }

      setMessage(
        "L'emploi du temps a été enregistré avec succès."
      )

      await chargerHoraires()

      setTimeout(() => {
        setMessage('')
      }, 3500)
    } catch (error) {
      console.error(error)
      setErreur(error.message)
    } finally {
      setEnregistrement(false)
    }
  }

  /*
   * =====================================================
   * SUPPRIMER L'EMPLOI DU TEMPS
   * =====================================================
   */

  const supprimerHoraire = async () => {
    if (!classeId) return

    const confirmation = window.confirm(
      `Voulez-vous vraiment supprimer tout l'emploi du temps de la classe "${classeSelectionnee?.nom || ''}" ?`
    )

    if (!confirmation) return

    try {
      setSuppression(true)
      setErreur('')
      setMessage('')

      const response = await fetch(
        `${API_URL}/horaires/classe/${classeId}`,
        {
          method: 'DELETE',
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.erreur ||
            "Impossible de supprimer l'emploi du temps."
        )
      }

      setHoraires([])

      setMessage(
        "L'emploi du temps a été supprimé avec succès."
      )

      setTimeout(() => {
        setMessage('')
      }, 3500)
    } catch (error) {
      console.error(error)
      setErreur(error.message)
    } finally {
      setSuppression(false)
    }
  }

  /*
   * =====================================================
   * ACTUALISER
   * =====================================================
   */

  const actualiser = async () => {
    await chargerClasses()

    if (classeId) {
      await chargerHoraires()
    }
  }

  /*
   * =====================================================
   * AFFICHAGE
   * =====================================================
   */

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">

      <div className="mx-auto max-w-7xl">

        {/* =================================================
            EN-TÊTE
        ================================================= */}

        <div className="mb-6 rounded-3xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 p-6 text-white shadow-xl">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                <CalendarDays size={29} />
              </div>

              <div>
                <h1 className="text-2xl font-bold md:text-3xl">
                  Emploi du temps
                </h1>

                <p className="mt-1 text-sm text-blue-100">
                  Gérez les horaires de chaque classe.
                </p>
              </div>

            </div>

            <button
              type="button"
              onClick={actualiser}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-blue-600 shadow-lg transition hover:bg-blue-50"
            >
              <RefreshCw size={18} />
              Actualiser
            </button>

          </div>

        </div>

        {/* =================================================
            MESSAGES
        ================================================= */}

        {message && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">

            <CheckCircle2
              size={20}
              className="shrink-0"
            />

            {message}

          </div>
        )}

        {erreur && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {erreur}
          </div>
        )}

        {/* =================================================
            SÉLECTION DE LA CLASSE
        ================================================= */}

        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

            <div className="flex-1">

              <label className="mb-2 block text-sm font-bold text-slate-700">
                Sélectionner une classe
              </label>

              <div className="relative">

                <School
                  size={19}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  value={classeId}
                  onChange={(e) =>
                    setClasseId(e.target.value)
                  }
                  disabled={chargementClasses}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-10 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                >

                  {classes.length === 0 ? (
                    <option value="">
                      Aucune classe disponible
                    </option>
                  ) : (
                    classes.map((classe) => (
                      <option
                        key={classe.id}
                        value={classe.id}
                      >
                        {classe.nom}
                        {classe.section
                          ? ` — ${classe.section}`
                          : ''}
                      </option>
                    ))
                  )}

                </select>

              </div>

            </div>

            {classeSelectionnee && (
              <div className="rounded-2xl bg-blue-50 px-5 py-3">

                <p className="text-xs font-semibold text-blue-500">
                  Classe sélectionnée
                </p>

                <p className="mt-1 font-bold text-blue-700">
                  {classeSelectionnee.nom}
                </p>

              </div>
            )}

          </div>

        </div>

        {/* =================================================
            EMPLOI DU TEMPS
        ================================================= */}

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          {/* TITRE */}
          <div className="border-b border-slate-100 p-5 md:p-6">

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Clock size={21} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    {classeSelectionnee?.nom ||
                      'Emploi du temps'}
                  </h2>

                  <p className="text-xs text-slate-500">
                    07:30 — 12:15
                  </p>
                </div>

              </div>

              <div className="flex flex-col gap-2 sm:flex-row">

                <button
                  type="button"
                  onClick={supprimerHoraire}
                  disabled={
                    suppression ||
                    chargementHoraires ||
                    !classeId
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 size={17} />

                  {suppression
                    ? 'Suppression...'
                    : 'Supprimer'}
                </button>

                <button
                  type="button"
                  onClick={enregistrerHoraire}
                  disabled={
                    enregistrement ||
                    chargementHoraires ||
                    !classeId
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save size={17} />

                  {enregistrement
                    ? 'Enregistrement...'
                    : 'Enregistrer'}
                </button>

              </div>

            </div>

          </div>

          {/* GRILLE */}
          {chargementHoraires ? (
            <div className="p-12 text-center">

              <RefreshCw
                size={28}
                className="mx-auto animate-spin text-blue-500"
              />

              <p className="mt-3 text-sm text-slate-500">
                Chargement de l'emploi du temps...
              </p>

            </div>
          ) : !classeId ? (
            <div className="p-12 text-center text-sm text-slate-500">
              Sélectionnez une classe pour afficher son emploi
              du temps.
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[1000px] border-collapse">

                <thead>

                  <tr>

                    <th className="sticky left-0 z-10 w-32 border-b border-r border-slate-200 bg-slate-50 px-3 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Horaire
                    </th>

                    {JOURS.map((jour) => (
                      <th
                        key={jour}
                        className="border-b border-r border-slate-200 bg-slate-50 px-3 py-4 text-center text-xs font-bold uppercase tracking-wide text-slate-600"
                      >
                        {jour}
                      </th>
                    ))}

                  </tr>

                </thead>

                <tbody>

                  {CRENEAUX.slice(0, 3).map(
                    (creneau) => (
                      <tr key={`${creneau.heure_debut}-${creneau.heure_fin}`}>

                        <td className="sticky left-0 z-10 border-b border-r border-slate-200 bg-white px-3 py-3">

                          <div className="text-xs font-bold text-slate-700">
                            {creneau.heure_debut}
                          </div>

                          <div className="text-[11px] text-slate-400">
                            {creneau.heure_fin}
                          </div>

                        </td>

                        {JOURS.map((jour) => {
                          const horaire =
                            trouverHoraire(
                              jour,
                              creneau
                            )

                          return (
                            <td
                              key={`${jour}-${creneau.heure_debut}`}
                              className="border-b border-r border-slate-200 bg-white p-2"
                            >

                              <input
                                type="text"
                                value={
                                  horaire?.matiere || ''
                                }
                                onChange={(e) =>
                                  modifierMatiere(
                                    jour,
                                    creneau,
                                    e.target.value
                                  )
                                }
                                placeholder="Matière..."
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-center text-xs font-semibold text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                              />

                            </td>
                          )
                        })}

                      </tr>
                    )
                  )}

                  {/* RÉCRÉATION */}

                  <tr>

                    <td className="sticky left-0 z-10 border-b border-r border-slate-200 bg-amber-50 px-3 py-4">

                      <div className="text-xs font-bold text-amber-700">
                        09:45
                      </div>

                      <div className="text-[11px] text-amber-500">
                        10:00
                      </div>

                    </td>

                    {JOURS.map((jour) => (
                      <td
                        key={`recreation-${jour}`}
                        className="border-b border-r border-slate-200 bg-amber-50 px-3 py-4 text-center"
                      >
                        <span className="text-xs font-bold text-amber-600">
                          Récréation
                        </span>
                      </td>
                    ))}

                  </tr>

                  {/* APRÈS RÉCRÉATION */}

                  {CRENEAUX.slice(3).map(
                    (creneau) => (
                      <tr key={`${creneau.heure_debut}-${creneau.heure_fin}`}>

                        <td className="sticky left-0 z-10 border-b border-r border-slate-200 bg-white px-3 py-3">

                          <div className="text-xs font-bold text-slate-700">
                            {creneau.heure_debut}
                          </div>

                          <div className="text-[11px] text-slate-400">
                            {creneau.heure_fin}
                          </div>

                        </td>

                        {JOURS.map((jour) => {
                          const horaire =
                            trouverHoraire(
                              jour,
                              creneau
                            )

                          return (
                            <td
                              key={`${jour}-${creneau.heure_debut}`}
                              className="border-b border-r border-slate-200 bg-white p-2"
                            >

                              <input
                                type="text"
                                value={
                                  horaire?.matiere || ''
                                }
                                onChange={(e) =>
                                  modifierMatiere(
                                    jour,
                                    creneau,
                                    e.target.value
                                  )
                                }
                                placeholder="Matière..."
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-center text-xs font-semibold text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                              />

                            </td>
                          )
                        })}

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

          {/* PIED */}
          <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">

            <div className="flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">

              <p>
                Les modifications sont enregistrées
                uniquement après avoir cliqué sur
                <strong className="mx-1 text-slate-700">
                  Enregistrer
                </strong>.
              </p>

              <p className="font-semibold text-blue-600">
                6 créneaux × 6 jours
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}

export default HorairesAdmin