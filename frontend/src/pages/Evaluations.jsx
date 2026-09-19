import { useEffect, useMemo, useState } from 'react'
import {
  BookOpen,
  Edit3,
  GraduationCap,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from 'lucide-react'

const API_URL = 'https://kalebuka-shaloom.onrender.com/api'

const BAREMES = {
  Exercice: 10,
  Interrogation: 10,
  Devoir: 10,
  Examen: 20,
}

const TYPES_EVALUATION = Object.keys(BAREMES)

function Evaluations() {
  const [utilisateur, setUtilisateur] = useState(null)
  const [eleves, setEleves] = useState([])
  const [notes, setNotes] = useState([])

  const [eleveId, setEleveId] = useState('')
  const [matiere, setMatiere] = useState('')
  const [typeEval, setTypeEval] = useState('Exercice')
  const [valeur, setValeur] = useState('')
  const [commentaire, setCommentaire] = useState('')

  const [noteEnModification, setNoteEnModification] = useState(null)

  const [recherche, setRecherche] = useState('')
  const [filtreType, setFiltreType] = useState('Tous')

  const [chargement, setChargement] = useState(true)
  const [enregistrement, setEnregistrement] = useState(false)

  const [message, setMessage] = useState('')
  const [erreur, setErreur] = useState('')

  const baremeActuel = BAREMES[typeEval] || 10

  useEffect(() => {
    const utilisateurStocke = localStorage.getItem('utilisateur')

    if (!utilisateurStocke) {
      setChargement(false)
      return
    }

    try {
      const utilisateurConnecte = JSON.parse(utilisateurStocke)
      setUtilisateur(utilisateurConnecte)
    } catch (error) {
      console.error('Erreur utilisateur :', error)
      setChargement(false)
    }
  }, [])

  useEffect(() => {
    if (!utilisateur?.classe_id) {
      setChargement(false)
      return
    }

    chargerDonnees()
  }, [utilisateur])

  const chargerDonnees = async () => {
    setChargement(true)
    setErreur('')

    try {
      const [elevesResponse, notesResponse] = await Promise.all([
        fetch(`${API_URL}/classes/${utilisateur.classe_id}/eleves`),
        fetch(`${API_URL}/notes/classe/${utilisateur.classe_id}`),
      ])

      if (!elevesResponse.ok) {
        throw new Error('Impossible de récupérer les élèves.')
      }

      if (!notesResponse.ok) {
        throw new Error('Impossible de récupérer les notes.')
      }

      const elevesData = await elevesResponse.json()
      const notesData = await notesResponse.json()

      setEleves(Array.isArray(elevesData) ? elevesData : [])
      setNotes(Array.isArray(notesData) ? notesData : [])
    } catch (error) {
      console.error(error)
      setErreur(error.message || 'Une erreur est survenue.')
    } finally {
      setChargement(false)
    }
  }

  const elevesFiltres = useMemo(() => {
    const rechercheNormalisee = recherche.toLowerCase().trim()

    return eleves.filter((eleve) => {
      const nomComplet = `${eleve.nom || ''} ${eleve.prenom || ''}`.toLowerCase()

      return nomComplet.includes(rechercheNormalisee)
    })
  }, [eleves, recherche])

  const notesFiltrees = useMemo(() => {
    const rechercheNormalisee = recherche.toLowerCase().trim()

    return notes.filter((note) => {
      const nomComplet = `${note.nom || ''} ${note.prenom || ''}`.toLowerCase()

      const correspondRecherche =
        nomComplet.includes(rechercheNormalisee) ||
        (note.matiere || '').toLowerCase().includes(rechercheNormalisee)

      const correspondType =
        filtreType === 'Tous' || note.type_eval === filtreType

      return correspondRecherche && correspondType
    })
  }, [notes, recherche, filtreType])

  const reinitialiserFormulaire = () => {
    setEleveId('')
    setMatiere('')
    setTypeEval('Exercice')
    setValeur('')
    setCommentaire('')
    setNoteEnModification(null)
    setMessage('')
    setErreur('')
  }

  const gererChangementType = (e) => {
    const nouveauType = e.target.value
    const nouveauBareme = BAREMES[nouveauType]

    setTypeEval(nouveauType)

    // Si la note saisie dépasse le nouveau barème,
    // on la vide pour éviter une valeur incorrecte.
    if (valeur !== '' && Number(valeur) > nouveauBareme) {
      setValeur('')
    }
  }

  const enregistrerNote = async (e) => {
    e.preventDefault()

    setMessage('')
    setErreur('')

    if (!eleveId || !matiere.trim() || !typeEval || valeur === '') {
      setErreur('Veuillez remplir tous les champs obligatoires.')
      return
    }

    const noteNumerique = Number(valeur)

    if (Number.isNaN(noteNumerique)) {
      setErreur('La note doit être un nombre valide.')
      return
    }

    if (noteNumerique < 0 || noteNumerique > baremeActuel) {
      setErreur(
        `La note pour ${typeEval} doit être comprise entre 0 et ${baremeActuel}.`
      )
      return
    }

    setEnregistrement(true)

    try {
      const url = noteEnModification
        ? `${API_URL}/notes/${noteEnModification.id}`
        : `${API_URL}/notes`

      const method = noteEnModification ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eleve_id: Number(eleveId),
          matiere: matiere.trim(),
          type_eval: typeEval,
          valeur: noteNumerique,
          commentaire: commentaire.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.erreur || data.message || 'Impossible d’enregistrer la note.'
        )
      }

      setMessage(
        noteEnModification
          ? 'Note modifiée avec succès.'
          : 'Note enregistrée avec succès.'
      )

      reinitialiserFormulaire()
      await chargerDonnees()
    } catch (error) {
      console.error(error)
      setErreur(error.message || 'Une erreur est survenue.')
    } finally {
      setEnregistrement(false)
    }
  }

  const modifierNote = (note) => {
    setNoteEnModification(note)
    setEleveId(String(note.eleve_id))
    setMatiere(note.matiere || '')
    setTypeEval(note.type_eval || 'Exercice')
    setValeur(note.valeur ?? '')
    setCommentaire(note.commentaire || '')
    setMessage('')
    setErreur('')

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const supprimerNote = async (note) => {
    const confirmation = window.confirm(
      `Voulez-vous vraiment supprimer la note de ${note.prenom || ''} ${note.nom || ''} ?`
    )

    if (!confirmation) return

    setMessage('')
    setErreur('')

    try {
      const response = await fetch(`${API_URL}/notes/${note.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.erreur || data.message || 'Impossible de supprimer la note.'
        )
      }

      setMessage('Note supprimée avec succès.')
      await chargerDonnees()
    } catch (error) {
      console.error(error)
      setErreur(error.message || 'Une erreur est survenue.')
    }
  }

  const nomClasse =
    utilisateur?.classe_nom || 'Classe non définie'

  if (!utilisateur) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-slate-500">
          Utilisateur non connecté.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* EN-TÊTE */}
      <div>
        <p className="text-sm font-semibold text-blue-600">
          Évaluation scolaire
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          Évaluations et notes
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Gérez les exercices, interrogations, devoirs et examens de votre classe.
        </p>
      </div>

      {/* CLASSE */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-blue-600 p-2 text-white">
            <GraduationCap size={20} />
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
              Ma classe
            </p>

            <p className="mt-1 font-bold text-slate-900">
              {nomClasse}
            </p>

            <p className="mt-1 text-sm text-slate-600">
              Cette classe vous a été attribuée par l'administration.
            </p>
          </div>
        </div>
      </div>

      {/* MESSAGES */}
      {message && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {message}
        </div>
      )}

      {erreur && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {erreur}
        </div>
      )}

      {/* FORMULAIRE */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              {noteEnModification ? (
                <>
                  <Edit3 size={20} />
                  Modifier la note
                </>
              ) : (
                <>
                  <Plus size={20} />
                  Nouvelle évaluation
                </>
              )}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Saisissez la note selon le barème de l'évaluation.
            </p>
          </div>

          {noteEnModification && (
            <button
              type="button"
              onClick={reinitialiserFormulaire}
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <form onSubmit={enregistrerNote} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* ELEVE */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Élève *
              </label>

              <select
                value={eleveId}
                onChange={(e) => setEleveId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
              >
                <option value="">Sélectionner un élève</option>

                {eleves.map((eleve) => (
                  <option key={eleve.id} value={eleve.id}>
                    {eleve.nom} {eleve.prenom}
                  </option>
                ))}
              </select>
            </div>

            {/* MATIERE */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Matière *
              </label>

              <input
                type="text"
                value={matiere}
                onChange={(e) => setMatiere(e.target.value)}
                placeholder="Ex : Mathématiques"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
            </div>

            {/* TYPE */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Type d'évaluation *
              </label>

              <select
                value={typeEval}
                onChange={gererChangementType}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
              >
                {TYPES_EVALUATION.map((type) => (
                  <option key={type} value={type}>
                    {type} /{BAREMES[type]}
                  </option>
                ))}
              </select>
            </div>

            {/* NOTE */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Note obtenue *
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max={baremeActuel}
                  step="0.01"
                  value={valeur}
                  onChange={(e) => setValeur(e.target.value)}
                  placeholder={`0 - ${baremeActuel}`}
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />

                <div className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700">
                  / {baremeActuel}
                </div>
              </div>

              <p className="mt-1 text-xs text-slate-500">
                Barème : {typeEval} /{baremeActuel}
              </p>
            </div>
          </div>

          {/* COMMENTAIRE */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Commentaire
            </label>

            <textarea
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              rows="3"
              placeholder="Observation éventuelle..."
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          {/* ACTIONS */}
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <button
              type="submit"
              disabled={enregistrement}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={18} />

              {enregistrement
                ? 'Enregistrement...'
                : noteEnModification
                  ? 'Modifier la note'
                  : 'Enregistrer la note'}
            </button>

            {noteEnModification && (
              <button
                type="button"
                onClick={reinitialiserFormulaire}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Annuler
              </button>
            )}
          </div>
        </form>
      </div>

      {/* LISTE DES NOTES */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <BookOpen size={20} />
                Notes enregistrées
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Les notes des élèves de votre classe.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {/* RECHERCHE */}
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 sm:w-56"
                />
              </div>

              {/* FILTRE TYPE */}
              <select
                value={filtreType}
                onChange={(e) => setFiltreType(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value="Tous">Tous les types</option>

                {TYPES_EVALUATION.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {chargement ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Chargement des données...
          </div>
        ) : notesFiltrees.length === 0 ? (
          <div className="p-8 text-center">
            <BookOpen
              size={35}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 font-semibold text-slate-700">
              Aucune note trouvée
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Les notes enregistrées apparaîtront ici.
            </p>
          </div>
        ) : (
          <>
            {/* MOBILE */}
            <div className="divide-y divide-slate-100 md:hidden">
              {notesFiltrees.map((note) => {
                const bareme = BAREMES[note.type_eval] || 10

                return (
                  <div key={note.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-900">
                          {note.nom} {note.prenom}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {note.matiere}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">
                          {note.valeur}/{bareme}
                        </p>

                        <p className="text-xs text-slate-500">
                          {note.type_eval}
                        </p>
                      </div>
                    </div>

                    {note.commentaire && (
                      <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                        {note.commentaire}
                      </p>
                    )}

                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => modifierNote(note)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <Edit3 size={15} />
                        Modifier
                      </button>

                      <button
                        type="button"
                        onClick={() => supprimerNote(note)}
                        className="flex items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={15} />
                        Supprimer
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* DESKTOP */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Élève</th>
                    <th className="px-5 py-4">Matière</th>
                    <th className="px-5 py-4">Évaluation</th>
                    <th className="px-5 py-4">Note</th>
                    <th className="px-5 py-4">Commentaire</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {notesFiltrees.map((note) => {
                    const bareme = BAREMES[note.type_eval] || 10

                    return (
                      <tr
                        key={note.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-900">
                            {note.nom} {note.prenom}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {note.matiere}
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                            {note.type_eval} /{bareme}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="font-bold text-slate-900">
                            {note.valeur}/{bareme}
                          </span>
                        </td>

                        <td className="max-w-xs px-5 py-4 text-sm text-slate-500">
                          {note.commentaire || '—'}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => modifierNote(note)}
                              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-600"
                              title="Modifier"
                            >
                              <Edit3 size={17} />
                            </button>

                            <button
                              type="button"
                              onClick={() => supprimerNote(note)}
                              className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                              title="Supprimer"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Evaluations