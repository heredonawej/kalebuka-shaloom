import { useEffect, useMemo, useState } from 'react'
import { API_URL } from '../api'
import {
  CalendarDays,
  Users,
  UserCheck,
  UserX,
  Search,
  RefreshCw,
  ClipboardCheck,
  Loader2,
  History,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react'

const SECTIONS = [
  'Maternelle',
  'Primaire',
  'Secondaire',
]

function RegistreAppelAdmin() {
  const [vueActive, setVueActive] = useState('jour')

  const [classes, setClasses] = useState([])
  const [historique, setHistorique] = useState([])
  const [presences, setPresences] = useState([])

  const [sectionActive, setSectionActive] =
    useState('Maternelle')

  const [classeSelectionnee, setClasseSelectionnee] =
    useState('')

  const [dateSelectionnee, setDateSelectionnee] =
    useState(
      new Date().toISOString().slice(0, 10)
    )

  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')

  const [recherche, setRecherche] = useState('')

  const [chargementClasses, setChargementClasses] =
    useState(true)

  const [chargement, setChargement] =
    useState(false)

  const [historiqueSelectionne, setHistoriqueSelectionne] =
    useState(null)

  // =====================================================
  // CHARGER LES CLASSES
  // =====================================================

  const chargerClasses = async () => {
    try {
      setChargementClasses(true)

      const response = await fetch(
        `${API_URL}/api/classes`
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.erreur ||
            'Impossible de récupérer les classes.'
        )
      }

      setClasses(data)
    } catch (error) {
      console.error(error)
      alert(error.message)
    } finally {
      setChargementClasses(false)
    }
  }

  useEffect(() => {
    chargerClasses()
  }, [])

  // =====================================================
  // CLASSES DE LA SECTION
  // =====================================================

  const classesSection = useMemo(() => {
    return classes.filter(
      (classe) =>
        classe.section === sectionActive
    )
  }, [classes, sectionActive])

  // =====================================================
  // CHANGEMENT DE SECTION
  // =====================================================

  const changerSection = (section) => {
    setSectionActive(section)
    setClasseSelectionnee('')
    setPresences([])
    setRecherche('')
  }

  // =====================================================
  // CHARGER L'APPEL DU JOUR
  // =====================================================

  const chargerAppel = async () => {
    if (!classeSelectionnee) {
      setPresences([])
      return
    }

    try {
      setChargement(true)

      const response = await fetch(
        `${API_URL}/api/presences/classe/${classeSelectionnee}?date=${dateSelectionnee}`
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.erreur ||
            "Impossible de récupérer l'appel."
        )
      }

      setPresences(data)
    } catch (error) {
      console.error(error)
      alert(error.message)
      setPresences([])
    } finally {
      setChargement(false)
    }
  }

  useEffect(() => {
    if (
      vueActive === 'jour' &&
      !historiqueSelectionne
    ) {
      chargerAppel()
    }
  }, [
    classeSelectionnee,
    dateSelectionnee,
    vueActive,
  ])

    // =====================================================
  // CHARGER HISTORIQUE
  // =====================================================

  const chargerHistorique = async () => {
    try {
      setChargement(true)

      const params = new URLSearchParams()

      // IMPORTANT :
      // On ne filtre plus automatiquement par section.
      // L'historique affiche tous les appels enregistrés.
      //
      // La classe est filtrée uniquement si
      // l'administrateur en sélectionne une.

      if (classeSelectionnee) {
        params.append(
          'classe_id',
          classeSelectionnee
        )
      }

      // Filtre date début
      if (dateDebut) {
        params.append(
          'date_debut',
          dateDebut
        )
      }

      // Filtre date fin
      if (dateFin) {
        params.append(
          'date_fin',
          dateFin
        )
      }

      const queryString =
        params.toString()

      const url =
        `${API_URL}/api/presences/historique` +
        (queryString
          ? `?${queryString}`
          : '')

      console.log(
        'URL HISTORIQUE :',
        url
      )

      const response =
        await fetch(url)

      const data =
        await response.json()

      console.log(
        'HISTORIQUE REÇU :',
        data
      )

      if (!response.ok) {
        throw new Error(
          data.erreur ||
            "Impossible de récupérer l'historique."
        )
      }

      setHistorique(
        Array.isArray(data)
          ? data
          : []
      )

    } catch (error) {

      console.error(
        'ERREUR HISTORIQUE :',
        error
      )

      alert(
        error.message ||
          "Impossible de récupérer l'historique."
      )

      setHistorique([])

    } finally {
      setChargement(false)
    }
  }

  useEffect(() => {
    if (
      vueActive === 'historique' &&
      !historiqueSelectionne
    ) {
      chargerHistorique()
    }
  }, [
    vueActive,
    sectionActive,
    classeSelectionnee,
  ])

  // =====================================================
  // STATISTIQUES DU JOUR
  // =====================================================

  const totalEleves = presences.length

  const totalPresents = presences.filter(
    (eleve) =>
      eleve.statut === 'present'
  ).length

  const totalAbsents = presences.filter(
    (eleve) =>
      eleve.statut === 'absent'
  ).length

  const tauxPresence =
    totalEleves > 0
      ? Math.round(
          (totalPresents / totalEleves) * 100
        )
      : 0

  // =====================================================
  // RECHERCHE ÉLÈVE
  // =====================================================

  const presencesFiltrees = useMemo(() => {
    const texte = recherche
      .trim()
      .toLowerCase()

    if (!texte) {
      return presences
    }

    return presences.filter((eleve) => {
      const nom =
        `${eleve.nom || ''} ${eleve.prenom || ''}`
          .toLowerCase()

      return nom.includes(texte)
    })
  }, [presences, recherche])

  // =====================================================
  // STATISTIQUES HISTORIQUE
  // =====================================================

  const totalAppels = historique.length

  const totalPresentsHistorique =
    historique.reduce(
      (total, ligne) =>
        total + Number(ligne.presents || 0),
      0
    )

  const totalAbsentsHistorique =
    historique.reduce(
      (total, ligne) =>
        total + Number(ligne.absents || 0),
      0
    )

  const totalElevesHistorique =
    historique.reduce(
      (total, ligne) =>
        total + Number(ligne.total_eleves || 0),
      0
    )

  const tauxPresenceHistorique =
    totalElevesHistorique > 0
      ? Math.round(
          (totalPresentsHistorique /
            totalElevesHistorique) *
            100
        )
      : 0

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formaterDate = (date) => {
    if (!date) return '—'

    const texte = String(date).slice(0, 10)

    const dateFormatee = new Date(
      `${texte}T00:00:00`
    )

    if (
      Number.isNaN(
        dateFormatee.getTime()
      )
    ) {
      return '—'
    }

    return dateFormatee.toLocaleDateString(
      'fr-FR',
      {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }
    )
  }

  const formaterDateCourte = (date) => {
    if (!date) return '—'

    const texte = String(date).slice(0, 10)

    const dateFormatee = new Date(
      `${texte}T00:00:00`
    )

    if (
      Number.isNaN(
        dateFormatee.getTime()
      )
    ) {
      return '—'
    }

    return dateFormatee.toLocaleDateString(
      'fr-FR'
    )
  }

  // =====================================================
  // NOM ENSEIGNANT
  // =====================================================

  const afficherEnseignant = (ligne) => {
    if (ligne?.enseignant_nom) {
      return ligne.enseignant_nom
    }

    if (ligne?.enseignant_prenom) {
      return `${ligne.enseignant_prenom} ${
        ligne.enseignant_nom || ''
      }`.trim()
    }

    if (ligne?.enseignant_id) {
      return `Enseignant #${ligne.enseignant_id}`
    }

    return 'Enseignant non renseigné'
  }

  // =====================================================
  // OUVRIR LE DÉTAIL D'UN APPEL
  // =====================================================

  const ouvrirDetail = async (ligne) => {
    try {
      setChargement(true)

      const date = String(
        ligne.date_appel
      ).slice(0, 10)

      const response = await fetch(
        `${API_URL}/api/presences/classe/${ligne.classe_id}?date=${date}`
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.erreur ||
            "Impossible de récupérer le détail."
        )
      }

      setPresences(
        Array.isArray(data) ? data : []
      )

      setRecherche('')
      setHistoriqueSelectionne(ligne)
    } catch (error) {
      console.error(error)
      alert(error.message)
    } finally {
      setChargement(false)
    }
  }

  // =====================================================
  // RETOUR À L'HISTORIQUE
  // =====================================================

  const retourHistorique = () => {
    setHistoriqueSelectionne(null)
    setPresences([])
    setRecherche('')
  }

  // =====================================================
  // RÉINITIALISER FILTRES
  // =====================================================

  const reinitialiserFiltres = () => {
    setClasseSelectionnee('')
    setDateDebut('')
    setDateFin('')
    setRecherche('')
  }

  // =====================================================
  // AFFICHAGE
  // =====================================================

  return (
    <div className="space-y-6 pb-10">

      {/* =================================================
          EN-TÊTE
      ================================================= */}

      <div className="
        rounded-3xl
        bg-gradient-to-br
        from-indigo-700
        via-indigo-600
        to-blue-600
        p-6
        text-white
        shadow-lg
        sm:p-8
      ">

        <div className="
          flex
          flex-col
          gap-5
          lg:flex-row
          lg:items-center
          lg:justify-between
        ">

          <div className="
            flex
            items-center
            gap-4
          ">

            <div className="
              flex
              h-14
              w-14
              shrink-0
              items-center
              justify-center
              rounded-2xl
              bg-white/15
              backdrop-blur
            ">
              <ClipboardCheck size={28} />
            </div>

            <div>

              <p className="
                text-xs
                font-bold
                uppercase
                tracking-wider
                text-indigo-200
              ">
                Administration
              </p>

              <h1 className="
                mt-1
                text-2xl
                font-black
                sm:text-3xl
              ">
                Registre d'appel
              </h1>

              <p className="
                mt-1
                text-sm
                text-indigo-100
              ">
                Suivi quotidien et historique
                des présences
              </p>

            </div>

          </div>

          {/* ONGLETS */}

          <div className="
            flex
            w-full
            rounded-2xl
            bg-white/10
            p-1
            backdrop-blur
            sm:w-auto
          ">

            <button
              onClick={() => {
                setVueActive('jour')
                setHistoriqueSelectionne(null)
              }}
              className={`
                flex
                flex-1
                items-center
                justify-center
                gap-2
                rounded-xl
                px-4
                py-2.5
                text-sm
                font-bold
                transition
                sm:flex-none
                ${
                  vueActive === 'jour'
                    ? 'bg-white text-indigo-700 shadow'
                    : 'text-white hover:bg-white/10'
                }
              `}
            >
              <ClipboardCheck size={17} />
              Appel du jour
            </button>

            <button
              onClick={() => {
                setVueActive('historique')
                setHistoriqueSelectionne(null)
                setPresences([])
              }}
              className={`
                flex
                flex-1
                items-center
                justify-center
                gap-2
                rounded-xl
                px-4
                py-2.5
                text-sm
                font-bold
                transition
                sm:flex-none
                ${
                  vueActive === 'historique'
                    ? 'bg-white text-indigo-700 shadow'
                    : 'text-white hover:bg-white/10'
                }
              `}
            >
              <History size={17} />
              Historique
            </button>

          </div>

        </div>

      </div>

      {/* =================================================
          SECTIONS
      ================================================= */}

      {!historiqueSelectionne && (
        <div className="
          grid
          gap-4
          md:grid-cols-3
        ">

          {SECTIONS.map((section) => {

            const active =
              sectionActive === section

            const nombreClasses =
              classes.filter(
                (classe) =>
                  classe.section === section
              ).length

            return (
              <button
                key={section}
                onClick={() =>
                  changerSection(section)
                }
                className={`
                  rounded-2xl
                  border
                  p-5
                  text-left
                  transition
                  ${
                    active
                      ? 'border-indigo-500 bg-indigo-50 shadow-md'
                      : 'border-slate-200 bg-white hover:border-indigo-200 hover:shadow-sm'
                  }
                `}
              >

                <div className="
                  flex
                  items-center
                  justify-between
                ">

                  <div>

                    <p className="
                      text-xs
                      font-bold
                      uppercase
                      tracking-wide
                      text-slate-400
                    ">
                      Section
                    </p>

                    <h2 className="
                      mt-1
                      text-lg
                      font-black
                      text-slate-900
                    ">
                      {section}
                    </h2>

                  </div>

                  <div className={`
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    ${
                      active
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }
                  `}>
                    <Users size={21} />
                  </div>

                </div>

                <p className="
                  mt-4
                  text-sm
                  text-slate-500
                ">
                  {nombreClasses}{' '}
                  classe
                  {nombreClasses > 1
                    ? 's'
                    : ''}
                </p>

              </button>
            )
          })}

        </div>
      )}

      {/* =================================================
          DÉTAIL HISTORIQUE
      ================================================= */}

      {historiqueSelectionne ? (

        <div className="space-y-6">

          <button
            onClick={retourHistorique}
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-white
              px-4
              py-2.5
              text-sm
              font-bold
              text-slate-700
              shadow-sm
              ring-1
              ring-slate-200
              transition
              hover:bg-slate-50
            "
          >
            <ArrowLeft size={17} />
            Retour à l'historique
          </button>

          <div className="
            rounded-3xl
            border
            border-slate-200
            bg-white
            p-6
            shadow-sm
          ">

            <div className="
              flex
              flex-col
              gap-4
              sm:flex-row
              sm:items-center
              sm:justify-between
            ">

              <div>

                <p className="
                  text-xs
                  font-bold
                  uppercase
                  tracking-wide
                  text-indigo-600
                ">
                  Détail de l'appel
                </p>

                <h2 className="
                  mt-1
                  text-2xl
                  font-black
                  text-slate-900
                ">
                  {historiqueSelectionne.classe_nom}
                </h2>

                <p className="
                  mt-1
                  text-sm
                  capitalize
                  text-slate-500
                ">
                  {formaterDate(
                    historiqueSelectionne.date_appel
                  )}
                </p>

              </div>

              <div className="
                rounded-2xl
                bg-indigo-50
                px-5
                py-4
              ">

                <p className="
                  text-xs
                  font-bold
                  text-indigo-500
                ">
                  Enseignant
                </p>

                <p className="
                  mt-1
                  font-bold
                  text-indigo-900
                ">
                  {afficherEnseignant(
                    historiqueSelectionne
                  )}
                </p>

              </div>

            </div>

          </div>

          {/* STATS */}

          <div className="
            grid
            gap-4
            sm:grid-cols-3
          ">

            <div className="
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-5
              shadow-sm
            ">
              <p className="
                text-xs
                font-bold
                uppercase
                text-slate-400
              ">
                Total élèves
              </p>

              <p className="
                mt-2
                text-3xl
                font-black
                text-slate-900
              ">
                {presences.length}
              </p>
            </div>

            <div className="
              rounded-2xl
              border
              border-emerald-100
              bg-emerald-50
              p-5
            ">
              <p className="
                text-xs
                font-bold
                uppercase
                text-emerald-600
              ">
                Présents
              </p>

              <p className="
                mt-2
                text-3xl
                font-black
                text-emerald-700
              ">
                {
                  presences.filter(
                    (e) =>
                      e.statut === 'present'
                  ).length
                }
              </p>
            </div>

            <div className="
              rounded-2xl
              border
              border-red-100
              bg-red-50
              p-5
            ">
              <p className="
                text-xs
                font-bold
                uppercase
                text-red-600
              ">
                Absents
              </p>

              <p className="
                mt-2
                text-3xl
                font-black
                text-red-700
              ">
                {
                  presences.filter(
                    (e) =>
                      e.statut === 'absent'
                  ).length
                }
              </p>
            </div>

          </div>

          {/* RECHERCHE */}

          <div className="
            relative
            max-w-md
          ">

            <Search
              size={18}
              className="
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-slate-400
              "
            />

            <input
              type="text"
              value={recherche}
              onChange={(e) =>
                setRecherche(e.target.value)
              }
              placeholder="Rechercher un élève..."
              className="
                w-full
                rounded-xl
                border
                border-slate-200
                bg-white
                py-3
                pl-11
                pr-4
                text-sm
                outline-none
                focus:border-indigo-500
                focus:ring-4
                focus:ring-indigo-100
              "
            />

          </div>

          {/* TABLEAU */}

          <div className="
            overflow-hidden
            rounded-3xl
            border
            border-slate-200
            bg-white
            shadow-sm
          ">

            <div className="overflow-x-auto">

              <table className="
                min-w-full
                divide-y
                divide-slate-200
              ">

                <thead className="bg-slate-50">

                  <tr>

                    <th className="
                      px-6
                      py-4
                      text-left
                      text-xs
                      font-bold
                      uppercase
                      text-slate-500
                    ">
                      Élève
                    </th>

                    <th className="
                      px-6
                      py-4
                      text-left
                      text-xs
                      font-bold
                      uppercase
                      text-slate-500
                    ">
                      Statut
                    </th>

                    <th className="
                      px-6
                      py-4
                      text-left
                      text-xs
                      font-bold
                      uppercase
                      text-slate-500
                    ">
                      Date
                    </th>

                  </tr>

                </thead>

                <tbody className="
                  divide-y
                  divide-slate-100
                ">

                  {presencesFiltrees.map(
                    (eleve) => {

                      const present =
                        eleve.statut ===
                        'present'

                      return (
                        <tr
                          key={
                            eleve.id ||
                            eleve.eleve_id
                          }
                          className="
                            hover:bg-slate-50
                          "
                        >

                          <td className="
                            px-6
                            py-4
                          ">

                            <p className="
                              font-bold
                              text-slate-900
                            ">
                              {eleve.nom}{' '}
                              {eleve.prenom}
                            </p>

                          </td>

                          <td className="
                            px-6
                            py-4
                          ">

                            <span className={`
                              inline-flex
                              items-center
                              gap-2
                              rounded-full
                              px-3
                              py-1.5
                              text-xs
                              font-bold
                              ${
                                present
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-red-50 text-red-700'
                              }
                            `}>

                              {present ? (
                                <UserCheck
                                  size={14}
                                />
                              ) : (
                                <UserX
                                  size={14}
                                />
                              )}

                              {present
                                ? 'Présent'
                                : 'Absent'}

                            </span>

                          </td>

                          <td className="
                            px-6
                            py-4
                            text-sm
                            text-slate-500
                          ">
                            {formaterDateCourte(
                              eleve.date_appel
                            )}
                          </td>

                        </tr>
                      )
                    }
                  )}

                </tbody>

              </table>

            </div>

          </div>

        </div>

      ) : vueActive === 'jour' ? (

        /* =================================================
           APPEL DU JOUR
        ================================================== */

        <div className="space-y-6">

          {/* FILTRES */}

          <div className="
            rounded-3xl
            border
            border-slate-200
            bg-white
            p-5
            shadow-sm
          ">

            <div className="
              grid
              gap-4
              md:grid-cols-2
              lg:grid-cols-3
            ">

              <div>

                <label className="
                  mb-2
                  block
                  text-xs
                  font-bold
                  uppercase
                  text-slate-500
                ">
                  Classe
                </label>

                <select
                  value={classeSelectionnee}
                  onChange={(e) =>
                    setClasseSelectionnee(
                      e.target.value
                    )
                  }
                  disabled={
                    chargementClasses
                  }
                  className="
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    px-4
                    py-3
                    text-sm
                    font-medium
                    outline-none
                    focus:border-indigo-500
                    focus:ring-4
                    focus:ring-indigo-100
                  "
                >

                  <option value="">
                    Sélectionner une classe
                  </option>

                  {classesSection.map(
                    (classe) => (
                      <option
                        key={classe.id}
                        value={classe.id}
                      >
                        {classe.nom}
                      </option>
                    )
                  )}

                </select>

              </div>

              <div>

                <label className="
                  mb-2
                  block
                  text-xs
                  font-bold
                  uppercase
                  text-slate-500
                ">
                  Date
                </label>

                <input
                  type="date"
                  value={dateSelectionnee}
                  onChange={(e) =>
                    setDateSelectionnee(
                      e.target.value
                    )
                  }
                  className="
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    px-4
                    py-3
                    text-sm
                    outline-none
                    focus:border-indigo-500
                    focus:ring-4
                    focus:ring-indigo-100
                  "
                />

              </div>

              <div className="
                flex
                items-end
              ">

                <button
                  onClick={chargerAppel}
                  className="
                    inline-flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-indigo-600
                    px-4
                    py-3
                    text-sm
                    font-bold
                    text-white
                    transition
                    hover:bg-indigo-700
                  "
                >
                  <RefreshCw size={17} />
                  Actualiser
                </button>

              </div>

            </div>

          </div>

          {/* DATE */}

          <div className="
            rounded-2xl
            bg-indigo-50
            px-5
            py-4
            text-sm
            text-indigo-800
          ">

            <div className="
              flex
              items-center
              gap-2
              font-semibold
              capitalize
            ">
              <CalendarDays size={18} />

              {formaterDate(
                dateSelectionnee
              )}
            </div>

          </div>

          {/* STATS */}

          {classeSelectionnee && (
            <div className="
              grid
              gap-4
              sm:grid-cols-2
              lg:grid-cols-4
            ">

              <div className="
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-5
                shadow-sm
              ">
                <p className="
                  text-xs
                  font-bold
                  uppercase
                  text-slate-400
                ">
                  Élèves
                </p>

                <p className="
                  mt-2
                  text-3xl
                  font-black
                  text-slate-900
                ">
                  {totalEleves}
                </p>
              </div>

              <div className="
                rounded-2xl
                border
                border-emerald-100
                bg-emerald-50
                p-5
              ">
                <p className="
                  text-xs
                  font-bold
                  uppercase
                  text-emerald-600
                ">
                  Présents
                </p>

                <p className="
                  mt-2
                  text-3xl
                  font-black
                  text-emerald-700
                ">
                  {totalPresents}
                </p>
              </div>

              <div className="
                rounded-2xl
                border
                border-red-100
                bg-red-50
                p-5
              ">
                <p className="
                  text-xs
                  font-bold
                  uppercase
                  text-red-600
                ">
                  Absents
                </p>

                <p className="
                  mt-2
                  text-3xl
                  font-black
                  text-red-700
                ">
                  {totalAbsents}
                </p>
              </div>

              <div className="
                rounded-2xl
                border
                border-indigo-100
                bg-indigo-50
                p-5
              ">
                <p className="
                  text-xs
                  font-bold
                  uppercase
                  text-indigo-600
                ">
                  Taux de présence
                </p>

                <p className="
                  mt-2
                  text-3xl
                  font-black
                  text-indigo-700
                ">
                  {tauxPresence}%
                </p>
              </div>

            </div>
          )}

          {/* RECHERCHE */}

          {classeSelectionnee && (
            <div className="
              relative
              max-w-md
            ">

              <Search
                size={18}
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <input
                type="text"
                value={recherche}
                onChange={(e) =>
                  setRecherche(e.target.value)
                }
                placeholder="Rechercher un élève..."
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  py-3
                  pl-11
                  pr-4
                  text-sm
                  outline-none
                  focus:border-indigo-500
                  focus:ring-4
                  focus:ring-indigo-100
                "
              />

            </div>
          )}

          {/* CHARGEMENT */}

          {chargement ? (

            <div className="
              flex
              min-h-[220px]
              items-center
              justify-center
              gap-3
              rounded-3xl
              border
              border-slate-200
              bg-white
              text-sm
              text-slate-500
            ">
              <Loader2
                size={22}
                className="animate-spin"
              />

              Chargement de l'appel...
            </div>

          ) : !classeSelectionnee ? (

            <div className="
              rounded-3xl
              border
              border-dashed
              border-slate-300
              bg-white
              p-10
              text-center
            ">

              <div className="
                mx-auto
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                bg-indigo-100
                text-indigo-600
              ">
                <ClipboardCheck size={28} />
              </div>

              <h3 className="
                mt-5
                text-lg
                font-bold
                text-slate-800
              ">
                Sélectionnez une classe
              </h3>

              <p className="
                mx-auto
                mt-2
                max-w-md
                text-sm
                leading-6
                text-slate-500
              ">
                Choisissez une classe pour
                consulter le registre d'appel.
              </p>

            </div>

          ) : presencesFiltrees.length === 0 ? (

            <div className="
              rounded-3xl
              border
              border-dashed
              border-slate-300
              bg-white
              p-10
              text-center
            ">

              <div className="
                mx-auto
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                bg-slate-100
                text-slate-500
              ">
                <CalendarDays size={28} />
              </div>

              <h3 className="
                mt-5
                text-lg
                font-bold
                text-slate-800
              ">
                Aucun appel enregistré
              </h3>

              <p className="
                mx-auto
                mt-2
                max-w-md
                text-sm
                text-slate-500
              ">
                Aucun registre d'appel n'a été
                enregistré pour cette classe à
                cette date.
              </p>

            </div>

          ) : (

            <div className="
              overflow-hidden
              rounded-3xl
              border
              border-slate-200
              bg-white
              shadow-sm
            ">

              {/* MOBILE */}

              <div className="
                divide-y
                divide-slate-100
                md:hidden
              ">

                {presencesFiltrees.map(
                  (eleve) => {

                    const present =
                      eleve.statut ===
                      'present'

                    return (
                      <div
                        key={
                          eleve.id ||
                          eleve.eleve_id
                        }
                        className="p-5"
                      >

                        <div className="
                          flex
                          items-center
                          justify-between
                          gap-4
                        ">

                          <div>

                            <p className="
                              font-bold
                              text-slate-900
                            ">
                              {eleve.nom}{' '}
                              {eleve.prenom}
                            </p>

                            <p className="
                              mt-1
                              text-xs
                              text-slate-400
                            ">
                              {formaterDateCourte(
                                eleve.date_appel
                              )}
                            </p>

                          </div>

                          <span className={`
                            inline-flex
                            shrink-0
                            items-center
                            gap-1.5
                            rounded-full
                            px-3
                            py-1.5
                            text-xs
                            font-bold
                            ${
                              present
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-red-50 text-red-700'
                            }
                          `}>

                            {present ? (
                              <UserCheck
                                size={14}
                              />
                            ) : (
                              <UserX
                                size={14}
                              />
                            )}

                            {present
                              ? 'Présent'
                              : 'Absent'}

                          </span>

                        </div>

                      </div>
                    )
                  }
                )}

              </div>

              {/* DESKTOP */}

              <div className="
                hidden
                overflow-x-auto
                md:block
              ">

                <table className="
                  min-w-full
                  divide-y
                  divide-slate-200
                ">

                  <thead className="bg-slate-50">

                    <tr>

                      <th className="
                        px-6
                        py-4
                        text-left
                        text-xs
                        font-bold
                        uppercase
                        text-slate-500
                      ">
                        Élève
                      </th>

                      <th className="
                        px-6
                        py-4
                        text-left
                        text-xs
                        font-bold
                        uppercase
                        text-slate-500
                      ">
                        Statut
                      </th>

                      <th className="
                        px-6
                        py-4
                        text-left
                        text-xs
                        font-bold
                        uppercase
                        text-slate-500
                      ">
                        Date
                      </th>

                    </tr>

                  </thead>

                  <tbody className="
                    divide-y
                    divide-slate-100
                  ">

                    {presencesFiltrees.map(
                      (eleve) => {

                        const present =
                          eleve.statut ===
                          'present'

                        return (
                          <tr
                            key={
                              eleve.id ||
                              eleve.eleve_id
                            }
                            className="
                              hover:bg-slate-50
                            "
                          >

                            <td className="
                              px-6
                              py-4
                            ">
                              <p className="
                                font-bold
                                text-slate-900
                              ">
                                {eleve.nom}{' '}
                                {eleve.prenom}
                              </p>
                            </td>

                            <td className="
                              px-6
                              py-4
                            ">

                              <span className={`
                                inline-flex
                                items-center
                                gap-2
                                rounded-full
                                px-3
                                py-1.5
                                text-xs
                                font-bold
                                ${
                                  present
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-red-50 text-red-700'
                                }
                              `}>

                                {present ? (
                                  <UserCheck
                                    size={14}
                                  />
                                ) : (
                                  <UserX
                                    size={14}
                                  />
                                )}

                                {present
                                  ? 'Présent'
                                  : 'Absent'}

                              </span>

                            </td>

                            <td className="
                              px-6
                              py-4
                              text-sm
                              text-slate-500
                            ">
                              {formaterDateCourte(
                                eleve.date_appel
                              )}
                            </td>

                          </tr>
                        )
                      }
                    )}

                  </tbody>

                </table>

              </div>

            </div>

          )}

        </div>

      ) : (

        /* =================================================
           HISTORIQUE
        ================================================== */

        <div className="space-y-6">

          {/* FILTRES HISTORIQUE */}

          <div className="
            rounded-3xl
            border
            border-slate-200
            bg-white
            p-5
            shadow-sm
          ">

            <div className="
              grid
              gap-4
              md:grid-cols-2
              lg:grid-cols-4
            ">

              <div>

                <label className="
                  mb-2
                  block
                  text-xs
                  font-bold
                  uppercase
                  text-slate-500
                ">
                  Classe
                </label>

                <select
                  value={classeSelectionnee}
                  onChange={(e) =>
                    setClasseSelectionnee(
                      e.target.value
                    )
                  }
                  className="
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    px-4
                    py-3
                    text-sm
                    outline-none
                    focus:border-indigo-500
                    focus:ring-4
                    focus:ring-indigo-100
                  "
                >

                  <option value="">
                    Toutes les classes
                  </option>

                  {classesSection.map(
                    (classe) => (
                      <option
                        key={classe.id}
                        value={classe.id}
                      >
                        {classe.nom}
                      </option>
                    )
                  )}

                </select>

              </div>

              <div>

                <label className="
                  mb-2
                  block
                  text-xs
                  font-bold
                  uppercase
                  text-slate-500
                ">
                  Date début
                </label>

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
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    px-4
                    py-3
                    text-sm
                    outline-none
                    focus:border-indigo-500
                    focus:ring-4
                    focus:ring-indigo-100
                  "
                />

              </div>

              <div>

                <label className="
                  mb-2
                  block
                  text-xs
                  font-bold
                  uppercase
                  text-slate-500
                ">
                  Date fin
                </label>

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
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    px-4
                    py-3
                    text-sm
                    outline-none
                    focus:border-indigo-500
                    focus:ring-4
                    focus:ring-indigo-100
                  "
                />

              </div>

              <div className="
                flex
                items-end
                gap-2
              ">

                <button
                  onClick={chargerHistorique}
                  className="
                    inline-flex
                    flex-1
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-indigo-600
                    px-4
                    py-3
                    text-sm
                    font-bold
                    text-white
                    transition
                    hover:bg-indigo-700
                  "
                >
                  <Search size={17} />
                  Rechercher
                </button>

                <button
                  onClick={reinitialiserFiltres}
                  title="Réinitialiser"
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-slate-100
                    text-slate-600
                    transition
                    hover:bg-slate-200
                  "
                >
                  <RefreshCw size={17} />
                </button>

              </div>

            </div>

          </div>

          {/* STATS HISTORIQUE */}

          <div className="
            grid
            gap-4
            sm:grid-cols-2
            lg:grid-cols-4
          ">

            <div className="
              rounded-2xl
              border
              border-indigo-100
              bg-indigo-50
              p-5
            ">

              <p className="
                text-xs
                font-bold
                uppercase
                text-indigo-600
              ">
                Appels enregistrés
              </p>

              <p className="
                mt-2
                text-3xl
                font-black
                text-indigo-700
              ">
                {totalAppels}
              </p>

            </div>

            <div className="
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-5
            ">

              <p className="
                text-xs
                font-bold
                uppercase
                text-slate-500
              ">
                Élèves concernés
              </p>

              <p className="
                mt-2
                text-3xl
                font-black
                text-slate-800
              ">
                {totalElevesHistorique}
              </p>

            </div>

            <div className="
              rounded-2xl
              border
              border-emerald-100
              bg-emerald-50
              p-5
            ">

              <p className="
                text-xs
                font-bold
                uppercase
                text-emerald-600
              ">
                Présences
              </p>

              <p className="
                mt-2
                text-3xl
                font-black
                text-emerald-700
              ">
                {totalPresentsHistorique}
              </p>

            </div>

            <div className="
              rounded-2xl
              border
              border-red-100
              bg-red-50
              p-5
            ">

              <p className="
                text-xs
                font-bold
                uppercase
                text-red-600
              ">
                Absences
              </p>

              <p className="
                mt-2
                text-3xl
                font-black
                text-red-700
              ">
                {totalAbsentsHistorique}
              </p>

            </div>

          </div>

          {/* TAUX GLOBAL */}

          {historique.length > 0 && (
            <div className="
              rounded-2xl
              border
              border-indigo-100
              bg-indigo-50
              p-5
            ">

              <div className="
                flex
                flex-col
                gap-3
                sm:flex-row
                sm:items-center
                sm:justify-between
              ">

                <div>
                  <p className="
                    text-xs
                    font-bold
                    uppercase
                    text-indigo-600
                  ">
                    Taux global de présence
                  </p>

                  <p className="
                    mt-1
                    text-sm
                    text-indigo-800
                  ">
                    Sur la période sélectionnée
                  </p>
                </div>

                <p className="
                  text-3xl
                  font-black
                  text-indigo-700
                ">
                  {tauxPresenceHistorique}%
                </p>

              </div>

              <div className="
                mt-4
                h-3
                overflow-hidden
                rounded-full
                bg-indigo-100
              ">
                <div
                  className="
                    h-full
                    rounded-full
                    bg-indigo-600
                    transition-all
                  "
                  style={{
                    width: `${tauxPresenceHistorique}%`,
                  }}
                />
              </div>

            </div>
          )}

          {/* CHARGEMENT HISTORIQUE */}

          {chargement ? (

            <div className="
              flex
              min-h-[220px]
              items-center
              justify-center
              gap-3
              rounded-3xl
              border
              border-slate-200
              bg-white
              text-sm
              text-slate-500
            ">

              <Loader2
                size={22}
                className="animate-spin"
              />

              Chargement de l'historique...

            </div>

          ) : historique.length === 0 ? (

            <div className="
              rounded-3xl
              border
              border-dashed
              border-slate-300
              bg-white
              p-10
              text-center
            ">

              <div className="
                mx-auto
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                bg-slate-100
                text-slate-500
              ">
                <History size={28} />
              </div>

              <h3 className="
                mt-5
                text-lg
                font-bold
                text-slate-800
              ">
                Aucun historique
              </h3>

              <p className="
                mx-auto
                mt-2
                max-w-md
                text-sm
                leading-6
                text-slate-500
              ">
                Aucun appel ne correspond aux
                filtres sélectionnés.
              </p>

            </div>

          ) : (

            /* TABLEAU HISTORIQUE */

            <div className="
              overflow-hidden
              rounded-3xl
              border
              border-slate-200
              bg-white
              shadow-sm
            ">

              {/* MOBILE */}

              <div className="
                divide-y
                divide-slate-100
                md:hidden
              ">

                {historique.map(
                  (ligne, index) => (

                    <button
                      key={`${ligne.date_appel}-${ligne.classe_id}-${index}`}
                      onClick={() =>
                        ouvrirDetail(ligne)
                      }
                      className="
                        block
                        w-full
                        p-5
                        text-left
                        transition
                        hover:bg-slate-50
                      "
                    >

                      <div className="
                        flex
                        items-center
                        justify-between
                        gap-3
                      ">

                        <div>

                          <p className="
                            text-sm
                            font-black
                            text-slate-900
                          ">
                            {ligne.classe_nom}
                          </p>

                          <p className="
                            mt-1
                            text-xs
                            capitalize
                            text-slate-500
                          ">
                            {formaterDate(
                              ligne.date_appel
                            )}
                          </p>

                        </div>

                        <ChevronRight
                          size={19}
                          className="text-slate-400"
                        />

                      </div>

                      <div className="
                        mt-4
                        grid
                        grid-cols-3
                        gap-2
                      ">

                        <div className="
                          rounded-xl
                          bg-slate-50
                          p-3
                          text-center
                        ">
                          <p className="
                            text-[10px]
                            font-bold
                            uppercase
                            text-slate-400
                          ">
                            Total
                          </p>

                          <p className="
                            mt-1
                            font-black
                            text-slate-800
                          ">
                            {ligne.total_eleves}
                          </p>
                        </div>

                        <div className="
                          rounded-xl
                          bg-emerald-50
                          p-3
                          text-center
                        ">
                          <p className="
                            text-[10px]
                            font-bold
                            uppercase
                            text-emerald-600
                          ">
                            Présents
                          </p>

                          <p className="
                            mt-1
                            font-black
                            text-emerald-700
                          ">
                            {ligne.presents}
                          </p>
                        </div>

                        <div className="
                          rounded-xl
                          bg-red-50
                          p-3
                          text-center
                        ">
                          <p className="
                            text-[10px]
                            font-bold
                            uppercase
                            text-red-600
                          ">
                            Absents
                          </p>

                          <p className="
                            mt-1
                            font-black
                            text-red-700
                          ">
                            {ligne.absents}
                          </p>
                        </div>

                      </div>

                      <div className="
                        mt-3
                        flex
                        items-center
                        justify-between
                        gap-3
                      ">

                        <p className="
                          truncate
                          text-xs
                          text-slate-500
                        ">
                          {afficherEnseignant(ligne)}
                        </p>

                        <span className="
                          shrink-0
                          rounded-full
                          bg-indigo-50
                          px-3
                          py-1
                          text-xs
                          font-bold
                          text-indigo-700
                        ">
                          {ligne.taux_presence}%
                        </span>

                      </div>

                    </button>

                  )
                )}

              </div>

              {/* DESKTOP */}

              <div className="
                hidden
                overflow-x-auto
                md:block
              ">

                <table className="
                  min-w-full
                  divide-y
                  divide-slate-200
                ">

                  <thead className="bg-slate-50">

                    <tr>

                      <th className="
                        px-6
                        py-4
                        text-left
                        text-xs
                        font-bold
                        uppercase
                        text-slate-500
                      ">
                        Date
                      </th>

                      <th className="
                        px-6
                        py-4
                        text-left
                        text-xs
                        font-bold
                        uppercase
                        text-slate-500
                      ">
                        Classe
                      </th>

                      <th className="
                        px-6
                        py-4
                        text-left
                        text-xs
                        font-bold
                        uppercase
                        text-slate-500
                      ">
                        Enseignant
                      </th>

                      <th className="
                        px-6
                        py-4
                        text-center
                        text-xs
                        font-bold
                        uppercase
                        text-slate-500
                      ">
                        Total
                      </th>

                      <th className="
                        px-6
                        py-4
                        text-center
                        text-xs
                        font-bold
                        uppercase
                        text-slate-500
                      ">
                        Présents
                      </th>

                      <th className="
                        px-6
                        py-4
                        text-center
                        text-xs
                        font-bold
                        uppercase
                        text-slate-500
                      ">
                        Absents
                      </th>

                      <th className="
                        px-6
                        py-4
                        text-center
                        text-xs
                        font-bold
                        uppercase
                        text-slate-500
                      ">
                        Taux
                      </th>

                      <th className="px-6 py-4" />

                    </tr>

                  </thead>

                  <tbody className="
                    divide-y
                    divide-slate-100
                  ">

                    {historique.map(
                      (ligne, index) => (

                        <tr
                          key={`${ligne.date_appel}-${ligne.classe_id}-${index}`}
                          className="
                            cursor-pointer
                            transition
                            hover:bg-slate-50
                          "
                          onClick={() =>
                            ouvrirDetail(ligne)
                          }
                        >

                          <td className="
                            px-6
                            py-4
                            text-sm
                            font-medium
                            text-slate-700
                          ">
                            {formaterDateCourte(
                              ligne.date_appel
                            )}
                          </td>

                          <td className="
                            px-6
                            py-4
                          ">

                            <p className="
                              font-bold
                              text-slate-900
                            ">
                              {ligne.classe_nom}
                            </p>

                            <p className="
                              mt-1
                              text-xs
                              text-slate-400
                            ">
                              {ligne.classe_section}
                            </p>

                          </td>

                          <td className="
                            px-6
                            py-4
                            text-sm
                            text-slate-600
                          ">
                            {afficherEnseignant(ligne)}
                          </td>

                          <td className="
                            px-6
                            py-4
                            text-center
                            font-bold
                            text-slate-700
                          ">
                            {ligne.total_eleves}
                          </td>

                          <td className="
                            px-6
                            py-4
                            text-center
                            font-bold
                            text-emerald-600
                          ">
                            {ligne.presents}
                          </td>

                          <td className="
                            px-6
                            py-4
                            text-center
                            font-bold
                            text-red-600
                          ">
                            {ligne.absents}
                          </td>

                          <td className="
                            px-6
                            py-4
                            text-center
                          ">

                            <span className="
                              rounded-full
                              bg-indigo-50
                              px-3
                              py-1.5
                              text-xs
                              font-bold
                              text-indigo-700
                            ">
                              {ligne.taux_presence}%
                            </span>

                          </td>

                          <td className="
                            px-6
                            py-4
                            text-right
                          ">
                            <ChevronRight
                              size={18}
                              className="text-slate-400"
                            />
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>

          )}

        </div>

      )}

    </div>
  )
}

export default RegistreAppelAdmin