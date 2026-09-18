import { useEffect, useState } from 'react'
import { API_URL } from '../api'
import {
  Plus,
  School,
  Users,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Trash2,
  Pencil,
  X,
  Save,
} from 'lucide-react'

function ClassesAdmin() {
  const [classes, setClasses] = useState([])

  const [section, setSection] = useState('')
  const [nom, setNom] = useState('')

  const [chargement, setChargement] = useState(true)
  const [creation, setCreation] = useState(false)
  const [suppression, setSuppression] = useState(null)
  const [modification, setModification] = useState(false)

  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState('')

  // Sections
  const [sectionActive, setSectionActive] = useState('Maternelle')

  // Sections déroulantes
  const [formulaireOuvert, setFormulaireOuvert] = useState(false)
  const [listeOuverte, setListeOuverte] = useState(true)

  // Modification
  const [classeModifiee, setClasseModifiee] = useState(null)
  const [nouveauNom, setNouveauNom] = useState('')
  const [nouvelleSection, setNouvelleSection] = useState('')

  // =====================================================
  // CHARGER LES CLASSES
  // =====================================================

  useEffect(() => {
    chargerClasses()
  }, [])

  const chargerClasses = async () => {
    try {
      setChargement(true)
      setErreur('')

      const response = await fetch(
        `${API_URL}/api/classes`
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.erreur ||
          'Impossible de charger les classes.'
        )
      }

      setClasses(data)

    } catch (err) {
      console.error(err)

      setErreur(
        err.message ||
        'Impossible de charger les classes.'
      )

    } finally {
      setChargement(false)
    }
  }

  // =====================================================
  // CLASSES DE LA SECTION ACTIVE
  // =====================================================

  const classesFiltrees = classes.filter(
    (classe) =>
      classe.section === sectionActive
  )

  // =====================================================
  // NOMBRE DE CLASSES PAR SECTION
  // =====================================================

  const nombreClassesSection = (nomSection) => {
    return classes.filter(
      (classe) =>
        classe.section === nomSection
    ).length
  }

  // =====================================================
  // CRÉER UNE CLASSE
  // =====================================================

  const creerClasse = async (e) => {
    e.preventDefault()

    setErreur('')
    setSucces('')

    if (!section) {
      setErreur(
        'Veuillez choisir une section.'
      )
      return
    }

    if (!nom.trim()) {
      setErreur(
        'Veuillez saisir le nom de la classe.'
      )
      return
    }

    try {
      setCreation(true)

      const response = await fetch(
        `${API_URL}/api/classes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nom: nom.trim(),
            section,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.erreur ||
          'Impossible de créer la classe.'
        )
      }

      setSucces(
        `La classe « ${data.nom} » a été créée avec succès.`
      )

      setNom('')
      setSection('')

      // Aller automatiquement sur la section créée
      setSectionActive(data.section)

      await chargerClasses()

    } catch (err) {
      console.error(err)

      setErreur(
        err.message ||
        'Une erreur est survenue.'
      )

    } finally {
      setCreation(false)
    }
  }

  // =====================================================
  // OUVRIR MODIFICATION
  // =====================================================

  const ouvrirModification = (classe) => {
    setErreur('')
    setSucces('')

    setClasseModifiee(classe)
    setNouveauNom(classe.nom || '')
    setNouvelleSection(
      classe.section || ''
    )
  }

  // =====================================================
  // FERMER MODIFICATION
  // =====================================================

  const fermerModification = () => {
    setClasseModifiee(null)
    setNouveauNom('')
    setNouvelleSection('')
  }

  // =====================================================
  // MODIFIER UNE CLASSE
  // =====================================================

  const modifierClasse = async () => {
    if (!classeModifiee) {
      return
    }

    setErreur('')
    setSucces('')

    if (!nouvelleSection) {
      setErreur(
        'Veuillez choisir une section.'
      )
      return
    }

    if (!nouveauNom.trim()) {
      setErreur(
        'Veuillez saisir le nom de la classe.'
      )
      return
    }

    try {
      setModification(true)

      const response = await fetch(
        `${API_URL}/api/classes/${classeModifiee.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nom: nouveauNom.trim(),
            section: nouvelleSection,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.erreur ||
          'Impossible de modifier la classe.'
        )
      }

      setSucces(
        `La classe « ${data.nom} » a été modifiée avec succès.`
      )

      // Si la section a changé,
      // afficher automatiquement cette section
      setSectionActive(data.section)

      fermerModification()

      await chargerClasses()

    } catch (err) {
      console.error(err)

      setErreur(
        err.message ||
        'Impossible de modifier la classe.'
      )

    } finally {
      setModification(false)
    }
  }

  // =====================================================
  // SUPPRIMER UNE CLASSE
  // =====================================================

  const supprimerClasse = async (classe) => {
    const confirmation = window.confirm(
      `Voulez-vous vraiment supprimer la classe « ${classe.nom} » ?\n\nCette action est définitive.`
    )

    if (!confirmation) {
      return
    }

    try {
      setSuppression(classe.id)
      setErreur('')
      setSucces('')

      const response = await fetch(
        `${API_URL}/api/classes/${classe.id}`,
        {
          method: 'DELETE',
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.erreur ||
          'Impossible de supprimer la classe.'
        )
      }

      setSucces(
        data.message ||
        'Classe supprimée avec succès.'
      )

      await chargerClasses()

    } catch (err) {
      console.error(err)

      setErreur(
        err.message ||
        'Impossible de supprimer la classe.'
      )

    } finally {
      setSuppression(null)
    }
  }

  return (
    <div className="space-y-5 sm:space-y-6">

      {/* =================================================
          EN-TÊTE
      ================================================= */}

      <div>
        <p className="text-xs sm:text-sm font-medium text-indigo-600">
          Administration
        </p>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
          Gestion des classes
        </h1>

        <p className="text-sm text-slate-500 mt-2">
          Créez et gérez les classes de l'école selon leur section.
        </p>
      </div>

      {/* =================================================
          MESSAGES
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
          <AlertCircle
            size={20}
            className="shrink-0"
          />

          <span>
            {erreur}
          </span>
        </div>
      )}

      {succes && (
        <div className="
          flex
          items-start
          gap-3
          bg-emerald-50
          border
          border-emerald-200
          text-emerald-700
          rounded-xl
          px-4
          py-3
          text-sm
        ">
          <CheckCircle2
            size={20}
            className="shrink-0"
          />

          <span>
            {succes}
          </span>
        </div>
      )}

      {/* =================================================
          FORMULAIRE DÉROULANT
      ================================================= */}

      <section className="
        bg-white
        border
        border-slate-200
        rounded-2xl
        shadow-sm
        overflow-hidden
      ">

        <button
          type="button"
          onClick={() =>
            setFormulaireOuvert(
              !formulaireOuvert
            )
          }
          className="
            w-full
            px-4 sm:px-5
            py-4
            flex
            items-center
            justify-between
            text-left
            hover:bg-slate-50
            transition
          "
        >

          <div className="flex items-center gap-3">

            <div className="
              w-10
              h-10
              rounded-xl
              bg-indigo-50
              text-indigo-600
              flex
              items-center
              justify-center
              shrink-0
            ">
              <School size={20} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                Ajouter une classe
              </h2>

              <p className="text-xs text-slate-500">
                Choisissez une section et saisissez le nom.
              </p>
            </div>

          </div>

          {formulaireOuvert ? (
            <ChevronUp
              size={20}
              className="text-slate-500 shrink-0"
            />
          ) : (
            <ChevronDown
              size={20}
              className="text-slate-500 shrink-0"
            />
          )}

        </button>

        {formulaireOuvert && (
          <div className="
            border-t
            border-slate-200
            p-4 sm:p-6
          ">

            <form
              onSubmit={creerClasse}
              className="
                grid
                grid-cols-1
                md:grid-cols-3
                gap-4
              "
            >

              {/* SECTION */}

              <div>
                <label className="
                  block
                  text-sm
                  font-semibold
                  text-slate-700
                  mb-2
                ">
                  Section
                </label>

                <select
                  value={section}
                  onChange={(e) =>
                    setSection(e.target.value)
                  }
                  className="
                    w-full
                    h-12
                    px-3 sm:px-4
                    rounded-xl
                    border
                    border-slate-300
                    bg-white
                    text-sm sm:text-base
                    outline-none
                    focus:ring-2
                    focus:ring-indigo-500
                    focus:border-indigo-500
                  "
                >
                  <option value="">
                    Choisir une section
                  </option>

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

              {/* NOM */}

              <div>
                <label className="
                  block
                  text-sm
                  font-semibold
                  text-slate-700
                  mb-2
                ">
                  Nom de la classe
                </label>

                <input
                  type="text"
                  value={nom}
                  onChange={(e) =>
                    setNom(e.target.value)
                  }
                  placeholder="Ex. 6ème Primaire"
                  className="
                    w-full
                    h-12
                    px-3 sm:px-4
                    rounded-xl
                    border
                    border-slate-300
                    text-sm sm:text-base
                    outline-none
                    focus:ring-2
                    focus:ring-indigo-500
                    focus:border-indigo-500
                  "
                />
              </div>

              {/* BOUTON */}

              <div className="flex items-end">

                <button
                  type="submit"
                  disabled={creation}
                  className="
                    w-full
                    h-12
                    flex
                    items-center
                    justify-center
                    gap-2
                    px-5
                    rounded-xl
                    bg-indigo-600
                    hover:bg-indigo-700
                    disabled:bg-indigo-300
                    text-white
                    text-sm
                    font-semibold
                    transition
                  "
                >

                  {creation ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />

                      Création...
                    </>
                  ) : (
                    <>
                      <Plus size={18} />

                      Créer la classe
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>
        )}

      </section>

      {/* =================================================
          LISTE DES CLASSES
      ================================================= */}

      <section className="
        bg-white
        border
        border-slate-200
        rounded-2xl
        shadow-sm
        overflow-hidden
      ">

        {/* HEADER */}

        <button
          type="button"
          onClick={() =>
            setListeOuverte(
              !listeOuverte
            )
          }
          className="
            w-full
            px-4 sm:px-5
            py-4
            flex
            items-center
            justify-between
            text-left
            hover:bg-slate-50
            transition
          "
        >

          <div className="flex items-center gap-3">

            <div className="
              w-10
              h-10
              rounded-xl
              bg-blue-50
              text-blue-600
              flex
              items-center
              justify-center
              shrink-0
            ">
              <School size={20} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                Classes enregistrées
              </h2>

              <p className="text-xs text-slate-500">
                {classes.length} classe(s)
              </p>
            </div>

          </div>

          {listeOuverte ? (
            <ChevronUp
              size={20}
              className="text-slate-500 shrink-0"
            />
          ) : (
            <ChevronDown
              size={20}
              className="text-slate-500 shrink-0"
            />
          )}

        </button>

        {listeOuverte && (
          <div className="
            border-t
            border-slate-200
            p-4 sm:p-5
          ">

            {/* =================================================
                LES 3 SECTIONS
            ================================================= */}

            <div className="
              grid
              grid-cols-1
              sm:grid-cols-3
              gap-3
              mb-5
            ">

              {[
                'Maternelle',
                'Primaire',
                'Secondaire'
              ].map((sectionNom) => {

                const nombre =
                  nombreClassesSection(
                    sectionNom
                  )

                const active =
                  sectionActive === sectionNom

                return (
                  <button
                    key={sectionNom}
                    type="button"
                    onClick={() =>
                      setSectionActive(
                        sectionNom
                      )
                    }
                    className={`
                      rounded-2xl
                      border
                      p-4
                      text-left
                      transition
                      ${
                        active
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-indigo-50 hover:border-indigo-200'
                      }
                    `}
                  >

                    <div className="flex items-center justify-between gap-3">

                      <div>
                        <p className="font-bold text-sm sm:text-base">
                          {sectionNom}
                        </p>

                        <p
                          className={
                            active
                              ? 'text-indigo-100 text-xs mt-1'
                              : 'text-slate-500 text-xs mt-1'
                          }
                        >
                          {nombre}{' '}
                          {nombre > 1
                            ? 'classes'
                            : 'classe'}
                        </p>
                      </div>

                      <School
                        size={20}
                        className={
                          active
                            ? 'text-white'
                            : 'text-indigo-500'
                        }
                      />

                    </div>

                  </button>
                )
              })}

            </div>

            {/* =================================================
                SECTION ACTIVE
            ================================================= */}

            <div className="
              flex
              flex-col
              sm:flex-row
              sm:items-center
              sm:justify-between
              gap-2
              mb-4
            ">

              <div>
                <p className="text-xs text-slate-400">
                  Section sélectionnée
                </p>

                <h3 className="text-lg font-bold text-slate-900">
                  {sectionActive}
                </h3>
              </div>

              <div className="
                inline-flex
                items-center
                gap-2
                self-start
                px-3
                py-1.5
                rounded-full
                bg-indigo-50
                text-indigo-600
                text-xs
                font-semibold
              ">
                <Users size={14} />

                {classesFiltrees.length}{' '}
                {classesFiltrees.length > 1
                  ? 'classes'
                  : 'classe'}
              </div>

            </div>

            {/* =================================================
                CHARGEMENT
            ================================================= */}

            {chargement ? (

              <div className="
                py-12
                flex
                items-center
                justify-center
                text-slate-500
              ">

                <Loader2
                  size={22}
                  className="animate-spin mr-2"
                />

                Chargement...

              </div>

            ) : classesFiltrees.length === 0 ? (

              <div className="
                py-12
                text-center
                text-slate-500
                text-sm
                border
                border-dashed
                border-slate-200
                rounded-xl
              ">

                <School
                  size={30}
                  className="mx-auto mb-3 text-slate-300"
                />

                Aucune classe enregistrée dans la section{' '}
                <strong>
                  {sectionActive}
                </strong>.

              </div>

            ) : (

              <>

                {/* =================================================
                    VERSION ORDINATEUR
                ================================================= */}

                <div className="hidden md:block overflow-x-auto">

                  <table className="w-full text-sm">

                    <thead className="
                      bg-slate-50
                      border
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
                          Classe
                        </th>

                        <th className="
                          text-left
                          px-5
                          py-3
                          font-semibold
                          text-slate-600
                        ">
                          Section
                        </th>

                        <th className="
                          text-left
                          px-5
                          py-3
                          font-semibold
                          text-slate-600
                        ">
                          Élèves
                        </th>

                        <th className="
                          text-right
                          px-5
                          py-3
                          font-semibold
                          text-slate-600
                        ">
                          Actions
                        </th>

                      </tr>

                    </thead>

                    <tbody className="
                      divide-y
                      divide-slate-100
                    ">

                      {classesFiltrees.map((classe) => (

                        <tr
                          key={classe.id}
                          className="
                            hover:bg-slate-50
                            transition
                          "
                        >

                          {/* CLASSE */}

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-3">

                              <div className="
                                w-9
                                h-9
                                rounded-lg
                                bg-slate-100
                                text-slate-600
                                flex
                                items-center
                                justify-center
                              ">
                                <School size={17} />
                              </div>

                              <span className="
                                font-semibold
                                text-slate-900
                              ">
                                {classe.nom}
                              </span>

                            </div>

                          </td>

                          {/* SECTION */}

                          <td className="
                            px-5
                            py-4
                            text-slate-600
                          ">
                            {classe.section}
                          </td>

                          {/* ÉLÈVES */}

                          <td className="
                            px-5
                            py-4
                            text-slate-600
                          ">

                            <span className="
                              inline-flex
                              items-center
                              gap-2
                            ">

                              <Users size={16} />

                              {classe.total_eleves || 0}

                            </span>

                          </td>

                          {/* ACTIONS */}

                          <td className="px-5 py-4">

                            <div className="
                              flex
                              justify-end
                              gap-2
                            ">

                              {/* MODIFIER */}

                              <button
                                type="button"
                                onClick={() =>
                                  ouvrirModification(
                                    classe
                                  )
                                }
                                className="
                                  inline-flex
                                  items-center
                                  gap-2
                                  px-3
                                  py-2
                                  rounded-lg
                                  bg-indigo-50
                                  text-indigo-600
                                  hover:bg-indigo-100
                                  text-xs
                                  font-semibold
                                  transition
                                "
                              >
                                <Pencil size={15} />
                                Modifier
                              </button>

                              {/* SUPPRIMER */}

                              <button
                                type="button"
                                disabled={
                                  suppression ===
                                  classe.id
                                }
                                onClick={() =>
                                  supprimerClasse(
                                    classe
                                  )
                                }
                                className="
                                  inline-flex
                                  items-center
                                  gap-2
                                  px-3
                                  py-2
                                  rounded-lg
                                  bg-red-50
                                  text-red-600
                                  hover:bg-red-100
                                  disabled:opacity-50
                                  text-xs
                                  font-semibold
                                  transition
                                "
                              >

                                {suppression ===
                                classe.id ? (
                                  <Loader2
                                    size={15}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Trash2
                                    size={15}
                                  />
                                )}

                                Supprimer

                              </button>

                            </div>

                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

                {/* =================================================
                    VERSION MOBILE
                ================================================= */}

                <div className="
                  md:hidden
                  divide-y
                  divide-slate-100
                  border
                  border-slate-200
                  rounded-xl
                  overflow-hidden
                ">

                  {classesFiltrees.map((classe) => (

                    <div
                      key={classe.id}
                      className="p-4 bg-white"
                    >

                      <div className="
                        flex
                        items-start
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
                            bg-slate-100
                            text-slate-600
                            flex
                            items-center
                            justify-center
                            shrink-0
                          ">
                            <School size={18} />
                          </div>

                          <div>

                            <h3 className="
                              font-semibold
                              text-slate-900
                            ">
                              {classe.nom}
                            </h3>

                            <p className="
                              text-xs
                              text-slate-500
                              mt-1
                            ">
                              {classe.section}
                            </p>

                          </div>

                        </div>

                        <span className="
                          shrink-0
                          inline-flex
                          items-center
                          gap-1.5
                          px-2.5
                          py-1
                          rounded-full
                          bg-slate-100
                          text-slate-600
                          text-xs
                          font-semibold
                        ">

                          <Users size={13} />

                          {classe.total_eleves || 0}

                        </span>

                      </div>

                      {/* MODIFIER */}

                      <button
                        type="button"
                        onClick={() =>
                          ouvrirModification(
                            classe
                          )
                        }
                        className="
                          w-full
                          mt-4
                          flex
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
                          transition
                        "
                      >
                        <Pencil size={15} />

                        Modifier la classe

                      </button>

                      {/* SUPPRIMER */}

                      <button
                        type="button"
                        disabled={
                          suppression ===
                          classe.id
                        }
                        onClick={() =>
                          supprimerClasse(
                            classe
                          )
                        }
                        className="
                          w-full
                          mt-2
                          flex
                          items-center
                          justify-center
                          gap-2
                          px-4
                          py-2.5
                          rounded-xl
                          bg-red-50
                          text-red-600
                          hover:bg-red-100
                          disabled:opacity-50
                          text-xs
                          font-semibold
                          transition
                        "
                      >

                        {suppression ===
                        classe.id ? (
                          <>
                            <Loader2
                              size={15}
                              className="animate-spin"
                            />

                            Suppression...
                          </>
                        ) : (
                          <>
                            <Trash2 size={15} />

                            Supprimer la classe
                          </>
                        )}

                      </button>

                    </div>

                  ))}

                </div>

              </>

            )}

          </div>
        )}

      </section>

      {/* =================================================
          MODALE MODIFICATION CLASSE
      ================================================= */}

      {classeModifiee && (

        <div className="
          fixed
          inset-0
          z-50
          flex
          items-center
          justify-center
          p-4
        ">

          {/* FOND */}

          <div
            className="
              absolute
              inset-0
              bg-slate-900/40
              backdrop-blur-sm
            "
            onClick={fermerModification}
          />

          {/* FENÊTRE */}

          <div className="
            relative
            w-full
            max-w-md
            bg-white
            rounded-2xl
            shadow-2xl
            overflow-hidden
          ">

            {/* HEADER */}

            <div className="
              px-5
              py-4
              border-b
              border-slate-200
              flex
              items-center
              justify-between
            ">

              <div>

                <h2 className="
                  font-bold
                  text-slate-900
                ">
                  Modifier la classe
                </h2>

                <p className="
                  text-xs
                  text-slate-500
                  mt-1
                ">
                  Modifiez le nom ou la section.
                </p>

              </div>

              <button
                type="button"
                onClick={fermerModification}
                className="
                  w-9
                  h-9
                  rounded-lg
                  flex
                  items-center
                  justify-center
                  hover:bg-slate-100
                  text-slate-500
                "
              >
                <X size={19} />
              </button>

            </div>

            {/* CONTENU */}

            <div className="p-5 space-y-4">

              {/* NOM */}

              <div>

                <label className="
                  block
                  text-sm
                  font-semibold
                  text-slate-700
                  mb-2
                ">
                  Nom de la classe
                </label>

                <input
                  type="text"
                  value={nouveauNom}
                  onChange={(e) =>
                    setNouveauNom(
                      e.target.value
                    )
                  }
                  placeholder="Ex. 6ème Primaire"
                  className="
                    w-full
                    h-12
                    px-4
                    rounded-xl
                    border
                    border-slate-300
                    outline-none
                    focus:ring-2
                    focus:ring-indigo-500
                    focus:border-indigo-500
                  "
                />

              </div>

              {/* SECTION */}

              <div>

                <label className="
                  block
                  text-sm
                  font-semibold
                  text-slate-700
                  mb-2
                ">
                  Section
                </label>

                <select
                  value={nouvelleSection}
                  onChange={(e) =>
                    setNouvelleSection(
                      e.target.value
                    )
                  }
                  className="
                    w-full
                    h-12
                    px-4
                    rounded-xl
                    border
                    border-slate-300
                    bg-white
                    outline-none
                    focus:ring-2
                    focus:ring-indigo-500
                    focus:border-indigo-500
                  "
                >

                  <option value="">
                    Choisir une section
                  </option>

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

            </div>

            {/* FOOTER */}

            <div className="
              px-5
              py-4
              border-t
              border-slate-200
              flex
              flex-col-reverse
              sm:flex-row
              justify-end
              gap-2
            ">

              <button
                type="button"
                onClick={fermerModification}
                disabled={modification}
                className="
                  px-4
                  py-2.5
                  rounded-xl
                  border
                  border-slate-300
                  text-slate-700
                  hover:bg-slate-50
                  font-medium
                  transition
                "
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={modifierClasse}
                disabled={modification}
                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                  px-4
                  py-2.5
                  rounded-xl
                  bg-indigo-600
                  hover:bg-indigo-700
                  disabled:bg-indigo-300
                  text-white
                  font-semibold
                  transition
                "
              >

                {modification ? (
                  <>
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />

                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save size={16} />

                    Enregistrer
                  </>
                )}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  )
}

export default ClassesAdmin