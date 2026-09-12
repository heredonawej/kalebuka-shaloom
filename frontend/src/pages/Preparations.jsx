import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API_URL } from '../api'
import {
  PlusCircle,
  Search,
  RefreshCw,
  Edit,
  Eye,
  Trash2,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react'

function Preparations() {
  const navigate = useNavigate()

  const [preparations, setPreparations] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')

  const [recherche, setRecherche] = useState('')
  const [filtreStatut, setFiltreStatut] = useState('tous')

  // =====================================================
  // CHARGER LES PRÉPARATIONS
  // =====================================================

  const chargerPreparations = async () => {
    try {
      setChargement(true)
      setErreur('')

      const utilisateurSauvegarde =
        localStorage.getItem('utilisateur')

      if (!utilisateurSauvegarde) {
        setErreur('Utilisateur non connecté.')
        navigate('/')
        return
      }

      const utilisateur = JSON.parse(
        utilisateurSauvegarde
      )

      console.log(
        'UTILISATEUR CONNECTÉ :',
        utilisateur
      )

      if (!utilisateur.id) {
        setErreur(
          'Impossible de récupérer l’identifiant de l’enseignant.'
        )
        return
      }

      const url =
        `${API_URL}/api/cours?enseignant_id=${utilisateur.id}`

      console.log('URL APPELÉE :', url)

      const reponse = await fetch(url)

      console.log(
        'STATUS SERVEUR :',
        reponse.status
      )

      console.log(
        'TYPE DE RÉPONSE :',
        reponse.headers.get('content-type')
      )

      // On récupère d'abord la réponse sous forme de texte.
      // Cela permet d'éviter l'erreur :
      // Unexpected token '<'
      const texte = await reponse.text()

      console.log(
        'RÉPONSE SERVEUR :',
        texte
      )

      if (!reponse.ok) {
        throw new Error(
          `Erreur serveur ${reponse.status} : ${texte}`
        )
      }

      let donnees

      try {
        donnees = JSON.parse(texte)
      } catch (error) {
        console.error(
          'Réponse reçue mais ce n’est pas du JSON :',
          texte
        )

        throw new Error(
          'Le serveur a renvoyé une réponse qui n’est pas du JSON.'
        )
      }

      console.log(
        'DONNÉES REÇUES :',
        donnees
      )

      if (!Array.isArray(donnees)) {
        throw new Error(
          'Les données reçues du serveur sont invalides.'
        )
      }

      setPreparations(donnees)

    } catch (err) {
      console.error(
        'ERREUR CHARGEMENT PRÉPARATIONS :',
        err
      )

      setErreur(
        err.message ||
        'Impossible de contacter le serveur.'
      )
    } finally {
      setChargement(false)
    }
  }

  useEffect(() => {
    chargerPreparations()
  }, [])

  // =====================================================
  // SUPPRIMER UNE PRÉPARATION
  // =====================================================

  const supprimerPreparation = async (id) => {
    const confirmation = window.confirm(
      'Voulez-vous vraiment supprimer cette préparation ?'
    )

    if (!confirmation) {
      return
    }

    try {
      const reponse = await fetch(
        `${API_URL}/api/cours/${id}`,
        {
          method: 'DELETE',
        }
      )

      const texte = await reponse.text()

      console.log(
        'RÉPONSE SUPPRESSION :',
        texte
      )

      let donnees = {}

      try {
        donnees = texte
          ? JSON.parse(texte)
          : {}
      } catch {
        throw new Error(
          'Le serveur a renvoyé une réponse invalide.'
        )
      }

      if (!reponse.ok) {
        throw new Error(
          donnees.erreur ||
          'Impossible de supprimer la préparation.'
        )
      }

      setPreparations(
        (ancienneListe) =>
          ancienneListe.filter(
            (preparation) =>
              preparation.id !== id
          )
      )

      alert(
        '✅ Préparation supprimée avec succès.'
      )

    } catch (err) {
      console.error(err)

      alert(
        err.message ||
        'Erreur lors de la suppression.'
      )
    }
  }

  // =====================================================
  // VÉRIFIER SI ON PEUT MODIFIER
  // =====================================================

  const peutModifier = (statut) => {
    return (
      statut === 'brouillon' ||
      statut === 'rejete'
    )
  }

  // =====================================================
  // AFFICHER LE STATUT
  // =====================================================

  const afficherStatut = (statut) => {
    switch (statut) {

      case 'brouillon':
        return {
          texte: 'Brouillon',
          classe:
            'bg-slate-100 text-slate-600',
          icone: FileText,
        }

      case 'soumis':
        return {
          texte: 'Soumise',
          classe:
            'bg-amber-100 text-amber-700',
          icone: Clock,
        }

      case 'valide':
        return {
          texte: 'Validée',
          classe:
            'bg-green-100 text-green-700',
          icone: CheckCircle,
        }

      case 'rejete':
        return {
          texte: 'Rejetée',
          classe:
            'bg-red-100 text-red-700',
          icone: XCircle,
        }

      default:
        return {
          texte:
            statut || 'Inconnu',
          classe:
            'bg-slate-100 text-slate-600',
          icone: FileText,
        }
    }
  }

  // =====================================================
  // RECHERCHE + FILTRE
  // =====================================================

  const preparationsFiltrees =
    preparations.filter(
      (preparation) => {

        const texteRecherche =
          recherche
            .toLowerCase()
            .trim()

        const correspondRecherche =
          preparation.titre
            ?.toLowerCase()
            .includes(
              texteRecherche
            ) ||

          preparation.matiere
            ?.toLowerCase()
            .includes(
              texteRecherche
            ) ||

          preparation.classe_nom
            ?.toLowerCase()
            .includes(
              texteRecherche
            )

        const correspondStatut =
          filtreStatut === 'tous' ||
          preparation.statut ===
            filtreStatut

        return (
          correspondRecherche &&
          correspondStatut
        )
      }
    )

  // =====================================================
  // STATISTIQUES
  // =====================================================

  const total =
    preparations.length

  const brouillons =
    preparations.filter(
      (p) =>
        p.statut === 'brouillon'
    ).length

  const soumises =
    preparations.filter(
      (p) =>
        p.statut === 'soumis'
    ).length

  const validees =
    preparations.filter(
      (p) =>
        p.statut === 'valide'
    ).length

  const rejetees =
    preparations.filter(
      (p) =>
        p.statut === 'rejete'
    ).length

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formaterDate = (date) => {

    if (!date) {
      return '-'
    }

    return new Date(
      date
    ).toLocaleDateString(
      'fr-FR',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }
    )
  }

  // =====================================================
  // AFFICHAGE
  // =====================================================

  return (
    <div className="space-y-6">

      {/* ===============================================
          EN-TÊTE
      =============================================== */}

      <div
        className="flex flex-col
                   lg:flex-row
                   lg:items-center
                   lg:justify-between
                   gap-4"
      >

        <div>

          <p
            className="text-sm font-medium
                       text-blue-600"
          >
            Gestion pédagogique
          </p>

          <h1
            className="mt-1 text-2xl
                       font-bold text-slate-900"
          >
            Mes préparations
          </h1>

          <p
            className="mt-1 text-sm
                       text-slate-500"
          >
            Consultez, modifiez et suivez
            vos préparations de cours.
          </p>

        </div>

        <div
          className="flex items-center
                     gap-2"
        >

          {/* ACTUALISER */}

          <button
            onClick={
              chargerPreparations
            }
            disabled={chargement}
            className="flex items-center
                       gap-2 px-4 py-2.5
                       rounded-xl bg-white
                       border border-slate-200
                       text-sm font-medium
                       text-slate-600
                       hover:bg-slate-50
                       transition
                       disabled:opacity-50"
          >

            <RefreshCw
              size={17}
              className={
                chargement
                  ? 'animate-spin'
                  : ''
              }
            />

            Actualiser

          </button>

          {/* NOUVELLE PRÉPARATION */}

          <Link
            to="/enseignant/nouvelle-preparation"
            className="flex items-center
                       gap-2 px-4 py-2.5
                       rounded-xl
                       bg-blue-600
                       text-white
                       text-sm font-semibold
                       hover:bg-blue-700
                       transition"
          >

            <PlusCircle size={17} />

            Nouvelle préparation

          </Link>

        </div>

      </div>

      {/* ===============================================
          ERREUR
      =============================================== */}

      {erreur && (

        <div
          className="bg-red-50
                     border border-red-200
                     text-red-700
                     rounded-xl
                     px-4 py-3
                     text-sm"
        >

          {erreur}

        </div>

      )}

      {/* ===============================================
          STATISTIQUES
      =============================================== */}

      <div
        className="grid grid-cols-2
                   lg:grid-cols-5
                   gap-3"
      >

        {/* TOTAL */}

        <div
          className="bg-white
                     border border-slate-200
                     rounded-2xl p-4"
        >

          <p className="text-xs text-slate-500">
            Total
          </p>

          <p
            className="mt-1 text-2xl
                       font-bold text-slate-900"
          >
            {total}
          </p>

        </div>

        {/* BROUILLONS */}

        <div
          className="bg-white
                     border border-slate-200
                     rounded-2xl p-4"
        >

          <p className="text-xs text-slate-500">
            Brouillons
          </p>

          <p
            className="mt-1 text-2xl
                       font-bold text-slate-700"
          >
            {brouillons}
          </p>

        </div>

        {/* SOUMISES */}

        <div
          className="bg-white
                     border border-slate-200
                     rounded-2xl p-4"
        >

          <p className="text-xs text-slate-500">
            Soumises
          </p>

          <p
            className="mt-1 text-2xl
                       font-bold text-amber-600"
          >
            {soumises}
          </p>

        </div>

        {/* VALIDÉES */}

        <div
          className="bg-white
                     border border-slate-200
                     rounded-2xl p-4"
        >

          <p className="text-xs text-slate-500">
            Validées
          </p>

          <p
            className="mt-1 text-2xl
                       font-bold text-green-600"
          >
            {validees}
          </p>

        </div>

        {/* REJETÉES */}

        <div
          className="bg-white
                     border border-slate-200
                     rounded-2xl p-4"
        >

          <p className="text-xs text-slate-500">
            Rejetées
          </p>

          <p
            className="mt-1 text-2xl
                       font-bold text-red-600"
          >
            {rejetees}
          </p>

        </div>

      </div>

      {/* ===============================================
          RECHERCHE + FILTRE
      =============================================== */}

      <div
        className="bg-white
                   border border-slate-200
                   rounded-2xl p-4"
      >

        <div
          className="flex flex-col
                     md:flex-row gap-3"
        >

          <div
            className="relative flex-1"
          >

            <Search
              size={18}
              className="absolute
                         left-3 top-1/2
                         -translate-y-1/2
                         text-slate-400"
            />

            <input
              type="text"
              value={recherche}
              onChange={(e) =>
                setRecherche(
                  e.target.value
                )
              }
              placeholder="Rechercher une préparation..."
              className="w-full
                         pl-10 pr-4 py-3
                         rounded-xl
                         border border-slate-200
                         outline-none
                         focus:border-blue-500
                         focus:ring-2
                         focus:ring-blue-500/20"
            />

          </div>

          <select
            value={filtreStatut}
            onChange={(e) =>
              setFiltreStatut(
                e.target.value
              )
            }
            className="md:w-52
                       px-4 py-3
                       rounded-xl
                       border border-slate-200
                       bg-white
                       outline-none
                       focus:border-blue-500"
          >

            <option value="tous">
              Tous les statuts
            </option>

            <option value="brouillon">
              Brouillons
            </option>

            <option value="soumis">
              Soumises
            </option>

            <option value="valide">
              Validées
            </option>

            <option value="rejete">
              Rejetées
            </option>

          </select>

        </div>

      </div>

      {/* ===============================================
          LISTE DES PRÉPARATIONS
      =============================================== */}

      <div
        className="bg-white
                   border border-slate-200
                   rounded-2xl
                   overflow-hidden"
      >

        {/* TITRE */}

        <div
          className="px-5 py-4
                     border-b border-slate-100"
        >

          <h2
            className="font-semibold
                       text-slate-900"
          >
            Liste des préparations
          </h2>

          <p
            className="mt-1 text-xs
                       text-slate-500"
          >

            {preparationsFiltrees.length}

            {' '}

            préparation
            {preparationsFiltrees.length >
            1
              ? 's'
              : ''}

            {' '}affichée
            {preparationsFiltrees.length >
            1
              ? 's'
              : ''}

          </p>

        </div>

        {/* CHARGEMENT */}

        {chargement ? (

          <div
            className="p-10
                       text-center
                       text-sm
                       text-slate-500"
          >

            Chargement des préparations...

          </div>

        ) : preparationsFiltrees.length === 0 ? (

          /* AUCUNE PRÉPARATION */

          <div
            className="p-10
                       text-center"
          >

            <div
              className="w-14 h-14
                         mx-auto
                         rounded-2xl
                         bg-slate-100
                         flex items-center
                         justify-center"
            >

              <FileText
                size={25}
                className="text-slate-400"
              />

            </div>

            <h3
              className="mt-4
                         font-semibold
                         text-slate-800"
            >
              Aucune préparation trouvée
            </h3>

            <p
              className="mt-1 text-sm
                         text-slate-500"
            >
              Essayez de modifier votre
              recherche ou créez une
              nouvelle préparation.
            </p>

          </div>

        ) : (

          /* LISTE */

          <div
            className="divide-y
                       divide-slate-100"
          >

            {preparationsFiltrees.map(
              (preparation) => {

                const statut =
                  afficherStatut(
                    preparation.statut
                  )

                const IconeStatut =
                  statut.icone

                return (

                  <div
                    key={preparation.id}
                    className="p-5
                               hover:bg-slate-50
                               transition"
                  >

                    <div
                      className="flex flex-col
                                 lg:flex-row
                                 lg:items-center
                                 lg:justify-between
                                 gap-4"
                    >

                      {/* INFORMATIONS */}

                      <div
                        className="min-w-0"
                      >

                        <div
                          className="flex
                                     flex-wrap
                                     items-center
                                     gap-2"
                        >

                          <h3
                            className="font-semibold
                                       text-slate-900"
                          >
                            {preparation.titre}
                          </h3>

                          <span
                            className={
                              `inline-flex
                               items-center
                               gap-1
                               px-2.5 py-1
                               rounded-full
                               text-[11px]
                               font-semibold
                               ${statut.classe}`
                            }
                          >

                            <IconeStatut
                              size={13}
                            />

                            {statut.texte}

                          </span>

                        </div>

                        <div
                          className="mt-2
                                     flex flex-wrap
                                     gap-x-4
                                     gap-y-1
                                     text-xs
                                     text-slate-500"
                        >

                          <span>
                            Matière :{' '}

                            <strong
                              className="text-slate-700"
                            >
                              {preparation.matiere}
                            </strong>
                          </span>

                          <span>
                            Classe :{' '}

                            <strong
                              className="text-slate-700"
                            >
                              {preparation.classe_nom ||
                                'Non définie'}
                            </strong>
                          </span>

                          <span>
                            Créée le{' '}

                            {formaterDate(
                              preparation.date_creation
                            )}

                          </span>

                        </div>

                        {/* MOTIF DU REJET */}

                        {preparation.statut ===
                          'rejete' &&

                          preparation.motif_rejet && (

                            <div
                              className="mt-3
                                         bg-red-50
                                         border
                                         border-red-100
                                         rounded-xl
                                         px-3 py-2"
                            >

                              <p
                                className="text-xs
                                           font-semibold
                                           text-red-800"
                              >
                                Motif du rejet
                              </p>

                              <p
                                className="mt-1
                                           text-xs
                                           text-red-700"
                              >
                                {preparation.motif_rejet}
                              </p>

                            </div>

                          )}

                      </div>

                      {/* ACTIONS */}

                      <div
                        className="flex
                                   flex-wrap
                                   items-center
                                   gap-2"
                      >

                        {/* MODIFIER / CORRIGER */}

                        {peutModifier(
                          preparation.statut
                        ) && (

                          <Link
                            to={
                              `/enseignant/modifier-preparation/${preparation.id}`
                            }
                            className="inline-flex
                                       items-center
                                       gap-2
                                       px-3 py-2
                                       rounded-xl
                                       bg-blue-50
                                       text-blue-600
                                       text-sm
                                       font-semibold
                                       hover:bg-blue-100
                                       transition"
                          >

                            <Edit size={16} />

                            {preparation.statut ===
                            'rejete'
                              ? 'Corriger'
                              : 'Modifier'}

                          </Link>

                        )}

                        {/* CONSULTER */}

                        <Link
  to={`/enseignant/consulter-preparation/${preparation.id}`}
  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-blue-600 hover:bg-blue-50 transition"
>
  Consulter
</Link>

                        {/* SUPPRIMER */}

                        {preparation.statut ===
                          'brouillon' && (

                          <button
                            onClick={() =>
                              supprimerPreparation(
                                preparation.id
                              )
                            }
                            className="inline-flex
                                       items-center
                                       gap-2
                                       px-3 py-2
                                       rounded-xl
                                       bg-red-50
                                       text-red-600
                                       text-sm
                                       font-semibold
                                       hover:bg-red-100
                                       transition"
                          >

                            <Trash2
                              size={16}
                            />

                            Supprimer

                          </button>

                        )}

                      </div>

                    </div>

                  </div>

                )
              }
            )}

          </div>

        )}

      </div>

    </div>
  )
}

export default Preparations