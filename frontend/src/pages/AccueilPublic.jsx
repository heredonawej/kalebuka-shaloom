import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { API_URL } from '../api'
import {
  School,
  GraduationCap,
  BookOpen,
  Users,
  ArrowRight,
  Newspaper,
  Phone,
  MapPin,
  Sparkles,
  CalendarDays,
  Loader2,
} from 'lucide-react'

function AccueilPublic() {
  const [communications, setCommunications] = useState([])
  const [chargementActualites, setChargementActualites] =
    useState(true)

  // =====================================================
  // CHARGER LES COMMUNICATIONS PUBLIÉES
  // =====================================================

  useEffect(() => {
    const chargerCommunications = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/communications/public`
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.erreur ||
              'Impossible de récupérer les actualités.'
          )
        }

        setCommunications(data)
      } catch (error) {
        console.error(
          'Erreur actualités :',
          error
        )

        setCommunications([])
      } finally {
        setChargementActualites(false)
      }
    }

    chargerCommunications()
  }, [])

  // =====================================================
  // FORMATER LA DATE
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">

      {/* ================================
          NAVIGATION
      ================================= */}

      <header className="
        sticky
        top-0
        z-50
        border-b
        border-slate-200
        bg-white/95
        backdrop-blur
      ">
        <div className="
          mx-auto
          flex
          max-w-7xl
          items-center
          justify-between
          px-4
          py-4
          sm:px-6
          lg:px-8
        ">

          {/* LOGO */}

          <Link
            to="/"
            className="flex items-center gap-3"
          >
            <div className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-2xl
              bg-indigo-600
              text-white
              shadow-lg
              shadow-indigo-200
            ">
              <School size={23} />
            </div>

            <div>
              <p className="
                text-base
                font-extrabold
                tracking-tight
                text-slate-900
              ">
                Kalebuka Shaloom
              </p>

              <p className="
                text-[11px]
                font-medium
                text-slate-500
              ">
                Établissement scolaire
              </p>
            </div>
          </Link>

          {/* MENU DESKTOP */}

          <nav className="
            hidden
            items-center
            gap-7
            md:flex
          ">
            <a
              href="#accueil"
              className="
                text-sm
                font-semibold
                text-indigo-600
              "
            >
              Accueil
            </a>

            <a
              href="#ecole"
              className="
                text-sm
                font-medium
                text-slate-600
                transition
                hover:text-indigo-600
              "
            >
              L'école
            </a>

            <a
              href="#sections"
              className="
                text-sm
                font-medium
                text-slate-600
                transition
                hover:text-indigo-600
              "
            >
              Sections
            </a>

            <a
              href="#actualites"
              className="
                text-sm
                font-medium
                text-slate-600
                transition
                hover:text-indigo-600
              "
            >
              Actualités
            </a>

            <a
              href="#contact"
              className="
                text-sm
                font-medium
                text-slate-600
                transition
                hover:text-indigo-600
              "
            >
              Contact
            </a>
          </nav>

          {/* CONNEXION */}

          <Link
            to="/connexion"
            className="
              rounded-xl
              bg-slate-900
              px-4
              py-2.5
              text-xs
              font-bold
              text-white
              shadow-sm
              transition
              hover:bg-indigo-700
              sm:px-5
              sm:text-sm
            "
          >
            Espace personnel
          </Link>

        </div>
      </header>

      {/* ================================
          HERO
      ================================= */}

      <main>

        <section
          id="accueil"
          className="
            relative
            overflow-hidden
            bg-gradient-to-br
            from-indigo-700
            via-indigo-600
            to-blue-600
            text-white
          "
        >

          {/* Décoration */}

          <div className="
            absolute
            -right-20
            -top-20
            h-72
            w-72
            rounded-full
            bg-white/10
          " />

          <div className="
            absolute
            -bottom-32
            left-1/3
            h-80
            w-80
            rounded-full
            bg-white/5
          " />

          <div className="
            relative
            mx-auto
            max-w-7xl
            px-4
            py-20
            sm:px-6
            sm:py-24
            lg:px-8
            lg:py-28
          ">

            <div className="
              grid
              items-center
              gap-12
              lg:grid-cols-2
            ">

              {/* TEXTE */}

              <div>

                <div className="
                  mb-6
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-white/20
                  bg-white/10
                  px-4
                  py-2
                  text-xs
                  font-semibold
                  backdrop-blur
                ">
                  <Sparkles size={15} />

                  Bienvenue à Kalebuka Shaloom
                </div>

                <h1 className="
                  max-w-2xl
                  text-4xl
                  font-black
                  leading-tight
                  tracking-tight
                  sm:text-5xl
                  lg:text-6xl
                ">
                  L'éducation qui prépare

                  <span className="
                    block
                    text-blue-200
                  ">
                    l'avenir.
                  </span>
                </h1>

                <p className="
                  mt-6
                  max-w-xl
                  text-sm
                  leading-7
                  text-indigo-100
                  sm:text-base
                ">
                  Découvrez Kalebuka Shaloom, un
                  établissement scolaire dédié à
                  l'accompagnement, à l'apprentissage
                  et à l'épanouissement des élèves.
                </p>

                <div className="
                  mt-8
                  flex
                  flex-col
                  gap-3
                  sm:flex-row
                ">

                  <a
                    href="#ecole"
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-white
                      px-5
                      py-3.5
                      text-sm
                      font-bold
                      text-indigo-700
                      shadow-lg
                      transition
                      hover:-translate-y-0.5
                      hover:bg-blue-50
                    "
                  >
                    Découvrir notre école

                    <ArrowRight size={17} />
                  </a>

                  <a
                    href="#sections"
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      border
                      border-white/20
                      bg-white/10
                      px-5
                      py-3.5
                      text-sm
                      font-bold
                      text-white
                      backdrop-blur
                      transition
                      hover:bg-white/20
                    "
                  >
                    Nos sections
                  </a>

                </div>

              </div>

              {/* CARTE VISUELLE */}

              <div className="hidden lg:block">

                <div className="
                  relative
                  mx-auto
                  max-w-md
                ">

                  <div className="
                    absolute
                    -inset-5
                    rounded-[35px]
                    bg-white/10
                    blur-xl
                  " />

                  <div className="
                    relative
                    rounded-[30px]
                    border
                    border-white/20
                    bg-white/10
                    p-8
                    shadow-2xl
                    backdrop-blur-md
                  ">

                    <div className="
                      flex
                      h-24
                      w-24
                      items-center
                      justify-center
                      rounded-3xl
                      bg-white/15
                    ">
                      <School
                        size={52}
                        strokeWidth={1.4}
                      />
                    </div>

                    <h2 className="
                      mt-7
                      text-2xl
                      font-extrabold
                    ">
                      Kalebuka Shaloom
                    </h2>

                    <p className="
                      mt-3
                      text-sm
                      leading-6
                      text-indigo-100
                    ">
                      Un espace d'apprentissage,
                      d'encadrement et de développement
                      pour chaque élève.
                    </p>

                    <div className="
                      mt-7
                      grid
                      grid-cols-3
                      gap-3
                    ">

                      <div className="
                        rounded-2xl
                        bg-white/10
                        p-4
                        text-center
                      ">
                        <School
                          size={20}
                          className="mx-auto"
                        />

                        <p className="
                          mt-2
                          text-xs
                          font-semibold
                        ">
                          École
                        </p>
                      </div>

                      <div className="
                        rounded-2xl
                        bg-white/10
                        p-4
                        text-center
                      ">
                        <Users
                          size={20}
                          className="mx-auto"
                        />

                        <p className="
                          mt-2
                          text-xs
                          font-semibold
                        ">
                          Élèves
                        </p>
                      </div>

                      <div className="
                        rounded-2xl
                        bg-white/10
                        p-4
                        text-center
                      ">
                        <BookOpen
                          size={20}
                          className="mx-auto"
                        />

                        <p className="
                          mt-2
                          text-xs
                          font-semibold
                        ">
                          Savoir
                        </p>
                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* ================================
            L'ÉCOLE
        ================================= */}

        <section
          id="ecole"
          className="bg-white"
        >

          <div className="
            mx-auto
            max-w-7xl
            px-4
            py-16
            sm:px-6
            lg:px-8
            lg:py-20
          ">

            <div className="
              grid
              gap-12
              lg:grid-cols-2
              lg:items-center
            ">

              <div>

                <span className="
                  text-sm
                  font-bold
                  text-indigo-600
                ">
                  NOTRE ÉTABLISSEMENT
                </span>

                <h2 className="
                  mt-2
                  text-3xl
                  font-black
                  tracking-tight
                  text-slate-900
                  sm:text-4xl
                ">
                  Une école tournée vers l'avenir
                </h2>

                <p className="
                  mt-5
                  text-sm
                  leading-7
                  text-slate-600
                  sm:text-base
                ">
                  Kalebuka Shaloom accompagne les
                  élèves dans leur parcours scolaire
                  en mettant l'accent sur
                  l'apprentissage, l'encadrement et
                  le suivi pédagogique.
                </p>

                <p className="
                  mt-4
                  text-sm
                  leading-7
                  text-slate-600
                  sm:text-base
                ">
                  Notre objectif est de créer un
                  environnement dans lequel chaque
                  élève peut développer ses
                  connaissances, ses compétences et
                  sa confiance.
                </p>

              </div>

              <div className="
                grid
                grid-cols-1
                gap-4
                sm:grid-cols-2
              ">

                <div className="
                  rounded-2xl
                  border
                  border-slate-200
                  bg-slate-50
                  p-6
                ">
                  <div className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-2xl
                    bg-indigo-100
                    text-indigo-600
                  ">
                    <GraduationCap size={23} />
                  </div>

                  <h3 className="
                    mt-5
                    font-bold
                    text-slate-900
                  ">
                    Suivi des élèves
                  </h3>

                  <p className="
                    mt-2
                    text-sm
                    leading-6
                    text-slate-500
                  ">
                    Un accompagnement adapté au
                    parcours de chaque élève.
                  </p>
                </div>

                <div className="
                  rounded-2xl
                  border
                  border-slate-200
                  bg-slate-50
                  p-6
                ">
                  <div className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-2xl
                    bg-blue-100
                    text-blue-600
                  ">
                    <BookOpen size={23} />
                  </div>

                  <h3 className="
                    mt-5
                    font-bold
                    text-slate-900
                  ">
                    Apprentissage
                  </h3>

                  <p className="
                    mt-2
                    text-sm
                    leading-6
                    text-slate-500
                  ">
                    Une organisation pédagogique
                    orientée vers la réussite.
                  </p>
                </div>

              </div>

            </div>

          </div>

        </section>

        {/* ================================
            SECTIONS
        ================================= */}

        <section
          id="sections"
          className="bg-slate-50"
        >

          <div className="
            mx-auto
            max-w-7xl
            px-4
            py-16
            sm:px-6
            lg:px-8
            lg:py-20
          ">

            <div className="
              mx-auto
              max-w-2xl
              text-center
            ">

              <span className="
                text-sm
                font-bold
                text-indigo-600
              ">
                NOS SECTIONS
              </span>

              <h2 className="
                mt-2
                text-3xl
                font-black
                text-slate-900
                sm:text-4xl
              ">
                Un parcours pour chaque étape
              </h2>

              <p className="
                mt-4
                text-sm
                leading-6
                text-slate-500
                sm:text-base
              ">
                L'établissement comprend trois
                niveaux d'enseignement.
              </p>

            </div>

            <div className="
              mt-10
              grid
              gap-5
              md:grid-cols-3
            ">

              {/* MATERNELLE */}

              <div className="
                group
                rounded-3xl
                border
                border-slate-200
                bg-white
                p-6
                shadow-sm
                transition
                hover:-translate-y-1
                hover:shadow-xl
              ">

                <div className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  bg-pink-100
                  text-pink-600
                ">
                  <GraduationCap size={27} />
                </div>

                <h3 className="
                  mt-6
                  text-xl
                  font-extrabold
                  text-slate-900
                ">
                  Maternelle
                </h3>

                <p className="
                  mt-3
                  text-sm
                  leading-6
                  text-slate-500
                ">
                  Un environnement adapté à
                  l'éveil, à la découverte et aux
                  premières expériences
                  d'apprentissage.
                </p>

                <div className="
                  mt-6
                  flex
                  items-center
                  gap-2
                  text-sm
                  font-bold
                  text-pink-600
                ">
                  Découvrir
                  <ArrowRight size={16} />
                </div>

              </div>

              {/* PRIMAIRE */}

              <div className="
                group
                rounded-3xl
                border
                border-slate-200
                bg-white
                p-6
                shadow-sm
                transition
                hover:-translate-y-1
                hover:shadow-xl
              ">

                <div className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  bg-blue-100
                  text-blue-600
                ">
                  <BookOpen size={27} />
                </div>

                <h3 className="
                  mt-6
                  text-xl
                  font-extrabold
                  text-slate-900
                ">
                  Primaire
                </h3>

                <p className="
                  mt-3
                  text-sm
                  leading-6
                  text-slate-500
                ">
                  Développement des connaissances
                  fondamentales et acquisition
                  progressive des compétences.
                </p>

                <div className="
                  mt-6
                  flex
                  items-center
                  gap-2
                  text-sm
                  font-bold
                  text-blue-600
                ">
                  Découvrir
                  <ArrowRight size={16} />
                </div>

              </div>

              {/* SECONDAIRE */}

              <div className="
                group
                rounded-3xl
                border
                border-slate-200
                bg-white
                p-6
                shadow-sm
                transition
                hover:-translate-y-1
                hover:shadow-xl
              ">

                <div className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  bg-purple-100
                  text-purple-600
                ">
                  <School size={27} />
                </div>

                <h3 className="
                  mt-6
                  text-xl
                  font-extrabold
                  text-slate-900
                ">
                  Secondaire
                </h3>

                <p className="
                  mt-3
                  text-sm
                  leading-6
                  text-slate-500
                ">
                  Approfondissement des connaissances
                  et préparation des élèves aux
                  prochaines étapes de leur parcours.
                </p>

                <div className="
                  mt-6
                  flex
                  items-center
                  gap-2
                  text-sm
                  font-bold
                  text-purple-600
                ">
                  Découvrir
                  <ArrowRight size={16} />
                </div>

              </div>

            </div>

          </div>

        </section>

        {/* ================================
            ACTUALITÉS
        ================================= */}

        <section
          id="actualites"
          className="bg-white"
        >

          <div className="
            mx-auto
            max-w-7xl
            px-4
            py-16
            sm:px-6
            lg:px-8
            lg:py-20
          ">

            <div className="
              flex
              flex-col
              gap-3
              sm:flex-row
              sm:items-end
              sm:justify-between
            ">

              <div>

                <span className="
                  text-sm
                  font-bold
                  text-indigo-600
                ">
                  ACTUALITÉS
                </span>

                <h2 className="
                  mt-2
                  text-3xl
                  font-black
                  text-slate-900
                ">
                  Les nouvelles de l'école
                </h2>

              </div>

              <div className="
                text-sm
                text-slate-400
              ">
                Informations et communications
                de l'établissement.
              </div>

            </div>

            {/* CHARGEMENT */}

            {chargementActualites ? (

              <div className="
                mt-8
                flex
                min-h-[220px]
                items-center
                justify-center
                gap-3
                rounded-3xl
                border
                border-slate-200
                bg-slate-50
                text-sm
                text-slate-500
              ">
                <Loader2
                  size={22}
                  className="animate-spin"
                />

                Chargement des actualités...
              </div>

            ) : communications.length === 0 ? (

              /* AUCUNE ACTUALITÉ */

              <div className="
                mt-8
                rounded-3xl
                border
                border-dashed
                border-slate-300
                bg-slate-50
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
                  bg-indigo-100
                  text-indigo-600
                ">
                  <Newspaper size={28} />
                </div>

                <h3 className="
                  mt-5
                  text-lg
                  font-bold
                  text-slate-800
                ">
                  Aucune actualité publiée
                </h3>

                <p className="
                  mx-auto
                  mt-2
                  max-w-md
                  text-sm
                  leading-6
                  text-slate-500
                ">
                  Les prochaines informations et
                  activités de l'école apparaîtront
                  dans cette section.
                </p>

              </div>

            ) : (

              /* COMMUNICATIONS */

              <div className="
                mt-8
                grid
                gap-5
                md:grid-cols-2
                lg:grid-cols-3
              ">

                {communications.map(
                  (communication) => (

                    <article
                      key={communication.id}
                      className="
                        group
                        overflow-hidden
                        rounded-3xl
                        border
                        border-slate-200
                        bg-white
                        shadow-sm
                        transition
                        hover:-translate-y-1
                        hover:shadow-xl
                      "
                    >

                      {/* BANDEAU */}

                      <div className="
                        h-2
                        bg-gradient-to-r
                        from-indigo-600
                        to-blue-500
                      " />

                      <div className="p-6">

                        <div className="
                          flex
                          flex-wrap
                          items-center
                          justify-between
                          gap-2
                        ">

                          <span className="
                            inline-flex
                            rounded-full
                            bg-indigo-50
                            px-3
                            py-1.5
                            text-xs
                            font-bold
                            text-indigo-700
                          ">
                            {communication.categorie}
                          </span>

                          <span className="
                            inline-flex
                            items-center
                            gap-1.5
                            text-xs
                            text-slate-400
                          ">
                            <CalendarDays size={14} />

                            {formaterDate(
                              communication.date_publication
                            )}
                          </span>

                        </div>

                        <h3 className="
                          mt-5
                          text-xl
                          font-extrabold
                          leading-tight
                          text-slate-900
                        ">
                          {communication.titre}
                        </h3>

                        <p className="
                          mt-3
                          whitespace-pre-line
                          text-sm
                          leading-6
                          text-slate-600
                        ">
                          {communication.contenu}
                        </p>

                        <div className="
                          mt-5
                          flex
                          items-center
                          gap-2
                          text-sm
                          font-bold
                          text-indigo-600
                        ">
                          <Newspaper size={16} />

                          Communication officielle
                        </div>

                      </div>

                    </article>

                  )
                )}

              </div>

            )}

          </div>

        </section>

        {/* ================================
            CONTACT
        ================================= */}

        <section
          id="contact"
          className="
            bg-slate-900
            text-white
          "
        >

          <div className="
            mx-auto
            max-w-7xl
            px-4
            py-16
            sm:px-6
            lg:px-8
            lg:py-20
          ">

            <div className="
              grid
              gap-10
              lg:grid-cols-2
              lg:items-center
            ">

              <div>

                <span className="
                  text-sm
                  font-bold
                  text-blue-400
                ">
                  CONTACT
                </span>

                <h2 className="
                  mt-2
                  text-3xl
                  font-black
                  sm:text-4xl
                ">
                  Parlons de notre école
                </h2>

                <p className="
                  mt-4
                  max-w-xl
                  text-sm
                  leading-7
                  text-slate-400
                  sm:text-base
                ">
                  Les informations de contact
                  officielles de Kalebuka Shaloom
                  pourront être ajoutées ici.
                </p>

              </div>

              <div className="space-y-4">

                <div className="
                  flex
                  items-center
                  gap-4
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/5
                  p-5
                ">

                  <div className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-white/10
                    text-blue-400
                  ">
                    <MapPin size={21} />
                  </div>

                  <div>

                    <p className="
                      text-sm
                      font-bold
                    ">
                      Adresse
                    </p>

                    <p className="
                      mt-1
                      text-sm
                      text-slate-400
                    ">
                      Adresse de l'établissement
                    </p>

                  </div>

                </div>

                <div className="
                  flex
                  items-center
                  gap-4
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/5
                  p-5
                ">

                  <div className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-white/10
                    text-blue-400
                  ">
                    <Phone size={21} />
                  </div>

                  <div>

                    <p className="
                      text-sm
                      font-bold
                    ">
                      Téléphone
                    </p>

                    <p className="
                      mt-1
                      text-sm
                      text-slate-400
                    ">
                      Numéro de téléphone de l'école
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>

      </main>

      {/* ================================
          FOOTER
      ================================= */}

      <footer className="
        bg-slate-950
        px-4
        py-7
        text-center
        text-sm
        text-slate-500
      ">

        <p>
          © {new Date().getFullYear()} Kalebuka
          Shaloom. Tous droits réservés.
        </p>

      </footer>

    </div>
  )
}

export default AccueilPublic