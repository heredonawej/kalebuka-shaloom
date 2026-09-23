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
} from 'lucide-react'

function RegistreAppelAdmin() {
  const [classes, setClasses] = useState([])
  const [presences, setPresences] = useState([])

  const [sectionActive, setSectionActive] =
    useState('Maternelle')

  const [classeSelectionnee, setClasseSelectionnee] =
    useState('')

  const [dateSelectionnee, setDateSelectionnee] =
    useState(() => {
      const aujourdHui = new Date()
      return aujourdHui.toISOString().split('T')[0]
    })

  const [recherche, setRecherche] = useState('')

  const [chargementClasses, setChargementClasses] =
    useState(true)

  const [chargementPresences, setChargementPresences] =
    useState(false)

  const [erreur, setErreur] = useState('')

  // =====================================================
  // CHARGER LES CLASSES
  // =====================================================

  useEffect(() => {
    chargerClasses()
  }, [])

  const chargerClasses = async () => {
    try {
      setChargementClasses(true)
      setErreur('')

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

      setErreur(
        error.message ||
          'Impossible de récupérer les classes.'
      )

    } finally {
      setChargementClasses(false)
    }
  }

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
  // CHANGER DE SECTION
  // =====================================================

  const changerSection = (section) => {
    setSectionActive(section)
    setClasseSelectionnee('')
    setPresences([])
  }

  // =====================================================
  // CHARGER L'APPEL
  // =====================================================

  const chargerPresences = async () => {
    if (!classeSelectionnee) {
      setPresences([])
      return
    }

    try {
      setChargementPresences(true)
      setErreur('')

      const response = await fetch(
        `${API_URL}/api/presences/classe/${classeSelectionnee}?date=${dateSelectionnee}`
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.erreur ||
            'Impossible de récupérer les présences.'
        )
      }

      setPresences(data)

    } catch (error) {
      console.error(error)

      setErreur(
        error.message ||
          'Impossible de récupérer les présences.'
      )

      setPresences([])

    } finally {
      setChargementPresences(false)
    }
  }

  // =====================================================
  // CHARGER AUTOMATIQUEMENT
  // =====================================================

  useEffect(() => {
    chargerPresences()
  }, [
    classeSelectionnee,
    dateSelectionnee,
  ])

  // =====================================================
  // RECHERCHE
  // =====================================================

  const presencesFiltrees = useMemo(() => {
    const texte =
      recherche.trim().toLowerCase()

    if (!texte) {
      return presences
    }

    return presences.filter((eleve) => {
      const nomComplet =
        `${eleve.eleve_prenom || ''} ${eleve.eleve_nom || ''}`
          .toLowerCase()

      return nomComplet.includes(texte)
    })
  }, [presences, recherche])

  // =====================================================
  // STATISTIQUES
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

  const pourcentagePresence =
    totalEleves > 0
      ? Math.round(
          (totalPresents / totalEleves) * 100
        )
      : 0

  // =====================================================
  // FORMATER LA DATE
  // =====================================================

 const formaterDate = (date) => {
  if (!date) return '—'

  const dateTexte = String(date).slice(0, 10)

  const dateFormatee = new Date(`${dateTexte}T00:00:00`)

  if (Number.isNaN(dateFormatee.getTime())) {
    return '—'
  }

  return dateFormatee.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

  // =====================================================
  // AFFICHAGE
  // =====================================================

  return (
    <div className="space-y-6">

      {/* =================================================
          EN-TÊTE
      ================================================= */}

      <div>
        <p className="text-sm font-medium text-indigo-600">
          Administration
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Registre d'appel
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Consultez les présences enregistrées par les enseignants.
            </p>
          </div>

          <button
            type="button"
            onClick={chargerPresences}
            disabled={
              chargementPresences ||
              !classeSelectionnee
            }
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-3
              text-sm
              font-semibold
              text-slate-700
              hover:bg-slate-50
              disabled:opacity-50
            "
          >
            <RefreshCw
              size={17}
              className={
                chargementPresences
                  ? 'animate-spin'
                  : ''
              }
            />

            Actualiser
          </button>

        </div>
      </div>


      {/* =================================================
          ERREUR
      ================================================= */}

      {erreur && (
        <div className="
          rounded-xl
          border
          border-red-200
          bg-red-50
          px-4
          py-3
          text-sm
          text-red-700
        ">
          {erreur}
        </div>
      )}


      {/* =================================================
          SECTIONS
      ================================================= */}

      <div className="
        grid
        grid-cols-1
        sm:grid-cols-3
        gap-4
      ">

        {[
          {
            nom: 'Maternelle',
            icon: '🧸',
            couleur:
              'border-pink-200 bg-pink-50 text-pink-700',
          },
          {
            nom: 'Primaire',
            icon: '📚',
            couleur:
              'border-blue-200 bg-blue-50 text-blue-700',
          },
          {
            nom: 'Secondaire',
            icon: '🎓',
            couleur:
              'border-indigo-200 bg-indigo-50 text-indigo-700',
          },
        ].map((section) => {

          const active =
            sectionActive === section.nom

          const nombreClasses =
            classes.filter(
              (classe) =>
                classe.section === section.nom
            ).length

          return (
            <button
              key={section.nom}
              type="button"
              onClick={() =>
                changerSection(section.nom)
              }
              className={`
                rounded-2xl
                border
                p-5
                text-left
                transition
                ${
                  active
                    ? `${section.couleur} ring-2 ring-indigo-200`
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                }
              `}
            >

              <div className="flex items-center justify-between">

                <span className="text-2xl">
                  {section.icon}
                </span>

                <span className="
                  rounded-full
                  bg-white/80
                  px-3
                  py-1
                  text-xs
                  font-bold
                ">
                  {nombreClasses} classe(s)
                </span>

              </div>

              <h2 className="mt-4 font-bold text-slate-900">
                {section.nom}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Consulter les appels
              </p>

            </button>
          )
        })}

      </div>


      {/* =================================================
          FILTRES
      ================================================= */}

      <div className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-4
        sm:p-6
      ">

        <div className="
          grid
          grid-cols-1
          md:grid-cols-3
          gap-4
        ">

          {/* CLASSE */}

          <div>
            <label className="
              mb-2
              block
              text-sm
              font-semibold
              text-slate-700
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
                h-12
                w-full
                rounded-xl
                border
                border-slate-200
                bg-white
                px-4
                outline-none
                focus:border-indigo-500
                focus:ring-4
                focus:ring-indigo-500/10
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


          {/* DATE */}

          <div>
            <label className="
              mb-2
              block
              text-sm
              font-semibold
              text-slate-700
            ">
              Date de l'appel
            </label>

            <div className="relative">

              <CalendarDays
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
                type="date"
                value={dateSelectionnee}
                onChange={(e) =>
                  setDateSelectionnee(
                    e.target.value
                  )
                }
                className="
                  h-12
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  pl-11
                  pr-4
                  outline-none
                  focus:border-indigo-500
                  focus:ring-4
                  focus:ring-indigo-500/10
                "
              />

            </div>
          </div>


          {/* RECHERCHE */}

          <div>
            <label className="
              mb-2
              block
              text-sm
              font-semibold
              text-slate-700
            ">
              Rechercher un élève
            </label>

            <div className="relative">

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
                  setRecherche(
                    e.target.value
                  )
                }
                placeholder="Nom ou prénom..."
                className="
                  h-12
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  pl-11
                  pr-4
                  outline-none
                  focus:border-indigo-500
                  focus:ring-4
                  focus:ring-indigo-500/10
                "
              />

            </div>
          </div>

        </div>

      </div>


      {/* =================================================
          STATISTIQUES
      ================================================= */}

      {classeSelectionnee && (
        <div className="
          grid
          grid-cols-2
          lg:grid-cols-4
          gap-3
          sm:gap-4
        ">

          <div className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-4
            sm:p-5
          ">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs text-slate-500">
                  Élèves
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {totalEleves}
                </p>
              </div>

              <div className="
                rounded-xl
                bg-slate-100
                p-3
                text-slate-600
              ">
                <Users size={20} />
              </div>

            </div>
          </div>


          <div className="
            rounded-2xl
            border
            border-emerald-200
            bg-emerald-50
            p-4
            sm:p-5
          ">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs text-emerald-700">
                  Présents
                </p>

                <p className="mt-1 text-2xl font-bold text-emerald-700">
                  {totalPresents}
                </p>
              </div>

              <UserCheck size={22} className="text-emerald-600" />

            </div>
          </div>


          <div className="
            rounded-2xl
            border
            border-red-200
            bg-red-50
            p-4
            sm:p-5
          ">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs text-red-700">
                  Absents
                </p>

                <p className="mt-1 text-2xl font-bold text-red-700">
                  {totalAbsents}
                </p>
              </div>

              <UserX size={22} className="text-red-600" />

            </div>
          </div>


          <div className="
            rounded-2xl
            border
            border-indigo-200
            bg-indigo-50
            p-4
            sm:p-5
          ">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs text-indigo-700">
                  Présence
                </p>

                <p className="mt-1 text-2xl font-bold text-indigo-700">
                  {pourcentagePresence}%
                </p>
              </div>

              <ClipboardCheck
                size={22}
                className="text-indigo-600"
              />

            </div>
          </div>

        </div>
      )}


      {/* =================================================
          APPEL
      ================================================= */}

      <div className="
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
      ">

        <div className="
          flex
          flex-col
          gap-2
          border-b
          border-slate-200
          bg-slate-50
          px-4
          py-4
          sm:flex-row
          sm:items-center
          sm:justify-between
          sm:px-6
        ">

          <div>
            <h2 className="font-bold text-slate-900">
              {classeSelectionnee
                ? classes.find(
                    (classe) =>
                      String(classe.id) ===
                      String(classeSelectionnee)
                  )?.nom || 'Classe'
                : 'Registre d’appel'}
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {formaterDate(
                dateSelectionnee
              )}
            </p>
          </div>

          {classeSelectionnee && (
            <span className="
              inline-flex
              items-center
              gap-2
              rounded-full
              bg-indigo-50
              px-3
              py-2
              text-xs
              font-semibold
              text-indigo-700
            ">
              <CalendarDays size={15} />
              Appel du jour
            </span>
          )}

        </div>


        {!classeSelectionnee ? (

          <div className="
            px-6
            py-16
            text-center
          ">

            <div className="
              mx-auto
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              bg-indigo-50
              text-indigo-600
            ">
              <ClipboardCheck size={26} />
            </div>

            <h3 className="
              mt-4
              font-semibold
              text-slate-900
            ">
              Sélectionnez une classe
            </h3>

            <p className="
              mx-auto
              mt-1
              max-w-md
              text-sm
              text-slate-500
            ">
              Choisissez une classe pour consulter
              l'appel enregistré par son enseignant.
            </p>

          </div>

        ) : chargementPresences ? (

          <div className="
            flex
            min-h-[250px]
            items-center
            justify-center
            gap-3
            text-slate-500
          ">

            <Loader2
              size={23}
              className="animate-spin"
            />

            Chargement de l'appel...

          </div>

        ) : presencesFiltrees.length === 0 ? (

          <div className="
            px-6
            py-16
            text-center
          ">

            <div className="
              mx-auto
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              bg-slate-100
              text-slate-400
            ">
              <ClipboardCheck size={25} />
            </div>

            <h3 className="
              mt-4
              font-semibold
              text-slate-800
            ">
              Aucun appel enregistré
            </h3>

            <p className="
              mt-1
              text-sm
              text-slate-500
            ">
              Aucun appel n'a été enregistré pour
              cette classe à cette date.
            </p>

          </div>

        ) : (

          <>
            {/* MOBILE */}

            <div className="divide-y divide-slate-100 md:hidden">

              {presencesFiltrees.map(
                (eleve) => {

                  const present =
                    eleve.statut === 'present'

                  return (
                    <div
                      key={eleve.id}
                      className="p-4"
                    >

                      <div className="
                        flex
                        items-center
                        justify-between
                        gap-3
                      ">

                        <div className="min-w-0">

                          <p className="
                            font-semibold
                            text-slate-900
                          ">
                            {eleve.eleve_prenom}{' '}
                            {eleve.eleve_nom}
                          </p>

                          <p className="
                            mt-1
                            text-xs
                            text-slate-500
                          ">
                            {eleve.enseignant_nom
                              ? `Appel fait par ${eleve.enseignant_nom}`
                              : 'Enseignant non renseigné'}
                          </p>

                        </div>

                        <span
                          className={`
                            shrink-0
                            rounded-full
                            px-3
                            py-2
                            text-xs
                            font-bold
                            ${
                              present
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-red-50 text-red-700'
                            }
                          `}
                        >
                          {present
                            ? '✓ Présent'
                            : '✕ Absent'}
                        </span>

                      </div>

                    </div>
                  )
                }
              )}

            </div>


            {/* DESKTOP */}

            <div className="hidden overflow-x-auto md:block">

              <table className="w-full">

                <thead className="
                  border-b
                  border-slate-200
                  bg-slate-50
                ">
                  <tr>

                    <th className="
                      px-6
                      py-4
                      text-left
                      text-xs
                      font-bold
                      uppercase
                      tracking-wide
                      text-slate-500
                    ">
                      #
                    </th>

                    <th className="
                      px-6
                      py-4
                      text-left
                      text-xs
                      font-bold
                      uppercase
                      tracking-wide
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
                      tracking-wide
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
                      tracking-wide
                      text-slate-500
                    ">
                      Enseignant
                    </th>

                    <th className="
                      px-6
                      py-4
                      text-left
                      text-xs
                      font-bold
                      uppercase
                      tracking-wide
                      text-slate-500
                    ">
                      Date
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {presencesFiltrees.map(
                    (eleve, index) => {

                      const present =
                        eleve.statut === 'present'

                      return (
                        <tr
                          key={eleve.id}
                          className="hover:bg-slate-50"
                        >

                          <td className="
                            px-6
                            py-4
                            text-sm
                            text-slate-400
                          ">
                            {index + 1}
                          </td>

                          <td className="
                            px-6
                            py-4
                            text-sm
                            font-semibold
                            text-slate-900
                          ">
                            {eleve.eleve_prenom}{' '}
                            {eleve.eleve_nom}
                          </td>

                          <td className="px-6 py-4">

                            <span
                              className={`
                                inline-flex
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
                              `}
                            >
                              {present
                                ? '✓ Présent'
                                : '✕ Absent'}
                            </span>

                          </td>

                          <td className="
                            px-6
                            py-4
                            text-sm
                            text-slate-600
                          ">
                            {eleve.enseignant_nom ||
                              '—'}
                          </td>

                          <td className="
                            px-6
                            py-4
                            text-sm
                            text-slate-500
                          ">
                            {eleve.date_appel
  ? new Date(
      String(eleve.date_appel).slice(0, 10) + 'T00:00:00'
    ).toLocaleDateString('fr-FR')
  : '—'}
                          </td>

                        </tr>
                      )
                    }
                  )}

                </tbody>

              </table>

            </div>
          </>

        )}

      </div>

    </div>
  )
}

export default RegistreAppelAdmin