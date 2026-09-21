import { useEffect, useMemo, useState } from 'react'
import {
  BookOpen,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Save,
  RefreshCw,
} from 'lucide-react'

const API_URL = 'https://kalebuka-shaloom.onrender.com/api'

const SECTIONS = [
  {
    nom: 'Maternelle',
    description: 'Matières de la maternelle',
  },
  {
    nom: 'Primaire',
    description: 'Matières du primaire',
  },
  {
    nom: 'Secondaire',
    description: 'Matières du secondaire',
  },
]

function MatieresAdmin() {
  const [matieres, setMatieres] = useState([])
  const [sectionActive, setSectionActive] = useState('Maternelle')
  const [recherche, setRecherche] = useState('')
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState('')
  const [message, setMessage] = useState('')

  const [modalOuverte, setModalOuverte] = useState(false)
  const [matiereEnModification, setMatiereEnModification] =
    useState(null)

  const [nom, setNom] = useState('')
  const [sectionFormulaire, setSectionFormulaire] =
    useState('Maternelle')

  /*
   * =====================================================
   * CHARGER LES MATIÈRES
   * =====================================================
   */

  const chargerMatieres = async () => {
    try {
      setChargement(true)
      setErreur('')

      const response = await fetch(`${API_URL}/matieres`)

      if (!response.ok) {
        throw new Error(
          'Impossible de récupérer les matières.'
        )
      }

      const data = await response.json()

      setMatieres(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error(error)
      setErreur(error.message)
    } finally {
      setChargement(false)
    }
  }

  useEffect(() => {
    chargerMatieres()
  }, [])

  /*
   * =====================================================
   * FILTRAGE
   * =====================================================
   */

  const matieresFiltrees = useMemo(() => {
    return matieres.filter((matiere) => {
      const correspondSection =
        matiere.section === sectionActive

      const correspondRecherche =
        matiere.nom
          .toLowerCase()
          .includes(recherche.toLowerCase())

      return correspondSection && correspondRecherche
    })
  }, [matieres, sectionActive, recherche])

  /*
   * =====================================================
   * OUVRIR AJOUT
   * =====================================================
   */

  const ouvrirAjout = () => {
    setMatiereEnModification(null)
    setNom('')
    setSectionFormulaire(sectionActive)
    setErreur('')
    setModalOuverte(true)
  }

  /*
   * =====================================================
   * OUVRIR MODIFICATION
   * =====================================================
   */

  const ouvrirModification = (matiere) => {
    setMatiereEnModification(matiere)
    setNom(matiere.nom)
    setSectionFormulaire(matiere.section)
    setErreur('')
    setModalOuverte(true)
  }

  /*
   * =====================================================
   * FERMER MODAL
   * =====================================================
   */

  const fermerModal = () => {
    setModalOuverte(false)
    setMatiereEnModification(null)
    setNom('')
  }

  /*
   * =====================================================
   * ENREGISTRER
   * =====================================================
   */

  const enregistrer = async (e) => {
    e.preventDefault()

    if (!nom.trim()) {
      setErreur('Veuillez saisir le nom de la matière.')
      return
    }

    try {
      setErreur('')
      setMessage('')

      const modification = Boolean(
        matiereEnModification
      )

      const url = modification
        ? `${API_URL}/matieres/${matiereEnModification.id}`
        : `${API_URL}/matieres`

      const response = await fetch(url, {
        method: modification ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nom: nom.trim(),
          section: sectionFormulaire,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.erreur ||
            "Impossible d'enregistrer la matière."
        )
      }

      fermerModal()
      await chargerMatieres()

      setSectionActive(sectionFormulaire)

      setMessage(
        modification
          ? 'Matière modifiée avec succès.'
          : 'Matière ajoutée avec succès.'
      )

      setTimeout(() => {
        setMessage('')
      }, 3000)
    } catch (error) {
      console.error(error)
      setErreur(error.message)
    }
  }

  /*
   * =====================================================
   * SUPPRIMER
   * =====================================================
   */

  const supprimer = async (matiere) => {
    const confirmation = window.confirm(
      `Voulez-vous vraiment supprimer la matière "${matiere.nom}" ?`
    )

    if (!confirmation) return

    try {
      setErreur('')
      setMessage('')

      const response = await fetch(
        `${API_URL}/matieres/${matiere.id}`,
        {
          method: 'DELETE',
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.erreur ||
            'Impossible de supprimer la matière.'
        )
      }

      await chargerMatieres()

      setMessage('Matière supprimée avec succès.')

      setTimeout(() => {
        setMessage('')
      }, 3000)
    } catch (error) {
      console.error(error)
      setErreur(error.message)
    }
  }

  /*
   * =====================================================
   * COMPTEURS
   * =====================================================
   */

  const nombreParSection = (section) =>
    matieres.filter(
      (matiere) => matiere.section === section
    ).length

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
                <BookOpen size={28} />
              </div>

              <div>
                <h1 className="text-2xl font-bold md:text-3xl">
                  Matières
                </h1>

                <p className="mt-1 text-sm text-blue-100">
                  Gérez les matières enseignées dans l'école.
                </p>
              </div>

            </div>

            <button
              type="button"
              onClick={ouvrirAjout}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-blue-600 shadow-lg transition hover:bg-blue-50"
            >
              <Plus size={19} />
              Ajouter une matière
            </button>

          </div>

        </div>

        {/* =================================================
            MESSAGES
        ================================================= */}

        {message && (
          <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
            {message}
          </div>
        )}

        {erreur && !modalOuverte && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {erreur}
          </div>
        )}

        {/* =================================================
            SECTIONS
        ================================================= */}

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">

          {SECTIONS.map((section) => {
            const active =
              sectionActive === section.nom

            return (
              <button
                key={section.nom}
                type="button"
                onClick={() =>
                  setSectionActive(section.nom)
                }
                className={`rounded-2xl border p-5 text-left transition ${
                  active
                    ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-500/10'
                    : 'border-slate-200 bg-white hover:border-blue-200 hover:shadow-sm'
                }`}
              >

                <div className="flex items-center justify-between">

                  <div>
                    <p
                      className={`text-lg font-bold ${
                        active
                          ? 'text-blue-700'
                          : 'text-slate-800'
                      }`}
                    >
                      {section.nom}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {section.description}
                    </p>
                  </div>

                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold ${
                      active
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {nombreParSection(section.nom)}
                  </div>

                </div>

              </button>
            )
          })}

        </div>

        {/* =================================================
            LISTE
        ================================================= */}

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          {/* BARRE */}
          <div className="border-b border-slate-100 p-4 md:p-6">

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Matières — {sectionActive}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {matieresFiltrees.length} matière(s)
                </p>
              </div>

              <div className="flex gap-2">

                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={recherche}
                    onChange={(e) =>
                      setRecherche(e.target.value)
                    }
                    placeholder="Rechercher..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 md:w-64"
                  />
                </div>

                <button
                  type="button"
                  onClick={chargerMatieres}
                  disabled={chargement}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                  title="Actualiser"
                >
                  <RefreshCw
                    size={18}
                    className={
                      chargement
                        ? 'animate-spin'
                        : ''
                    }
                  />
                </button>

              </div>

            </div>

          </div>

          {/* CONTENU */}
          {chargement ? (
            <div className="p-12 text-center">
              <RefreshCw
                size={28}
                className="mx-auto animate-spin text-blue-500"
              />

              <p className="mt-3 text-sm text-slate-500">
                Chargement des matières...
              </p>
            </div>
          ) : matieresFiltrees.length === 0 ? (
            <div className="p-12 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <BookOpen size={30} />
              </div>

              <h3 className="mt-4 font-bold text-slate-700">
                Aucune matière
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Aucune matière n'est encore enregistrée
                pour cette section.
              </p>

              <button
                type="button"
                onClick={ouvrirAjout}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <Plus size={17} />
                Ajouter une matière
              </button>

            </div>
          ) : (

            <>
              {/* MOBILE */}
              <div className="divide-y divide-slate-100 md:hidden">

                {matieresFiltrees.map((matiere) => (
                  <div
                    key={matiere.id}
                    className="p-4"
                  >

                    <div className="flex items-center justify-between gap-3">

                      <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <BookOpen size={19} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-800">
                            {matiere.nom}
                          </p>

                          <p className="text-xs text-slate-400">
                            {matiere.section}
                          </p>
                        </div>

                      </div>

                      <div className="flex shrink-0 gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            ouvrirModification(matiere)
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            supprimer(matiere)
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100"
                        >
                          <Trash2 size={16} />
                        </button>

                      </div>

                    </div>

                  </div>
                ))}

              </div>

              {/* DESKTOP */}
              <div className="hidden overflow-x-auto md:block">

                <table className="w-full">

                  <thead>
                    <tr className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">

                      <th className="px-6 py-4">
                        #
                      </th>

                      <th className="px-6 py-4">
                        Matière
                      </th>

                      <th className="px-6 py-4">
                        Section
                      </th>

                      <th className="px-6 py-4 text-right">
                        Actions
                      </th>

                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {matieresFiltrees.map(
                      (matiere, index) => (
                        <tr
                          key={matiere.id}
                          className="transition hover:bg-slate-50"
                        >

                          <td className="px-6 py-4 text-sm font-semibold text-slate-400">
                            {index + 1}
                          </td>

                          <td className="px-6 py-4">

                            <div className="flex items-center gap-3">

                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <BookOpen size={18} />
                              </div>

                              <span className="font-semibold text-slate-800">
                                {matiere.nom}
                              </span>

                            </div>

                          </td>

                          <td className="px-6 py-4">

                            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                              {matiere.section}
                            </span>

                          </td>

                          <td className="px-6 py-4">

                            <div className="flex justify-end gap-2">

                              <button
                                type="button"
                                onClick={() =>
                                  ouvrirModification(
                                    matiere
                                  )
                                }
                                className="flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-100"
                              >
                                <Pencil size={15} />
                                Modifier
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  supprimer(matiere)
                                }
                                className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100"
                              >
                                <Trash2 size={15} />
                                Supprimer
                              </button>

                            </div>

                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>
            </>
          )}

        </div>

      </div>

      {/* =================================================
          MODAL AJOUT / MODIFICATION
      ================================================= */}

      {modalOuverte && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl">

            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-slate-100 p-5">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {matiereEnModification
                    ? 'Modifier la matière'
                    : 'Ajouter une matière'}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Renseignez les informations de la matière.
                </p>
              </div>

              <button
                type="button"
                onClick={fermerModal}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
              >
                <X size={18} />
              </button>

            </div>

            {/* FORMULAIRE */}
            <form
              onSubmit={enregistrer}
              className="space-y-5 p-5"
            >

              {erreur && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                  {erreur}
                </div>
              )}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Nom de la matière
                </label>

                <input
                  type="text"
                  value={nom}
                  onChange={(e) =>
                    setNom(e.target.value)
                  }
                  placeholder="Ex. Mathématiques"
                  autoFocus
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Section
                </label>

                <select
                  value={sectionFormulaire}
                  onChange={(e) =>
                    setSectionFormulaire(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                >

                  <option value="Maternelle">
                    Maternelle
                  </option>

                  <option value="Primaire">
                    Primaire
                  </option>

                  <option value="Secondaire">
                    Secondaire
                  </option>

                </select>

              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={fermerModal}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                >
                  {matiereEnModification ? (
                    <>
                      <Save size={17} />
                      Enregistrer
                    </>
                  ) : (
                    <>
                      <Plus size={17} />
                      Ajouter
                    </>
                  )}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  )
}

export default MatieresAdmin