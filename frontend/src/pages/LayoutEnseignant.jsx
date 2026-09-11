import { Outlet, NavLink } from 'react-router-dom'
import {
  Home,
  BookOpen,
  PlusCircle,
  GraduationCap,
  ClipboardList,
  User,
  LogOut,
} from 'lucide-react'

function LayoutEnseignant({ utilisateur, onDeconnexion }) {

  // ===============================
  // APPELLATION SELON LA SECTION
  // ===============================

  const getAppellation = () => {
    const section = utilisateur?.section?.toLowerCase()

    if (section === 'secondaire') {
      return 'Professeur'
    }

    return 'Monsieur/Madame'
  }

  const appellation = getAppellation()

  // ===============================
  // MENU
  // ===============================

  const liens = [
    {
      nom: 'Accueil',
      chemin: '/enseignant',
      icone: Home,
    },
    {
      nom: 'Préparations',
      chemin: '/enseignant/preparations',
      icone: BookOpen,
    },
    {
      nom: 'Nouvelle',
      chemin: '/enseignant/nouvelle-preparation',
      icone: PlusCircle,
    },
    {
      nom: 'Élèves',
      chemin: '/enseignant/eleves',
      icone: GraduationCap,
    },
    {
      nom: 'Évaluations',
      chemin: '/enseignant/evaluations',
      icone: ClipboardList,
    },
    {
      nom: 'Profil',
      chemin: '/enseignant/profil',
      icone: User,
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =================================================
          HEADER
      ================================================= */}

      <header
        className="fixed
                   top-0
                   left-0
                   right-0
                   z-50
                   h-16
                   bg-white/95
                   backdrop-blur-md
                   border-b
                   border-slate-200"
      >

        <div
          className="h-full
                     px-4
                     sm:px-6
                     flex
                     items-center
                     justify-between"
        >

          {/* LOGO */}

          <div
            className="flex
                       items-center
                       gap-3"
          >

            <div
              className="w-10
                         h-10
                         rounded-xl
                         bg-blue-600
                         flex
                         items-center
                         justify-center"
            >

              <GraduationCap
                size={22}
                className="text-white"
              />

            </div>

            <div>

              <h1
                className="text-sm
                           font-bold
                           text-slate-900"
              >
                Kalebuka Shaloom
              </h1>

              <p
                className="text-xs
                           text-slate-500"
              >
                Espace enseignant
              </p>

            </div>

          </div>

          {/* INFORMATIONS UTILISATEUR */}

          <div
            className="hidden
                       sm:flex
                       items-center
                       gap-4"
          >

            <div className="text-right">

              <p
                className="text-sm
                           font-semibold
                           text-slate-800"
              >
                {utilisateur?.nom}
              </p>

              <p
                className="text-xs
                           text-slate-500"
              >
                {appellation}
              </p>

            </div>

          </div>

        </div>

      </header>

      {/* =================================================
          MENU LATÉRAL
      ================================================= */}

      <aside
        className="hidden
                   sm:block
                   fixed
                   top-16
                   left-0
                   bottom-0
                   z-40
                   w-64
                   bg-white
                   border-r
                   border-slate-200
                   overflow-y-auto"
      >

        <div className="p-4">

          <p
            className="px-3
                       mb-3
                       text-[11px]
                       font-semibold
                       uppercase
                       tracking-wider
                       text-slate-400"
          >
            Menu principal
          </p>

          <div className="space-y-1">

            {liens.map((lien) => {

              const Icone = lien.icone

              return (
                <NavLink
                  key={lien.chemin}
                  to={lien.chemin}
                  end={lien.chemin === '/enseignant'}
                  className={({ isActive }) =>
                    `flex
                     items-center
                     gap-3
                     px-4
                     py-3
                     rounded-xl
                     text-sm
                     font-medium
                     transition
                     ${
                       isActive
                         ? 'bg-blue-50 text-blue-600'
                         : 'text-slate-600 hover:bg-slate-50'
                     }`
                  }
                >

                  <Icone size={19} />

                  <span>
                    {lien.nom}
                  </span>

                </NavLink>
              )

            })}

          </div>

          {/* =================================================
              DÉCONNEXION
          ================================================= */}

          <div
            className="mt-8
                       pt-5
                       border-t
                       border-slate-100"
          >

            <button
              onClick={onDeconnexion}
              className="w-full
                         flex
                         items-center
                         gap-3
                         px-4
                         py-3
                         rounded-xl
                         text-sm
                         font-medium
                         text-red-500
                         hover:bg-red-50
                         transition"
            >

              <LogOut size={19} />

              Déconnexion

            </button>

          </div>

        </div>

      </aside>

      {/* =================================================
          CONTENU PRINCIPAL
      ================================================= */}

      <main
        className="pt-16
                   sm:ml-64"
      >

        <div
          className="max-w-7xl
                     mx-auto
                     px-4
                     sm:px-6
                     lg:px-8
                     py-6
                     pb-24
                     sm:pb-8"
        >

          <Outlet />

        </div>

      </main>

      {/* =================================================
          NAVIGATION MOBILE
      ================================================= */}

      <nav
        className="fixed
                   bottom-0
                   left-0
                   right-0
                   z-50
                   bg-white/95
                   backdrop-blur-md
                   border-t
                   border-slate-200
                   sm:hidden"
      >

        <div
          className="grid
                     grid-cols-5
                     h-16"
        >

          {liens.slice(0, 5).map((lien) => {

            const Icone = lien.icone

            return (
              <NavLink
                key={lien.chemin}
                to={lien.chemin}
                end={lien.chemin === '/enseignant'}
                className={({ isActive }) =>
                  `flex
                   flex-col
                   items-center
                   justify-center
                   gap-1
                   text-[10px]
                   font-medium
                   transition
                   ${
                     isActive
                       ? 'text-blue-600'
                       : 'text-slate-400'
                   }`
                }
              >

                {({ isActive }) => (
                  <>
                    <Icone
                      size={20}
                      strokeWidth={
                        isActive ? 2.5 : 2
                      }
                    />

                    <span>
                      {lien.nom}
                    </span>
                  </>
                )}

              </NavLink>
            )

          })}

        </div>

      </nav>

    </div>
  )
}

export default LayoutEnseignant