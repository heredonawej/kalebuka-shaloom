import { useEffect, useState } from 'react'
import { API_URL } from '../api'
import {
  Users,
  GraduationCap,
  School,
  ClipboardList,
  UserPlus,
} from 'lucide-react'
import { Link } from 'react-router-dom'

function DashboardAdmin() {

  // ===============================
  // STATISTIQUES
  // ===============================

  const [statistiques, setStatistiques] = useState([
    {
      titre: 'Enseignants',
      valeur: 0,
      description: 'Enseignants enregistrés',
      icone: Users,
      couleur: 'indigo',
    },
    {
      titre: 'Élèves',
      valeur: 0,
      description: 'Élèves enregistrés',
      icone: GraduationCap,
      couleur: 'blue',
    },
    {
      titre: 'Classes',
      valeur: 0,
      description: 'Classes disponibles',
      icone: School,
      couleur: 'emerald',
    },
    {
      titre: 'Préparations',
      valeur: 0,
      description: 'Préparations soumises',
      icone: ClipboardList,
      couleur: 'amber',
    },
  ])

  const [chargement, setChargement] = useState(true)

  // ===============================
  // COULEURS
  // ===============================

  const couleurs = {
    indigo: 'bg-indigo-50 text-indigo-600',
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
  }

  // ===============================
  // CHARGER LES STATISTIQUES
  // ===============================

  useEffect(() => {
    chargerStatistiques()
  }, [])

  const chargerStatistiques = async () => {
    try {

      setChargement(true)

      const [
        reponseEnseignants,
        reponseClasses,
        reponsePreparations,
      ] = await Promise.all([
        fetch('${API_URL}/api/admin/enseignants'),
        fetch('${API_URL}/api/classes'),
        fetch('${API_URL}/api/cours'),
      ])

      // ===============================
      // ENSEIGNANTS
      // ===============================

      let enseignants = []

      if (reponseEnseignants.ok) {
        enseignants = await reponseEnseignants.json()
      }

      // ===============================
      // CLASSES + ÉLÈVES
      // ===============================

      let classes = []

      if (reponseClasses.ok) {
        classes = await reponseClasses.json()
      }

      // Calcul du nombre total d'élèves
      const totalEleves = classes.reduce(
        (total, classe) =>
          total + Number(classe.total_eleves || 0),
        0
      )

      // ===============================
      // PRÉPARATIONS
      // ===============================

      let preparations = []

      if (reponsePreparations.ok) {
        preparations = await reponsePreparations.json()
      }

      // Seulement les préparations soumises
      const preparationsSoumises = preparations.filter(
        (preparation) =>
          preparation.statut === 'soumis'
      ).length

      // ===============================
      // MISE À JOUR
      // ===============================

      setStatistiques([
        {
          titre: 'Enseignants',
          valeur: enseignants.length,
          description: 'Enseignants enregistrés',
          icone: Users,
          couleur: 'indigo',
        },
        {
          titre: 'Élèves',
          valeur: totalEleves,
          description: 'Élèves enregistrés',
          icone: GraduationCap,
          couleur: 'blue',
        },
        {
          titre: 'Classes',
          valeur: classes.length,
          description: 'Classes disponibles',
          icone: School,
          couleur: 'emerald',
        },
        {
          titre: 'Préparations',
          valeur: preparationsSoumises,
          description: 'Préparations soumises',
          icone: ClipboardList,
          couleur: 'amber',
        },
      ])

    } catch (erreur) {

      console.error(
        'Erreur chargement statistiques admin :',
        erreur
      )

    } finally {

      setChargement(false)

    }
  }

  return (
    <div className="space-y-6">

      {/* =================================================
          EN-TÊTE
      ================================================= */}

      <section
        className="rounded-3xl
                   bg-gradient-to-r
                   from-indigo-600
                   to-blue-600
                   p-6
                   sm:p-8
                   text-white"
      >

        <div className="max-w-3xl">

          <p
            className="text-indigo-100
                       text-sm
                       font-medium"
          >
            Administration
          </p>

          <h1
            className="text-2xl
                       sm:text-3xl
                       font-bold
                       mt-2"
          >
            Tableau de bord
          </h1>

          <p
            className="mt-2
                       text-indigo-100
                       text-sm
                       sm:text-base"
          >
            Gérez les enseignants, les élèves, les
            classes et le fonctionnement pédagogique
            de Kalebuka Shaloom.
          </p>

        </div>

      </section>

      {/* =================================================
          STATISTIQUES
      ================================================= */}

      <section
        className="grid
                   grid-cols-1
                   sm:grid-cols-2
                   lg:grid-cols-4
                   gap-4"
      >

        {statistiques.map((statistique) => {

          const Icone = statistique.icone

          return (
            <div
              key={statistique.titre}
              className="bg-white
                         border
                         border-slate-200
                         rounded-2xl
                         p-5
                         shadow-sm"
            >

              <div
                className="flex
                           items-start
                           justify-between"
              >

                <div>

                  <p
                    className="text-sm
                               text-slate-500"
                  >
                    {statistique.titre}
                  </p>

                  <p
                    className="text-3xl
                               font-bold
                               text-slate-900
                               mt-2"
                  >
                    {chargement
                      ? '...'
                      : statistique.valeur}
                  </p>

                </div>

                <div
                  className={`w-11
                             h-11
                             rounded-xl
                             flex
                             items-center
                             justify-center
                             ${couleurs[statistique.couleur]}`}
                >
                  <Icone size={21} />
                </div>

              </div>

              <p
                className="text-xs
                           text-slate-400
                           mt-4"
              >
                {statistique.description}
              </p>

            </div>
          )
        })}

      </section>

      {/* =================================================
          ACTIONS RAPIDES
      ================================================= */}

      <section>

        <div
          className="flex
                     items-center
                     justify-between
                     mb-4"
        >

          <div>

            <h2
              className="text-lg
                         font-bold
                         text-slate-900"
            >
              Actions rapides
            </h2>

            <p
              className="text-sm
                         text-slate-500"
            >
              Accédez rapidement aux principales
              fonctions.
            </p>

          </div>

        </div>

        <div
          className="grid
                     grid-cols-1
                     sm:grid-cols-2
                     lg:grid-cols-3
                     gap-4"
        >

          {/* =================================================
              ENSEIGNANTS
          ================================================= */}

          <Link
            to="/admin/enseignants"
            className="bg-white
                       border
                       border-slate-200
                       rounded-2xl
                       p-5
                       hover:border-indigo-300
                       hover:shadow-md
                       transition
                       group"
          >

            <div
              className="w-11
                         h-11
                         rounded-xl
                         bg-indigo-50
                         text-indigo-600
                         flex
                         items-center
                         justify-center
                         group-hover:bg-indigo-100"
            >
              <UserPlus size={21} />
            </div>

            <h3
              className="font-semibold
                         text-slate-900
                         mt-4"
            >
              Ajouter un enseignant
            </h3>

            <p
              className="text-sm
                         text-slate-500
                         mt-1"
            >
              Créer un compte avec un nom et un
              matricule.
            </p>

          </Link>

          {/* =================================================
              ÉLÈVES
          ================================================= */}

          <Link
            to="/admin/eleves"
            className="bg-white
                       border
                       border-slate-200
                       rounded-2xl
                       p-5
                       hover:border-blue-300
                       hover:shadow-md
                       transition
                       group"
          >

            <div
              className="w-11
                         h-11
                         rounded-xl
                         bg-blue-50
                         text-blue-600
                         flex
                         items-center
                         justify-center"
            >
              <GraduationCap size={21} />
            </div>

            <h3
              className="font-semibold
                         text-slate-900
                         mt-4"
            >
              Gérer les élèves
            </h3>

            <p
              className="text-sm
                         text-slate-500
                         mt-1"
            >
              Inscrire et affecter les élèves aux
              classes.
            </p>

          </Link>

          {/* =================================================
              CLASSES
          ================================================= */}

          <Link
            to="/admin/classes"
            className="bg-white
                       border
                       border-slate-200
                       rounded-2xl
                       p-5
                       hover:border-emerald-300
                       hover:shadow-md
                       transition
                       group"
          >

            <div
              className="w-11
                         h-11
                         rounded-xl
                         bg-emerald-50
                         text-emerald-600
                         flex
                         items-center
                         justify-center"
            >
              <School size={21} />
            </div>

            <h3
              className="font-semibold
                         text-slate-900
                         mt-4"
            >
              Gérer les classes
            </h3>

            <p
              className="text-sm
                         text-slate-500
                         mt-1"
            >
              Créer les classes et consulter leurs
              effectifs.
            </p>

          </Link>

        </div>

      </section>

    </div>
  )
}

export default DashboardAdmin