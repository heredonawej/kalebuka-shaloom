import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  Loader2,
  Lock,
  CheckCircle2,
  Clock3,
  XCircle,
  FileText,
  User,
  CalendarDays,
} from 'lucide-react'
import {
  Link,
  useParams,
} from 'react-router-dom'

function ConsulterPreparation() {
  const { id } = useParams()

  const utilisateur = JSON.parse(
    localStorage.getItem('utilisateur')
  )

  const [preparation, setPreparation] = useState(null)
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')


  // ==========================================
  // CHARGER LA PRÉPARATION
  // ==========================================

  useEffect(() => {
    chargerPreparation()
  }, [id])


  const chargerPreparation = async () => {
    try {
      setChargement(true)
      setErreur('')

      if (!utilisateur) {
        setErreur(
          'Votre session a expiré. Veuillez vous reconnecter.'
        )
        return
      }

      const reponse = await fetch(
        `http://localhost:5000/api/cours?enseignant_id=${utilisateur.id}`
      )

      const donnees = await reponse.json()

      if (!reponse.ok) {
        setErreur(
          donnees.erreur ||
          'Impossible de charger la préparation.'
        )
        return
      }

      const resultat = donnees.find(
        (element) =>
          Number(element.id) === Number(id)
      )

      if (!resultat) {
        setErreur(
          'Préparation introuvable ou accès refusé.'
        )
        return
      }

      setPreparation(resultat)

    } catch (err) {
      console.error(
        'Erreur consultation préparation :',
        err
      )

      setErreur(
        'Impossible de contacter le serveur.'
      )
    } finally {
      setChargement(false)
    }
  }


  // ==========================================
  // STATUT
  // ==========================================

  const afficherStatut = (statut) => {

    const configurations = {
      brouillon: {
        texte: 'Brouillon',
        classe:
          'bg-slate-100 text-slate-700',
        icone: FileText,
      },

      soumis: {
        texte: 'Soumise',
        classe:
          'bg-blue-100 text-blue-700',
        icone: Clock3,
      },

      valide: {
        texte: 'Validée',
        classe:
          'bg-green-100 text-green-700',
        icone: CheckCircle2,
      },

      rejete: {
        texte: 'Rejetée',
        classe:
          'bg-red-100 text-red-700',
        icone: XCircle,
      },
    }

    const configuration =
      configurations[statut] ||
      configurations.brouillon

    const Icone = configuration.icone

    return (
      <span
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold ${configuration.classe}`}
      >
        <Icone size={16} />
        {configuration.texte}
      </span>
    )
  }


  // ==========================================
  // AFFICHER UNE VALEUR
  // ==========================================

  const valeur = (texte) => {
    if (!texte) {
      return (
        <span className="text-slate-400 italic">
          Non renseigné
        </span>
      )
    }

    return (
      <span className="whitespace-pre-line">
        {texte}
      </span>
    )
  }


  // ==========================================
  // CHARGEMENT
  // ==========================================

  if (chargement) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">

        <div className="flex items-center gap-3 text-slate-500">

          <Loader2
            size={25}
            className="animate-spin"
          />

          <span>
            Chargement de la préparation...
          </span>

        </div>

      </div>
    )
  }


  // ==========================================
  // ERREUR
  // ==========================================

  if (erreur) {
    return (
      <div className="max-w-3xl mx-auto">

        <Link
          to="/enseignant/preparations"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600"
        >
          <ArrowLeft size={17} />
          Retour aux préparations
        </Link>

        <div className="mt-6 bg-red-50 border border-red-200 rounded-2xl p-6">

          <div className="flex items-start gap-3">

            <XCircle
              size={22}
              className="text-red-600 shrink-0"
            />

            <div>

              <h2 className="font-bold text-red-800">
                Impossible d'afficher la préparation
              </h2>

              <p className="text-sm text-red-700 mt-1">
                {erreur}
              </p>

            </div>

          </div>

        </div>

      </div>
    )
  }


  if (!preparation) {
    return null
  }


  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* ========================================
          EN-TÊTE
      ======================================== */}

      <div>

        <Link
          to="/enseignant/preparations"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition"
        >
          <ArrowLeft size={17} />
          Retour aux préparations
        </Link>


        <div className="mt-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

          <div>

            <p className="text-sm font-medium text-blue-600">
              Préparation pédagogique
            </p>

            <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900">
              Consultation de la préparation
            </h1>

          </div>

          <div>
            {afficherStatut(preparation.statut)}
          </div>

        </div>

      </div>


      {/* ========================================
          INFORMATIONS ENSEIGNANT
      ======================================== */}

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">

        <div className="flex items-center gap-3 mb-5">

          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <User size={20} />
          </div>

          <div>

            <h2 className="font-bold text-slate-900">
              Enseignant
            </h2>

            <p className="text-sm text-slate-500">
              Informations liées à la préparation
            </p>

          </div>

        </div>


        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          <div className="rounded-xl bg-slate-50 p-4">

            <p className="text-xs text-slate-400">
              Enseignant
            </p>

            <p className="text-sm font-semibold text-slate-800 mt-1">
              {preparation.enseignant_nom || '—'}
            </p>

          </div>


          <div className="rounded-xl bg-slate-50 p-4">

            <p className="text-xs text-slate-400">
              Classe
            </p>

            <div className="flex items-center justify-between mt-1">

              <p className="text-sm font-semibold text-slate-800">
                {preparation.classe_nom || '—'}
              </p>

              <Lock
                size={15}
                className="text-slate-400"
              />

            </div>

          </div>


          <div className="rounded-xl bg-slate-50 p-4">

            <p className="text-xs text-slate-400">
              Section
            </p>

            <p className="text-sm font-semibold text-slate-800 mt-1">
              {preparation.section || '—'}
            </p>

          </div>

        </div>

      </section>


      {/* ========================================
          FICHE
      ======================================== */}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">


        {/* TITRE */}

        <div className="bg-slate-900 px-5 sm:px-8 py-6 text-white">

          <div className="text-center">

            <p className="text-xs uppercase tracking-widest text-slate-400">
              Kalebuka Shaloom
            </p>

            <h2 className="text-xl sm:text-2xl font-bold mt-2">
              FICHE DE PRÉPARATION DE LEÇON
            </h2>

            <p className="text-sm text-slate-300 mt-2">
              Fiche N° {preparation.fiche_numero || '—'}
            </p>

          </div>

        </div>


        {/* ========================================
            INFORMATIONS GÉNÉRALES
        ======================================== */}

        <section className="p-5 sm:p-8 border-b border-slate-200">

          <h2 className="text-lg font-bold text-slate-900 mb-5">
            1. Informations générales
          </h2>


          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">


            <Info
              label="Branche"
              valeur={preparation.branche}
            />

            <Info
              label="Sous-branche"
              valeur={preparation.sous_branche}
            />

            <Info
              label="Classe"
              valeur={preparation.classe_nom}
              verrouille
            />

            <Info
              label="Jour"
              valeur={preparation.jour}
            />

            <Info
              label="Date"
              valeur={
                preparation.date_lecon
                  ? new Date(
                      preparation.date_lecon
                    ).toLocaleDateString(
                      'fr-FR'
                    )
                  : null
              }
            />

            <Info
              label="Heure"
              valeur={
                preparation.heure_debut &&
                preparation.heure_fin
                  ? `${String(
                      preparation.heure_debut
                    ).slice(0, 5)} — ${String(
                      preparation.heure_fin
                    ).slice(0, 5)}`
                  : preparation.heure_debut
                    ? String(
                        preparation.heure_debut
                      ).slice(0, 5)
                    : null
              }
            />

          </div>


          <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">

            <Info
              label="Sujet"
              valeur={
                preparation.sujet ||
                preparation.titre
              }
            />

            <Info
              label="Matériel didactique"
              valeur={
                preparation.materiel_didactique
              }
            />

          </div>


          <div className="mt-4">

            <Info
              label="Référence"
              valeur={
                preparation.reference
              }
            />

          </div>

        </section>


        {/* ========================================
            OBJECTIF
        ======================================== */}

        <section className="p-5 sm:p-8 border-b border-slate-200">

          <SectionTitre>
            2. Objectif opérationnel
          </SectionTitre>

          <div className="mt-5 bg-blue-50 border border-blue-100 rounded-xl p-5">

            <p className="text-sm text-slate-700 leading-7">
              {valeur(
                preparation.objectif_operationnel ||
                preparation.objectifs
              )}
            </p>

          </div>

        </section>


        {/* ========================================
            ACTIVITÉS DE LA LEÇON
        ======================================== */}

        <section className="p-5 sm:p-8 border-b border-slate-200">

          <SectionTitre>
            3. Activités de la leçon
          </SectionTitre>


          <div className="mt-6 space-y-8">

            <BlocActivite
              numero="1"
              titre="Rappel"
              enseignant={
                preparation.rappel_enseignant
              }
              apprenants={
                preparation.rappel_apprenants
              }
            />

            <BlocActivite
              numero="2"
              titre="Motivation"
              enseignant={
                preparation.motivation_enseignant
              }
              apprenants={
                preparation.motivation_apprenants
              }
            />

            <BlocActivite
              numero="3"
              titre="Annonce du sujet"
              enseignant={
                preparation.annonce_enseignant
              }
              apprenants={
                preparation.annonce_apprenants
              }
            />

          </div>

        </section>


        {/* ========================================
            ACTIVITÉS PRINCIPALES
        ======================================== */}

        <section className="p-5 sm:p-8 border-b border-slate-200">

          <SectionTitre>
            4. Activités principales
          </SectionTitre>


          <div className="mt-6">

            <BlocActivite
              numero="1"
              titre="Analyse"
              enseignant={
                preparation.analyse_enseignant
              }
              apprenants={
                preparation.analyse_apprenants
              }
            />

          </div>


          <div className="mt-8">

            <BlocActivite
              numero="2"
              titre="Synthèse"
              enseignant={
                preparation.synthese_enseignant
              }
              apprenants={
                preparation.synthese_apprenants
              }
            />

          </div>

        </section>


        {/* ========================================
            ACTIVITÉS FINALES
        ======================================== */}

        <section className="p-5 sm:p-8">

          <SectionTitre>
            5. Activités finales
          </SectionTitre>


          <div className="mt-6">

            <BlocActivite
              titre="Questions et réponses"
              enseignant={
                preparation.questions_finales
              }
              apprenants={
                preparation.reponses_finales
              }
              labelEnseignant="Questions de l'enseignant"
              labelApprenants="Réponses des apprenants"
            />

          </div>

        </section>


        {/* ========================================
            DATES / ÉTAT
        ======================================== */}

        <section className="px-5 sm:px-8 py-5 bg-slate-50 border-t border-slate-200">

          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between text-sm">

            <div className="flex items-center gap-2 text-slate-500">

              <CalendarDays size={17} />

              <span>
                Créée le{' '}
                {preparation.date_creation
                  ? new Date(
                      preparation.date_creation
                    ).toLocaleString('fr-FR')
                  : '—'}
              </span>

            </div>


            {preparation.date_soumission && (
              <div className="text-slate-500">

                Soumise le{' '}

                {new Date(
                  preparation.date_soumission
                ).toLocaleString('fr-FR')}

              </div>
            )}

          </div>

        </section>

      </div>


      {/* ========================================
          RETOUR
      ======================================== */}

      <div className="flex justify-end">

        <Link
          to="/enseignant/preparations"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"
        >

          <ArrowLeft size={17} />

          Retour aux préparations

        </Link>

      </div>

    </div>
  )
}


// =====================================================
// COMPOSANTS
// =====================================================

function SectionTitre({ children }) {
  return (
    <h2 className="text-lg font-bold text-slate-900">
      {children}
    </h2>
  )
}


function Info({
  label,
  valeur,
  verrouille = false,
}) {
  return (
    <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">

      <div className="flex items-center justify-between">

        <p className="text-xs font-medium text-slate-400">
          {label}
        </p>

        {verrouille && (
          <Lock
            size={15}
            className="text-slate-400"
          />
        )}

      </div>

      <p className="text-sm font-semibold text-slate-800 mt-2">
        {valeur || (
          <span className="text-slate-400 italic font-normal">
            Non renseigné
          </span>
        )}
      </p>

    </div>
  )
}


function BlocActivite({
  numero,
  titre,
  enseignant,
  apprenants,
  labelEnseignant = "Activités de l'enseignant",
  labelApprenants = "Activités de l'apprenant",
}) {
  return (
    <div>

      <div className="flex items-center gap-3 mb-4">

        {numero && (
          <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold">
            {numero}
          </span>
        )}

        <h3 className="font-bold text-slate-900">
          {titre}
        </h3>

      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <div className="rounded-xl border border-slate-200 overflow-hidden">

          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">

            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              {labelEnseignant}
            </p>

          </div>

          <div className="p-4 text-sm text-slate-700 leading-7 min-h-24">
            {enseignant || (
              <span className="text-slate-400 italic">
                Non renseigné
              </span>
            )}
          </div>

        </div>


        <div className="rounded-xl border border-slate-200 overflow-hidden">

          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">

            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              {labelApprenants}
            </p>

          </div>

          <div className="p-4 text-sm text-slate-700 leading-7 min-h-24">
            {apprenants || (
              <span className="text-slate-400 italic">
                Non renseigné
              </span>
            )}
          </div>

        </div>

      </div>

    </div>
  )
}


export default ConsulterPreparation