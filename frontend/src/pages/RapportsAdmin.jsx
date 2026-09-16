import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  exporterRapportPDF,
  exporterRapportWord,
} from '../utils/exportRapport'
import { API_URL } from '../api'

import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Filter,
  Loader2,
  RefreshCw,
  Users,
  XCircle,
  Clock,
  RotateCcw,
} from 'lucide-react'


function RapportsAdmin() {

  const [preparations, setPreparations] = useState([])
  const [enseignants, setEnseignants] = useState([])
  const [classes, setClasses] = useState([])

  const [chargement, setChargement] = useState(true)

  const [enseignantId, setEnseignantId] = useState('')
  const [classeId, setClasseId] = useState('')
  const [statut, setStatut] = useState('')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')

  const [erreur, setErreur] = useState('')
  const [exportation, setExportation] = useState(false)


  // =====================================================
  // CHARGER LES DONNÉES
  // =====================================================

  useEffect(() => {
    chargerDonnees()
  }, [])


  const chargerDonnees = async () => {

    try {

      setChargement(true)
      setErreur('')

      const [
        preparationsResponse,
        enseignantsResponse,
        classesResponse,
      ] = await Promise.all([

        fetch(
          `${API_URL}/api/cours`
        ),

        fetch(
          `${API_URL}/api/admin/enseignants`
        ),

        fetch(
          `${API_URL}/api/classes`
        ),

      ])


      const preparationsData =
        await preparationsResponse.json()

      const enseignantsData =
        await enseignantsResponse.json()

      const classesData =
        await classesResponse.json()


      if (!preparationsResponse.ok) {

        throw new Error(
          preparationsData.erreur ||
          'Impossible de charger les préparations.'
        )

      }


      if (!enseignantsResponse.ok) {

        throw new Error(
          enseignantsData.erreur ||
          'Impossible de charger les enseignants.'
        )

      }


      if (!classesResponse.ok) {

        throw new Error(
          classesData.erreur ||
          'Impossible de charger les classes.'
        )

      }


      setPreparations(
        preparationsData
      )

      setEnseignants(
        enseignantsData
      )

      setClasses(
        classesData
      )

    } catch (err) {

      console.error(err)

      setErreur(
        err.message ||
        'Impossible de charger les données.'
      )

    } finally {

      setChargement(false)

    }

  }


  // =====================================================
  // FILTRER
  // =====================================================

  const preparationsFiltrees = useMemo(() => {

    return preparations.filter(
      (preparation) => {

        // -------------------------------
        // ENSEIGNANT
        // -------------------------------

        if (
          enseignantId &&
          String(
            preparation.enseignant_id
          ) !== String(enseignantId)
        ) {
          return false
        }


        // -------------------------------
        // CLASSE
        // -------------------------------

        if (
          classeId &&
          String(
            preparation.classe_id
          ) !== String(classeId)
        ) {
          return false
        }


        // -------------------------------
        // STATUT
        // -------------------------------

        if (
          statut &&
          preparation.statut !== statut
        ) {
          return false
        }


        // -------------------------------
        // DATE DÉBUT
        // -------------------------------

        if (
          dateDebut &&
          preparation.date_lecon &&
          preparation.date_lecon <
            dateDebut
        ) {
          return false
        }


        // -------------------------------
        // DATE FIN
        // -------------------------------

        if (
          dateFin &&
          preparation.date_lecon &&
          preparation.date_lecon >
            dateFin
        ) {
          return false
        }


        return true
      }
    )

  }, [
    preparations,
    enseignantId,
    classeId,
    statut,
    dateDebut,
    dateFin,
  ])


  // =====================================================
  // STATISTIQUES
  // =====================================================

  const statistiques = useMemo(() => {

    const total =
      preparationsFiltrees.length

    const soumises =
      preparationsFiltrees.filter(
        (p) => p.statut === 'soumis'
      ).length

    const validees =
      preparationsFiltrees.filter(
        (p) => p.statut === 'valide'
      ).length

    const rejetees =
      preparationsFiltrees.filter(
        (p) => p.statut === 'rejete'
      ).length

    const brouillons =
      preparationsFiltrees.filter(
        (p) => p.statut === 'brouillon'
      ).length


    return {
      total,
      soumises,
      validees,
      rejetees,
      brouillons,
    }

  }, [preparationsFiltrees])


  // =====================================================
  // RÉINITIALISER
  // =====================================================

  const reinitialiser = () => {

    setEnseignantId('')
    setClasseId('')
    setStatut('')
    setDateDebut('')
    setDateFin('')

  }


  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formaterDate = (date) => {

    if (!date) {
      return 'Non renseignée'
    }

    try {

      return new Date(
        `${date}T12:00:00`
      ).toLocaleDateString(
        'fr-FR'
      )

    } catch {

      return date

    }

  }


  // =====================================================
  // STATUT
  // =====================================================

  const afficherStatut = (statut) => {

    switch (statut) {

      case 'soumis':

        return {
          texte: 'À vérifier',
          classe:
            'bg-amber-50 text-amber-700',
          Icone: Clock,
        }


      case 'valide':

        return {
          texte: 'Validée',
          classe:
            'bg-emerald-50 text-emerald-700',
          Icone: CheckCircle2,
        }


      case 'rejete':

        return {
          texte: 'Rejetée',
          classe:
            'bg-red-50 text-red-700',
          Icone: XCircle,
        }


      default:

        return {
          texte: 'Brouillon',
          classe:
            'bg-slate-100 text-slate-600',
          Icone: ClipboardList,
        }

    }

  }
const obtenirNomEnseignant = () => {

  const enseignant =
    enseignants.find(
      (e) =>
        String(e.id) ===
        String(enseignantId)
    )

  return enseignant?.nom || ''
}


const obtenirNomClasse = () => {

  const classe =
    classes.find(
      (c) =>
        String(c.id) ===
        String(classeId)
    )

  if (!classe) {
    return ''
  }

  return `${classe.nom} — ${classe.section}`
}


const obtenirNomStatut = () => {

  switch (statut) {

    case 'soumis':
      return 'À vérifier'

    case 'valide':
      return 'Validées'

    case 'rejete':
      return 'Rejetées'

    case 'brouillon':
      return 'Brouillons'

    default:
      return ''

  }

}


const filtresExport = {

  enseignantNom:
    obtenirNomEnseignant(),

  classeNom:
    obtenirNomClasse(),

  statutNom:
    obtenirNomStatut(),

  dateDebut,

  dateFin,

}


  return (

    <div className="space-y-5 sm:space-y-6">

      {/* =================================================
          EN-TÊTE
      ================================================= */}

      <div>
<div className="
  flex
  flex-col
  sm:flex-row
  sm:items-center
  sm:justify-between
  gap-3
  mb-4
">

  <div>

    <h2 className="
      text-lg
      font-bold
      text-slate-900
    ">
      Exporter le rapport
    </h2>

    <p className="
      text-sm
      text-slate-500
      mt-1
    ">
      Téléchargez les résultats selon les filtres sélectionnés.
    </p>

  </div>


  <div className="
    flex
    flex-col
    sm:flex-row
    gap-2
  ">

    <button
      type="button"
      disabled={
        exportation ||
        preparationsFiltrees.length === 0
      }
      onClick={async () => {

        try {

          setExportation(true)

          exporterRapportPDF(
            preparationsFiltrees,
            filtresExport
          )

        } catch (err) {

          console.error(err)

          alert(
            'Impossible de générer le PDF.'
          )

        } finally {

          setExportation(false)

        }

      }}
      className="
        inline-flex
        items-center
        justify-center
        gap-2
        px-4
        py-3
        rounded-xl
        bg-red-600
        text-white
        text-sm
        font-semibold
        hover:bg-red-700
        disabled:opacity-50
        disabled:cursor-not-allowed
        transition
      "
    >

      📄

      {exportation
        ? 'Génération...'
        : 'Télécharger PDF'}

    </button>


    <button
      type="button"
      disabled={
        exportation ||
        preparationsFiltrees.length === 0
      }
      onClick={async () => {

        try {

          setExportation(true)

          await exporterRapportWord(
            preparationsFiltrees,
            filtresExport
          )

        } catch (err) {

          console.error(err)

          alert(
            'Impossible de générer le fichier Word.'
          )

        } finally {

          setExportation(false)

        }

      }}
      className="
        inline-flex
        items-center
        justify-center
        gap-2
        px-4
        py-3
        rounded-xl
        bg-blue-600
        text-white
        text-sm
        font-semibold
        hover:bg-blue-700
        disabled:opacity-50
        disabled:cursor-not-allowed
        transition
      "
    >

      📝

      {exportation
        ? 'Génération...'
        : 'Télécharger Word'}

    </button>

  </div>

</div>
        <Link
          to="/admin"
          className="
            inline-flex
            items-center
            gap-2
            text-sm
            text-indigo-600
            hover:text-indigo-700
            font-medium
            mb-4
          "
        >

          <ArrowLeft size={17} />

          Retour au tableau de bord

        </Link>


        <div className="
          flex
          flex-col
          sm:flex-row
          sm:items-center
          sm:justify-between
          gap-4
        ">

          <div>

            <p className="
              text-sm
              font-medium
              text-indigo-600
            ">
              Administration
            </p>

            <h1 className="
              text-2xl
              sm:text-3xl
              font-bold
              text-slate-900
              mt-1
            ">
              Rapports
            </h1>

            <p className="
              text-sm
              text-slate-500
              mt-2
            ">
              Consultez les activités pédagogiques et les préparations des enseignants.
            </p>

          </div>


          <button
            type="button"
            onClick={chargerDonnees}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              px-4
              py-3
              rounded-xl
              border
              border-slate-300
              bg-white
              text-slate-700
              hover:bg-slate-50
              text-sm
              font-semibold
              transition
            "
          >

            <RefreshCw size={17} />

            Actualiser

          </button>

        </div>

      </div>


      {/* =================================================
          ERREUR
      ================================================= */}

      {erreur && (

        <div className="
          flex
          items-start
          gap-3
          bg-red-50
          border
          border-red-200
          text-red-700
          rounded-xl
          px-4
          py-3
          text-sm
        ">

          <XCircle
            size={19}
            className="shrink-0"
          />

          <span>
            {erreur}
          </span>

        </div>

      )}


      {/* =================================================
          FILTRES
      ================================================= */}

      <section className="
        bg-white
        border
        border-slate-200
        rounded-2xl
        shadow-sm
        overflow-hidden
      ">


        <div className="
          px-4
          sm:px-5
          py-4
          border-b
          border-slate-200
          flex
          items-center
          justify-between
          gap-3
        ">

          <div className="
            flex
            items-center
            gap-3
          ">

            <div className="
              w-10
              h-10
              rounded-xl
              bg-indigo-50
              text-indigo-600
              flex
              items-center
              justify-center
            ">

              <Filter size={20} />

            </div>

            <div>

              <h2 className="
                font-bold
                text-slate-900
              ">
                Filtres du rapport
              </h2>

              <p className="
                text-xs
                text-slate-500
                mt-1
              ">
                Sélectionnez les critères à afficher.
              </p>

            </div>

          </div>


          <button
            type="button"
            onClick={reinitialiser}
            className="
              inline-flex
              items-center
              gap-2
              text-xs
              sm:text-sm
              font-semibold
              text-slate-500
              hover:text-indigo-600
            "
          >

            <RotateCcw size={15} />

            Réinitialiser

          </button>

        </div>


        <div className="
          p-4
          sm:p-5
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-3
          gap-4
        ">


          {/* ENSEIGNANT */}

          <div>

            <label className="
              block
              text-sm
              font-semibold
              text-slate-700
              mb-2
            ">
              Enseignant
            </label>

            <select
              value={enseignantId}
              onChange={(e) =>
                setEnseignantId(
                  e.target.value
                )
              }
              className="
                w-full
                h-11
                px-3
                rounded-xl
                border
                border-slate-300
                bg-white
                text-sm
                outline-none
                focus:ring-2
                focus:ring-indigo-500
              "
            >

              <option value="">
                Tous les enseignants
              </option>

              {enseignants.map(
                (enseignant) => (

                  <option
                    key={enseignant.id}
                    value={enseignant.id}
                  >
                    {enseignant.nom}
                  </option>

                )
              )}

            </select>

          </div>


          {/* CLASSE */}

          <div>

            <label className="
              block
              text-sm
              font-semibold
              text-slate-700
              mb-2
            ">
              Classe
            </label>

            <select
              value={classeId}
              onChange={(e) =>
                setClasseId(
                  e.target.value
                )
              }
              className="
                w-full
                h-11
                px-3
                rounded-xl
                border
                border-slate-300
                bg-white
                text-sm
                outline-none
                focus:ring-2
                focus:ring-indigo-500
              "
            >

              <option value="">
                Toutes les classes
              </option>

              {classes.map(
                (classe) => (

                  <option
                    key={classe.id}
                    value={classe.id}
                  >
                    {classe.nom} — {classe.section}
                  </option>

                )
              )}

            </select>

          </div>


          {/* STATUT */}

          <div>

            <label className="
              block
              text-sm
              font-semibold
              text-slate-700
              mb-2
            ">
              Statut
            </label>

            <select
              value={statut}
              onChange={(e) =>
                setStatut(
                  e.target.value
                )
              }
              className="
                w-full
                h-11
                px-3
                rounded-xl
                border
                border-slate-300
                bg-white
                text-sm
                outline-none
                focus:ring-2
                focus:ring-indigo-500
              "
            >

              <option value="">
                Tous les statuts
              </option>

              <option value="soumis">
                À vérifier
              </option>

              <option value="valide">
                Validées
              </option>

              <option value="rejete">
                Rejetées
              </option>

              <option value="brouillon">
                Brouillons
              </option>

            </select>

          </div>


          {/* DATE DÉBUT */}

          <div>

            <label className="
              block
              text-sm
              font-semibold
              text-slate-700
              mb-2
            ">
              Date début
            </label>

            <div className="relative">

              <CalendarDays
                size={17}
                className="
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                  pointer-events-none
                "
              />

              <input
                type="date"
                value={dateDebut}
                onChange={(e) =>
                  setDateDebut(
                    e.target.value
                  )
                }
                className="
                  w-full
                  h-11
                  pl-10
                  pr-3
                  rounded-xl
                  border
                  border-slate-300
                  text-sm
                  outline-none
                  focus:ring-2
                  focus:ring-indigo-500
                "
              />

            </div>

          </div>


          {/* DATE FIN */}

          <div>

            <label className="
              block
              text-sm
              font-semibold
              text-slate-700
              mb-2
            ">
              Date fin
            </label>

            <div className="relative">

              <CalendarDays
                size={17}
                className="
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                  pointer-events-none
                "
              />

              <input
                type="date"
                value={dateFin}
                onChange={(e) =>
                  setDateFin(
                    e.target.value
                  )
                }
                className="
                  w-full
                  h-11
                  pl-10
                  pr-3
                  rounded-xl
                  border
                  border-slate-300
                  text-sm
                  outline-none
                  focus:ring-2
                  focus:ring-indigo-500
                "
              />

            </div>

          </div>


          {/* RÉSULTAT */}

          <div className="
            flex
            items-end
          ">

            <div className="
              w-full
              h-11
              flex
              items-center
              gap-2
              px-4
              rounded-xl
              bg-indigo-50
              text-indigo-700
              text-sm
              font-semibold
            ">

              <BarChart3 size={17} />

              {preparationsFiltrees.length}
              {' '}
              résultat(s)

            </div>

          </div>

        </div>

      </section>


      {/* =================================================
          STATISTIQUES
      ================================================= */}

      <div className="
        grid
        grid-cols-2
        lg:grid-cols-5
        gap-3
        sm:gap-4
      ">


        <CarteStat
          titre="Total"
          valeur={statistiques.total}
          Icone={ClipboardList}
          classe="bg-indigo-50 text-indigo-600"
        />


        <CarteStat
          titre="À vérifier"
          valeur={statistiques.soumises}
          Icone={Clock}
          classe="bg-amber-50 text-amber-600"
        />


        <CarteStat
          titre="Validées"
          valeur={statistiques.validees}
          Icone={CheckCircle2}
          classe="bg-emerald-50 text-emerald-600"
        />


        <CarteStat
          titre="Rejetées"
          valeur={statistiques.rejetees}
          Icone={XCircle}
          classe="bg-red-50 text-red-600"
        />


        <CarteStat
          titre="Brouillons"
          valeur={statistiques.brouillons}
          Icone={ClipboardList}
          classe="bg-slate-100 text-slate-600"
        />

      </div>


      {/* =================================================
          LISTE DU RAPPORT
      ================================================= */}

      <section className="
        bg-white
        border
        border-slate-200
        rounded-2xl
        shadow-sm
        overflow-hidden
      ">

        <div className="
          px-4
          sm:px-5
          py-4
          border-b
          border-slate-200
          flex
          items-center
          gap-3
        ">

          <div className="
            w-10
            h-10
            rounded-xl
            bg-blue-50
            text-blue-600
            flex
            items-center
            justify-center
          ">

            <BarChart3 size={20} />

          </div>

          <div>

            <h2 className="
              font-bold
              text-slate-900
            ">
              Résultats du rapport
            </h2>

            <p className="
              text-xs
              text-slate-500
              mt-1
            ">
              Préparations correspondant aux filtres sélectionnés.
            </p>

          </div>

        </div>


        {chargement ? (

          <div className="
            py-14
            flex
            items-center
            justify-center
            text-slate-500
            text-sm
          ">

            <Loader2
              size={22}
              className="
                animate-spin
                mr-2
              "
            />

            Chargement...

          </div>

        ) : preparationsFiltrees.length === 0 ? (

          <div className="
            py-14
            text-center
          ">

            <ClipboardList
              size={42}
              className="
                mx-auto
                text-slate-300
              "
            />

            <h3 className="
              mt-4
              font-semibold
              text-slate-800
            ">
              Aucun résultat
            </h3>

            <p className="
              mt-1
              text-sm
              text-slate-500
            ">
              Aucune préparation ne correspond aux critères sélectionnés.
            </p>

          </div>

        ) : (

          <>

            {/* =================================================
                ORDINATEUR
            ================================================= */}

            <div className="hidden md:block overflow-x-auto">

              <table className="w-full text-sm">

                <thead className="
                  bg-slate-50
                  border-b
                  border-slate-200
                ">

                  <tr>

                    <th className="
                      text-left
                      px-5
                      py-3
                      font-semibold
                      text-slate-600
                    ">
                      Enseignant
                    </th>

                    <th className="
                      text-left
                      px-5
                      py-3
                      font-semibold
                      text-slate-600
                    ">
                      Classe
                    </th>

                    <th className="
                      text-left
                      px-5
                      py-3
                      font-semibold
                      text-slate-600
                    ">
                      Branche
                    </th>

                    <th className="
                      text-left
                      px-5
                      py-3
                      font-semibold
                      text-slate-600
                    ">
                      Sujet
                    </th>

                    <th className="
                      text-left
                      px-5
                      py-3
                      font-semibold
                      text-slate-600
                    ">
                      Date
                    </th>

                    <th className="
                      text-left
                      px-5
                      py-3
                      font-semibold
                      text-slate-600
                    ">
                      Statut
                    </th>

                  </tr>

                </thead>


                <tbody className="
                  divide-y
                  divide-slate-100
                ">

                  {preparationsFiltrees.map(
                    (preparation) => {

                      const statutInfo =
                        afficherStatut(
                          preparation.statut
                        )

                      const Icone =
                        statutInfo.Icone

                      return (

                        <tr
                          key={preparation.id}
                          className="
                            hover:bg-slate-50
                            transition
                          "
                        >

                          <td className="
                            px-5
                            py-4
                          ">

                            <p className="
                              font-semibold
                              text-slate-900
                            ">
                              {preparation.enseignant_nom ||
                                'Non renseigné'}
                            </p>

                          </td>


                          <td className="
                            px-5
                            py-4
                            text-slate-600
                          ">

                            <p>
                              {preparation.classe_nom ||
                                'Non affectée'}
                            </p>

                            <p className="
                              text-xs
                              text-slate-400
                              mt-1
                            ">
                              {preparation.section || ''}
                            </p>

                          </td>


                          <td className="
                            px-5
                            py-4
                            text-slate-600
                          ">

                            {preparation.branche ||
                              preparation.matiere ||
                              'Non renseignée'}

                          </td>


                          <td className="
                            px-5
                            py-4
                            text-slate-700
                            max-w-[250px]
                          ">

                            <p className="
                              font-medium
                              truncate
                            ">

                              {preparation.sujet ||
                                preparation.titre ||
                                'Sans sujet'}

                            </p>

                          </td>


                          <td className="
                            px-5
                            py-4
                            text-slate-600
                          ">

                            {formaterDate(
                              preparation.date_lecon
                            )}

                          </td>


                          <td className="
                            px-5
                            py-4
                          ">

                            <span className={`
                              inline-flex
                              items-center
                              gap-1.5
                              px-2.5
                              py-1
                              rounded-full
                              text-xs
                              font-semibold
                              ${statutInfo.classe}
                            `}>

                              <Icone size={14} />

                              {statutInfo.texte}

                            </span>

                          </td>

                        </tr>

                      )

                    }
                  )}

                </tbody>

              </table>

            </div>


            {/* =================================================
                MOBILE
            ================================================= */}

            <div className="
              md:hidden
              divide-y
              divide-slate-100
            ">

              {preparationsFiltrees.map(
                (preparation) => {

                  const statutInfo =
                    afficherStatut(
                      preparation.statut
                    )

                  const Icone =
                    statutInfo.Icone

                  return (

                    <div
                      key={preparation.id}
                      className="p-4"
                    >

                      <div className="
                        flex
                        items-start
                        justify-between
                        gap-3
                      ">

                        <div className="min-w-0">

                          <h3 className="
                            font-semibold
                            text-slate-900
                          ">

                            {preparation.sujet ||
                              preparation.titre ||
                              'Sans sujet'}

                          </h3>

                          <p className="
                            text-sm
                            text-slate-600
                            mt-1
                          ">

                            {preparation.enseignant_nom ||
                              'Enseignant non renseigné'}

                          </p>

                        </div>


                        <span className={`
                          shrink-0
                          inline-flex
                          items-center
                          gap-1
                          px-2
                          py-1
                          rounded-full
                          text-[11px]
                          font-semibold
                          ${statutInfo.classe}
                        `}>

                          <Icone size={12} />

                          {statutInfo.texte}

                        </span>

                      </div>


                      <div className="
                        grid
                        grid-cols-2
                        gap-3
                        mt-4
                      ">

                        <div>

                          <p className="
                            text-[11px]
                            text-slate-400
                            uppercase
                          ">
                            Classe
                          </p>

                          <p className="
                            text-sm
                            font-medium
                            text-slate-700
                            mt-1
                          ">

                            {preparation.classe_nom ||
                              'Non affectée'}

                          </p>

                        </div>


                        <div>

                          <p className="
                            text-[11px]
                            text-slate-400
                            uppercase
                          ">
                            Branche
                          </p>

                          <p className="
                            text-sm
                            font-medium
                            text-slate-700
                            mt-1
                          ">

                            {preparation.branche ||
                              preparation.matiere ||
                              'Non renseignée'}

                          </p>

                        </div>


                        <div>

                          <p className="
                            text-[11px]
                            text-slate-400
                            uppercase
                          ">
                            Date
                          </p>

                          <p className="
                            text-sm
                            font-medium
                            text-slate-700
                            mt-1
                          ">

                            {formaterDate(
                              preparation.date_lecon
                            )}

                          </p>

                        </div>


                        <div>

                          <p className="
                            text-[11px]
                            text-slate-400
                            uppercase
                          ">
                            Fiche N°
                          </p>

                          <p className="
                            text-sm
                            font-medium
                            text-slate-700
                            mt-1
                          ">

                            {preparation.fiche_numero ||
                              '—'}

                          </p>

                        </div>

                      </div>


                      {preparation.statut ===
                        'valide' && (

                        <Link
                          to={`/admin/preparations/${preparation.id}`}
                          className="
                            mt-4
                            w-full
                            inline-flex
                            items-center
                            justify-center
                            gap-2
                            px-4
                            py-2.5
                            rounded-xl
                            bg-indigo-50
                            text-indigo-600
                            hover:bg-indigo-100
                            text-xs
                            font-semibold
                          "
                        >

                          <ClipboardList
                            size={15}
                          />

                          Consulter la préparation

                        </Link>

                      )}

                    </div>

                  )

                }
              )}

            </div>

          </>

        )}

      </section>

    </div>
  )
}


// =====================================================
// CARTE STATISTIQUE
// =====================================================

function CarteStat({
  titre,
  valeur,
  Icone,
  classe,
}) {

  return (

    <div className="
      bg-white
      border
      border-slate-200
      rounded-2xl
      p-4
      sm:p-5
      shadow-sm
    ">

      <div className="
        flex
        items-start
        justify-between
        gap-3
      ">

        <div>

          <p className="
            text-xs
            text-slate-500
          ">
            {titre}
          </p>

          <p className="
            text-2xl
            font-bold
            text-slate-900
            mt-1
          ">
            {valeur}
          </p>

        </div>


        <div className={`
          w-10
          h-10
          rounded-xl
          flex
          items-center
          justify-center
          ${classe}
        `}>

          <Icone size={19} />

        </div>

      </div>

    </div>

  )
}


export default RapportsAdmin