import { useState } from 'react'
import { API_URL } from '../api'
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
import { Link, useNavigate } from 'react-router-dom'

// =====================================================
// COMPOSANT CHAMP TEXTE
// IMPORTANT : il reste en dehors de NouvellePreparation
// pour éviter la perte du focus à chaque caractère.
// =====================================================

function ChampTexte({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 4,
  obligatoire = false,
}) {
  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        {label}

        {obligatoire && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </label>

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className="
          w-full
          px-3 sm:px-4
          py-3
          rounded-xl
          border border-slate-200
          bg-white
          text-sm sm:text-base
          text-slate-800
          outline-none
          resize-none
          focus:border-blue-500
          focus:ring-4
          focus:ring-blue-500/10
          transition
          leading-6
          placeholder:text-slate-400
        "
      />
    </div>
  )
}


// =====================================================
// PAGE
// =====================================================

function NouvellePreparation() {
  const navigate = useNavigate()

  const utilisateur = JSON.parse(
    localStorage.getItem('utilisateur')
  )

  const aujourdHui = new Date()
    .toISOString()
    .split('T')[0]

  const [formulaire, setFormulaire] = useState({
    branche: '',
    sous_branche: '',
    jour: '',
    date_lecon: aujourdHui,
    heure_debut: '',
    heure_fin: '',
    fiche_numero: '01/01',

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

  const [chargement, setChargement] = useState(false)
  const [message, setMessage] = useState(null)


  // =====================================================
  // CHANGER UN CHAMP
  // =====================================================

  const changerChamp = (e) => {
    const { name, value } = e.target

    setFormulaire((ancien) => ({
      ...ancien,
      [name]: value,
    }))
  }


  // =====================================================
  // CHANGER LA DATE
  // =====================================================

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


  // =====================================================
  // ENREGISTRER / SOUMETTRE
  // =====================================================

  const enregistrerPreparation = async (statut) => {
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

    setChargement(true)

    try {
      const reponse = await fetch(
        `${API_URL}/api/cours`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            enseignant_id: utilisateur.id,

            branche: formulaire.branche,
            sous_branche: formulaire.sous_branche,
            jour: formulaire.jour,
            date_lecon: formulaire.date_lecon,

            heure_debut:
              formulaire.heure_debut || null,

            heure_fin:
              formulaire.heure_fin || null,

            fiche_numero:
              formulaire.fiche_numero,

            sujet: formulaire.sujet,

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

            // Compatibilité avec l'ancien système
            titre: formulaire.sujet,
            matiere: formulaire.branche,
            objectifs:
              formulaire.objectif_operationnel,
            deroule: '',
          }),
        }
      )

      const donnees = await reponse.json()

      if (!reponse.ok) {
        setMessage({
          type: 'erreur',
          texte:
            donnees.erreur ||
            'Impossible d’enregistrer la préparation.',
        })

        setChargement(false)
        return
      }


      // =================================================
      // SOUMISSION DIRECTE
      // =================================================

      if (statut === 'soumis') {
        const reponseSoumission =
          await fetch(
            `${API_URL}/api/cours/${donnees.id}/soumettre`,
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
              'La préparation a été enregistrée mais n’a pas pu être soumise.',
          })

          setChargement(false)
          return
        }
      }


      setMessage({
        type: 'succes',
        texte:
          statut === 'soumis'
            ? 'Préparation soumise avec succès !'
            : 'Préparation enregistrée comme brouillon.',
      })

      setChargement(false)

      setTimeout(() => {
        navigate('/enseignant/preparations')
      }, 1200)

    } catch (erreur) {
      console.error(
        'Erreur création préparation :',
        erreur
      )

      setMessage({
        type: 'erreur',
        texte:
          'Impossible de contacter le serveur. Vérifiez que le backend fonctionne.',
      })

      setChargement(false)
    }
  }


  // =====================================================
  // AFFICHAGE
  // =====================================================

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-0 space-y-4 sm:space-y-6 pb-6">


      {/* =================================================
          EN-TÊTE
      ================================================= */}

      <div className="px-1">

        <Link
          to="/enseignant"
          className="
            inline-flex
            items-center
            gap-2
            text-sm
            text-slate-500
            hover:text-blue-600
            transition
            py-2
          "
        >
          <ArrowLeft size={17} />
          Retour à l'accueil
        </Link>

        <div className="mt-2 sm:mt-4">

          <p className="text-xs sm:text-sm font-medium text-blue-600">
            Préparation pédagogique
          </p>

          <h1 className="mt-1 text-xl sm:text-3xl font-bold text-slate-900 leading-tight">
            Nouvelle fiche de préparation
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-5">
            Remplissez votre fiche de préparation conformément au modèle pédagogique de l'école.
          </p>

        </div>

      </div>


      {/* =================================================
          MESSAGE
      ================================================= */}

      {message && (
        <div
          className={`
            flex
            items-start
            gap-3
            rounded-xl
            border
            p-3 sm:p-4
            mx-0
            ${
              message.type === 'succes'
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }
          `}
        >

          {message.type === 'succes' ? (
            <CheckCircle2
              size={20}
              className="shrink-0 mt-0.5"
            />
          ) : (
            <AlertCircle
              size={20}
              className="shrink-0 mt-0.5"
            />
          )}

          <p className="text-xs sm:text-sm font-medium leading-5">
            {message.texte}
          </p>

        </div>
      )}


      {/* =================================================
          FICHE
      ================================================= */}

      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm overflow-hidden">


        {/* =================================================
            TITRE
        ================================================= */}

        <div className="bg-slate-900 px-4 sm:px-7 py-4 sm:py-5 text-white">

          <div className="flex items-center gap-3">

            <ClipboardList
              size={21}
              className="shrink-0"
            />

            <div className="min-w-0">

              <h2 className="font-bold text-sm sm:text-lg leading-5">
                FICHE DE PRÉPARATION DE LEÇON
              </h2>

              <p className="text-[11px] sm:text-xs text-slate-300 mt-1">
                Fiche pédagogique numérique
              </p>

            </div>

          </div>

        </div>


        {/* =================================================
            INFORMATIONS GÉNÉRALES
        ================================================= */}

        <section className="p-4 sm:p-7 border-b border-slate-200">

          <div className="mb-4 sm:mb-5">

            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              1. Informations générales
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-5">
              Renseignez les informations d'identification de la leçon.
            </p>

          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">


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
                placeholder="Ex. Mathématiques"
                className="
                  w-full
                  h-12
                  px-3 sm:px-4
                  rounded-xl
                  border border-slate-200
                  text-sm sm:text-base
                  outline-none
                  focus:border-blue-500
                  focus:ring-4
                  focus:ring-blue-500/10
                "
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
                placeholder="Ex. Numération"
                className="
                  w-full
                  h-12
                  px-3 sm:px-4
                  rounded-xl
                  border border-slate-200
                  text-sm sm:text-base
                  outline-none
                  focus:border-blue-500
                  focus:ring-4
                  focus:ring-blue-500/10
                "
              />

            </div>


            {/* CLASSE */}

            <div>

              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Classe
              </label>

              <div className="
                h-12
                px-3 sm:px-4
                rounded-xl
                border border-slate-200
                bg-slate-100
                flex
                items-center
                justify-between
                gap-2
              ">

                <span className="text-sm font-semibold text-slate-700 truncate">
                  {utilisateur?.classe_nom ||
                    'Classe non affectée'}
                </span>

                <Lock
                  size={17}
                  className="text-slate-400 shrink-0"
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
                placeholder="Automatique"
                className="
                  w-full
                  h-12
                  px-3 sm:px-4
                  rounded-xl
                  border border-slate-200
                  bg-slate-50
                  text-sm sm:text-base
                  text-slate-600
                  outline-none
                "
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
                className="
                  w-full
                  h-12
                  px-3 sm:px-4
                  rounded-xl
                  border border-slate-200
                  text-sm sm:text-base
                  outline-none
                  focus:border-blue-500
                  focus:ring-4
                  focus:ring-blue-500/10
                "
              />

            </div>


            {/* FICHE NUMÉRO */}

            <div>

              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Fiche N°
              </label>

              <input
                type="text"
                name="fiche_numero"
                value={formulaire.fiche_numero}
                onChange={changerChamp}
                placeholder="Ex. 01/01"
                className="
                  w-full
                  h-12
                  px-3 sm:px-4
                  rounded-xl
                  border border-slate-200
                  text-sm sm:text-base
                  outline-none
                  focus:border-blue-500
                  focus:ring-4
                  focus:ring-blue-500/10
                "
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
                className="
                  w-full
                  h-12
                  px-3 sm:px-4
                  rounded-xl
                  border border-slate-200
                  text-sm sm:text-base
                  outline-none
                  focus:border-blue-500
                  focus:ring-4
                  focus:ring-blue-500/10
                "
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
                className="
                  w-full
                  h-12
                  px-3 sm:px-4
                  rounded-xl
                  border border-slate-200
                  text-sm sm:text-base
                  outline-none
                  focus:border-blue-500
                  focus:ring-4
                  focus:ring-blue-500/10
                "
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
                placeholder="Ex. Les nombres entiers de 0 à 250"
                className="
                  w-full
                  h-12
                  px-3 sm:px-4
                  rounded-xl
                  border border-slate-200
                  text-sm sm:text-base
                  outline-none
                  focus:border-blue-500
                  focus:ring-4
                  focus:ring-blue-500/10
                "
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
                placeholder="Ex. Stylo, tableau..."
                className="
                  w-full
                  h-12
                  px-3 sm:px-4
                  rounded-xl
                  border border-slate-200
                  text-sm sm:text-base
                  outline-none
                  focus:border-blue-500
                  focus:ring-4
                  focus:ring-blue-500/10
                "
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
                placeholder="Ex. Recherche personnelle"
                className="
                  w-full
                  h-12
                  px-3 sm:px-4
                  rounded-xl
                  border border-slate-200
                  text-sm sm:text-base
                  outline-none
                  focus:border-blue-500
                  focus:ring-4
                  focus:ring-blue-500/10
                "
              />

            </div>

          </div>

        </section>


        {/* =================================================
            OBJECTIF
        ================================================= */}

        <section className="p-4 sm:p-7 border-b border-slate-200">

          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            2. Objectif opérationnel
          </h2>

          <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-4 sm:mb-5 leading-5">
            Indiquez ce que l'élève sera capable de faire à l'issue de la leçon.
          </p>

          <ChampTexte
            label="Objectif opérationnel"
            name="objectif_operationnel"
            value={formulaire.objectif_operationnel}
            onChange={changerChamp}
            placeholder="Ex. À l’issue de la leçon, l’élève sera capable de..."
            rows={5}
            obligatoire
          />

          <p className="mt-2 text-[11px] sm:text-xs text-slate-400 leading-5">
            Décrivez clairement ce que l’élève sera capable de faire à la fin de la leçon.
          </p>

        </section>


        {/* =================================================
            ACTIVITÉS DE LA LEÇON
        ================================================= */}

        <section className="p-4 sm:p-7 border-b border-slate-200">

          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            3. Activités de la leçon
          </h2>

          <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-5 sm:mb-6 leading-5">
            Décrivez les interventions de l'enseignant et les activités des apprenants.
          </p>


          {/* RAPPEL */}

          <div className="mb-7 sm:mb-8">

            <div className="flex items-center gap-2 mb-4">

              <span className="
                w-8 h-8
                rounded-lg
                bg-blue-50
                text-blue-600
                flex
                items-center
                justify-center
                text-sm
                font-bold
                shrink-0
              ">
                1
              </span>

              <h3 className="font-bold text-slate-900">
                Rappel
              </h3>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">

              <ChampTexte
                label="Activités de l'enseignant"
                name="rappel_enseignant"
                value={formulaire.rappel_enseignant}
                onChange={changerChamp}
                placeholder="Questions, rappels, consignes..."
              />

              <ChampTexte
                label="Activités de l'apprenant"
                name="rappel_apprenants"
                value={formulaire.rappel_apprenants}
                onChange={changerChamp}
                placeholder="Réponses et activités des élèves..."
              />

            </div>

          </div>


          {/* MOTIVATION */}

          <div className="mb-7 sm:mb-8">

            <div className="flex items-center gap-2 mb-4">

              <span className="
                w-8 h-8
                rounded-lg
                bg-blue-50
                text-blue-600
                flex
                items-center
                justify-center
                text-sm
                font-bold
                shrink-0
              ">
                2
              </span>

              <h3 className="font-bold text-slate-900">
                Motivation
              </h3>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">

              <ChampTexte
                label="Activités de l'enseignant"
                name="motivation_enseignant"
                value={formulaire.motivation_enseignant}
                onChange={changerChamp}
                placeholder="Questions, exemples, situation de départ..."
              />

              <ChampTexte
                label="Activités de l'apprenant"
                name="motivation_apprenants"
                value={formulaire.motivation_apprenants}
                onChange={changerChamp}
                placeholder="Réponses et réactions des élèves..."
              />

            </div>

          </div>


          {/* ANNONCE */}

          <div>

            <div className="flex items-center gap-2 mb-4">

              <span className="
                w-8 h-8
                rounded-lg
                bg-blue-50
                text-blue-600
                flex
                items-center
                justify-center
                text-sm
                font-bold
                shrink-0
              ">
                3
              </span>

              <h3 className="font-bold text-slate-900">
                Annonce du sujet
              </h3>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">

              <ChampTexte
                label="Activités de l'enseignant"
                name="annonce_enseignant"
                value={formulaire.annonce_enseignant}
                onChange={changerChamp}
                placeholder="Annoncez le sujet de la leçon..."
              />

              <ChampTexte
                label="Activités de l'apprenant"
                name="annonce_apprenants"
                value={formulaire.annonce_apprenants}
                onChange={changerChamp}
                placeholder="Écoute, observation et réaction des élèves..."
              />

            </div>

          </div>

        </section>


        {/* =================================================
            ACTIVITÉS PRINCIPALES
        ================================================= */}

        <section className="p-4 sm:p-7 border-b border-slate-200">

          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            4. Activités principales
          </h2>

          <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-5 sm:mb-6 leading-5">
            Présentez l'analyse de la matière et les réponses ou activités des apprenants.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">

            <ChampTexte
              label="Analyse — Activités de l'enseignant"
              name="analyse_enseignant"
              value={formulaire.analyse_enseignant}
              onChange={changerChamp}
              placeholder="Présentation, explications, exercices, démonstrations..."
              rows={7}
            />

            <ChampTexte
              label="Réponses / activités des apprenants"
              name="analyse_apprenants"
              value={formulaire.analyse_apprenants}
              onChange={changerChamp}
              placeholder="Réponses, exercices réalisés, observations..."
              rows={7}
            />

          </div>


          {/* SYNTHÈSE */}

          <div className="mt-7">

            <div className="flex items-center gap-2 mb-4">

              <span className="
                w-8 h-8
                rounded-lg
                bg-emerald-50
                text-emerald-600
                flex
                items-center
                justify-center
                text-sm
                font-bold
                shrink-0
              ">
                ✓
              </span>

              <h3 className="font-bold text-slate-900">
                Synthèse
              </h3>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">

              <ChampTexte
                label="Synthèse de l'enseignant"
                name="synthese_enseignant"
                value={formulaire.synthese_enseignant}
                onChange={changerChamp}
                placeholder="Questions de synthèse, conclusion..."
              />

              <ChampTexte
                label="Réponses / activités des apprenants"
                name="synthese_apprenants"
                value={formulaire.synthese_apprenants}
                onChange={changerChamp}
                placeholder="Réponses des élèves et conclusion..."
              />

            </div>

          </div>

        </section>


        {/* =================================================
            ACTIVITÉS FINALES
        ================================================= */}

        <section className="p-4 sm:p-7">

          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            5. Activités finales
          </h2>

          <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-5 sm:mb-6 leading-5">
            Terminez la fiche par les questions et réponses des apprenants.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">

            <ChampTexte
              label="Questions de l'enseignant"
              name="questions_finales"
              value={formulaire.questions_finales}
              onChange={changerChamp}
              placeholder="Questions permettant de vérifier les acquis..."
              rows={6}
            />

            <ChampTexte
              label="Réponses des apprenants"
              name="reponses_finales"
              value={formulaire.reponses_finales}
              onChange={changerChamp}
              placeholder="Réponses attendues ou obtenues des élèves..."
              rows={6}
            />

          </div>

        </section>


        {/* =================================================
            BOUTONS
        ================================================= */}

        <div className="
          px-4 sm:px-7
          py-4 sm:py-5
          bg-slate-50
          border-t border-slate-200
        ">

          <div className="
            flex
            flex-col-reverse
            sm:flex-row
            sm:justify-end
            gap-3
          ">

            <button
              type="button"
              disabled={chargement}
              onClick={() =>
                enregistrerPreparation('brouillon')
              }
              className="
                w-full
                sm:w-auto
                min-h-12
                px-5
                rounded-xl
                border border-slate-200
                bg-white
                text-slate-700
                text-sm
                font-semibold
                hover:bg-slate-100
                disabled:opacity-50
                transition
                flex
                items-center
                justify-center
                gap-2
              "
            >

              {chargement ? (
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
              disabled={chargement}
              onClick={() =>
                enregistrerPreparation('soumis')
              }
              className="
                w-full
                sm:w-auto
                min-h-12
                px-5
                rounded-xl
                bg-blue-600
                text-white
                text-sm
                font-semibold
                hover:bg-blue-700
                disabled:opacity-50
                transition
                flex
                items-center
                justify-center
                gap-2
                shadow-lg
                shadow-blue-600/20
              "
            >

              {chargement ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <Send size={18} />
              )}

              Soumettre la préparation

            </button>

          </div>

        </div>

      </div>

    </div>
  )
}


export default NouvellePreparation