import { useEffect, useState } from 'react'
import {
  UserPlus,
  Users,
  Copy,
  Check,
  Loader2,
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


  // =====================================
  // CHARGER LES ENSEIGNANTS ET LES CLASSES
  // =====================================

  useEffect(() => {
    chargerDonnees()
  }, [])


  const chargerDonnees = async () => {
    try {
      setChargement(true)
      setErreur('')

      const [enseignantsResponse, classesResponse] =
        await Promise.all([
          fetch(
            'http://localhost:5000/api/admin/enseignants'
          ),
          fetch(
            'http://localhost:5000/api/classes'
          ),
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
        'http://localhost:5000/api/admin/enseignants',
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
          Créez et consultez les comptes des enseignants.
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

              <div className="mt-4 flex items-center gap-2">

                <div className="bg-white border border-indigo-200 rounded-xl px-4 py-3 font-mono font-bold text-slate-900 tracking-wider">
                  {motDePasse}
                </div>

                <button
                  type="button"
                  onClick={copierMotDePasse}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
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
          FORMULAIRE
      ================================= */}

      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6">

        <div className="flex items-center gap-3 mb-6">

          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <UserPlus size={20} />
          </div>

          <div>

            <h2 className="font-bold text-slate-900">
              Nouveau compte enseignant
            </h2>

            <p className="text-xs text-slate-500">
              Le mot de passe sera généré automatiquement.
            </p>

          </div>

        </div>


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
              placeholder="Ex : ENS-0002"
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

      </section>


      {/* =================================
          LISTE DES ENSEIGNANTS
      ================================= */}

      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

        <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-3">

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

          <div className="overflow-x-auto">

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

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {enseignants.map((enseignant) => (

                  <tr
                    key={enseignant.id}
                    className="hover:bg-slate-50 transition"
                  >

                    <td className="px-5 py-4">

                      <p className="font-semibold text-slate-900">
                        {enseignant.nom}
                      </p>

                    </td>

                    <td className="px-5 py-4">

                      <span className="font-mono text-sm text-slate-700">
                        {enseignant.matricule}
                      </span>

                    </td>

                    <td className="px-5 py-4 text-slate-600">

                      {enseignant.classe_nom || (
                        <span className="text-slate-400">
                          Non affectée
                        </span>
                      )}

                    </td>

                    <td className="px-5 py-4">

                      <span className="inline-flex px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold">
                        Actif
                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </div>
  )
}

export default EnseignantsAdmin