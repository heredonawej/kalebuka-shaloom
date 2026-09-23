import { useEffect, useMemo, useState } from 'react'
import { API_URL } from '../api'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Megaphone,
  CalendarDays,
  X,
  Save,
  Loader2,
} from 'lucide-react'

const CATEGORIES = [
  'Annonce',
  'Événement',
  'Information',
  'Communiqué',
]

function CommunicationsAdmin() {
  const [communications, setCommunications] = useState([])
  const [chargement, setChargement] = useState(true)
  const [enregistrement, setEnregistrement] = useState(false)
  const [erreur, setErreur] = useState('')

  const [recherche, setRecherche] = useState('')
  const [filtreCategorie, setFiltreCategorie] =
    useState('Toutes')

  const [modalOuvert, setModalOuvert] = useState(false)
  const [communicationModifiee, setCommunicationModifiee] =
    useState(null)

  const [formulaire, setFormulaire] = useState({
    titre: '',
    contenu: '',
    categorie: 'Information',
    publie: true,
  })

  // =====================================================
  // CHARGER LES COMMUNICATIONS
  // =====================================================

  const chargerCommunications = async () => {
    try {
      setChargement(true)
      setErreur('')

      const response = await fetch(
        `${API_URL}/api/communications`
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.erreur ||
            'Impossible de récupérer les communications.'
        )
      }

      setCommunications(data)
    } catch (error) {
      console.error(error)

      setErreur(
        error.message ||
          'Impossible de récupérer les communications.'
      )
    } finally {
      setChargement(false)
    }
  }

  useEffect(() => {
    chargerCommunications()
  }, [])

  // =====================================================
  // OUVRIR LE FORMULAIRE D'AJOUT
  // =====================================================

  const ouvrirAjout = () => {
    setCommunicationModifiee(null)

    setFormulaire({
      titre: '',
      contenu: '',
      categorie: 'Information',
      publie: true,
    })

    setErreur('')
    setModalOuvert(true)
  }

  // =====================================================
  // OUVRIR LE FORMULAIRE DE MODIFICATION
  // =====================================================

  const ouvrirModification = (communication) => {
    setCommunicationModifiee(communication)

    setFormulaire({
      titre: communication.titre || '',
      contenu: communication.contenu || '',
      categorie:
        communication.categorie || 'Information',
      publie: communication.publie ?? true,
    })

    setErreur('')
    setModalOuvert(true)
  }

  // =====================================================
  // FERMER LE MODAL
  // =====================================================

  const fermerModal = () => {
    if (enregistrement) return

    setModalOuvert(false)
    setCommunicationModifiee(null)
    setErreur('')
  }

  // =====================================================
  // MODIFIER LE FORMULAIRE
  // =====================================================

  const modifierChamp = (champ, valeur) => {
    setFormulaire((ancien) => ({
      ...ancien,
      [champ]: valeur,
    }))
  }

  // =====================================================
  // ENREGISTRER / MODIFIER
  // =====================================================

  const enregistrer = async (e) => {
    e.preventDefault()

    if (!formulaire.titre.trim()) {
      setErreur('Le titre est obligatoire.')
      return
    }

    if (!formulaire.contenu.trim()) {
      setErreur('Le contenu est obligatoire.')
      return
    }

    try {
      setEnregistrement(true)
      setErreur('')

      const url = communicationModifiee
        ? `${API_URL}/api/communications/${communicationModifiee.id}`
        : `${API_URL}/api/communications`

      const method = communicationModifiee
        ? 'PUT'
        : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formulaire),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.erreur ||
            "Impossible d'enregistrer la communication."
        )
      }

      setModalOuvert(false)
      setCommunicationModifiee(null)

      await chargerCommunications()
    } catch (error) {
      console.error(error)

      setErreur(
        error.message ||
          "Impossible d'enregistrer la communication."
      )
    } finally {
      setEnregistrement(false)
    }
  }

  // =====================================================
  // PUBLIER / MASQUER
  // =====================================================

  const changerStatut = async (communication) => {
    try {
      const response = await fetch(
        `${API_URL}/api/communications/${communication.id}/statut`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            publie: !communication.publie,
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

      setCommunications((anciennes) =>
        anciennes.map((item) =>
          item.id === communication.id
            ? data
            : item
        )
      )
    } catch (error) {
      console.error(error)

      alert(
        error.message ||
          'Impossible de modifier le statut.'
      )
    }
  }

  // =====================================================
  // SUPPRIMER
  // =====================================================

  const supprimer = async (communication) => {
    const confirmation = window.confirm(
      `Voulez-vous vraiment supprimer "${communication.titre}" ?`
    )

    if (!confirmation) return

    try {
      const response = await fetch(
        `${API_URL}/api/communications/${communication.id}`,
        {
          method: 'DELETE',
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.erreur ||
            'Impossible de supprimer la communication.'
        )
      }

      setCommunications((anciennes) =>
        anciennes.filter(
          (item) => item.id !== communication.id
        )
      )
    } catch (error) {
      console.error(error)

      alert(
        error.message ||
          'Impossible de supprimer la communication.'
      )
    }
  }

  // =====================================================
  // RECHERCHE + FILTRE
  // =====================================================

  const communicationsFiltrees = useMemo(() => {
    const texte = recherche.trim().toLowerCase()

    return communications.filter((communication) => {
      const correspondRecherche =
        !texte ||
        communication.titre
          ?.toLowerCase()
          .includes(texte) ||
        communication.contenu
          ?.toLowerCase()
          .includes(texte)

      const correspondCategorie =
        filtreCategorie === 'Toutes' ||
        communication.categorie === filtreCategorie

      return (
        correspondRecherche &&
        correspondCategorie
      )
    })
  }, [
    communications,
    recherche,
    filtreCategorie,
  ])

  // =====================================================
  // STATISTIQUES
  // =====================================================

  const total = communications.length

  const totalPubliees = communications.filter(
    (communication) => communication.publie
  ).length

  const totalMasquees = communications.filter(
    (communication) => !communication.publie
  ).length

  // =====================================================
  // FORMATER DATE
  // =====================================================

  const formaterDate = (date) => {
    if (!date) return '—'

    const dateFormatee = new Date(date)

    if (Number.isNaN(dateFormatee.getTime())) {
      return '—'
    }

    return dateFormatee.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
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

      <div className="
        flex
        flex-col
        gap-4
        sm:flex-row
        sm:items-end
        sm:justify-between
      ">

        <div>
          <p className="
            text-sm
            font-semibold
            text-indigo-600
          ">
            Administration
          </p>

          <h1 className="
            mt-1
            text-2xl
            font-bold
            text-slate-900
            sm:text-3xl
          ">
            Communications
          </h1>

          <p className="
            mt-1
            text-sm
            text-slate-500
          ">
            Publiez les informations visibles sur le
            site de l'école.
          </p>
        </div>

        <button
          type="button"
          onClick={ouvrirAjout}
          className="
            inline-flex
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-indigo-600
            px-5
            py-3
            text-sm
            font-semibold
            text-white
            shadow-sm
            transition
            hover:bg-indigo-700
          "
        >
          <Plus size={18} />
          Nouvelle communication
        </button>

      </div>

      {/* =================================================
          ERREUR
      ================================================= */}

      {erreur && !modalOuvert && (
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
          STATISTIQUES
      ================================================= */}

      <div className="
        grid
        grid-cols-1
        gap-4
        sm:grid-cols-3
      ">

        <div className="
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-5
        ">
          <p className="text-sm text-slate-500">
            Total
          </p>

          <p className="
            mt-2
            text-3xl
            font-bold
            text-slate-900
          ">
            {total}
          </p>
        </div>

        <div className="
          rounded-2xl
          border
          border-emerald-200
          bg-emerald-50
          p-5
        ">
          <p className="text-sm text-emerald-700">
            Publiées
          </p>

          <p className="
            mt-2
            text-3xl
            font-bold
            text-emerald-700
          ">
            {totalPubliees}
          </p>
        </div>

        <div className="
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-5
        ">
          <p className="text-sm text-slate-500">
            Masquées
          </p>

          <p className="
            mt-2
            text-3xl
            font-bold
            text-slate-700
          ">
            {totalMasquees}
          </p>
        </div>

      </div>

      {/* =================================================
          FILTRES
      ================================================= */}

      <div className="
        grid
        grid-cols-1
        gap-4
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-4
        sm:grid-cols-2
        sm:p-5
      ">

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
              setRecherche(e.target.value)
            }
            placeholder="Rechercher une communication..."
            className="
              h-12
              w-full
              rounded-xl
              border
              border-slate-200
              bg-white
              pl-11
              pr-4
              text-sm
              outline-none
              focus:border-indigo-500
              focus:ring-4
              focus:ring-indigo-500/10
            "
          />

        </div>

        <select
          value={filtreCategorie}
          onChange={(e) =>
            setFiltreCategorie(e.target.value)
          }
          className="
            h-12
            w-full
            rounded-xl
            border
            border-slate-200
            bg-white
            px-4
            text-sm
            outline-none
            focus:border-indigo-500
            focus:ring-4
            focus:ring-indigo-500/10
          "
        >
          <option value="Toutes">
            Toutes les catégories
          </option>

          {CATEGORIES.map((categorie) => (
            <option
              key={categorie}
              value={categorie}
            >
              {categorie}
            </option>
          ))}
        </select>

      </div>

      {/* =================================================
          LISTE DES COMMUNICATIONS
      ================================================= */}

      <div className="
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
      ">

        {chargement ? (

          <div className="
            flex
            min-h-[250px]
            items-center
            justify-center
            gap-3
            text-slate-500
          ">
            <Loader2
              size={24}
              className="animate-spin"
            />

            Chargement des communications...
          </div>

        ) : communicationsFiltrees.length === 0 ? (

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
              <Megaphone size={26} />
            </div>

            <h3 className="
              mt-4
              font-semibold
              text-slate-900
            ">
              Aucune communication
            </h3>

            <p className="
              mt-1
              text-sm
              text-slate-500
            ">
              Créez votre première communication.
            </p>

          </div>

        ) : (

          <div className="divide-y divide-slate-100">

            {communicationsFiltrees.map(
              (communication) => (

                <div
                  key={communication.id}
                  className="
                    p-5
                    transition
                    hover:bg-slate-50
                    sm:p-6
                  "
                >

                  <div className="
                    flex
                    flex-col
                    gap-4
                    lg:flex-row
                    lg:items-start
                    lg:justify-between
                  ">

                    <div className="min-w-0 flex-1">

                      <div className="
                        flex
                        flex-wrap
                        items-center
                        gap-2
                      ">

                        {/* CATÉGORIE */}

                        <span className="
                          rounded-full
                          bg-indigo-50
                          px-3
                          py-1
                          text-xs
                          font-bold
                          text-indigo-700
                        ">
                          {communication.categorie}
                        </span>

                        {/* STATUT */}

                        <span
                          className={`
                            rounded-full
                            px-3
                            py-1
                            text-xs
                            font-semibold
                            ${
                              communication.publie
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-slate-100 text-slate-500'
                            }
                          `}
                        >
                          {communication.publie
                            ? 'Publiée'
                            : 'Masquée'}
                        </span>

                      </div>

                      <h2 className="
                        mt-3
                        text-lg
                        font-bold
                        text-slate-900
                      ">
                        {communication.titre}
                      </h2>

                      <p className="
                        mt-2
                        whitespace-pre-line
                        text-sm
                        leading-6
                        text-slate-600
                      ">
                        {communication.contenu}
                      </p>

                      <div className="
                        mt-4
                        flex
                        items-center
                        gap-2
                        text-xs
                        text-slate-400
                      ">
                        <CalendarDays size={15} />

                        Publiée le{' '}
                        {formaterDate(
                          communication.date_publication
                        )}
                      </div>

                    </div>

                    {/* ACTIONS */}

                    <div className="
                      flex
                      flex-wrap
                      gap-2
                      lg:w-auto
                      lg:justify-end
                    ">

                      <button
                        type="button"
                        onClick={() =>
                          changerStatut(
                            communication
                          )
                        }
                        className="
                          inline-flex
                          items-center
                          gap-2
                          rounded-xl
                          border
                          border-slate-200
                          bg-white
                          px-3
                          py-2
                          text-xs
                          font-semibold
                          text-slate-700
                          hover:bg-slate-50
                        "
                      >
                        {communication.publie ? (
                          <>
                            <EyeOff size={16} />
                            Masquer
                          </>
                        ) : (
                          <>
                            <Eye size={16} />
                            Publier
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          ouvrirModification(
                            communication
                          )
                        }
                        className="
                          inline-flex
                          items-center
                          gap-2
                          rounded-xl
                          border
                          border-slate-200
                          bg-white
                          px-3
                          py-2
                          text-xs
                          font-semibold
                          text-slate-700
                          hover:bg-slate-50
                        "
                      >
                        <Pencil size={16} />
                        Modifier
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          supprimer(
                            communication
                          )
                        }
                        className="
                          inline-flex
                          items-center
                          gap-2
                          rounded-xl
                          border
                          border-red-200
                          bg-red-50
                          px-3
                          py-2
                          text-xs
                          font-semibold
                          text-red-700
                          hover:bg-red-100
                        "
                      >
                        <Trash2 size={16} />
                        Supprimer
                      </button>

                    </div>

                  </div>

                </div>
              )
            )}

          </div>

        )}

      </div>

      {/* =================================================
          MODAL
      ================================================= */}

      {modalOuvert && (
        <div className="
          fixed
          inset-0
          z-50
          flex
          items-center
          justify-center
          bg-slate-900/50
          p-4
        ">

          <div className="
            max-h-[90vh]
            w-full
            max-w-2xl
            overflow-y-auto
            rounded-2xl
            bg-white
            shadow-2xl
          ">

            {/* HEADER MODAL */}

            <div className="
              flex
              items-center
              justify-between
              border-b
              border-slate-200
              px-5
              py-4
              sm:px-6
            ">

              <div>

                <h2 className="
                  text-lg
                  font-bold
                  text-slate-900
                ">
                  {communicationModifiee
                    ? 'Modifier la communication'
                    : 'Nouvelle communication'}
                </h2>

                <p className="
                  mt-1
                  text-xs
                  text-slate-500
                ">
                  Publiez une information destinée
                  aux visiteurs du site.
                </p>

              </div>

              <button
                type="button"
                onClick={fermerModal}
                className="
                  rounded-xl
                  p-2
                  text-slate-400
                  hover:bg-slate-100
                  hover:text-slate-700
                "
              >
                <X size={20} />
              </button>

            </div>

            {/* FORMULAIRE */}

            <form
              onSubmit={enregistrer}
              className="space-y-5 p-5 sm:p-6"
            >

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

              {/* TITRE */}

              <div>

                <label className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-slate-700
                ">
                  Titre
                </label>

                <input
                  type="text"
                  value={formulaire.titre}
                  onChange={(e) =>
                    modifierChamp(
                      'titre',
                      e.target.value
                    )
                  }
                  placeholder="Ex : Rentrée scolaire 2026-2027"
                  className="
                    h-12
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    px-4
                    text-sm
                    outline-none
                    focus:border-indigo-500
                    focus:ring-4
                    focus:ring-indigo-500/10
                  "
                />

              </div>

              {/* CATÉGORIE */}

              <div>

                <label className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-slate-700
                ">
                  Catégorie
                </label>

                <select
                  value={formulaire.categorie}
                  onChange={(e) =>
                    modifierChamp(
                      'categorie',
                      e.target.value
                    )
                  }
                  className="
                    h-12
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    px-4
                    text-sm
                    outline-none
                    focus:border-indigo-500
                    focus:ring-4
                    focus:ring-indigo-500/10
                  "
                >

                  {CATEGORIES.map((categorie) => (
                    <option
                      key={categorie}
                      value={categorie}
                    >
                      {categorie}
                    </option>
                  ))}

                </select>

              </div>

              {/* CONTENU */}

              <div>

                <label className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-slate-700
                ">
                  Contenu
                </label>

                <textarea
                  value={formulaire.contenu}
                  onChange={(e) =>
                    modifierChamp(
                      'contenu',
                      e.target.value
                    )
                  }
                  placeholder="Écrivez le contenu de la communication..."
                  rows={7}
                  className="
                    w-full
                    resize-y
                    rounded-xl
                    border
                    border-slate-200
                    px-4
                    py-3
                    text-sm
                    leading-6
                    outline-none
                    focus:border-indigo-500
                    focus:ring-4
                    focus:ring-indigo-500/10
                  "
                />

              </div>

              {/* PUBLICATION */}

              <label className="
                flex
                cursor-pointer
                items-center
                gap-3
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                p-4
              ">

                <input
                  type="checkbox"
                  checked={formulaire.publie}
                  onChange={(e) =>
                    modifierChamp(
                      'publie',
                      e.target.checked
                    )
                  }
                  className="
                    h-5
                    w-5
                    rounded
                    border-slate-300
                    text-indigo-600
                  "
                />

                <div>

                  <p className="
                    text-sm
                    font-semibold
                    text-slate-800
                  ">
                    Publier immédiatement
                  </p>

                  <p className="
                    mt-1
                    text-xs
                    text-slate-500
                  ">
                    La communication sera visible
                    sur le site public.
                  </p>

                </div>

              </label>

              {/* BOUTONS */}

              <div className="
                flex
                flex-col-reverse
                gap-3
                border-t
                border-slate-200
                pt-5
                sm:flex-row
                sm:justify-end
              ">

                <button
                  type="button"
                  onClick={fermerModal}
                  disabled={enregistrement}
                  className="
                    rounded-xl
                    border
                    border-slate-200
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-slate-700
                    hover:bg-slate-50
                    disabled:opacity-50
                  "
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={enregistrement}
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-indigo-600
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-white
                    hover:bg-indigo-700
                    disabled:opacity-50
                  "
                >

                  {enregistrement ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save size={17} />
                      {communicationModifiee
                        ? 'Enregistrer les modifications'
                        : 'Publier la communication'}
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  )
}

export default CommunicationsAdmin