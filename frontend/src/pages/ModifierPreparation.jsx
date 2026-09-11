import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  Save,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Lock,
  ClipboardList,
} from 'lucide-react'
import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom'

function ModifierPreparation() {
  const navigate = useNavigate()
  const { id } = useParams()

  const utilisateur = JSON.parse(
    localStorage.getItem('utilisateur')
  )

  const [formulaire, setFormulaire] = useState({
    branche: '',
    sous_branche: '',
    jour: '',
    date_lecon: '',
    heure_debut: '',
    heure_fin: '',
    fiche_numero: '',

    sujet: '',
    materiel_didactique: '',
    reference: '',

    objectif_operationnel: '',

    rappel_enseignant: '',
    rappel_apprenants: '',

    motivation_enseignant: '',
    motivation_apprenants: '',

    annonce_enseignant: '',
    annonce_apprenants: '',

    analyse_enseignant: '',
    analyse_apprenants: '',

    synthese_enseignant: '',
    synthese_apprenants: '',

    questions_finales: '',
    reponses_finales: '',
  })

  const [statut, setStatut] = useState('')
  const [motifRejet, setMotifRejet] = useState('')

  const [chargement, setChargement] = useState(true)
  const [enregistrement, setEnregistrement] =
    useState(false)

  const [message, setMessage] = useState(null)


  // ==========================================
  // CHARGER LA PRÉPARATION
  // ==========================================

  useEffect(() => {
    chargerPreparation()
  }, [id])


  const chargerPreparation = async () => {
    try {
      setChargement(true)
      setMessage(null)

      if (!utilisateur) {
        setMessage({
          type: 'erreur',
          texte:
            'Votre session a expiré. Veuillez vous reconnecter.',
        })

        return
      }

      const reponse = await fetch(
        `http://localhost:5000/api/cours?enseignant_id=${utilisateur.id}`
      )

      const donnees = await reponse.json()

      if (!reponse.ok) {
        throw new Error(
          donnees.erreur ||
          'Impossible de charger les préparations.'
        )
      }

      const preparation = donnees.find(
        (element) =>
          Number(element.id) === Number(id)
      )

      if (!preparation) {
        setMessage({
          type: 'erreur',
          texte:
            'Préparation introuvable ou vous n’avez pas accès à cette préparation.',
        })

        return
      }


      // Vérification supplémentaire côté interface
      if (
        Number(preparation.enseignant_id) !==
        Number(utilisateur.id)
      ) {
        setMessage({
          type: 'erreur',
          texte:
            'Vous n’avez pas accès à cette préparation.',
        })

        return
      }


      // Une préparation soumise ou validée ne peut pas
      // être modifiée.
      if (
        preparation.statut !== 'brouillon' &&
        preparation.statut !== 'rejete'
      ) {
        setMessage({
          type: 'erreur',
          texte:
            'Cette préparation ne peut plus être modifiée.',
        })

        setStatut(preparation.statut)
        return
      }


      setStatut(preparation.statut || 'brouillon')
      setMotifRejet(
        preparation.motif_rejet || ''
      )


      // Conversion de la date PostgreSQL
      let dateLecon = ''

      if (preparation.date_lecon) {
        dateLecon = String(
          preparation.date_lecon
        ).split('T')[0]
      }


      setFormulaire({
        branche:
          preparation.branche || '',

        sous_branche:
          preparation.sous_branche || '',

        jour:
          preparation.jour || '',

        date_lecon:
          dateLecon,

        heure_debut:
          preparation.heure_debut
            ? String(preparation.heure_debut).slice(0, 5)
            : '',

        heure_fin:
          preparation.heure_fin
            ? String(preparation.heure_fin).slice(0, 5)
            : '',

        fiche_numero:
          preparation.fiche_numero || '',

        sujet:
          preparation.sujet ||
          preparation.titre ||
          '',

        materiel_didactique:
          preparation.materiel_didactique || '',

        reference:
          preparation.reference || '',

        objectif_operationnel:
          preparation.objectif_operationnel ||
          preparation.objectifs ||
          '',

        rappel_enseignant:
          preparation.rappel_enseignant || '',

        rappel_apprenants:
          preparation.rappel_apprenants || '',

        motivation_enseignant:
          preparation.motivation_enseignant || '',

        motivation_apprenants:
          preparation.motivation_apprenants || '',

        annonce_enseignant:
          preparation.annonce_enseignant || '',

        annonce_apprenants:
          preparation.annonce_apprenants || '',

        analyse_enseignant:
          preparation.analyse_enseignant || '',

        analyse_apprenants:
          preparation.analyse_apprenants || '',

        synthese_enseignant:
          preparation.synthese_enseignant || '',

        synthese_apprenants:
          preparation.synthese_apprenants || '',

        questions_finales:
          preparation.questions_finales || '',

        reponses_finales:
          preparation.reponses_finales || '',
      })

    } catch (erreur) {

      console.error(
        'Erreur chargement préparation :',
        erreur
      )

      setMessage({
        type: 'erreur',
        texte:
          'Impossible de charger la préparation.',
      })

    } finally {
      setChargement(false)
    }
  }


  // ==========================================
  // CHANGER UN CHAMP
  // ==========================================

  const changerChamp = (e) => {
    const { name, value } = e.target

    setFormulaire((ancien) => ({
      ...ancien,
      [name]: value,
    }))
  }


  // ==========================================
  // CHANGER LA DATE
  // ==========================================

  const changerDate = (e) => {
    const date = e.target.value

    const nouvelleDate = new Date(
      `${date}T12:00:00`
    )

    const jours = [
      'Dimanche',
      'Lundi',
      'Mardi',
      'Mercredi',
      'Jeudi',
      'Vendredi',
      'Samedi',
    ]

    setFormulaire((ancien) => ({
      ...ancien,
      date_lecon: date,
      jour: jours[nouvelleDate.getDay()],
    }))
  }


  // ==========================================
  // ENREGISTRER LES MODIFICATIONS
  // ==========================================

  const enregistrer = async (soumettre = false) => {

    setMessage(null)

    if (!utilisateur) {
      setMessage({
        type: 'erreur',
        texte:
          'Votre session a expiré. Veuillez vous reconnecter.',
      })

      return
    }


    if (!utilisateur.classe_id) {
      setMessage({
        type: 'erreur',
        texte:
          'Aucune classe ne vous est affectée. Contactez la direction.',
      })

      return
    }


    if (
      !formulaire.branche.trim() ||
      !formulaire.sous_branche.trim() ||
      !formulaire.sujet.trim() ||
      !formulaire.objectif_operationnel.trim()
    ) {
      setMessage({
        type: 'erreur',
        texte:
          'Veuillez remplir les informations obligatoires.',
      })

      return
    }


    setEnregistrement(true)

    try {

      // ========================================
      // MODIFICATION
      // ========================================

      const reponse = await fetch(
        `http://localhost:5000/api/cours/${id}`,
        {
          method: 'PUT',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({

            enseignant_id:
              utilisateur.id,

            branche:
              formulaire.branche,

            sous_branche:
              formulaire.sous_branche,

            jour:
              formulaire.jour,

            date_lecon:
              formulaire.date_lecon || null,

            heure_debut:
              formulaire.heure_debut || null,

            heure_fin:
              formulaire.heure_fin || null,

            fiche_numero:
              formulaire.fiche_numero,

            sujet:
              formulaire.sujet,

            materiel_didactique:
              formulaire.materiel_didactique,

            reference:
              formulaire.reference,

            objectif_operationnel:
              formulaire.objectif_operationnel,

            rappel_enseignant:
              formulaire.rappel_enseignant,

            rappel_apprenants:
              formulaire.rappel_apprenants,

            motivation_enseignant:
              formulaire.motivation_enseignant,

            motivation_apprenants:
              formulaire.motivation_apprenants,

            annonce_enseignant:
              formulaire.annonce_enseignant,

            annonce_apprenants:
              formulaire.annonce_apprenants,

            analyse_enseignant:
              formulaire.analyse_enseignant,

            analyse_apprenants:
              formulaire.analyse_apprenants,

            synthese_enseignant:
              formulaire.synthese_enseignant,

            synthese_apprenants:
              formulaire.synthese_apprenants,

            questions_finales:
              formulaire.questions_finales,

            reponses_finales:
              formulaire.reponses_finales,

            // Anciennes colonnes
            titre:
              formulaire.sujet,

            matiere:
              formulaire.branche,

            objectifs:
              formulaire.objectif_operationnel,

            deroule:
              '',
          }),
        }
      )


      const donnees = await reponse.json()


      if (!reponse.ok) {
        setMessage({
          type: 'erreur',
          texte:
            donnees.erreur ||
            'Impossible de modifier la préparation.',
        })

        setEnregistrement(false)
        return
      }


      // ========================================
      // SOUMISSION
      // ========================================

      if (soumettre) {

        const reponseSoumission =
          await fetch(
            `http://localhost:5000/api/cours/${id}/soumettre`,
            {
              method: 'POST',
            }
          )

        const resultatSoumission =
          await reponseSoumission.json()


        if (!reponseSoumission.ok) {
          setMessage({
            type: 'erreur',
            texte:
              resultatSoumission.erreur ||
              'La préparation a été modifiée mais n’a pas pu être soumise.',
          })

          setEnregistrement(false)
          return
        }
      }


      setMessage({
        type: 'succes',
        texte: soumettre
          ? 'Préparation modifiée et soumise avec succès !'
          : 'Préparation modifiée et enregistrée comme brouillon.',
      })


      setEnregistrement(false)


      setTimeout(() => {
        navigate('/enseignant/preparations')
      }, 1200)

    } catch (erreur) {

      console.error(
        'Erreur modification préparation :',
        erreur
      )

      setMessage({
        type: 'erreur',
        texte:
          'Impossible de contacter le serveur.',
      })

      setEnregistrement(false)
    }
  }


  // ==========================================
  // CHAMP TEXTAREA
  // ==========================================

  const ChampTexte = ({
    label,
    name,
    placeholder,
    rows = 4,
    obligatoire = false,
  }) => (
    <div>

      <label className="block text-sm font-semibold text-slate-700 mb-2">

        {label}

        {obligatoire && (
          <span className="text-red-500 ml-1">
            *
          </span>
        )}

      </label>

      <textarea
        name={name}
        value={formulaire[name]}
        onChange={changerChamp}
        rows={rows}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white outline-none resize-y focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"
      />

    </div>
  )


  // ==========================================
  // CHARGEMENT
  // ==========================================

  if (chargement) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">

        <div className="flex items-center gap-3 text-slate-500">

          <Loader2
            size={24}
            className="animate-spin"
          />

          <span>
            Chargement de la préparation...
          </span>

        </div>

      </div>
    )
  }


  return (
    <div className="max-w-5xl mx-auto space-y-6">


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


        <div className="mt-4">

          <p className="text-sm font-medium text-blue-600">
            Préparation pédagogique
          </p>

          <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900">
            Modifier la préparation
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Corrigez votre fiche avant de l'enregistrer ou de la soumettre.
          </p>

        </div>

      </div>


      {/* ========================================
          MESSAGE
      ======================================== */}

      {message && (
        <div
          className={`flex items-start gap-3 rounded-xl border p-4 ${
            message.type === 'succes'
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >

          {message.type === 'succes' ? (
            <CheckCircle2 size={20} />
          ) : (
            <AlertCircle size={20} />
          )}

          <p className="text-sm font-medium">
            {message.texte}
          </p>

        </div>
      )}


      {/* ========================================
          MOTIF DE REJET
      ======================================== */}

      {statut === 'rejete' &&
        motifRejet && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5">

            <div className="flex items-start gap-3">

              <AlertCircle
                size={21}
                className="text-red-600 shrink-0"
              />

              <div>

                <h2 className="font-bold text-red-800">
                  Préparation rejetée
                </h2>

                <p className="text-sm text-red-700 mt-1">
                  Motif du rejet :
                </p>

                <p className="text-sm text-red-800 font-medium mt-2">
                  {motifRejet}
                </p>

              </div>

            </div>

          </div>
        )}


      {/* ========================================
          FICHE
      ======================================== */}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">


        {/* TITRE */}

        <div className="bg-slate-900 px-5 sm:px-7 py-5 text-white">

          <div className="flex items-center gap-3">

            <ClipboardList size={22} />

            <div>

              <h2 className="font-bold text-lg">
                FICHE DE PRÉPARATION DE LEÇON
              </h2>

              <p className="text-xs text-slate-300 mt-1">
                Modification de la fiche pédagogique
              </p>

            </div>

          </div>

        </div>


        {/* ========================================
            INFORMATIONS GÉNÉRALES
        ======================================== */}

        <section className="p-5 sm:p-7 border-b border-slate-200">

          <div className="mb-5">

            <h2 className="text-lg font-bold text-slate-900">
              1. Informations générales
            </h2>

          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">


            {/* BRANCHE */}

            <div>

              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Branche
                <span className="text-red-500 ml-1">*</span>
              </label>

              <input
                type="text"
                name="branche"
                value={formulaire.branche}
                onChange={changerChamp}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />

            </div>


            {/* SOUS-BRANCHE */}

            <div>

              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Sous-branche
                <span className="text-red-500 ml-1">*</span>
              </label>

              <input
                type="text"
                name="sous_branche"
                value={formulaire.sous_branche}
                onChange={changerChamp}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />

            </div>


            {/* CLASSE */}

            <div>

              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Classe
              </label>

              <div className="h-12 px-4 rounded-xl border border-slate-200 bg-slate-100 flex items-center justify-between">

                <span className="text-sm font-semibold text-slate-700">
                  {utilisateur?.classe_nom ||
                    'Classe non affectée'}
                </span>

                <Lock
                  size={17}
                  className="text-slate-400"
                />

              </div>

            </div>


            {/* JOUR */}

            <div>

              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Jour
              </label>

              <input
                type="text"
                value={formulaire.jour}
                readOnly
                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 outline-none"
              />

            </div>


            {/* DATE */}

            <div>

              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Date
              </label>

              <input
                type="date"
                name="date_lecon"
                value={formulaire.date_lecon}
                onChange={changerDate}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />

            </div>


            {/* FICHE N° */}

            <div>

              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Fiche N°
              </label>

              <input
                type="text"
                name="fiche_numero"
                value={formulaire.fiche_numero}
                onChange={changerChamp}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />

            </div>


            {/* HEURE DÉBUT */}

            <div>

              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Heure de début
              </label>

              <input
                type="time"
                name="heure_debut"
                value={formulaire.heure_debut}
                onChange={changerChamp}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />

            </div>


            {/* HEURE FIN */}

            <div>

              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Heure de fin
              </label>

              <input
                type="time"
                name="heure_fin"
                value={formulaire.heure_fin}
                onChange={changerChamp}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />

            </div>


            {/* SUJET */}

            <div className="sm:col-span-2 lg:col-span-3">

              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Sujet
                <span className="text-red-500 ml-1">*</span>
              </label>

              <input
                type="text"
                name="sujet"
                value={formulaire.sujet}
                onChange={changerChamp}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />

            </div>


            {/* MATÉRIEL */}

            <div>

              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Matériel didactique
              </label>

              <input
                type="text"
                name="materiel_didactique"
                value={formulaire.materiel_didactique}
                onChange={changerChamp}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />

            </div>


            {/* RÉFÉRENCE */}

            <div className="sm:col-span-2">

              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Référence
              </label>

              <input
                type="text"
                name="reference"
                value={formulaire.reference}
                onChange={changerChamp}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />

            </div>

          </div>

        </section>


        {/* ========================================
            OBJECTIF
        ======================================== */}

        <section className="p-5 sm:p-7 border-b border-slate-200">

          <h2 className="text-lg font-bold text-slate-900">
            2. Objectif opérationnel
          </h2>

          <p className="text-sm text-slate-500 mt-1 mb-5">
            Ce que l'élève sera capable de faire à l'issue de la leçon.
          </p>

          <ChampTexte
            label="Objectif opérationnel"
            name="objectif_operationnel"
            rows={4}
            obligatoire
          />

        </section>


        {/* ========================================
            ACTIVITÉS DE LA LEÇON
        ======================================== */}

        <section className="p-5 sm:p-7 border-b border-slate-200">

          <h2 className="text-lg font-bold text-slate-900">
            3. Activités de la leçon
          </h2>


          {/* RAPPEL */}

          <div className="mt-6 mb-8">

            <h3 className="font-bold text-slate-900 mb-4">
              1. Rappel
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              <ChampTexte
                label="Activités de l'enseignant"
                name="rappel_enseignant"
                placeholder="Questions, rappels, consignes..."
              />

              <ChampTexte
                label="Activités de l'apprenant"
                name="rappel_apprenants"
                placeholder="Réponses et activités des élèves..."
              />

            </div>

          </div>


          {/* MOTIVATION */}

          <div className="mb-8">

            <h3 className="font-bold text-slate-900 mb-4">
              2. Motivation
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              <ChampTexte
                label="Activités de l'enseignant"
                name="motivation_enseignant"
                placeholder="Questions, exemples, situation de départ..."
              />

              <ChampTexte
                label="Activités de l'apprenant"
                name="motivation_apprenants"
                placeholder="Réponses et réactions des élèves..."
              />

            </div>

          </div>


          {/* ANNONCE */}

          <div>

            <h3 className="font-bold text-slate-900 mb-4">
              3. Annonce du sujet
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              <ChampTexte
                label="Activités de l'enseignant"
                name="annonce_enseignant"
                placeholder="Annoncez le sujet de la leçon..."
              />

              <ChampTexte
                label="Activités de l'apprenant"
                name="annonce_apprenants"
                placeholder="Écoute, observation et réaction des élèves..."
              />

            </div>

          </div>

        </section>


        {/* ========================================
            ACTIVITÉS PRINCIPALES
        ======================================== */}

        <section className="p-5 sm:p-7 border-b border-slate-200">

          <h2 className="text-lg font-bold text-slate-900">
            4. Activités principales
          </h2>


          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">

            <ChampTexte
              label="Analyse — Activités de l'enseignant"
              name="analyse_enseignant"
              placeholder="Présentation, explications, exercices..."
              rows={7}
            />

            <ChampTexte
              label="Réponses / activités des apprenants"
              name="analyse_apprenants"
              placeholder="Réponses, exercices réalisés..."
              rows={7}
            />

          </div>


          {/* SYNTHÈSE */}

          <div className="mt-7">

            <h3 className="font-bold text-slate-900 mb-4">
              Synthèse
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              <ChampTexte
                label="Synthèse de l'enseignant"
                name="synthese_enseignant"
                placeholder="Questions de synthèse, conclusion..."
              />

              <ChampTexte
                label="Réponses / activités des apprenants"
                name="synthese_apprenants"
                placeholder="Réponses des élèves et conclusion..."
              />

            </div>

          </div>

        </section>


        {/* ========================================
            ACTIVITÉS FINALES
        ======================================== */}

        <section className="p-5 sm:p-7">

          <h2 className="text-lg font-bold text-slate-900">
            5. Activités finales
          </h2>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">

            <ChampTexte
              label="Questions de l'enseignant"
              name="questions_finales"
              placeholder="Questions permettant de vérifier les acquis..."
              rows={6}
            />

            <ChampTexte
              label="Réponses des apprenants"
              name="reponses_finales"
              placeholder="Réponses attendues ou obtenues..."
              rows={6}
            />

          </div>

        </section>


        {/* ========================================
            BOUTONS
        ======================================== */}

        <div className="px-5 sm:px-7 py-5 bg-slate-50 border-t border-slate-200">

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">

            <button
              type="button"
              disabled={enregistrement}
              onClick={() => enregistrer(false)}
              className="h-12 px-5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-100 disabled:opacity-50 transition flex items-center justify-center gap-2"
            >

              {enregistrement ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <Save size={18} />
              )}

              Enregistrer brouillon

            </button>


            <button
              type="button"
              disabled={enregistrement}
              onClick={() => enregistrer(true)}
              className="h-12 px-5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
            >

              {enregistrement ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <Send size={18} />
              )}

              Enregistrer et soumettre

            </button>

          </div>

        </div>

      </div>

    </div>
  )
}

export default ModifierPreparation