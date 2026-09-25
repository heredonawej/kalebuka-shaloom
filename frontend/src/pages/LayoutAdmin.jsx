import { Outlet, NavLink } from 'react-router-dom'
import {
  Home,
  Users,
  GraduationCap,
  School,
  BookOpen,
  BarChart3,
  Settings,
  LogOut,
  ShieldCheck,
  CalendarDays,
  ClipboardCheck,
  Megaphone,
  LockKeyhole,
} from 'lucide-react';

function LayoutAdmin({ utilisateur, onDeconnexion }) {

  const liens = [
    {
      nom: 'Accueil',
      chemin: '/admin',
      icone: Home,
    },
    {
      nom: 'Enseignants',
      chemin: '/admin/enseignants',
      icone: Users,
    },
    {
      nom: 'Élèves',
      chemin: '/admin/eleves',
      icone: GraduationCap,
    },
    {
      nom: 'Classes',
      chemin: '/admin/classes',
      icone: School,
    },
    {
  nom: 'Horaires',
  chemin: '/admin/horaires',
  icone: CalendarDays,
},
    {
      nom: 'Matières',
      chemin: '/admin/matieres',
      icone: BookOpen,
    },
    {
  nom: 'Registre d’appel',
  chemin: '/admin/registre-appel',
  icone: ClipboardCheck,
},
{
  nom: 'Communications',
  chemin: '/admin/communications',
  icone: Megaphone,
},
    {
      nom: 'Rapports',
      chemin: '/admin/rapports',
      icone: BarChart3,
    },
    {
  nom: 'Coffre ADM',
  chemin: '/admin/coffre-adm',
  icone: LockKeyhole,
},
    {
      nom: 'Paramètres',
      chemin: '/admin/parametres',
      icone: Settings,
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ===============================
          HEADER
      =============================== */}

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

          <div className="flex items-center gap-3">

            <div
              className="w-10
                         h-10
                         rounded-xl
                         bg-blue-600
                         flex
                         items-center
                         justify-center"
            >
              <ShieldCheck
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
                Administration
              </p>

            </div>

          </div>

          {/* ADMIN CONNECTÉ */}

          <div className="hidden sm:flex items-center gap-3">

            <div className="text-right">

              <p
                className="text-sm
                           font-semibold
                           text-slate-800"
              >
                {utilisateur?.nom || 'Administration'}
              </p>

              <p
                className="text-xs
                           text-slate-500"
              >
                Administrateur
              </p>

            </div>

            <div
              className="w-9
                         h-9
                         rounded-full
                         bg-blue-50
                         flex
                         items-center
                         justify-center"
            >
              <ShieldCheck
                size={18}
                className="text-blue-600"
              />
            </div>

          </div>

        </div>

      </header>

      {/* ===============================
          SIDEBAR
      =============================== */}

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
            Administration
          </p>

          <div className="space-y-1">

            {liens.map((lien) => {

              const Icone = lien.icone

              return (
                <NavLink
                  key={lien.chemin}
                  to={lien.chemin}
                  end={lien.chemin === '/admin'}
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

          {/* DÉCONNEXION */}

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

      {/* ===============================
          CONTENU
      =============================== */}

      <main className="pt-16 sm:ml-64">

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

      {/* ===============================
          NAVIGATION MOBILE
      =============================== */}

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

        <div className="grid grid-cols-5 h-16">

          {liens.slice(0, 5).map((lien) => {

            const Icone = lien.icone

            return (
              <NavLink
                key={lien.chemin}
                to={lien.chemin}
                end={lien.chemin === '/admin'}
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
                      strokeWidth={isActive ? 2.5 : 2}
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

export default LayoutAdmin