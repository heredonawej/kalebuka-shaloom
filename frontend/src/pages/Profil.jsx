import {
  User,
  CreditCard,
  ShieldCheck,
  School,
  LogOut,
  Lock,
} from 'lucide-react'

function Profil({ utilisateur, onDeconnexion }) {

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

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* =====================================
          EN-TÊTE
      ===================================== */}

      <div>

        <p className="text-sm font-medium text-blue-600">
          Mon espace
        </p>

        <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900">
          Mon profil
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Consultez vos informations personnelles et votre affectation.
        </p>

      </div>


      {/* =====================================
          IDENTITÉ
      ===================================== */}

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-7 text-white">

          <div className="flex items-center gap-4">

            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">

              <User
                size={32}
                className="text-white"
              />

            </div>

            <div>

              {/* APPELLATION DYNAMIQUE */}

              <p className="text-blue-100 text-sm">
                {appellation}
              </p>

              <h2 className="text-xl sm:text-2xl font-bold mt-1">
                {utilisateur?.nom || 'Nom non renseigné'}
              </h2>

              <p className="text-sm text-blue-100 mt-1">
                Compte actif
              </p>

            </div>

          </div>

        </div>


        {/* INFORMATIONS */}

        <div className="p-5 sm:p-7">

          <h3 className="font-bold text-slate-900 mb-5">
            Informations personnelles
          </h3>


          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">


            {/* NOM */}

            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">

                  <User size={19} />

                </div>

                <div>

                  <p className="text-xs text-slate-400">
                    Nom complet
                  </p>

                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    {utilisateur?.nom || '—'}
                  </p>

                </div>

              </div>

            </div>


            {/* MATRICULE */}

            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">

                  <CreditCard size={19} />

                </div>

                <div>

                  <p className="text-xs text-slate-400">
                    Matricule
                  </p>

                  <p className="text-sm font-semibold text-slate-800 font-mono mt-1">
                    {utilisateur?.matricule || '—'}
                  </p>

                </div>

              </div>

            </div>


            {/* RÔLE */}

            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">

                  <ShieldCheck size={19} />

                </div>

                <div>

                  <p className="text-xs text-slate-400">
                    Fonction
                  </p>

                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    {appellation}
                  </p>

                </div>

              </div>

            </div>


            {/* CLASSE */}

            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">

                  <School size={19} />

                </div>

                <div className="flex-1">

                  <p className="text-xs text-slate-400">
                    Classe affectée
                  </p>

                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    {utilisateur?.classe_nom ||
                      'Classe non affectée'}
                  </p>

                  {utilisateur?.section && (
                    <p className="text-xs text-slate-500 mt-1">
                      Section : {utilisateur.section}
                    </p>
                  )}

                </div>

                <Lock
                  size={17}
                  className="text-slate-400"
                />

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================
          AFFECTATION
      ===================================== */}

      <section className="bg-blue-50 border border-blue-100 rounded-2xl p-5 sm:p-6">

        <div className="flex items-start gap-3">

          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">

            <School
              size={20}
              className="text-white"
            />

          </div>

          <div>

            <h3 className="font-bold text-slate-900">
              Affectation pédagogique
            </h3>

            <p className="text-sm text-slate-600 mt-1">
              Votre classe est définie par la direction de l'école.
              Elle détermine les élèves et les préparations auxquels
              vous avez accès.
            </p>

            <div className="mt-4 inline-flex items-center gap-2 bg-white border border-blue-100 rounded-xl px-4 py-3">

              <Lock
                size={16}
                className="text-blue-600"
              />

              <div>

                <p className="text-sm font-semibold text-slate-800">
                  {utilisateur?.classe_nom ||
                    'Aucune classe affectée'}
                </p>

                {utilisateur?.section && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    {utilisateur.section}
                  </p>
                )}

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================
          DÉCONNEXION
      ===================================== */}

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">

        <h3 className="font-bold text-slate-900">
          Session
        </h3>

        <p className="text-sm text-slate-500 mt-1 mb-4">
          Vous pouvez vous déconnecter de votre compte depuis cette section.
        </p>

        <button
          type="button"
          onClick={onDeconnexion}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-semibold text-sm transition"
        >

          <LogOut size={18} />

          Déconnexion

        </button>

      </section>

    </div>
  )
}

export default Profil