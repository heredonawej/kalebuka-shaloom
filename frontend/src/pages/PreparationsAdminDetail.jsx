import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  genererPDF,
  genererWord,
} from '../utils/genererDocuments'
import { API_URL } from '../api'
import {
  ArrowLeft,
  ClipboardList,
  Loader2,
  CheckCircle2,
  XCircle,
  Printer,
  Calendar,
  Clock,
  User,
  School,
  BookOpen,
  Download,
  FileText,
} from 'lucide-react'

function PreparationsAdminDetail() {

  const { id } = useParams()

  const [preparation, setPreparation] = useState(null)

  const [chargement, setChargement] = useState(true)

  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState('')

  const [action, setAction] = useState(false)


  // =====================================
  // CHARGER LA PRÉPARATION
  // =====================================

  useEffect(() => {
    chargerPreparation()
  }, [id])


  const chargerPreparation = async () => {

    try {

      setChargement(true)
      setErreur('')

      const response = await fetch(
        `${API_URL}/api/cours/${id}`
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.erreur ||
          'Impossible de charger la préparation.'
        )
      }

      setPreparation(data)

    } catch (err) {

      console.error(err)

      setErreur(
        err.message ||
        'Impossible de charger la préparation.'
      )

    } finally {

      setChargement(false)

    }
  }


  // =====================================
  // VALIDER
  // =====================================

  const validerPreparation = async () => {

    const confirmation = window.confirm(
      'Voulez-vous vraiment valider cette préparation ?'
    )

    if (!confirmation) {
      return
    }

    try {

      setAction(true)
      setErreur('')
      setSucces('')

      const response = await fetch(
        `${API_URL}/api/cours/${id}/valider`,
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

      setPreparation(data.preparation)

    } catch (err) {

      console.error(err)

      setErreur(
        err.message ||
        'Impossible de valider la préparation.'
      )

    } finally {

      setAction(false)

    }
  }


  // =====================================
  // REJETER
  // =====================================

  const rejeterPreparation = async () => {

    const motif = window.prompt(
      'Veuillez saisir le motif du rejet :'
    )

    if (!motif || !motif.trim()) {
      return
    }

    try {

      setAction(true)
      setErreur('')
      setSucces('')

      const response = await fetch(
        `${API_URL}/api/cours/${id}/rejeter`,
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

      setPreparation(data.preparation)

    } catch (err) {

      console.error(err)

      setErreur(
        err.message ||
        'Impossible de rejeter la préparation.'
      )

    } finally {

      setAction(false)

    }
  }


  // =====================================
  // IMPRIMER / PDF
  // =====================================

  const telechargerPDF = () => {
  try {
    setErreur('')
    setSucces('')

    genererPDF(preparation)

    setSucces(
      'Le fichier PDF a été téléchargé avec succès.'
    )

  } catch (err) {

    console.error(err)

    setErreur(
      err.message ||
      'Impossible de générer le PDF.'
    )
  }
}


const telechargerWord = async () => {

  try {

    setErreur('')
    setSucces('')

    await genererWord(preparation)

    setSucces(
      'Le document Word a été téléchargé avec succès.'
    )

  } catch (err) {

    console.error(err)

    setErreur(
      err.message ||
      'Impossible de générer le document Word.'
    )
  }
}


  // =====================================
  // CHARGEMENT
  // =====================================

  if (chargement) {

    return (

      <div className="py-20 flex items-center justify-center text-slate-500">

        <Loader2
          size={25}
          className="animate-spin mr-2"
        />

        Chargement de la préparation...

      </div>

    )
  }


  // =====================================
  // ERREUR SANS PRÉPARATION
  // =====================================

  if (!preparation) {

    return (

      <div className="space-y-5">

        <Link
          to="/admin/preparations"
          className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          <ArrowLeft size={17} />
          Retour aux préparations
        </Link>

        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6">
          {erreur || 'Préparation introuvable.'}
        </div>

      </div>

    )
  }


  return (

    <div className="space-y-5 sm:space-y-6">

      {/* =================================
          NAVIGATION
      ================================= */}

      <div className="print:hidden">

        <Link
          to="/admin/preparations"
          className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          <ArrowLeft size={17} />
          Retour aux préparations
        </Link>

      </div>


      {/* =================================
          MESSAGES
      ================================= */}

      {erreur && (

        <div className="print:hidden flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">

          <XCircle
            size={19}
            className="shrink-0"
          />

          <span>
            {erreur}
          </span>

        </div>

      )}


      {succes && (

        <div className="print:hidden flex items-start gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm">

          <CheckCircle2
            size={19}
            className="shrink-0"
          />

          <span>
            {succes}
          </span>

        </div>

      )}


      {/* =================================
          EN-TÊTE DE LA PRÉPARATION
      ================================= */}

      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

        <div className="p-5 sm:p-6">

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">

            <div>

              <div className="flex items-center gap-3">

                <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">

                  <ClipboardList size={22} />

                </div>

                <div>

                  <p className="text-xs text-indigo-600 font-medium">
                    Préparation de leçon
                  </p>

                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                    {preparation.sujet || preparation.titre || 'Sans sujet'}
                  </h1>

                </div>

              </div>

            </div>


            {/* STATUT */}

            <div>

              {preparation.statut === 'soumis' && (

                <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 text-amber-700 text-sm font-semibold">

                  <Clock size={16} />

                  À vérifier

                </span>

              )}


              {preparation.statut === 'valide' && (

                <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-semibold">

                  <CheckCircle2 size={16} />

                  Validée

                </span>

              )}


              {preparation.statut === 'rejete' && (

                <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 text-red-700 text-sm font-semibold">

                  <XCircle size={16} />

                  Rejetée

                </span>

              )}


              {preparation.statut === 'brouillon' && (

                <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold">

                  Brouillon

                </span>

              )}

            </div>

          </div>


          {/* =================================
              INFORMATIONS PRINCIPALES
          ================================= */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">

            <div className="bg-slate-50 rounded-xl p-4">

              <div className="flex items-center gap-2 text-slate-400">

                <User size={16} />

                <span className="text-xs">
                  Enseignant
                </span>

              </div>

              <p className="font-semibold text-slate-900 mt-2">
                {preparation.enseignant_nom || 'Non renseigné'}
              </p>

            </div>


            <div className="bg-slate-50 rounded-xl p-4">

              <div className="flex items-center gap-2 text-slate-400">

                <School size={16} />

                <span className="text-xs">
                  Classe
                </span>

              </div>

              <p className="font-semibold text-slate-900 mt-2">
                {preparation.classe_nom || 'Non affectée'}
              </p>

              <p className="text-xs text-slate-500 mt-1">
                {preparation.section || ''}
              </p>

            </div>


            <div className="bg-slate-50 rounded-xl p-4">

              <div className="flex items-center gap-2 text-slate-400">

                <Calendar size={16} />

                <span className="text-xs">
                  Date
                </span>

              </div>

              <p className="font-semibold text-slate-900 mt-2">
                {preparation.date_lecon || 'Non renseignée'}
              </p>

            </div>


            <div className="bg-slate-50 rounded-xl p-4">

              <div className="flex items-center gap-2 text-slate-400">

                <Clock size={16} />

                <span className="text-xs">
                  Heure
                </span>

              </div>

              <p className="font-semibold text-slate-900 mt-2">

                {preparation.heure_debut || '--:--'}

                {' - '}

                {preparation.heure_fin || '--:--'}

              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =================================
          INFORMATIONS PÉDAGOGIQUES
      ================================= */}

      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6">

        <div className="flex items-center gap-3 mb-5">

          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">

            <BookOpen size={20} />

          </div>

          <div>

            <h2 className="font-bold text-slate-900">
              Informations pédagogiques
            </h2>

            <p className="text-xs text-slate-500">
              Informations générales de la leçon.
            </p>

          </div>

        </div>


        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

          <Info
            label="Branche"
            value={preparation.branche}
          />

          <Info
            label="Sous-branche"
            value={preparation.sous_branche}
          />

          <Info
            label="Jour"
            value={preparation.jour}
          />

          <Info
            label="Fiche N°"
            value={preparation.fiche_numero}
          />

          <Info
            label="Sujet"
            value={preparation.sujet}
            full
          />

          <Info
            label="Matériel didactique"
            value={preparation.materiel_didactique}
            full
          />

          <Info
            label="Référence"
            value={preparation.reference}
            full
          />

          <Info
            label="Objectif opérationnel"
            value={preparation.objectif_operationnel}
            full
          />

        </div>

      </section>


      {/* =================================
          DÉROULEMENT
      ================================= */}

      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6">

        <div className="flex items-center gap-3 mb-6">

          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">

            <FileText size={20} />

          </div>

          <div>

            <h2 className="font-bold text-slate-900">
              Déroulement de la leçon
            </h2>

            <p className="text-xs text-slate-500">
              Vérification du contenu pédagogique.
            </p>

          </div>

        </div>


        <Etape
          numero="1"
          titre="Rappel"
          enseignant={preparation.rappel_enseignant}
          apprenants={preparation.rappel_apprenants}
        />

        <Etape
          numero="2"
          titre="Motivation"
          enseignant={preparation.motivation_enseignant}
          apprenants={preparation.motivation_apprenants}
        />

        <Etape
          numero="3"
          titre="Annonce du sujet"
          enseignant={preparation.annonce_enseignant}
          apprenants={preparation.annonce_apprenants}
        />

        <Etape
          numero="4"
          titre="Analyse"
          enseignant={preparation.analyse_enseignant}
          apprenants={preparation.analyse_apprenants}
        />

        <Etape
          numero="5"
          titre="Synthèse"
          enseignant={preparation.synthese_enseignant}
          apprenants={preparation.synthese_apprenants}
        />

      </section>


      {/* =================================
          QUESTIONS FINALES
      ================================= */}

      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6">

        <h2 className="font-bold text-slate-900 mb-5">
          Questions finales
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <Info
            label="Questions"
            value={preparation.questions_finales}
          />

          <Info
            label="Réponses"
            value={preparation.reponses_finales}
          />

        </div>

      </section>


      {/* =================================
          MOTIF REJET
      ================================= */}

      {preparation.motif_rejet && (

        <section className="bg-red-50 border border-red-200 rounded-2xl p-5 sm:p-6">

          <div className="flex items-start gap-3">

            <XCircle
              size={21}
              className="text-red-600 shrink-0"
            />

            <div>

              <h2 className="font-bold text-red-800">
                Motif du rejet
              </h2>

              <p className="text-sm text-red-700 mt-2 whitespace-pre-wrap">
                {preparation.motif_rejet}
              </p>

            </div>

          </div>

        </section>

      )}


      {/* =================================
          ACTIONS ADMIN
      ================================= */}

      <section className="print:hidden bg-white border border-slate-200 rounded-2xl shadow-sm p-5">

        <h2 className="font-bold text-slate-900">
          Actions de la Direction
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          La préparation doit être validée avant l'impression.
        </p>


        <div className="flex flex-col sm:flex-row gap-3 mt-5">


          {/* SOUMISE */}

          {preparation.statut === 'soumis' && (

            <>

              <button
                type="button"
                onClick={rejeterPreparation}
                disabled={action}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 font-semibold text-sm transition"
              >

                {action ? (

                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                ) : (

                  <XCircle size={18} />

                )}

                Rejeter

              </button>


              <button
                type="button"
                onClick={validerPreparation}
                disabled={action}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-semibold text-sm transition"
              >

                {action ? (

                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                ) : (

                  <CheckCircle2 size={18} />

                )}

                Valider la préparation

              </button>

            </>

          )}


          {/* VALIDÉE */}

          {preparation.statut === 'valide' && (

  <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">

    {/* PDF */}

    <button
      type="button"
      onClick={telechargerPDF}
      className="
        inline-flex
        items-center
        justify-center
        gap-2
        px-5
        py-3
        rounded-xl
        bg-red-600
        hover:bg-red-700
        text-white
        font-semibold
        text-sm
        transition
      "
    >

      <Download size={18} />

      Générer PDF

    </button>


    {/* WORD */}

    <button
      type="button"
      onClick={telechargerWord}
      className="
        inline-flex
        items-center
        justify-center
        gap-2
        px-5
        py-3
        rounded-xl
        bg-blue-600
        hover:bg-blue-700
        text-white
        font-semibold
        text-sm
        transition
      "
    >

      <FileText size={18} />

      Générer Word

    </button>

  </div>

)}


          {/* BROUILLON */}

          {preparation.statut === 'brouillon' && (

            <div className="w-full bg-slate-50 border border-slate-200 text-slate-600 rounded-xl px-4 py-3 text-sm">

              Cette préparation est encore en brouillon et n'a pas été soumise par l'enseignant.

            </div>

          )}

        </div>

      </section>


      {/* =================================
          INFORMATIONS DE VALIDATION
      ================================= */}

      {preparation.statut === 'valide' && (

        <section className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 print:mt-6">

          <div className="flex items-start gap-3">

            <CheckCircle2
              size={22}
              className="text-emerald-600 shrink-0"
            />

            <div>

              <h2 className="font-bold text-emerald-800">
                Préparation validée
              </h2>

              <p className="text-sm text-emerald-700 mt-1">

                Cette préparation a été validée par la Direction.

              </p>

              {preparation.date_validation && (

                <p className="text-xs text-emerald-600 mt-2">

                  Date de validation :{' '}
                  {new Date(
                    preparation.date_validation
                  ).toLocaleString('fr-FR')}

                </p>

              )}

            </div>

          </div>

        </section>

      )}

    </div>
  )
}


// =====================================
// COMPOSANT INFO
// =====================================

function Info({
  label,
  value,
  full = false,
}) {

  return (

    <div className={full ? 'md:col-span-2' : ''}>

      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
        {label}
      </p>

      <div className="mt-2 bg-slate-50 rounded-xl px-4 py-3 text-sm text-slate-700 whitespace-pre-wrap min-h-[44px]">
        {value || 'Non renseigné'}
      </div>

    </div>

  )
}


// =====================================
// ÉTAPE DU DÉROULEMENT
// =====================================

function Etape({
  numero,
  titre,
  enseignant,
  apprenants,
}) {

  return (

    <div className="border border-slate-200 rounded-2xl overflow-hidden mb-4">

      <div className="bg-slate-50 px-4 py-3 flex items-center gap-3">

        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">
          {numero}
        </div>

        <h3 className="font-bold text-slate-900">
          {titre}
        </h3>

      </div>


      <div className="grid grid-cols-1 md:grid-cols-2">

        <div className="p-4 border-b md:border-b-0 md:border-r border-slate-200">

          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
            Enseignant
          </p>

          <p className="text-sm text-slate-700 mt-2 whitespace-pre-wrap">
            {enseignant || 'Non renseigné'}
          </p>

        </div>


        <div className="p-4">

          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
            Apprenants
          </p>

          <p className="text-sm text-slate-700 mt-2 whitespace-pre-wrap">
            {apprenants || 'Non renseigné'}
          </p>

        </div>

      </div>

    </div>

  )
}


export default PreparationsAdminDetail