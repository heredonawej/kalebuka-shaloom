import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { API_URL } from '../api'
import {
  ClipboardList,
  Loader2,
  Eye,
  CheckCircle2,
  XCircle,
  FileText,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react'

function PreparationsAdmin() {
  const [preparations, setPreparations] = useState([])
  const [chargement, setChargement] = useState(true)

  const [filtre, setFiltre] = useState('toutes')

  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState('')

  const [actionId, setActionId] = useState(null)

  // =====================================
  // CHARGER LES PRÉPARATIONS
  // =====================================

  useEffect(() => {
    chargerPreparations()
  }, [])

  const chargerPreparations = async () => {
    try {
      setChargement(true)
      setErreur('')

      const response = await fetch(
        `${API_URL}/api/cours`
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.erreur ||
          'Impossible de charger les préparations.'
        )
      }

      setPreparations(data)

    } catch (err) {
      console.error(err)

      setErreur(
        err.message ||
        'Impossible de charger les préparations.'
      )

    } finally {
      setChargement(false)
    }
  }

  // =====================================
  // VALIDER
  // =====================================

  const validerPreparation = async (preparation) => {
    const confirmation = window.confirm(
      `Voulez-vous valider la préparation de ${preparation.enseignant_nom} ?`
    )

    if (!confirmation) return

    try {
      setActionId(preparation.id)
      setErreur('')
      setSucces('')

      const response = await fetch(
        `${API_URL}/api/cours/${preparation.id}/valider`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.erreur ||
          'Impossible de valider la préparation.'
        )
      }

      setSucces(
        'Préparation validée avec succès.'
      )

      await chargerPreparations()

    } catch (err) {
      console.error(err)

      setErreur(
        err.message ||
        'Impossible de valider la préparation.'
      )

    } finally {
      setActionId(null)
    }
  }

  // =====================================
  // REJETER
  // =====================================

  const rejeterPreparation = async (preparation) => {
    const motif = window.prompt(
      'Veuillez indiquer le motif du rejet :'
    )

    if (!motif || !motif.trim()) {
      return
    }

    try {
      setActionId(preparation.id)
      setErreur('')
      setSucces('')

      const response = await fetch(
        `${API_URL}/api/cours/${preparation.id}/rejeter`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            motif_rejet: motif.trim(),
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.erreur ||
          'Impossible de rejeter la préparation.'
        )
      }

      setSucces(
        'Préparation rejetée.'
      )

      await chargerPreparations()

    } catch (err) {
      console.error(err)

      setErreur(
        err.message ||
        'Impossible de rejeter la préparation.'
      )

    } finally {
      setActionId(null)
    }
  }

  // =====================================
  // FILTRAGE
  // =====================================

  const preparationsFiltrees =
    preparations.filter((preparation) => {

      if (filtre === 'toutes') {
        return true
      }

      return preparation.statut === filtre
    })

  // =====================================
  // COMPTEURS
  // =====================================

  const total = preparations.length

  const soumises = preparations.filter(
    (p) => p.statut === 'soumis'
  ).length

  const validees = preparations.filter(
    (p) => p.statut === 'valide'
  ).length

  const rejetees = preparations.filter(
    (p) => p.statut === 'rejete'
  ).length

  return (
    <div className="space-y-5 sm:space-y-6">

      {/* =================================
          EN-TÊTE
      ================================= */}

      <div>

        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium mb-4"
        >
          <ArrowLeft size={17} />
          Retour au tableau de bord
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div>

            <p className="text-sm font-medium text-indigo-600">
              Administration
            </p>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Gestion des préparations
            </h1>

            <p className="text-sm text-slate-500 mt-2">
              Vérifiez, validez ou rejetez les préparations des enseignants.
            </p>

          </div>

          <button
            type="button"
            onClick={chargerPreparations}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-sm font-semibold transition"
          >
            <RefreshCw size={17} />
            Actualiser
          </button>

        </div>

      </div>


      {/* =================================
          MESSAGES
      ================================= */}

      {erreur && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          <XCircle size={19} className="shrink-0" />
          <span>{erreur}</span>
        </div>
      )}

      {succes && (
        <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm">
          <CheckCircle2 size={19} className="shrink-0" />
          <span>{succes}</span>
        </div>
      )}


      {/* =================================
          STATISTIQUES
      ================================= */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">

        <button
          type="button"
          onClick={() => setFiltre('toutes')}
          className={`text-left bg-white border rounded-2xl p-4 transition ${
            filtre === 'toutes'
              ? 'border-indigo-400 ring-2 ring-indigo-100'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <p className="text-xs text-slate-500">
            Toutes
          </p>

          <p className="text-2xl font-bold text-slate-900 mt-1">
            {total}
          </p>
        </button>


        <button
          type="button"
          onClick={() => setFiltre('soumis')}
          className={`text-left bg-white border rounded-2xl p-4 transition ${
            filtre === 'soumis'
              ? 'border-amber-400 ring-2 ring-amber-100'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <p className="text-xs text-slate-500">
            À vérifier
          </p>

          <p className="text-2xl font-bold text-amber-600 mt-1">
            {soumises}
          </p>
        </button>


        <button
          type="button"
          onClick={() => setFiltre('valide')}
          className={`text-left bg-white border rounded-2xl p-4 transition ${
            filtre === 'valide'
              ? 'border-emerald-400 ring-2 ring-emerald-100'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <p className="text-xs text-slate-500">
            Validées
          </p>

          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {validees}
          </p>
        </button>


        <button
          type="button"
          onClick={() => setFiltre('rejete')}
          className={`text-left bg-white border rounded-2xl p-4 transition ${
            filtre === 'rejete'
              ? 'border-red-400 ring-2 ring-red-100'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <p className="text-xs text-slate-500">
            Rejetées
          </p>

          <p className="text-2xl font-bold text-red-600 mt-1">
            {rejetees}
          </p>
        </button>

      </div>


      {/* =================================
          LISTE
      ================================= */}

      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

        <div className="px-4 sm:px-5 py-4 border-b border-slate-200 flex items-center gap-3">

          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <ClipboardList size={20} />
          </div>

          <div>

            <h2 className="font-bold text-slate-900">
              Préparations
            </h2>

            <p className="text-xs text-slate-500">
              {preparationsFiltrees.length} préparation(s)
            </p>

          </div>

        </div>


        {chargement ? (

          <div className="py-14 flex items-center justify-center text-slate-500">

            <Loader2
              size={22}
              className="animate-spin mr-2"
            />

            Chargement...

          </div>

        ) : preparationsFiltrees.length === 0 ? (

          <div className="py-14 text-center">

            <ClipboardList
              size={40}
              className="mx-auto text-slate-300"
            />

            <p className="text-slate-500 mt-3 text-sm">
              Aucune préparation dans cette catégorie.
            </p>

          </div>

        ) : (

          <div className="divide-y divide-slate-100">

            {preparationsFiltrees.map((preparation) => (

              <div
                key={preparation.id}
                className="p-4 sm:p-5 hover:bg-slate-50 transition"
              >

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                  {/* INFORMATIONS */}

                  <div className="min-w-0">

                    <div className="flex flex-wrap items-center gap-2">

                      <h3 className="font-bold text-slate-900">
                        {preparation.sujet || preparation.titre || 'Sans sujet'}
                      </h3>

                      {preparation.statut === 'soumis' && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">
                          À vérifier
                        </span>
                      )}

                      {preparation.statut === 'valide' && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                          Validée
                        </span>
                      )}

                      {preparation.statut === 'rejete' && (
                        <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-semibold">
                          Rejetée
                        </span>
                      )}

                      {preparation.statut === 'brouillon' && (
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                          Brouillon
                        </span>
                      )}

                    </div>


                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">

                      <div>

                        <p className="text-xs text-slate-400">
                          Enseignant
                        </p>

                        <p className="text-sm font-medium text-slate-700 mt-1">
                          {preparation.enseignant_nom || 'Non renseigné'}
                        </p>

                      </div>


                      <div>

                        <p className="text-xs text-slate-400">
                          Classe
                        </p>

                        <p className="text-sm font-medium text-slate-700 mt-1">
                          {preparation.classe_nom || 'Non affectée'}
                        </p>

                      </div>


                      <div>

                        <p className="text-xs text-slate-400">
                          Branche
                        </p>

                        <p className="text-sm font-medium text-slate-700 mt-1">
                          {preparation.branche || 'Non renseignée'}
                        </p>

                      </div>

                    </div>


                    {preparation.motif_rejet && (
                      <div className="mt-3 bg-red-50 border border-red-100 rounded-xl px-3 py-2">

                        <p className="text-xs font-semibold text-red-700">
                          Motif du rejet
                        </p>

                        <p className="text-xs text-red-600 mt-1">
                          {preparation.motif_rejet}
                        </p>

                      </div>
                    )}

                  </div>


                  {/* ACTIONS */}

                  <div className="flex flex-wrap gap-2 shrink-0">

                    <Link
                      to={`/admin/preparations/${preparation.id}`}
                      className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition"
                    >
                      <Eye size={16} />
                      Consulter
                    </Link>


                    {preparation.statut === 'soumis' && (

                      <>
                        <button
                          type="button"
                          disabled={
                            actionId === preparation.id
                          }
                          onClick={() =>
                            rejeterPreparation(
                              preparation
                            )
                          }
                          className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 text-xs font-semibold transition"
                        >

                          <XCircle size={16} />

                          Rejeter

                        </button>


                        <button
                          type="button"
                          disabled={
                            actionId === preparation.id
                          }
                          onClick={() =>
                            validerPreparation(
                              preparation
                            )
                          }
                          className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 disabled:opacity-50 text-xs font-semibold transition"
                        >

                          {actionId === preparation.id ? (

                            <Loader2
                              size={16}
                              className="animate-spin"
                            />

                          ) : (

                            <CheckCircle2 size={16} />

                          )}

                          Valider

                        </button>

                      </>

                    )}


                    {preparation.statut === 'valide' && (

                      <Link
                        to={`/admin/preparations/${preparation.id}`}
                        className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-semibold transition"
                      >
                        <FileText size={16} />
                        PDF
                      </Link>

                    )}

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </section>

    </div>
  )
}

export default PreparationsAdmin