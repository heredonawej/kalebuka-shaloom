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
} from 'lucide-react'
import { API_URL } from '../api'

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

function ElevesAdmin() {
  const [classes, setClasses] = useState([])
  const [eleves, setEleves] = useState([])

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

  const [recherche, setRecherche] = useState('')

  const [eleveEnModification, setEleveEnModification] =
    useState(null)

  const [chargementClasses, setChargementClasses] =
    useState(true)

  const [chargementEleves, setChargementEleves] =
    useState(false)

  const [enregistrement, setEnregistrement] =
    useState(false)

  const [message, setMessage] = useState('')
  const [erreur, setErreur] = useState('')

  // =====================================================
  // CHARGER LES CLASSES
  // =====================================================

  const chargerClasses = async () => {
    try {
      setChargementClasses(true)
      setErreur('')

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
    } finally {
      setChargementClasses(false)
    }
  }

  // =====================================================
  // CHARGER LES ÉLÈVES
  // =====================================================

  const chargerEleves = async (id = classeId) => {
    if (!id) {
      setEleves([])
      return
    }

    try {
      setChargementEleves(true)
      setErreur('')

      const response = await fetch(
        `${API_URL}/api/classes/${id}/eleves`
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
      setEleves([])
    } finally {
      setChargementEleves(false)
    }
  }

  useEffect(() => {
    chargerClasses()
  }, [])

  // =====================================================
  // CLASSES PAR SECTION
  // =====================================================

  const classesFiltrees = useMemo(() => {
    if (!section) return classes

    return classes.filter(
      (classe) => classe.section === section
    )
  }, [classes, section])

  // =====================================================
  // CHANGEMENT SECTION
  // =====================================================

  const changerSection = (e) => {
    const nouvelleSection = e.target.value

    setSection(nouvelleSection)
    setClasseId('')
    setEleves([])
    setRecherche('')
  }

  // =====================================================
  // CHANGEMENT CLASSE
  // =====================================================

  const changerClasse = (e) => {
    const nouvelleClasse = e.target.value

    setClasseId(nouvelleClasse)
    setRecherche('')

    if (nouvelleClasse) {
      chargerEleves(nouvelleClasse)
    } else {
      setEleves([])
    }
  }

  // =====================================================
  // MESSAGE TEMPORAIRE
  // =====================================================

  const afficherMessage = (texte) => {
    setMessage(texte)

    setTimeout(() => {
      setMessage('')
    }, 4000)
  }

  // =====================================================
  // RÉINITIALISER
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
    setEleveEnModification(null)
  }

  // =====================================================
  // AJOUTER / MODIFIER
  // =====================================================

  const enregistrerEleve = async (e) => {
    e.preventDefault()

    setErreur('')

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
        'Veuillez sélectionner le sexe de l’élève.'
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

      let response

      const donnees = {
        nom: nom.trim(),
        prenom: prenom.trim(),
        sexe,
        date_naissance: dateNaissance,
        lieu_naissance: lieuNaissance.trim(),
        adresse: adresse.trim(),
        nom_tuteur: nomTuteur.trim(),
        telephone_tuteur: telephoneTuteur.trim(),
      }

      // MODIFICATION
      if (eleveEnModification) {
        response = await fetch(
          `${API_URL}/api/classes/eleves/${eleveEnModification.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...donnees,
              classe_id: classeId,
            }),
          }
        )
      }

      // AJOUT
      else {
        response = await fetch(
          `${API_URL}/api/classes/${classeId}/eleves`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(donnees),
          }
        )
      }

      const data = await response.json()

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

      await chargerClasses()
      await chargerEleves(classeId)
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

    setNom(eleve.nom || '')
    setPrenom(eleve.prenom || '')
    setSexe(eleve.sexe || '')
    setDateNaissance(
      eleve.date_naissance
        ? String(eleve.date_naissance).substring(
            0,
            10
          )
        : ''
    )
    setLieuNaissance(
      eleve.lieu_naissance || ''
    )
    setAdresse(eleve.adresse || '')
    setNomTuteur(eleve.nom_tuteur || '')
    setTelephoneTuteur(
      eleve.telephone_tuteur || ''
    )

    setClasseId(
      String(eleve.classe_id || classeId)
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
    const confirmation = window.confirm(
      `Voulez-vous vraiment supprimer ${eleve.prenom} ${eleve.nom} ?`
    )

    if (!confirmation) return

    try {
      setErreur('')

      const response = await fetch(
        `${API_URL}/api/classes/eleves/${eleve.id}`,
        {
          method: 'DELETE',
        }
      )

      const data = await response.json()

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
      await chargerEleves(classeId)
    } catch (err) {
      console.error(err)
      setErreur(err.message)
    }
  }

  // =====================================================
  // RECHERCHE
  // =====================================================

  const elevesFiltres = useMemo(() => {
    const terme = recherche
      .trim()
      .toLowerCase()

    if (!terme) return eleves

    return eleves.filter((eleve) => {
      const nomComplet =
        `${eleve.prenom} ${eleve.nom}`
          .toLowerCase()

      return (
        eleve.nom
          ?.toLowerCase()
          .includes(terme) ||
        eleve.prenom
          ?.toLowerCase()
          .includes(terme) ||
        nomComplet.includes(terme)
      )
    })
  }, [eleves, recherche])

  // =====================================================
  // CLASSE ACTUELLE
  // =====================================================

  const classeActuelle = classes.find(
    (classe) =>
      String(classe.id) ===
      String(classeId)
  )

  // =====================================================
  // AFFICHAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-5 lg:p-8">

      {/* =================================================
          HEADER
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
            Inscription et gestion des élèves.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            chargerClasses()

            if (classeId) {
              chargerEleves(classeId)
            }
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition active:scale-[0.98] hover:bg-slate-50 sm:w-auto"
        >
          <RefreshCw size={17} />
          Actualiser
        </button>

      </div>


      {/* =================================================
          MESSAGES
      ================================================= */}

      {message && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100">
            ✓
          </span>

          <span>{message}</span>
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
            onClick={() => setErreur('')}
          >
            <X size={17} />
          </button>
        </div>
      )}


      {/* =================================================
          FORMULAIRE D'INSCRIPTION
      ================================================= */}

      <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* TITRE FORMULAIRE */}

        <div className="border-b border-slate-100 p-4 sm:p-6">

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
                  : 'Inscrire un élève'}
              </h2>

              <p className="text-xs text-slate-500">
                {eleveEnModification
                  ? 'Modifiez les informations nécessaires.'
                  : 'Complétez la fiche d’inscription.'}
              </p>
            </div>

          </div>

        </div>


        <form
          onSubmit={enregistrerEleve}
          className="p-4 sm:p-6"
        >

          {/* =================================================
              SECTION SCOLARITÉ
          ================================================= */}

          <div className="mb-6">

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

              <Champ
                label="Section"
              >
                <select
                  value={section}
                  onChange={changerSection}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">
                    Toutes les sections
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
                  onChange={changerClasse}
                  disabled={chargementClasses}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                >
                  <option value="">
                    {chargementClasses
                      ? 'Chargement...'
                      : 'Sélectionner une classe'}
                  </option>

                  {classesFiltrees.map(
                    (classe) => (
                      <option
                        key={classe.id}
                        value={classe.id}
                      >
                        {classe.nom} —{' '}
                        {classe.section}
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

          <div className="mb-6 border-t border-slate-100 pt-6">

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
                    setNom(e.target.value)
                  }
                  placeholder="Ex. KABONGO"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                    setPrenom(e.target.value)
                  }
                  placeholder="Ex. Jean"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </Champ>


              <Champ
                label="Sexe"
                obligatoire
              >
                <select
                  value={sexe}
                  onChange={(e) =>
                    setSexe(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                    className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:col-span-2"
                />
              </Champ>

            </div>
          </div>


          {/* =================================================
              DOMICILE
          ================================================= */}

          <div className="mb-6 border-t border-slate-100 pt-6">

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
                  setAdresse(e.target.value)
                }
                placeholder="Ex. Commune de Lubumbashi, quartier..."
                rows="3"
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </Champ>

          </div>


          {/* =================================================
              TUTEUR
          ================================================= */}

          <div className="mb-6 border-t border-slate-100 pt-6">

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
                  placeholder="Ex. KABONGO Pierre"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                  placeholder="Ex. 097 000 00 00"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </Champ>

            </div>
          </div>


          {/* =================================================
              BOUTONS
          ================================================= */}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">

            {eleveEnModification && (
              <button
                type="button"
                onClick={
                  reinitialiserFormulaire
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
              >
                <X size={17} />
                Annuler
              </button>
            )}

            <button
              type="submit"
              disabled={enregistrement}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition active:scale-[0.98] hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
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
                  Enregistrer les modifications
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


      {/* =================================================
          LISTE DES ÉLÈVES
      ================================================= */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* HEADER LISTE */}

        <div className="border-b border-slate-100 p-4 sm:p-6">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <div className="flex items-center gap-2">
                <Users
                  size={20}
                  className="text-blue-600"
                />

                <h2 className="font-bold text-slate-900">
                  Élèves inscrits
                </h2>
              </div>

              {classeActuelle && (
                <p className="mt-1 text-sm text-slate-500">
                  {classeActuelle.nom} —{' '}
                  {classeActuelle.section}
                </p>
              )}
            </div>

            {classeId && (
              <div className="w-fit rounded-xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
                {eleves.length}{' '}
                {eleves.length > 1
                  ? 'élèves'
                  : 'élève'}
              </div>
            )}

          </div>


          {/* RECHERCHE */}

          {classeId && (
            <div className="relative mt-5">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={recherche}
                onChange={(e) =>
                  setRecherche(
                    e.target.value
                  )
                }
                placeholder="Rechercher par nom ou prénom..."
                className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          )}

        </div>


        {/* AUCUNE CLASSE */}

        {!classeId ? (
          <div className="px-5 py-14 text-center">

            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <GraduationCap size={28} />
            </div>

            <h3 className="font-semibold text-slate-800">
              Sélectionnez une classe
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Sélectionnez une classe pour
              afficher ses élèves.
            </p>

          </div>

        ) : chargementEleves ? (

          <div className="px-5 py-14 text-center">

            <RefreshCw
              size={28}
              className="mx-auto animate-spin text-blue-600"
            />

            <p className="mt-3 text-sm text-slate-500">
              Chargement des élèves...
            </p>

          </div>

        ) : elevesFiltres.length === 0 ? (

          <div className="px-5 py-14 text-center">

            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Users size={28} />
            </div>

            <h3 className="font-semibold text-slate-800">
              {recherche
                ? 'Aucun élève trouvé'
                : 'Aucun élève inscrit'}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              {recherche
                ? 'Essayez avec un autre nom ou prénom.'
                : 'Utilisez le formulaire ci-dessus pour inscrire un élève.'}
            </p>

          </div>

        ) : (

          <>

            {/* =================================================
                MOBILE
            ================================================= */}

            <div className="divide-y divide-slate-100 md:hidden">

              {elevesFiltres.map(
                (eleve, index) => (

                  <div
                    key={eleve.id}
                    className="p-4"
                  >

                    <div className="flex gap-3">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                        {eleve.prenom
                          ?.charAt(0)
                          ?.toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">

                        <h3 className="truncate font-bold text-slate-900">
                          {eleve.prenom}{' '}
                          {eleve.nom}
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          Élève #{index + 1}
                        </p>

                      </div>

                    </div>


                    {/* INFORMATIONS */}

                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs">

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-slate-400">
                          Sexe
                        </p>

                        <p className="mt-1 font-semibold text-slate-700">
                          {eleve.sexe || '—'}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-slate-400">
                          Naissance
                        </p>

                        <p className="mt-1 font-semibold text-slate-700">
                          {eleve.date_naissance
                            ? new Date(
                                eleve.date_naissance
                              ).toLocaleDateString(
                                'fr-FR'
                              )
                            : '—'}
                        </p>
                      </div>

                      <div className="col-span-2 rounded-xl bg-slate-50 p-3">
                        <p className="text-slate-400">
                          Domicile
                        </p>

                        <p className="mt-1 font-semibold text-slate-700">
                          {eleve.adresse || '—'}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-slate-400">
                          Tuteur
                        </p>

                        <p className="mt-1 truncate font-semibold text-slate-700">
                          {eleve.nom_tuteur ||
                            '—'}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-slate-400">
                          Téléphone
                        </p>

                        <p className="mt-1 truncate font-semibold text-slate-700">
                          {eleve.telephone_tuteur ||
                            '—'}
                        </p>
                      </div>

                    </div>


                    {/* NOTES */}

                    <div className="mt-3 flex gap-2">

                      <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                        {eleve.nombre_notes ||
                          0}{' '}
                        note(s)
                      </span>

                      <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                        Moyenne :{' '}
                        {eleve.moyenne ??
                          '—'}
                      </span>

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
                        className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-sm font-semibold text-slate-700 transition active:scale-[0.98] hover:bg-slate-50"
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
                        className="flex items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-3 text-sm font-semibold text-red-600 transition active:scale-[0.98] hover:bg-red-50"
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
                ORDINATEUR
            ================================================= */}

            <div className="hidden overflow-x-auto md:block">

              <table className="w-full min-w-[850px]">

                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      #
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Élève
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Sexe
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Naissance
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Tuteur
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Téléphone
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {elevesFiltres.map(
                    (eleve, index) => (

                      <tr
                        key={eleve.id}
                        className="transition hover:bg-slate-50"
                      >

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {index + 1}
                        </td>

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                              {eleve.prenom
                                ?.charAt(
                                  0
                                )
                                ?.toUpperCase()}
                            </div>

                            <div>
                              <p className="font-semibold text-slate-900">
                                {eleve.prenom}{' '}
                                {eleve.nom}
                              </p>

                              <p className="text-xs text-slate-500">
                                Élève
                              </p>
                            </div>

                          </div>

                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {eleve.sexe || '—'}
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

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {eleve.nom_tuteur ||
                            '—'}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {eleve.telephone_tuteur ||
                            '—'}
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
                              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-blue-600"
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
                              className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
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

      </div>

    </div>
  )
}

export default ElevesAdmin