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
} from 'lucide-react'


function ClassesAdmin() {

  const [classes, setClasses] = useState([])

  const [section, setSection] = useState('')
  const [nom, setNom] = useState('')

  const [chargement, setChargement] = useState(true)
  const [creation, setCreation] = useState(false)
  const [suppression, setSuppression] = useState(null)

  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState('')

  // Sections déroulantes
  const [formulaireOuvert, setFormulaireOuvert] = useState(false)
  const [listeOuverte, setListeOuverte] = useState(true)


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
          LISTE DÉROULANTE
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


        {/* CONTENU */}

        {listeOuverte && (

          <div className="
            border-t
            border-slate-200
          ">


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


            ) : classes.length === 0 ? (

              <div className="
                py-12
                text-center
                text-slate-500
                text-sm
              ">

                Aucune classe enregistrée.

              </div>


            ) : (

              <>

                {/* ======================================
                    VERSION ORDINATEUR
                ====================================== */}

                <div className="hidden md:block">

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

                      {classes.map((classe) => (

                        <tr
                          key={classe.id}
                          className="
                            hover:bg-slate-50
                            transition
                          "
                        >

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


                          <td className="
                            px-5
                            py-4
                            text-slate-600
                          ">

                            {classe.section}

                          </td>


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


                          <td className="px-5 py-4">

                            <div className="
                              flex
                              justify-end
                            ">

                              <button
                                type="button"
                                disabled={
                                  suppression === classe.id
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

                                {suppression === classe.id ? (

                                  <Loader2
                                    size={15}
                                    className="animate-spin"
                                  />

                                ) : (

                                  <Trash2 size={15} />

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


                {/* ======================================
                    VERSION MOBILE
                ====================================== */}

                <div className="
                  md:hidden
                  divide-y
                  divide-slate-100
                ">

                  {classes.map((classe) => (

                    <div
                      key={classe.id}
                      className="p-4"
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


                      <button
                        type="button"
                        disabled={
                          suppression === classe.id
                        }
                        onClick={() =>
                          supprimerClasse(
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
                          bg-red-50
                          text-red-600
                          hover:bg-red-100
                          disabled:opacity-50
                          text-xs
                          font-semibold
                          transition
                        "
                      >

                        {suppression === classe.id ? (

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

    </div>
  )
}


export default ClassesAdmin