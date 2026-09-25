import { useState } from 'react'
import { API_URL } from '../api'
import {
  Lock,
  ShieldCheck,
  KeyRound,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Eye,
  EyeOff,
  Loader2,
  FileText,
} from 'lucide-react'

function CoffreAdm() {
  const [pin, setPin] = useState('')
  const [token, setToken] = useState(null)
  const [verifying, setVerifying] = useState(false)

  const [informations, setInformations] = useState([])
  const [chargement, setChargement] = useState(false)

  const [modalOuverte, setModalOuverte] = useState(false)
  const [modification, setModification] = useState(null)

  const [titre, setTitre] = useState('')
  const [contenu, setContenu] = useState('')
  const [enregistrement, setEnregistrement] = useState(false)

  const [afficherContenu, setAfficherContenu] = useState({})

  // =====================================================
  // HEADERS SÉCURISÉS
  // =====================================================

  const headersSecurises = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  })

  // =====================================================
  // VÉRIFIER LE PIN
  // =====================================================

  const verifierPin = async (e) => {
    e.preventDefault()

    if (!/^\d{4}$/.test(pin)) {
      alert('Veuillez entrer exactement 4 chiffres.')
      return
    }

    try {
      setVerifying(true)

      const response = await fetch(
        `${API_URL}/api/coffre-adm/verifier`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pin,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.erreur || 'Code PIN incorrect.'
        )
      }

      if (!data.token) {
        throw new Error(
          'Le serveur n’a pas retourné de jeton de sécurité.'
        )
      }

      setToken(data.token)
      setPin('')

      await chargerInformations(data.token)
    } catch (error) {
      console.error(error)

      alert(
        error.message ||
          'Impossible de déverrouiller le coffre.'
      )
    } finally {
      setVerifying(false)
    }
  }

  // =====================================================
  // CHARGER LES INFORMATIONS
  // =====================================================

  const chargerInformations = async (
    tokenSecurite = token
  ) => {
    if (!tokenSecurite) return

    try {
      setChargement(true)

      const response = await fetch(
        `${API_URL}/api/coffre-adm`,
        {
          headers: {
            Authorization: `Bearer ${tokenSecurite}`,
          },
        }
      )

      const data = await response.json()

      if (response.status === 401) {
        verrouiller()
        alert(
          data.erreur ||
            'La session du coffre a expiré.'
        )
        return
      }

      if (!response.ok) {
        throw new Error(
          data.erreur ||
            'Impossible de récupérer les informations.'
        )
      }

      setInformations(data)
    } catch (error) {
      console.error(error)

      if (error.message) {
        alert(error.message)
      }
    } finally {
      setChargement(false)
    }
  }

  // =====================================================
  // AJOUTER UNE INFORMATION
  // =====================================================

  const ouvrirAjout = () => {
    setModification(null)
    setTitre('')
    setContenu('')
    setModalOuverte(true)
  }

  // =====================================================
  // MODIFIER UNE INFORMATION
  // =====================================================

  const ouvrirModification = (information) => {
    setModification(information)
    setTitre(information.titre)
    setContenu(information.contenu)
    setModalOuverte(true)
  }

  // =====================================================
  // ENREGISTRER
  // =====================================================

  const enregistrer = async (e) => {
    e.preventDefault()

    if (!titre.trim()) {
      alert('Le titre est obligatoire.')
      return
    }

    if (!contenu.trim()) {
      alert('Le contenu est obligatoire.')
      return
    }

    if (!token) {
      alert('Votre session sécurisée est expirée.')
      verrouiller()
      return
    }

    try {
      setEnregistrement(true)

      const url = modification
        ? `${API_URL}/api/coffre-adm/${modification.id}`
        : `${API_URL}/api/coffre-adm`

      const response = await fetch(url, {
        method: modification ? 'PUT' : 'POST',
        headers: headersSecurises(),
        body: JSON.stringify({
          titre,
          contenu,
        }),
      })

      const data = await response.json()

      if (response.status === 401) {
        verrouiller()

        throw new Error(
          data.erreur ||
            'Votre session du coffre a expiré.'
        )
      }

      if (!response.ok) {
        throw new Error(
          data.erreur ||
            'Impossible d’enregistrer.'
        )
      }

      setModalOuverte(false)
      setModification(null)
      setTitre('')
      setContenu('')

      await chargerInformations()
    } catch (error) {
      console.error(error)
      alert(error.message)
    } finally {
      setEnregistrement(false)
    }
  }

  // =====================================================
  // SUPPRIMER
  // =====================================================

  const supprimer = async (id) => {
    const confirmation = window.confirm(
      'Voulez-vous vraiment supprimer cette information ?'
    )

    if (!confirmation) return

    if (!token) {
      alert('Votre session sécurisée est expirée.')
      verrouiller()
      return
    }

    try {
      const response = await fetch(
        `${API_URL}/api/coffre-adm/${id}`,
        {
          method: 'DELETE',
          headers: headersSecurises(),
        }
      )

      const data = await response.json()

      if (response.status === 401) {
        verrouiller()

        throw new Error(
          data.erreur ||
            'Votre session du coffre a expiré.'
        )
      }

      if (!response.ok) {
        throw new Error(
          data.erreur ||
            'Impossible de supprimer.'
        )
      }

      await chargerInformations()
    } catch (error) {
      console.error(error)
      alert(error.message)
    }
  }

  // =====================================================
  // AFFICHER / MASQUER
  // =====================================================

  const basculerContenu = (id) => {
    setAfficherContenu((ancien) => ({
      ...ancien,
      [id]: !ancien[id],
    }))
  }

  // =====================================================
  // VERROUILLER
  // =====================================================

  const verrouiller = () => {
    setToken(null)
    setInformations([])
    setAfficherContenu({})
    setModalOuverte(false)
    setModification(null)
    setTitre('')
    setContenu('')
  }

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formaterDate = (date) => {
    if (!date) return '—'

    const dateFormatee = new Date(date)

    if (Number.isNaN(dateFormatee.getTime())) {
      return '—'
    }

    return dateFormatee.toLocaleDateString(
      'fr-FR',
      {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }
    )
  }

  // =====================================================
  // ÉCRAN DE VERROUILLAGE
  // =====================================================

  if (!token) {
    return (
      <div className="
        min-h-[calc(100vh-120px)]
        flex
        items-center
        justify-center
        px-4
        py-10
      ">

        <div className="
          w-full
          max-w-md
          overflow-hidden
          rounded-3xl
          border
          border-slate-200
          bg-white
          shadow-xl
        ">

          {/* HEADER */}

          <div className="
            bg-gradient-to-br
            from-slate-900
            via-slate-800
            to-indigo-900
            px-6
            py-10
            text-center
            text-white
          ">

            <div className="
              mx-auto
              flex
              h-20
              w-20
              items-center
              justify-center
              rounded-3xl
              bg-white/10
              shadow-lg
            ">
              <Lock size={36} />
            </div>

            <h1 className="
              mt-6
              text-2xl
              font-black
            ">
              Coffre ADM
            </h1>

            <p className="
              mt-2
              text-sm
              text-slate-300
            ">
              Espace réservé aux informations
              confidentielles
            </p>

          </div>

          {/* PIN */}

          <form
            onSubmit={verifierPin}
            className="p-6 sm:p-8"
          >

            <div className="text-center">

              <div className="
                mx-auto
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                bg-indigo-100
                text-indigo-600
              ">
                <KeyRound size={23} />
              </div>

              <h2 className="
                mt-4
                font-bold
                text-slate-900
              ">
                Code de sécurité
              </h2>

              <p className="
                mt-1
                text-sm
                text-slate-500
              ">
                Entrez votre code à 4 chiffres
              </p>

            </div>

            <div className="mt-7">

              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                autoComplete="off"
                value={pin}
                onChange={(e) => {
                  const valeur =
                    e.target.value.replace(/\D/g, '')

                  setPin(valeur)
                }}
                placeholder="••••"
                autoFocus
                className="
                  w-full
                  rounded-2xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-4
                  py-4
                  text-center
                  text-3xl
                  font-black
                  tracking-[0.7em]
                  text-slate-900
                  outline-none
                  transition
                  focus:border-indigo-500
                  focus:bg-white
                  focus:ring-4
                  focus:ring-indigo-100
                "
              />

            </div>

            <button
              type="submit"
              disabled={
                verifying ||
                pin.length !== 4
              }
              className="
                mt-5
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-2xl
                bg-slate-900
                px-5
                py-4
                text-sm
                font-bold
                text-white
                transition
                hover:bg-indigo-700
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >

              {verifying ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Vérification...
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  Déverrouiller
                </>
              )}

            </button>

            <p className="
              mt-5
              text-center
              text-xs
              text-slate-400
            ">
              Cet espace est réservé à
              l'administration.
            </p>

          </form>

        </div>

      </div>
    )
  }

  // =====================================================
  // COFFRE OUVERT
  // =====================================================

  return (
    <div className="space-y-6 pb-10">

      {/* HEADER */}

      <div className="
        overflow-hidden
        rounded-3xl
        bg-gradient-to-br
        from-slate-900
        via-slate-800
        to-indigo-900
        p-6
        text-white
        shadow-lg
        sm:p-8
      ">

        <div className="
          flex
          flex-col
          gap-5
          sm:flex-row
          sm:items-center
          sm:justify-between
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
              bg-white/10
            ">
              <ShieldCheck size={28} />
            </div>

            <div>

              <p className="
                text-xs
                font-bold
                uppercase
                tracking-wider
                text-indigo-300
              ">
                Accès sécurisé
              </p>

              <h1 className="
                mt-1
                text-2xl
                font-black
                sm:text-3xl
              ">
                Coffre ADM
              </h1>

              <p className="
                mt-1
                text-sm
                text-slate-300
              ">
                Informations confidentielles
              </p>

            </div>

          </div>

          <button
            onClick={verrouiller}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-white/10
              bg-white/10
              px-4
              py-2.5
              text-sm
              font-bold
              text-white
              transition
              hover:bg-white/20
            "
          >
            <Lock size={17} />
            Verrouiller
          </button>

        </div>

      </div>

      {/* TITRE + AJOUT */}

      <div className="
        flex
        flex-col
        gap-4
        sm:flex-row
        sm:items-center
        sm:justify-between
      ">

        <div>

          <h2 className="
            text-xl
            font-black
            text-slate-900
          ">
            Informations confidentielles
          </h2>

          <p className="
            mt-1
            text-sm
            text-slate-500
          ">
            {informations.length}{' '}
            information
            {informations.length > 1 ? 's' : ''}
            enregistrée
            {informations.length > 1 ? 's' : ''}
          </p>

        </div>

        <button
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
            font-bold
            text-white
            shadow-lg
            shadow-indigo-200
            transition
            hover:bg-indigo-700
          "
        >
          <Plus size={18} />
          Ajouter une information
        </button>

      </div>

      {/* INFORMATIONS */}

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

          Chargement...
        </div>

      ) : informations.length === 0 ? (

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
            <FileText size={28} />
          </div>

          <h3 className="
            mt-5
            text-lg
            font-bold
            text-slate-800
          ">
            Aucun contenu
          </h3>

          <p className="
            mx-auto
            mt-2
            max-w-md
            text-sm
            text-slate-500
          ">
            Ajoutez votre première information
            confidentielle.
          </p>

        </div>

      ) : (

        <div className="
          grid
          gap-5
          md:grid-cols-2
        ">

          {informations.map(
            (information) => {

              const contenuVisible =
                afficherContenu[
                  information.id
                ]

              return (
                <div
                  key={information.id}
                  className="
                    rounded-3xl
                    border
                    border-slate-200
                    bg-white
                    p-6
                    shadow-sm
                  "
                >

                  <div className="
                    flex
                    items-start
                    justify-between
                    gap-4
                  ">

                    <div className="
                      flex
                      min-w-0
                      items-center
                      gap-3
                    ">

                      <div className="
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-indigo-100
                        text-indigo-600
                      ">
                        <FileText size={21} />
                      </div>

                      <div className="min-w-0">

                        <h3 className="
                          truncate
                          font-bold
                          text-slate-900
                        ">
                          {information.titre}
                        </h3>

                        <p className="
                          mt-1
                          text-xs
                          text-slate-400
                        ">
                          {formaterDate(
                            information.created_at
                          )}
                        </p>

                      </div>

                    </div>

                  </div>

                  <div className="
                    mt-5
                    rounded-2xl
                    bg-slate-50
                    p-4
                  ">

                    {contenuVisible ? (
                      <p className="
                        whitespace-pre-line
                        text-sm
                        leading-6
                        text-slate-700
                      ">
                        {information.contenu}
                      </p>
                    ) : (
                      <p className="
                        text-sm
                        italic
                        text-slate-400
                      ">
                        Contenu masqué
                      </p>
                    )}

                  </div>

                  <div className="
                    mt-4
                    flex
                    flex-wrap
                    gap-2
                  ">

                    <button
                      onClick={() =>
                        basculerContenu(
                          information.id
                        )
                      }
                      className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-xl
                        bg-slate-100
                        px-3
                        py-2
                        text-xs
                        font-bold
                        text-slate-700
                        transition
                        hover:bg-slate-200
                      "
                    >
                      {contenuVisible ? (
                        <>
                          <EyeOff size={15} />
                          Masquer
                        </>
                      ) : (
                        <>
                          <Eye size={15} />
                          Afficher
                        </>
                      )}
                    </button>

                    <button
                      onClick={() =>
                        ouvrirModification(
                          information
                        )
                      }
                      className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-xl
                        bg-indigo-50
                        px-3
                        py-2
                        text-xs
                        font-bold
                        text-indigo-700
                        transition
                        hover:bg-indigo-100
                      "
                    >
                      <Pencil size={15} />
                      Modifier
                    </button>

                    <button
                      onClick={() =>
                        supprimer(
                          information.id
                        )
                      }
                      className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-xl
                        bg-red-50
                        px-3
                        py-2
                        text-xs
                        font-bold
                        text-red-600
                        transition
                        hover:bg-red-100
                      "
                    >
                      <Trash2 size={15} />
                      Supprimer
                    </button>

                  </div>

                </div>
              )
            }
          )}

        </div>

      )}

      {/* MODAL */}

      {modalOuverte && (
        <div className="
          fixed
          inset-0
          z-[100]
          flex
          items-center
          justify-center
          bg-slate-950/60
          px-4
          py-6
          backdrop-blur-sm
        ">

          <div className="
            w-full
            max-w-xl
            overflow-hidden
            rounded-3xl
            bg-white
            shadow-2xl
          ">

            <div className="
              flex
              items-center
              justify-between
              border-b
              border-slate-200
              px-6
              py-5
            ">

              <div>

                <h2 className="
                  text-xl
                  font-black
                  text-slate-900
                ">
                  {modification
                    ? 'Modifier l’information'
                    : 'Nouvelle information'}
                </h2>

                <p className="
                  mt-1
                  text-xs
                  text-slate-500
                ">
                  Cette information restera
                  confidentielle.
                </p>

              </div>

              <button
                onClick={() =>
                  setModalOuverte(false)
                }
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-slate-100
                  text-slate-500
                  transition
                  hover:bg-slate-200
                "
              >
                <X size={18} />
              </button>

            </div>

            <form
              onSubmit={enregistrer}
              className="space-y-5 p-6"
            >

              <div>

                <label className="
                  mb-2
                  block
                  text-sm
                  font-bold
                  text-slate-700
                ">
                  Titre
                </label>

                <input
                  type="text"
                  value={titre}
                  onChange={(e) =>
                    setTitre(e.target.value)
                  }
                  placeholder="Ex : Information importante"
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
                    transition
                    focus:border-indigo-500
                    focus:bg-white
                    focus:ring-4
                    focus:ring-indigo-100
                  "
                />

              </div>

              <div>

                <label className="
                  mb-2
                  block
                  text-sm
                  font-bold
                  text-slate-700
                ">
                  Information
                </label>

                <textarea
                  value={contenu}
                  onChange={(e) =>
                    setContenu(e.target.value)
                  }
                  rows={7}
                  placeholder="Écrivez ici l'information confidentielle..."
                  className="
                    w-full
                    resize-none
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    px-4
                    py-3
                    text-sm
                    leading-6
                    outline-none
                    transition
                    focus:border-indigo-500
                    focus:bg-white
                    focus:ring-4
                    focus:ring-indigo-100
                  "
                />

              </div>

              <div className="
                flex
                flex-col-reverse
                gap-3
                sm:flex-row
                sm:justify-end
              ">

                <button
                  type="button"
                  onClick={() =>
                    setModalOuverte(false)
                  }
                  className="
                    rounded-xl
                    bg-slate-100
                    px-5
                    py-3
                    text-sm
                    font-bold
                    text-slate-700
                    transition
                    hover:bg-slate-200
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
                    font-bold
                    text-white
                    transition
                    hover:bg-indigo-700
                    disabled:cursor-not-allowed
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

                      {modification
                        ? 'Enregistrer les modifications'
                        : 'Enregistrer'}
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

export default CoffreAdm