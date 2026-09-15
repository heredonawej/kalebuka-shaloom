import { useEffect, useState } from 'react'
import { API_URL } from '../api'
import {
  UserPlus,
  Users,
  Copy,
  Check,
  Loader2,
  ChevronDown,
  ChevronUp,
  Pencil,
  Power,
  Trash2,
  X,
  Save,
} from 'lucide-react'

function EnseignantsAdmin() {
  const [enseignants, setEnseignants] = useState([])
  const [classes, setClasses] = useState([])

  const [nom, setNom] = useState('')
  const [matricule, setMatricule] = useState('')
  const [classeId, setClasseId] = useState('')

  const [chargement, setChargement] = useState(true)
  const [creation, setCreation] = useState(false)

  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState('')

  const [motDePasse, setMotDePasse] = useState('')
  const [copie, setCopie] = useState(false)

  // Sections déroulantes
  const [formulaireOuvert, setFormulaireOuvert] = useState(false)
  const [listeOuverte, setListeOuverte] = useState(true)

  // Modification
  const [enseignantModifie, setEnseignantModifie] = useState(null)
  const [nouvelleClasseId, setNouvelleClasseId] = useState('')
  const [modification, setModification] = useState(false)

  // Action statut
  const [actionId, setActionId] = useState(null)


  // =====================================
  // CHARGER LES DONNÉES
  // =====================================

  useEffect(() => {
    chargerDonnees()
  }, [])


  const chargerDonnees = async () => {
    try {
      setChargement(true)
      setErreur('')

      const [
        enseignantsResponse,
        classesResponse
      ] = await Promise.all([
        fetch(`${API_URL}/api/admin/enseignants`),
        fetch(`${API_URL}/api/classes`),
      ])

      const enseignantsData =
        await enseignantsResponse.json()

      const classesData =
        await classesResponse.json()

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

      setEnseignants(enseignantsData)
      setClasses(classesData)

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


  // =====================================
  // CRÉER UN ENSEIGNANT
  // =====================================

  const creerEnseignant = async (e) => {
    e.preventDefault()

    setErreur('')
    setSucces('')
    setMotDePasse('')
    setCopie(false)

    if (!nom.trim() || !matricule.trim()) {
      setErreur(
        'Le nom complet et le matricule sont obligatoires.'
      )
      return
    }

    try {
      setCreation(true)

      const response = await fetch(
        `${API_URL}/api/admin/enseignants`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nom: nom.trim(),
            matricule: matricule.trim(),
            classe_id: classeId
              ? Number(classeId)
              : null,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.erreur ||
          'Impossible de créer le compte.'
        )
      }

      setSucces(
        'Compte enseignant créé avec succès.'
      )

      setMotDePasse(
        data.mot_de_passe_temporaire
      )

      setNom('')
      setMatricule('')
      setClasseId('')

      await chargerDonnees()

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


  // =====================================
  // COPIER LE MOT DE PASSE
  // =====================================

  const copierMotDePasse = async () => {
    try {
      await navigator.clipboard.writeText(
        motDePasse
      )

      setCopie(true)

      setTimeout(() => {
        setCopie(false)
      }, 2000)

    } catch (err) {
      console.error(
        'Impossible de copier le mot de passe :',
        err
      )
    }
  }


  // =====================================
  // OUVRIR MODIFICATION
  // =====================================

  const ouvrirModification = (enseignant) => {
    setErreur('')
    setSucces('')

    setEnseignantModifie(enseignant)

    setNouvelleClasseId(
      enseignant.classe_id
        ? String(enseignant.classe_id)
        : ''
    )
  }


  // =====================================
  // FERMER MODIFICATION
  // =====================================

  const fermerModification = () => {
    setEnseignantModifie(null)
    setNouvelleClasseId('')
  }


  // =====================================
  // MODIFIER L'AFFECTATION
  // =====================================

  const modifierAffectation = async () => {
    if (!enseignantModifie) return

    try {
      setModification(true)
      setErreur('')
      setSucces('')

      const response = await fetch(
        `${API_URL}/api/admin/enseignants/${enseignantModifie.id}/classe`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            classe_id: nouvelleClasseId
              ? Number(nouvelleClasseId)
              : null,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.erreur ||
          'Impossible de modifier l’affectation.'
        )
      }

      setSucces(
        'Affectation modifiée avec succès.'
      )

      fermerModification()

      await chargerDonnees()

    } catch (err) {
      console.error(err)

      setErreur(
        err.message ||
        'Impossible de modifier l’affectation.'
      )

    } finally {
      setModification(false)
    }
  }


  // =====================================
  // ACTIVER / DÉSACTIVER
  // =====================================

  const changerStatut = async (enseignant) => {
    const nouveauStatut =
      enseignant.actif === false

    const message = nouveauStatut
      ? `Voulez-vous réactiver ${enseignant.nom} ?`
      : `Voulez-vous désactiver ${enseignant.nom} ?`

    if (!window.confirm(message)) {
      return
    }

    try {
      setActionId(enseignant.id)
      setErreur('')
      setSucces('')

      const response = await fetch(
        `${API_URL}/api/admin/enseignants/${enseignant.id}/statut`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            actif: nouveauStatut,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.erreur ||
          'Impossible de modifier le statut.'
        )
      }

      setSucces(
        nouveauStatut
          ? 'Enseignant réactivé avec succès.'
          : 'Enseignant désactivé avec succès.'
      )

      await chargerDonnees()

    } catch (err) {
      console.error(err)

      setErreur(
        err.message ||
        'Impossible de modifier le statut.'
      )

    } finally {
      setActionId(null)
    }
  }


  // =====================================
  // SUPPRIMER
  // =====================================

  const supprimerEnseignant = async (enseignant) => {
    const confirmation = window.confirm(
      `Voulez-vous vraiment supprimer le compte de ${enseignant.nom} ?\n\nCette action est définitive.`
    )

    if (!confirmation) {
      return
    }

    try {
      setActionId(enseignant.id)
      setErreur('')
      setSucces('')

      const response = await fetch(
        `${API_URL}/api/admin/enseignants/${enseignant.id}`,
        {
          method: 'DELETE',
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.erreur ||
          'Impossible de supprimer l’enseignant.'
        )
      }

      setSucces(
        'Enseignant supprimé avec succès.'
      )

      await chargerDonnees()

    } catch (err) {
      console.error(err)

      setErreur(
        err.message ||
        'Impossible de supprimer l’enseignant.'
      )

    } finally {
      setActionId(null)
    }
  }


  return (
    <div className="space-y-6">

      {/* =================================
          EN-TÊTE
      ================================= */}

      <div>
        <p className="text-sm font-medium text-indigo-600">
          Administration
        </p>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
          Gestion des enseignants
        </h1>

        <p className="text-sm text-slate-500 mt-2">
          Créez, affectez et gérez les comptes des enseignants.
        </p>
      </div>


      {/* =================================
          MESSAGES
      ================================= */}

      {erreur && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {erreur}
        </div>
      )}

      {succes && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm">
          {succes}
        </div>
      )}


      {/* =================================
          MOT DE PASSE TEMPORAIRE
      ================================= */}

      {motDePasse && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5">

          <div className="flex items-start gap-3">

            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
              <Check
                size={20}
                className="text-white"
              />
            </div>

            <div className="flex-1">

              <h2 className="font-bold text-indigo-900">
                Compte créé
              </h2>

              <p className="text-sm text-indigo-700 mt-1">
                Voici le mot de passe temporaire.
                Communiquez-le à l’enseignant.
              </p>

              <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">

                <div className="bg-white border border-indigo-200 rounded-xl px-4 py-3 font-mono font-bold text-slate-900 tracking-wider">
                  {motDePasse}
                </div>

                <button
                  type="button"
                  onClick={copierMotDePasse}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
                >
                  {copie ? (
                    <>
                      <Check size={17} />
                      Copié
                    </>
                  ) : (
                    <>
                      <Copy size={17} />
                      Copier
                    </>
                  )}
                </button>

              </div>

            </div>

          </div>

        </div>
      )}


      {/* =================================
          FORMULAIRE DÉROULANT
      ================================= */}

      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

        <button
          type="button"
          onClick={() =>
            setFormulaireOuvert(!formulaireOuvert)
          }
          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition"
        >

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <UserPlus size={20} />
            </div>

            <div>

              <h2 className="font-bold text-slate-900">
                Ajouter un enseignant
              </h2>

              <p className="text-xs text-slate-500">
                Le mot de passe sera généré automatiquement.
              </p>

            </div>

          </div>

          {formulaireOuvert ? (
            <ChevronUp
              size={20}
              className="text-slate-500"
            />
          ) : (
            <ChevronDown
              size={20}
              className="text-slate-500"
            />
          )}

        </button>


        {formulaireOuvert && (
          <div className="border-t border-slate-200 p-5 sm:p-6">

            <form
              onSubmit={creerEnseignant}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >

              {/* NOM */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nom complet
                </label>

                <input
                  type="text"
                  value={nom}
                  onChange={(e) =>
                    setNom(e.target.value)
                  }
                  placeholder="Ex : Jean Kabeya"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />

              </div>


              {/* MATRICULE */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Matricule
                </label>

                <input
                  type="text"
                  value={matricule}
                  onChange={(e) =>
                    setMatricule(e.target.value)
                  }
                  placeholder="Ex : ENS-2026-0004"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 uppercase"
                />

              </div>


              {/* CLASSE */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Classe
                </label>

                <select
                  value={classeId}
                  onChange={(e) =>
                    setClasseId(e.target.value)
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >

                  <option value="">
                    Aucune classe
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

              </div>


              {/* BOUTON */}

              <div className="md:col-span-3">

                <button
                  type="submit"
                  disabled={creation}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold transition"
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
                      <UserPlus size={18} />
                      Créer le compte
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>
        )}

      </section>


      {/* =================================
          LISTE DÉROULANTE
      ================================= */}

      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

        <button
          type="button"
          onClick={() =>
            setListeOuverte(!listeOuverte)
          }
          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition"
        >

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users size={20} />
            </div>

            <div>

              <h2 className="font-bold text-slate-900">
                Enseignants enregistrés
              </h2>

              <p className="text-xs text-slate-500">
                {enseignants.length} enseignant(s)
              </p>

            </div>

          </div>

          {listeOuverte ? (
            <ChevronUp
              size={20}
              className="text-slate-500"
            />
          ) : (
            <ChevronDown
              size={20}
              className="text-slate-500"
            />
          )}

        </button>


        {listeOuverte && (
          <div className="border-t border-slate-200">

            {chargement ? (

              <div className="py-12 flex items-center justify-center text-slate-500">

                <Loader2
                  size={22}
                  className="animate-spin mr-2"
                />

                Chargement...

              </div>

            ) : enseignants.length === 0 ? (

              <div className="py-12 text-center text-slate-500">
                Aucun enseignant enregistré.
              </div>

            ) : (

              <>
                {/* =========================
                    TABLEAU ORDINATEUR
                ========================= */}

                <div className="hidden md:block overflow-x-auto">

                  <table className="w-full text-sm">

                    <thead className="bg-slate-50 border-b border-slate-200">

                      <tr>

                        <th className="text-left px-5 py-3 font-semibold text-slate-600">
                          Enseignant
                        </th>

                        <th className="text-left px-5 py-3 font-semibold text-slate-600">
                          Matricule
                        </th>

                        <th className="text-left px-5 py-3 font-semibold text-slate-600">
                          Classe
                        </th>

                        <th className="text-left px-5 py-3 font-semibold text-slate-600">
                          Statut
                        </th>

                        <th className="text-right px-5 py-3 font-semibold text-slate-600">
                          Actions
                        </th>

                      </tr>

                    </thead>


                    <tbody className="divide-y divide-slate-100">

                      {enseignants.map((enseignant) => (

                        <tr
                          key={enseignant.id}
                          className="hover:bg-slate-50 transition"
                        >

                          {/* ENSEIGNANT */}

                          <td className="px-5 py-4">

                            <p className="font-semibold text-slate-900">
                              {enseignant.nom}
                            </p>

                          </td>


                          {/* MATRICULE */}

                          <td className="px-5 py-4">

                            <span className="font-mono text-sm text-slate-700">
                              {enseignant.matricule}
                            </span>

                          </td>


                          {/* CLASSE */}

                          <td className="px-5 py-4 text-slate-600">

                            {enseignant.classe_nom || (
                              <span className="text-slate-400">
                                Non affectée
                              </span>
                            )}

                          </td>


                          {/* STATUT */}

                          <td className="px-5 py-4">

                            {enseignant.actif === false ? (

                              <span className="inline-flex px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-xs font-semibold">
                                Désactivé
                              </span>

                            ) : (

                              <span className="inline-flex px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold">
                                Actif
                              </span>

                            )}

                          </td>


                          {/* ACTIONS */}

                          <td className="px-5 py-4">

                            <div className="flex items-center justify-end gap-2">

                              <button
                                type="button"
                                onClick={() =>
                                  ouvrirModification(enseignant)
                                }
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-semibold transition"
                              >
                                <Pencil size={14} />
                                Modifier
                              </button>


                              <button
                                type="button"
                                disabled={actionId === enseignant.id}
                                onClick={() =>
                                  changerStatut(enseignant)
                                }
                                className={
                                  enseignant.actif === false
                                    ? "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-xs font-semibold transition"
                                    : "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 text-xs font-semibold transition"
                                }
                              >

                                {actionId === enseignant.id ? (
                                  <Loader2
                                    size={14}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Power size={14} />
                                )}

                                {enseignant.actif === false
                                  ? 'Réactiver'
                                  : 'Désactiver'}

                              </button>


                              <button
                                type="button"
                                disabled={actionId === enseignant.id}
                                onClick={() =>
                                  supprimerEnseignant(
                                    enseignant
                                  )
                                }
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold transition"
                              >
                                <Trash2 size={14} />
                                Supprimer
                              </button>

                            </div>

                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>


                {/* =========================
                    CARTES MOBILE
                ========================= */}

                <div className="md:hidden divide-y divide-slate-100">

                  {enseignants.map((enseignant) => (

                    <div
                      key={enseignant.id}
                      className="p-4"
                    >

                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">

                          <h3 className="font-semibold text-slate-900">
                            {enseignant.nom}
                          </h3>

                          <p className="font-mono text-xs text-slate-500 mt-1">
                            {enseignant.matricule}
                          </p>

                        </div>


                        {enseignant.actif === false ? (

                          <span className="shrink-0 inline-flex px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-xs font-semibold">
                            Désactivé
                          </span>

                        ) : (

                          <span className="shrink-0 inline-flex px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold">
                            Actif
                          </span>

                        )}

                      </div>


                      <div className="mt-4">

                        <p className="text-xs text-slate-400">
                          Classe
                        </p>

                        <p className="text-sm font-medium text-slate-700 mt-1">
                          {enseignant.classe_nom || 'Non affectée'}
                        </p>

                      </div>


                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">

                        <button
                          type="button"
                          onClick={() =>
                            ouvrirModification(enseignant)
                          }
                          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-semibold transition"
                        >
                          <Pencil size={15} />
                          Modifier
                        </button>


                        <button
                          type="button"
                          disabled={actionId === enseignant.id}
                          onClick={() =>
                            changerStatut(enseignant)
                          }
                          className={
                            enseignant.actif === false
                              ? "flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-xs font-semibold transition"
                              : "flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 text-xs font-semibold transition"
                          }
                        >

                          {actionId === enseignant.id ? (
                            <Loader2
                              size={15}
                              className="animate-spin"
                            />
                          ) : (
                            <Power size={15} />
                          )}

                          {enseignant.actif === false
                            ? 'Réactiver'
                            : 'Désactiver'}

                        </button>


                        <button
                          type="button"
                          disabled={actionId === enseignant.id}
                          onClick={() =>
                            supprimerEnseignant(
                              enseignant
                            )
                          }
                          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold transition"
                        >
                          <Trash2 size={15} />
                          Supprimer
                        </button>

                      </div>

                    </div>

                  ))}

                </div>

              </>

            )}

          </div>
        )}

      </section>


      {/* =================================
          MODALE MODIFICATION AFFECTATION
      ================================= */}

      {enseignantModifie && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

          {/* Fond */}

          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={fermerModification}
          />


          {/* Fenêtre */}

          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">

            {/* HEADER */}

            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">

              <div>

                <h2 className="font-bold text-slate-900">
                  Modifier l'affectation
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Changez la classe de l'enseignant.
                </p>

              </div>


              <button
                type="button"
                onClick={fermerModification}
                className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-500"
              >
                <X size={19} />
              </button>

            </div>


            {/* CONTENU */}

            <div className="p-5">

              <div className="bg-slate-50 rounded-xl p-4 mb-5">

                <p className="text-xs text-slate-400">
                  Enseignant
                </p>

                <p className="font-semibold text-slate-900 mt-1">
                  {enseignantModifie.nom}
                </p>

                <p className="font-mono text-xs text-slate-500 mt-1">
                  {enseignantModifie.matricule}
                </p>

              </div>


              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nouvelle classe
              </label>

              <select
                value={nouvelleClasseId}
                onChange={(e) =>
                  setNouvelleClasseId(e.target.value)
                }
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >

                <option value="">
                  Aucune classe
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

            </div>


            {/* FOOTER */}

            <div className="px-5 py-4 border-t border-slate-200 flex flex-col-reverse sm:flex-row justify-end gap-2">

              <button
                type="button"
                onClick={fermerModification}
                disabled={modification}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium transition"
              >
                Annuler
              </button>


              <button
                type="button"
                onClick={modifierAffectation}
                disabled={modification}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold transition"
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

export default EnseignantsAdmin