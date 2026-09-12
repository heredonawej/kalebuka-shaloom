import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { API_URL } from '../api'
import {
  BookOpen,
  GraduationCap,
  ClipboardList,
  PlusCircle,
  Bell,
  CheckCircle,
  Clock,
  XCircle,
  ArrowRight,
  CalendarDays,
  Sparkles,
  UserRound,
} from 'lucide-react'

function AccueilEnseignant() {
  const [utilisateur, setUtilisateur] = useState(null)

  const [stats, setStats] = useState({
    preparations: 0,
    brouillons: 0,
    soumises: 0,
    validees: 0,
    rejetees: 0,
  })

  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    chargerAccueil()
  }, [])

  const chargerAccueil = async () => {
    try {
      const sauvegarde = localStorage.getItem('utilisateur')

      if (!sauvegarde) {
        setChargement(false)
        return
      }

      const utilisateurConnecte = JSON.parse(sauvegarde)

      setUtilisateur(utilisateurConnecte)

      const reponse = await fetch(
  `${API_URL}/api/cours?enseignant_id=${utilisateurConnecte.id}`
      )

      const texte = await reponse.text()

      if (!reponse.ok) {
        throw new Error('Impossible de charger les données.')
      }

      const preparations = JSON.parse(texte)

      setStats({
        preparations: preparations.length,

        brouillons: preparations.filter(
          (p) => p.statut === 'brouillon'
        ).length,

        soumises: preparations.filter(
          (p) => p.statut === 'soumis'
        ).length,

        validees: preparations.filter(
          (p) => p.statut === 'valide'
        ).length,

        rejetees: preparations.filter(
          (p) => p.statut === 'rejete'
        ).length,
      })
    } catch (erreur) {
      console.error('Erreur accueil :', erreur)
    } finally {
      setChargement(false)
    }
  }

  // ===============================
  // DATE ACTUELLE
  // ===============================

  const aujourdHui = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

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
    <div className="space-y-6">

      {/* =================================================
          BLOC PRINCIPAL
      ================================================= */}

      <section
        className="relative overflow-hidden
                   rounded-3xl
                   bg-gradient-to-br
                   from-blue-600
                   via-blue-700
                   to-indigo-800
                   p-6 sm:p-8
                   text-white"
      >

        {/* Décor */}

        <div
          className="absolute
                     -right-16
                     -top-16
                     w-48 h-48
                     rounded-full
                     bg-white/10"
        />

        <div
          className="absolute
                     right-20
                     -bottom-24
                     w-40 h-40
                     rounded-full
                     bg-white/5"
        />

        <div
          className="relative
                     flex flex-col
                     lg:flex-row
                     lg:items-center
                     lg:justify-between
                     gap-6"
        >

          <div>

            <div
              className="inline-flex
                         items-center
                         gap-2
                         px-3 py-1.5
                         rounded-full
                         bg-white/10
                         text-xs
                         font-medium
                         mb-4"
            >
              <Sparkles size={14} />

              Espace enseignant
            </div>

            {/* APPELLATION */}

            <h1
              className="text-2xl
                         sm:text-3xl
                         font-bold"
            >
              {utilisateur?.nom
                ? `${appellation} ${utilisateur.nom}`
                : 'Espace enseignant'}
            </h1>

            <p
              className="mt-2
                         text-sm
                         sm:text-base
                         text-blue-100
                         max-w-xl"
            >
              Gérez vos préparations, vos élèves
              et vos évaluations depuis un seul
              endroit.
            </p>

            {/* CLASSE ET SECTION */}

            {utilisateur?.classe_nom && (
              <div
                className="mt-4
                           flex flex-wrap
                           items-center
                           gap-2"
              >
                <span
                  className="inline-flex
                             items-center
                             gap-2
                             px-3 py-1.5
                             rounded-xl
                             bg-white/10
                             text-sm"
                >
                  <GraduationCap size={16} />

                  {utilisateur.classe_nom}
                </span>

                {utilisateur?.section && (
                  <span
                    className="px-3 py-1.5
                               rounded-xl
                               bg-white/10
                               text-sm"
                  >
                    {utilisateur.section}
                  </span>
                )}
              </div>
            )}

          </div>

          <div
            className="hidden
                       lg:flex
                       w-24 h-24
                       rounded-3xl
                       bg-white/10
                       items-center
                       justify-center"
          >
            <GraduationCap
              size={48}
              strokeWidth={1.5}
            />
          </div>

        </div>

      </section>

      {/* =================================================
          DATE
      ================================================= */}

      <div
        className="flex
                   items-center
                   gap-3
                   text-sm
                   text-slate-500"
      >

        <div
          className="w-9 h-9
                     rounded-xl
                     bg-blue-50
                     flex items-center
                     justify-center"
        >
          <CalendarDays
            size={18}
            className="text-blue-600"
          />
        </div>

        <span className="capitalize">
          {aujourdHui}
        </span>

      </div>

      {/* =================================================
          ACCÈS RAPIDES
      ================================================= */}

      <section>

        <div className="mb-4">

          <h2
            className="text-lg
                       font-bold
                       text-slate-900"
          >
            Accès rapides
          </h2>

          <p
            className="mt-1
                       text-sm
                       text-slate-500"
          >
            Accédez rapidement aux principales
            fonctionnalités.
          </p>

        </div>

        <div
          className="grid
                     grid-cols-1
                     sm:grid-cols-3
                     gap-4"
        >

          {/* NOUVELLE PRÉPARATION */}

          <Link
            to="/enseignant/nouvelle-preparation"
            className="group
                       bg-white
                       border border-slate-200
                       rounded-2xl
                       p-5
                       hover:border-blue-300
                       hover:shadow-lg
                       hover:shadow-blue-100/50
                       transition"
          >

            <div
              className="flex
                         items-center
                         justify-between"
            >

              <div
                className="w-11 h-11
                           rounded-xl
                           bg-blue-50
                           flex items-center
                           justify-center"
              >
                <PlusCircle
                  size={22}
                  className="text-blue-600"
                />
              </div>

              <ArrowRight
                size={18}
                className="text-slate-300
                           group-hover:text-blue-600
                           group-hover:translate-x-1
                           transition"
              />

            </div>

            <h3
              className="mt-4
                         font-semibold
                         text-slate-900"
            >
              Nouvelle préparation
            </h3>

            <p
              className="mt-1
                         text-sm
                         text-slate-500"
            >
              Préparer votre prochaine leçon.
            </p>

          </Link>

          {/* ÉLÈVES */}

          <Link
            to="/enseignant/eleves"
            className="group
                       bg-white
                       border border-slate-200
                       rounded-2xl
                       p-5
                       hover:border-emerald-300
                       hover:shadow-lg
                       hover:shadow-emerald-100/50
                       transition"
          >

            <div
              className="flex
                         items-center
                         justify-between"
            >

              <div
                className="w-11 h-11
                           rounded-xl
                           bg-emerald-50
                           flex items-center
                           justify-center"
              >
                <GraduationCap
                  size={22}
                  className="text-emerald-600"
                />
              </div>

              <ArrowRight
                size={18}
                className="text-slate-300
                           group-hover:text-emerald-600
                           group-hover:translate-x-1
                           transition"
              />

            </div>

            <h3
              className="mt-4
                         font-semibold
                         text-slate-900"
            >
              Mes élèves
            </h3>

            <p
              className="mt-1
                         text-sm
                         text-slate-500"
            >
              Gérer la présence et le suivi.
            </p>

          </Link>

          {/* ÉVALUATIONS */}

          <Link
            to="/enseignant/evaluations"
            className="group
                       bg-white
                       border border-slate-200
                       rounded-2xl
                       p-5
                       hover:border-violet-300
                       hover:shadow-lg
                       hover:shadow-violet-100/50
                       transition"
          >

            <div
              className="flex
                         items-center
                         justify-between"
            >

              <div
                className="w-11 h-11
                           rounded-xl
                           bg-violet-50
                           flex items-center
                           justify-center"
              >
                <ClipboardList
                  size={22}
                  className="text-violet-600"
                />
              </div>

              <ArrowRight
                size={18}
                className="text-slate-300
                           group-hover:text-violet-600
                           group-hover:translate-x-1
                           transition"
              />

            </div>

            <h3
              className="mt-4
                         font-semibold
                         text-slate-900"
            >
              Évaluations
            </h3>

            <p
              className="mt-1
                         text-sm
                         text-slate-500"
            >
              Saisir les notes des élèves.
            </p>

          </Link>

        </div>

      </section>

      {/* =================================================
          ACTIVITÉ PÉDAGOGIQUE
      ================================================= */}

      <section
        className="grid
                   grid-cols-1
                   lg:grid-cols-3
                   gap-4"
      >

        {/* CARTE PRINCIPALE */}

        <div
          className="lg:col-span-2
                     bg-white
                     border border-slate-200
                     rounded-2xl
                     p-6"
        >

          <div
            className="flex
                       items-center
                       justify-between"
          >

            <div>

              <p
                className="text-sm
                           font-medium
                           text-blue-600"
              >
                Vue d'ensemble
              </p>

              <h2
                className="mt-1
                           text-lg
                           font-bold
                           text-slate-900"
              >
                Votre activité pédagogique
              </h2>

            </div>

            <BookOpen
              size={24}
              className="text-blue-600"
            />

          </div>

          <div
            className="mt-6
                       grid
                       grid-cols-2
                       sm:grid-cols-4
                       gap-4"
          >

            {/* TOTAL */}

            <div
              className="rounded-xl
                         bg-slate-50
                         p-4"
            >
              <p
                className="text-xs
                           text-slate-500"
              >
                Préparations
              </p>

              <p
                className="mt-2
                           text-2xl
                           font-bold
                           text-slate-900"
              >
                {chargement
                  ? '...'
                  : stats.preparations}
              </p>
            </div>

            {/* SOUMISES */}

            <div
              className="rounded-xl
                         bg-amber-50
                         p-4"
            >
              <p
                className="text-xs
                           text-amber-700"
              >
                En attente
              </p>

              <p
                className="mt-2
                           text-2xl
                           font-bold
                           text-amber-700"
              >
                {chargement
                  ? '...'
                  : stats.soumises}
              </p>
            </div>

            {/* VALIDÉES */}

            <div
              className="rounded-xl
                         bg-green-50
                         p-4"
            >
              <p
                className="text-xs
                           text-green-700"
              >
                Validées
              </p>

              <p
                className="mt-2
                           text-2xl
                           font-bold
                           text-green-700"
              >
                {chargement
                  ? '...'
                  : stats.validees}
              </p>
            </div>

            {/* REJETÉES */}

            <div
              className="rounded-xl
                         bg-red-50
                         p-4"
            >
              <p
                className="text-xs
                           text-red-700"
              >
                À corriger
              </p>

              <p
                className="mt-2
                           text-2xl
                           font-bold
                           text-red-700"
              >
                {chargement
                  ? '...'
                  : stats.rejetees}
              </p>
            </div>

          </div>

          <Link
            to="/enseignant/preparations"
            className="inline-flex
                       items-center
                       gap-2
                       mt-5
                       text-sm
                       font-semibold
                       text-blue-600
                       hover:text-blue-700"
          >
            Voir toutes mes préparations

            <ArrowRight size={16} />
          </Link>

        </div>

        {/* NOTIFICATIONS */}

        <div
          className="bg-white
                     border border-slate-200
                     rounded-2xl
                     p-6"
        >

          <div
            className="flex
                       items-center
                       justify-between"
          >

            <div>

              <p
                className="text-sm
                           font-medium
                           text-blue-600"
              >
                Notifications
              </p>

              <h2
                className="mt-1
                           text-lg
                           font-bold
                           text-slate-900"
              >
                À retenir
              </h2>

            </div>

            <div
              className="w-10 h-10
                         rounded-xl
                         bg-blue-50
                         flex items-center
                         justify-center"
            >
              <Bell
                size={19}
                className="text-blue-600"
              />
            </div>

          </div>

          <div className="mt-5 space-y-3">

            {/* BROUILLONS */}

            {stats.brouillons > 0 && (

              <div
                className="flex
                           items-start
                           gap-3
                           rounded-xl
                           bg-slate-50
                           p-3"
              >
                <Clock
                  size={17}
                  className="mt-0.5
                             text-slate-500"
                />

                <div>

                  <p
                    className="text-sm
                               font-medium
                               text-slate-800"
                  >
                    Préparations en brouillon
                  </p>

                  <p
                    className="mt-0.5
                               text-xs
                               text-slate-500"
                  >
                    {stats.brouillons}{' '}
                    préparation
                    {stats.brouillons > 1
                      ? 's'
                      : ''}{' '}
                    à terminer.
                  </p>

                </div>

              </div>

            )}

            {/* REJETS */}

            {stats.rejetees > 0 && (

              <div
                className="flex
                           items-start
                           gap-3
                           rounded-xl
                           bg-red-50
                           p-3"
              >
                <XCircle
                  size={17}
                  className="mt-0.5
                             text-red-600"
                />

                <div>

                  <p
                    className="text-sm
                               font-medium
                               text-red-800"
                  >
                    Préparation à corriger
                  </p>

                  <p
                    className="mt-0.5
                               text-xs
                               text-red-600"
                  >
                    Une préparation a été rejetée.
                  </p>

                </div>

              </div>

            )}

            {/* VALIDATIONS */}

            {stats.validees > 0 && (

              <div
                className="flex
                           items-start
                           gap-3
                           rounded-xl
                           bg-green-50
                           p-3"
              >
                <CheckCircle
                  size={17}
                  className="mt-0.5
                             text-green-600"
                />

                <div>

                  <p
                    className="text-sm
                               font-medium
                               text-green-800"
                  >
                    Préparations validées
                  </p>

                  <p
                    className="mt-0.5
                               text-xs
                               text-green-600"
                  >
                    {stats.validees}{' '}
                    préparation
                    {stats.validees > 1
                      ? 's'
                      : ''}{' '}
                    validée
                    {stats.validees > 1
                      ? 's'
                      : ''}.
                  </p>

                </div>

              </div>

            )}

            {/* AUCUNE NOTIFICATION */}

            {stats.brouillons === 0 &&
              stats.rejetees === 0 &&
              stats.validees === 0 && (

                <div
                  className="text-center
                             py-5"
                >
                  <CheckCircle
                    size={28}
                    className="mx-auto
                               text-slate-300"
                  />

                  <p
                    className="mt-2
                               text-sm
                               text-slate-500"
                  >
                    Aucune notification importante.
                  </p>
                </div>

              )}

          </div>

        </div>

      </section>

      {/* =================================================
          PROFIL RAPIDE
      ================================================= */}

      <section
        className="bg-white
                   border border-slate-200
                   rounded-2xl
                   p-5"
      >

        <div
          className="flex
                     flex-col
                     sm:flex-row
                     sm:items-center
                     sm:justify-between
                     gap-4"
        >

          <div
            className="flex
                       items-center
                       gap-4"
          >

            <div
              className="w-12 h-12
                         rounded-2xl
                         bg-slate-100
                         flex items-center
                         justify-center"
            >
              <UserRound
                size={23}
                className="text-slate-500"
              />
            </div>

            <div>

              <p
                className="font-semibold
                           text-slate-900"
              >
                {utilisateur?.nom ||
                  'Enseignant'}
              </p>

              <p
                className="text-sm
                           text-slate-500"
              >
                {utilisateur?.classe_nom ||
                  'Classe non affectée'}
              </p>

            </div>

          </div>

          <Link
            to="/enseignant/profil"
            className="inline-flex
                       items-center
                       justify-center
                       gap-2
                       px-4 py-2.5
                       rounded-xl
                       border
                       border-slate-200
                       text-sm
                       font-semibold
                       text-slate-700
                       hover:bg-slate-50
                       transition"
          >
            Mon profil

            <ArrowRight size={16} />
          </Link>

        </div>

      </section>

    </div>
  )
}

export default AccueilEnseignant