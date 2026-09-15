import { useEffect, useMemo, useState } from 'react'
import {
  UserPlus,
  Search,
  Pencil,
  Trash2,
  Users,
  X,
  Save,
  GraduationCap,
  RefreshCw,
  AlertCircle,
  MapPin,
  Phone,
  CalendarDays,
  UserRound,
  School,
  ChevronDown,
  ChevronUp,
  Filter,
} from 'lucide-react'
import { API_URL } from '../api'


// =====================================================
// COMPOSANT CHAMP
// =====================================================

function Champ({
  label,
  children,
  obligatoire = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}

        {obligatoire && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  )
}


// =====================================================
// PAGE ÉLÈVES
// =====================================================

function ElevesAdmin() {

  const [classes, setClasses] = useState([])
  const [eleves, setEleves] = useState([])

  // =====================================================
  // FORMULAIRE
  // =====================================================

  const [formulaireOuvert, setFormulaireOuvert] =
    useState(false)

  const [section, setSection] = useState('')
  const [classeId, setClasseId] = useState('')

  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [sexe, setSexe] = useState('')
  const [dateNaissance, setDateNaissance] = useState('')
  const [lieuNaissance, setLieuNaissance] = useState('')
  const [adresse, setAdresse] = useState('')
  const [nomTuteur, setNomTuteur] = useState('')
  const [telephoneTuteur, setTelephoneTuteur] = useState('')

  // =====================================================
  // LISTE DÉROULANTE
  // =====================================================

  const [listeOuverte, setListeOuverte] =
    useState(true)

  // =====================================================
  // MODIFICATION
  // =====================================================

  const [eleveEnModification, setEleveEnModification] =
    useState(null)

  // =====================================================
  // RECHERCHE
  // =====================================================

  const [rechercheNom, setRechercheNom] =
    useState('')

  const [rechercheClasse, setRechercheClasse] =
    useState('')

  const [rechercheDate, setRechercheDate] =
    useState('')

  // =====================================================
  // ÉTATS
  // =====================================================

  const [chargement, setChargement] =
    useState(true)

  const [enregistrement, setEnregistrement] =
    useState(false)

  const [message, setMessage] =
    useState('')

  const [erreur, setErreur] =
    useState('')


  // =====================================================
  // CHARGER LES CLASSES
  // =====================================================

  const chargerClasses = async () => {

    try {

      const response = await fetch(
        `${API_URL}/api/classes`
      )

      if (!response.ok) {
        throw new Error(
          'Impossible de charger les classes.'
        )
      }

      const data = await response.json()

      setClasses(data)

    } catch (err) {

      console.error(err)
      setErreur(err.message)

    }

  }


  // =====================================================
  // CHARGER TOUS LES ÉLÈVES
  // =====================================================

  const chargerEleves = async () => {

    try {

      setChargement(true)
      setErreur('')

      const response = await fetch(
        `${API_URL}/api/classes/eleves`
      )

      if (!response.ok) {
        throw new Error(
          'Impossible de charger les élèves.'
        )
      }

      const data = await response.json()

      setEleves(data)

    } catch (err) {

      console.error(err)
      setErreur(err.message)

    } finally {

      setChargement(false)

    }

  }


  // =====================================================
  // CHARGEMENT INITIAL
  // =====================================================

  useEffect(() => {

    chargerClasses()
    chargerEleves()

  }, [])


  // =====================================================
  // CLASSES PAR SECTION
  // =====================================================

  const classesFormulaire = useMemo(() => {

    if (!section) {
      return classes
    }

    return classes.filter(
      (classe) =>
        classe.section === section
    )

  }, [classes, section])


  // =====================================================
  // MESSAGE
  // =====================================================

  const afficherMessage = (texte) => {

    setMessage(texte)

    setTimeout(() => {
      setMessage('')
    }, 4000)

  }


  // =====================================================
  // RÉINITIALISER FORMULAIRE
  // =====================================================

  const reinitialiserFormulaire = () => {

    setNom('')
    setPrenom('')
    setSexe('')
    setDateNaissance('')
    setLieuNaissance('')
    setAdresse('')
    setNomTuteur('')
    setTelephoneTuteur('')

    setSection('')
    setClasseId('')

    setEleveEnModification(null)

  }


  // =====================================================
  // FERMER FORMULAIRE
  // =====================================================

  const fermerFormulaire = () => {

    reinitialiserFormulaire()

    setFormulaireOuvert(false)

  }


  // =====================================================
  // OUVRIR FORMULAIRE
  // =====================================================

  const ouvrirFormulaire = () => {

    setErreur('')

    setFormulaireOuvert(true)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })

  }


  // =====================================================
  // ENREGISTRER ÉLÈVE
  // =====================================================

  const enregistrerEleve = async (e) => {

    e.preventDefault()

    setErreur('')

    // Vérifications

    if (!nom.trim()) {
      setErreur(
        'Veuillez entrer le nom de l’élève.'
      )
      return
    }

    if (!prenom.trim()) {
      setErreur(
        'Veuillez entrer le prénom de l’élève.'
      )
      return
    }

    if (!sexe) {
      setErreur(
        'Veuillez sélectionner le sexe.'
      )
      return
    }

    if (!dateNaissance) {
      setErreur(
        'Veuillez entrer la date de naissance.'
      )
      return
    }

    if (!lieuNaissance.trim()) {
      setErreur(
        'Veuillez entrer le lieu de naissance.'
      )
      return
    }

    if (!adresse.trim()) {
      setErreur(
        'Veuillez entrer le lieu de domicile.'
      )
      return
    }

    if (!nomTuteur.trim()) {
      setErreur(
        'Veuillez entrer le nom du tuteur.'
      )
      return
    }

    if (!telephoneTuteur.trim()) {
      setErreur(
        'Veuillez entrer le téléphone du tuteur.'
      )
      return
    }

    if (!classeId) {
      setErreur(
        'Veuillez sélectionner une classe.'
      )
      return
    }


    try {

      setEnregistrement(true)

      const donnees = {
        nom: nom.trim(),
        prenom: prenom.trim(),
        sexe,
        date_naissance: dateNaissance,
        lieu_naissance: lieuNaissance.trim(),
        adresse: adresse.trim(),
        nom_tuteur: nomTuteur.trim(),
        telephone_tuteur:
          telephoneTuteur.trim(),
      }

      let response


      // =================================================
      // MODIFICATION
      // =================================================

      if (eleveEnModification) {

        response = await fetch(
          `${API_URL}/api/classes/eleves/${eleveEnModification.id}`,
          {
            method: 'PUT',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              ...donnees,
              classe_id: classeId,
            }),
          }
        )

      }


      // =================================================
      // AJOUT
      // =================================================

      else {

        response = await fetch(
          `${API_URL}/api/classes/${classeId}/eleves`,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify(
              donnees
            ),
          }
        )

      }


      const data =
        await response.json()


      if (!response.ok) {

        throw new Error(
          data.erreur ||
          'Une erreur est survenue.'
        )

      }


      afficherMessage(
        eleveEnModification
          ? 'Élève modifié avec succès.'
          : 'Élève inscrit avec succès.'
      )


      reinitialiserFormulaire()

      setFormulaireOuvert(false)

      await chargerClasses()
      await chargerEleves()

    } catch (err) {

      console.error(err)
      setErreur(err.message)

    } finally {

      setEnregistrement(false)

    }

  }


  // =====================================================
  // MODIFIER
  // =====================================================

  const commencerModification = (eleve) => {

    setEleveEnModification(eleve)

    setFormulaireOuvert(true)

    setNom(eleve.nom || '')
    setPrenom(eleve.prenom || '')
    setSexe(eleve.sexe || '')

    setDateNaissance(
      eleve.date_naissance
        ? String(
            eleve.date_naissance
          ).substring(0, 10)
        : ''
    )

    setLieuNaissance(
      eleve.lieu_naissance || ''
    )

    setAdresse(
      eleve.adresse || ''
    )

    setNomTuteur(
      eleve.nom_tuteur || ''
    )

    setTelephoneTuteur(
      eleve.telephone_tuteur || ''
    )

    setClasseId(
      String(
        eleve.classe_id || ''
      )
    )

    setSection(
      eleve.classe_section || ''
    )

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })

  }


  // =====================================================
  // SUPPRIMER
  // =====================================================

  const supprimerEleve = async (eleve) => {

    const confirmation =
      window.confirm(
        `Voulez-vous vraiment supprimer ${eleve.prenom} ${eleve.nom} ?`
      )

    if (!confirmation) return


    try {

      setErreur('')

      const response =
        await fetch(
          `${API_URL}/api/classes/eleves/${eleve.id}`,
          {
            method: 'DELETE',
          }
        )


      const data =
        await response.json()


      if (!response.ok) {

        throw new Error(
          data.erreur ||
          'Impossible de supprimer l’élève.'
        )

      }


      afficherMessage(
        'Élève supprimé avec succès.'
      )

      await chargerClasses()
      await chargerEleves()

    } catch (err) {

      console.error(err)
      setErreur(err.message)

    }

  }


  // =====================================================
  // FILTRAGE
  // =====================================================

  const elevesFiltres = useMemo(() => {

    const nomRecherche =
      rechercheNom
        .trim()
        .toLowerCase()


    return eleves.filter((eleve) => {

      // NOM / PRÉNOM

      const correspondNom =
        !nomRecherche ||
        eleve.nom
          ?.toLowerCase()
          .includes(nomRecherche) ||
        eleve.prenom
          ?.toLowerCase()
          .includes(nomRecherche) ||
        `${eleve.prenom} ${eleve.nom}`
          .toLowerCase()
          .includes(nomRecherche)


      // CLASSE

      const correspondClasse =
        !rechercheClasse ||
        String(
          eleve.classe_id
        ) === String(
          rechercheClasse
        )


      // DATE INSCRIPTION

      const dateEleve =
        eleve.date_inscription
          ? String(
              eleve.date_inscription
            ).substring(0, 10)
          : ''


      const correspondDate =
        !rechercheDate ||
        dateEleve === rechercheDate


      return (
        correspondNom &&
        correspondClasse &&
        correspondDate
      )

    })

  }, [
    eleves,
    rechercheNom,
    rechercheClasse,
    rechercheDate,
  ])


  // =====================================================
  // RÉINITIALISER FILTRES
  // =====================================================

  const reinitialiserFiltres = () => {

    setRechercheNom('')
    setRechercheClasse('')
    setRechercheDate('')

  }


  // =====================================================
  // AFFICHAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-5 lg:p-8">

      {/* =================================================
          EN-TÊTE
      ================================================= */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <div className="mb-2 flex items-center gap-2">

            <div className="rounded-xl bg-blue-100 p-2 text-blue-600">

              <GraduationCap size={21} />

            </div>

            <span className="text-sm font-semibold text-blue-600">
              Administration
            </span>

          </div>


          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Gestion des élèves
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Inscription et suivi des élèves.
          </p>

        </div>


        <button
          type="button"
          onClick={ouvrirFormulaire}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition active:scale-[0.98] hover:bg-blue-700 sm:w-auto"
        >

          <UserPlus size={18} />

          {eleveEnModification
            ? 'Modifier l’élève'
            : 'Inscrire un élève'}

        </button>

      </div>


      {/* =================================================
          STATISTIQUE
      ================================================= */}

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-blue-100 p-3 text-blue-600">

              <Users size={21} />

            </div>

            <div>

              <p className="text-xs font-medium text-slate-500">
                Total des élèves
              </p>

              <p className="text-2xl font-bold text-slate-900">
                {eleves.length}
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          MESSAGES
      ================================================= */}

      {message && (

        <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">

          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100">
            ✓
          </span>

          <span>
            {message}
          </span>

        </div>

      )}


      {erreur && (

        <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

          <AlertCircle
            size={19}
            className="mt-0.5 shrink-0"
          />

          <span className="flex-1">
            {erreur}
          </span>

          <button
            type="button"
            onClick={() =>
              setErreur('')
            }
          >
            <X size={17} />
          </button>

        </div>

      )}


      {/* =================================================
          FORMULAIRE DÉROULANT
      ================================================= */}

      {formulaireOuvert && (

        <div className="mb-6 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">

          {/* HEADER */}

          <div className="flex items-center justify-between border-b border-slate-100 bg-blue-50/50 p-4 sm:p-6">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">

                {eleveEnModification ? (
                  <Pencil size={21} />
                ) : (
                  <UserPlus size={21} />
                )}

              </div>

              <div>

                <h2 className="font-bold text-slate-900">

                  {eleveEnModification
                    ? 'Modifier l’élève'
                    : 'Nouvelle inscription'}

                </h2>

                <p className="text-xs text-slate-500">
                  Complétez les informations de l’élève.
                </p>

              </div>

            </div>


            <button
              type="button"
              onClick={fermerFormulaire}
              className="rounded-xl p-2 text-slate-500 transition hover:bg-white hover:text-slate-800"
              title="Fermer"
            >
              <X size={21} />
            </button>

          </div>


          {/* FORMULAIRE */}

          <form
            onSubmit={enregistrerEleve}
            className="p-4 sm:p-6"
          >

            {/* =================================================
                SCOLARITÉ
            ================================================= */}

            <div className="mb-7">

              <div className="mb-4 flex items-center gap-2">

                <School
                  size={18}
                  className="text-blue-600"
                />

                <h3 className="font-bold text-slate-800">
                  Scolarité
                </h3>

              </div>


              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <Champ label="Section">

                  <select
                    value={section}
                    onChange={(e) => {

                      setSection(
                        e.target.value
                      )

                      setClasseId('')

                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >

                    <option value="">
                      Sélectionner une section
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

                </Champ>


                <Champ
                  label="Classe"
                  obligatoire
                >

                  <select
                    value={classeId}
                    onChange={(e) =>
                      setClasseId(
                        e.target.value
                      )
                    }
                    disabled={
                      !section ||
                      classesFormulaire.length === 0
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                  >

                    <option value="">

                      {!section
                        ? 'Choisir d’abord la section'
                        : 'Sélectionner une classe'}

                    </option>

                    {classesFormulaire.map(
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

                </Champ>

              </div>

            </div>


            {/* =================================================
                INFORMATIONS PERSONNELLES
            ================================================= */}

            <div className="mb-7 border-t border-slate-100 pt-7">

              <div className="mb-4 flex items-center gap-2">

                <UserRound
                  size={18}
                  className="text-blue-600"
                />

                <h3 className="font-bold text-slate-800">
                  Informations personnelles
                </h3>

              </div>


              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <Champ
                  label="Nom"
                  obligatoire
                >

                  <input
                    type="text"
                    value={nom}
                    onChange={(e) =>
                      setNom(
                        e.target.value
                      )
                    }
                    placeholder="Ex. KABONGO"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </Champ>


                <Champ
                  label="Prénom"
                  obligatoire
                >

                  <input
                    type="text"
                    value={prenom}
                    onChange={(e) =>
                      setPrenom(
                        e.target.value
                      )
                    }
                    placeholder="Ex. Jean"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </Champ>


                <Champ
                  label="Sexe"
                  obligatoire
                >

                  <select
                    value={sexe}
                    onChange={(e) =>
                      setSexe(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >

                    <option value="">
                      Sélectionner
                    </option>

                    <option value="Masculin">
                      Masculin
                    </option>

                    <option value="Féminin">
                      Féminin
                    </option>

                  </select>

                </Champ>


                <Champ
                  label="Date de naissance"
                  obligatoire
                >

                  <div className="relative">

                    <CalendarDays
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="date"
                      value={dateNaissance}
                      onChange={(e) =>
                        setDateNaissance(
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                  </div>

                </Champ>


                <Champ
                  label="Lieu de naissance"
                  obligatoire
                >

                  <input
                    type="text"
                    value={lieuNaissance}
                    onChange={(e) =>
                      setLieuNaissance(
                        e.target.value
                      )
                    }
                    placeholder="Ex. Lubumbashi"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:col-span-2"
                  />

                </Champ>

              </div>

            </div>


            {/* =================================================
                DOMICILE
            ================================================= */}

            <div className="mb-7 border-t border-slate-100 pt-7">

              <div className="mb-4 flex items-center gap-2">

                <MapPin
                  size={18}
                  className="text-blue-600"
                />

                <h3 className="font-bold text-slate-800">
                  Domicile
                </h3>

              </div>


              <Champ
                label="Lieu / adresse de domicile"
                obligatoire
              >

                <textarea
                  value={adresse}
                  onChange={(e) =>
                    setAdresse(
                      e.target.value
                    )
                  }
                  rows="3"
                  placeholder="Ex. Commune de Lubumbashi, quartier..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </Champ>

            </div>


            {/* =================================================
                TUTEUR
            ================================================= */}

            <div className="mb-7 border-t border-slate-100 pt-7">

              <div className="mb-4 flex items-center gap-2">

                <Phone
                  size={18}
                  className="text-blue-600"
                />

                <h3 className="font-bold text-slate-800">
                  Responsable / tuteur
                </h3>

              </div>


              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <Champ
                  label="Nom du tuteur"
                  obligatoire
                >

                  <input
                    type="text"
                    value={nomTuteur}
                    onChange={(e) =>
                      setNomTuteur(
                        e.target.value
                      )
                    }
                    placeholder="Ex. Pierre KABONGO"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </Champ>


                <Champ
                  label="Téléphone du tuteur"
                  obligatoire
                >

                  <input
                    type="tel"
                    inputMode="tel"
                    value={telephoneTuteur}
                    onChange={(e) =>
                      setTelephoneTuteur(
                        e.target.value
                      )
                    }
                    placeholder="Ex. +243 97 000 00 00"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </Champ>

              </div>

            </div>


            {/* =================================================
                BOUTONS
            ================================================= */}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={fermerFormulaire}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:w-auto"
              >

                <X size={17} />

                Annuler

              </button>


              <button
                type="submit"
                disabled={enregistrement}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60 sm:w-auto"
              >

                {enregistrement ? (

                  <>

                    <RefreshCw
                      size={17}
                      className="animate-spin"
                    />

                    Enregistrement...

                  </>

                ) : eleveEnModification ? (

                  <>

                    <Save size={17} />

                    Enregistrer

                  </>

                ) : (

                  <>

                    <UserPlus size={17} />

                    Inscrire l’élève

                  </>

                )}

              </button>

            </div>

          </form>

        </div>

      )}


      {/* =================================================
          RECHERCHE / FILTRES
      ================================================= */}

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

        <div className="mb-4 flex items-center gap-2">

          <Filter
            size={19}
            className="text-blue-600"
          />

          <div>

            <h2 className="font-bold text-slate-900">
              Rechercher un élève
            </h2>

            <p className="text-xs text-slate-500">
              Filtrez par nom, classe ou date d'inscription.
            </p>

          </div>

        </div>


        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">

          {/* NOM */}

          <div className="relative">

            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={rechercheNom}
              onChange={(e) =>
                setRechercheNom(
                  e.target.value
                )
              }
              placeholder="Nom ou prénom..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

          </div>


          {/* CLASSE */}

          <select
            value={rechercheClasse}
            onChange={(e) =>
              setRechercheClasse(
                e.target.value
              )
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >

            <option value="">
              Toutes les classes
            </option>

            {classes.map((classe) => (

              <option
                key={classe.id}
                value={classe.id}
              >

                {classe.nom} — {classe.section}

              </option>

            ))}

          </select>


          {/* DATE */}

          <div className="relative">

            <CalendarDays
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="date"
              value={rechercheDate}
              onChange={(e) =>
                setRechercheDate(
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

          </div>

        </div>


        {(rechercheNom ||
          rechercheClasse ||
          rechercheDate) && (

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">

            <p className="text-xs text-slate-500">

              <strong className="text-slate-700">
                {elevesFiltres.length}
              </strong>{' '}

              résultat(s)

            </p>


            <button
              type="button"
              onClick={
                reinitialiserFiltres
              }
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Réinitialiser les filtres
            </button>

          </div>

        )}

      </div>


      {/* =================================================
          LISTE DES ÉLÈVES — DÉROULANTE
      ================================================= */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* =================================================
            HEADER CLIQUABLE
        ================================================= */}

        <button
          type="button"
          onClick={() =>
            setListeOuverte(
              !listeOuverte
            )
          }
          className="flex w-full items-center justify-between gap-3 border-b border-slate-100 p-4 text-left transition hover:bg-slate-50 sm:p-5"
        >

          <div className="flex min-w-0 items-center gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">

              <Users size={20} />

            </div>


            <div className="min-w-0">

              <h2 className="font-bold text-slate-900">
                Liste des élèves
              </h2>

              <p className="text-xs text-slate-500">
                {elevesFiltres.length} élève(s)
              </p>

            </div>

          </div>


          <div className="flex shrink-0 items-center gap-2">

            <span className="hidden rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 sm:block">

              {elevesFiltres.length} élève(s)

            </span>


            {listeOuverte ? (

              <ChevronUp
                size={21}
                className="text-slate-500"
              />

            ) : (

              <ChevronDown
                size={21}
                className="text-slate-500"
              />

            )}

          </div>

        </button>


        {/* =================================================
            CONTENU DÉROULANT
        ================================================= */}

        {listeOuverte && (

          <>

            {/* =================================================
                CHARGEMENT
            ================================================= */}

            {chargement ? (

              <div className="px-5 py-16 text-center">

                <RefreshCw
                  size={28}
                  className="mx-auto animate-spin text-blue-600"
                />

                <p className="mt-3 text-sm text-slate-500">
                  Chargement des élèves...
                </p>

              </div>

            ) : elevesFiltres.length === 0 ? (

              /* =================================================
                 AUCUN ÉLÈVE
              ================================================= */

              <div className="px-5 py-16 text-center">

                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">

                  <Users size={28} />

                </div>


                <h3 className="font-semibold text-slate-800">
                  Aucun élève trouvé
                </h3>


                <p className="mt-2 text-sm text-slate-500">
                  Aucun élève ne correspond aux critères de recherche.
                </p>

              </div>

            ) : (

              <>

                {/* =================================================
                    VERSION MOBILE
                ================================================= */}

                <div className="divide-y divide-slate-100 md:hidden">

                  {elevesFiltres.map(
                    (eleve) => (

                      <div
                        key={eleve.id}
                        className="p-4"
                      >

                        {/* IDENTITÉ */}

                        <div className="flex items-start gap-3">

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">

                            {eleve.prenom
                              ?.charAt(0)
                              ?.toUpperCase()}

                          </div>


                          <div className="min-w-0 flex-1">

                            <h3 className="font-bold text-slate-900">

                              {eleve.prenom}{' '}
                              {eleve.nom}

                            </h3>


                            <p className="mt-1 text-xs text-blue-600">

                              {eleve.classe_nom ||
                                'Classe non définie'}

                            </p>

                          </div>

                        </div>


                        {/* INFORMATIONS */}

                        <div className="mt-4 grid grid-cols-2 gap-2">

                          <div className="rounded-xl bg-slate-50 p-3">

                            <p className="text-[11px] text-slate-400">
                              Sexe
                            </p>

                            <p className="mt-1 text-xs font-semibold text-slate-700">

                              {eleve.sexe ||
                                '—'}

                            </p>

                          </div>


                          <div className="rounded-xl bg-slate-50 p-3">

                            <p className="text-[11px] text-slate-400">
                              Naissance
                            </p>

                            <p className="mt-1 text-xs font-semibold text-slate-700">

                              {eleve.date_naissance
                                ? new Date(
                                    eleve.date_naissance
                                  ).toLocaleDateString(
                                    'fr-FR'
                                  )
                                : '—'}

                            </p>

                          </div>


                          <div className="rounded-xl bg-slate-50 p-3">

                            <p className="text-[11px] text-slate-400">
                              Tuteur
                            </p>

                            <p className="mt-1 truncate text-xs font-semibold text-slate-700">

                              {eleve.nom_tuteur ||
                                '—'}

                            </p>

                          </div>


                          <div className="rounded-xl bg-slate-50 p-3">

                            <p className="text-[11px] text-slate-400">
                              Téléphone
                            </p>

                            <p className="mt-1 truncate text-xs font-semibold text-slate-700">

                              {eleve.telephone_tuteur ||
                                '—'}

                            </p>

                          </div>


                          <div className="col-span-2 rounded-xl bg-slate-50 p-3">

                            <p className="text-[11px] text-slate-400">
                              Date d'inscription
                            </p>

                            <p className="mt-1 text-xs font-semibold text-slate-700">

                              {eleve.date_inscription
                                ? new Date(
                                    eleve.date_inscription
                                  ).toLocaleDateString(
                                    'fr-FR'
                                  )
                                : '—'}

                            </p>

                          </div>

                        </div>


                        {/* ACTIONS */}

                        <div className="mt-4 grid grid-cols-2 gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              commencerModification(
                                eleve
                              )
                            }
                            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                          >

                            <Pencil size={16} />

                            Modifier

                          </button>


                          <button
                            type="button"
                            onClick={() =>
                              supprimerEleve(
                                eleve
                              )
                            }
                            className="flex items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
                          >

                            <Trash2 size={16} />

                            Supprimer

                          </button>

                        </div>

                      </div>

                    )
                  )}

                </div>


                {/* =================================================
                    VERSION ORDINATEUR
                ================================================= */}

                <div className="hidden overflow-x-auto md:block">

                  <table className="w-full min-w-[1100px]">

                    <thead>

                      <tr className="border-b border-slate-100 bg-slate-50">

                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                          Élève
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                          Sexe
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                          Date naissance
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                          Classe
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                          Tuteur
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                          Téléphone
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                          Inscription
                        </th>

                        <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                          Actions
                        </th>

                      </tr>

                    </thead>


                    <tbody className="divide-y divide-slate-100">

                      {elevesFiltres.map(
                        (eleve) => (

                          <tr
                            key={eleve.id}
                            className="transition hover:bg-slate-50"
                          >

                            <td className="px-5 py-4">

                              <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">

                                  {eleve.prenom
                                    ?.charAt(0)
                                    ?.toUpperCase()}

                                </div>


                                <div>

                                  <p className="font-semibold text-slate-900">

                                    {eleve.prenom}{' '}
                                    {eleve.nom}

                                  </p>

                                </div>

                              </div>

                            </td>


                            <td className="px-5 py-4 text-sm text-slate-600">

                              {eleve.sexe ||
                                '—'}

                            </td>


                            <td className="px-5 py-4 text-sm text-slate-600">

                              {eleve.date_naissance
                                ? new Date(
                                    eleve.date_naissance
                                  ).toLocaleDateString(
                                    'fr-FR'
                                  )
                                : '—'}

                            </td>


                            <td className="px-5 py-4">

                              <div>

                                <p className="text-sm font-semibold text-slate-800">

                                  {eleve.classe_nom ||
                                    '—'}

                                </p>


                                <p className="text-xs text-blue-600">

                                  {eleve.classe_section ||
                                    ''}

                                </p>

                              </div>

                            </td>


                            <td className="px-5 py-4 text-sm text-slate-600">

                              {eleve.nom_tuteur ||
                                '—'}

                            </td>


                            <td className="px-5 py-4 text-sm text-slate-600">

                              {eleve.telephone_tuteur ||
                                '—'}

                            </td>


                            <td className="px-5 py-4 text-sm text-slate-600">

                              {eleve.date_inscription
                                ? new Date(
                                    eleve.date_inscription
                                  ).toLocaleDateString(
                                    'fr-FR'
                                  )
                                : '—'}

                            </td>


                            <td className="px-5 py-4">

                              <div className="flex justify-end gap-2">

                                <button
                                  type="button"
                                  onClick={() =>
                                    commencerModification(
                                      eleve
                                    )
                                  }
                                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-600"
                                  title="Modifier"
                                >

                                  <Pencil
                                    size={17}
                                  />

                                </button>


                                <button
                                  type="button"
                                  onClick={() =>
                                    supprimerEleve(
                                      eleve
                                    )
                                  }
                                  className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                                  title="Supprimer"
                                >

                                  <Trash2
                                    size={17}
                                  />

                                </button>

                              </div>

                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              </>

            )}

          </>

        )}

      </div>

    </div>
  )
}


export default ElevesAdmin