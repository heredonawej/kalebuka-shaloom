import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  GraduationCap,
  School,
  ClipboardList,
  UserPlus,
  ArrowRight,
  FileText,
  Settings,
  BookOpen,
  CheckCircle2,
  Clock3,
  LayoutDashboard,
  RefreshCw,
  ChevronRight,
  CalendarDays,
  BarChart3,
  Layers3,
  UserRound,
  TrendingUp,
} from "lucide-react";

const API_URL = "https://kalebuka-shaloom.onrender.com/api";

function DashboardAdmin() {
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  const [donnees, setDonnees] = useState({
    enseignants: [],
    classes: [],
    cours: [],
  });

  const [admin, setAdmin] = useState(null);

  // =========================================================
  // ADMIN CONNECTÉ
  // =========================================================
  useEffect(() => {
    try {
      const utilisateur = localStorage.getItem("utilisateur");

      if (utilisateur) {
        setAdmin(JSON.parse(utilisateur));
      }
    } catch (error) {
      console.error("Erreur utilisateur :", error);
    }
  }, []);

  // =========================================================
  // CHARGEMENT DES DONNÉES
  // =========================================================
  const chargerStatistiques = async () => {
    try {
      setChargement(true);
      setErreur("");

      const [enseignantsRes, classesRes, coursRes] = await Promise.all([
        fetch(`${API_URL}/admin/enseignants`),
        fetch(`${API_URL}/classes`),
        fetch(`${API_URL}/cours`),
      ]);

      if (!enseignantsRes.ok) {
        throw new Error("Impossible de récupérer les enseignants.");
      }

      if (!classesRes.ok) {
        throw new Error("Impossible de récupérer les classes.");
      }

      if (!coursRes.ok) {
        throw new Error("Impossible de récupérer les préparations.");
      }

      const enseignants = await enseignantsRes.json();
      const classes = await classesRes.json();
      const cours = await coursRes.json();

      setDonnees({
        enseignants: Array.isArray(enseignants) ? enseignants : [],
        classes: Array.isArray(classes) ? classes : [],
        cours: Array.isArray(cours) ? cours : [],
      });
    } catch (error) {
      console.error(error);
      setErreur(error.message || "Une erreur est survenue.");
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    chargerStatistiques();
  }, []);

  // =========================================================
  // STATISTIQUES
  // =========================================================
  const statistiques = useMemo(() => {
    const totalEleves = donnees.classes.reduce(
      (total, classe) => total + Number(classe.total_eleves || 0),
      0
    );

    const preparationsSoumises = donnees.cours.filter(
      (cours) => cours.statut === "soumis"
    ).length;

    const preparationsValidees = donnees.cours.filter(
      (cours) => cours.statut === "valide"
    ).length;

    const preparationsRejetees = donnees.cours.filter(
      (cours) => cours.statut === "rejete"
    ).length;

    return {
      enseignants: donnees.enseignants.length,
      eleves: totalEleves,
      classes: donnees.classes.length,
      preparations: preparationsSoumises,
      validees: preparationsValidees,
      rejetees: preparationsRejetees,
    };
  }, [donnees]);

  // =========================================================
  // SECTIONS
  // =========================================================
  const sections = useMemo(() => {
    const nomsSections = ["Maternelle", "Primaire", "Secondaire"];

    return nomsSections.map((nom) => {
      const classesSection = donnees.classes.filter(
        (classe) =>
          String(classe.section || "").toLowerCase() ===
          nom.toLowerCase()
      );

      const enseignantsSection = donnees.enseignants.filter(
        (enseignant) =>
          String(enseignant.section || "").toLowerCase() ===
          nom.toLowerCase()
      );

      const elevesSection = classesSection.reduce(
        (total, classe) => total + Number(classe.total_eleves || 0),
        0
      );

      return {
        nom,
        classes: classesSection.length,
        enseignants: enseignantsSection.length,
        eleves: elevesSection,
      };
    });
  }, [donnees]);

  // =========================================================
  // DATE
  // =========================================================
  const dateActuelle = new Date();

  const dateFormatee = dateActuelle.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // =========================================================
  // NOM ADMIN
  // =========================================================
  const nomAdmin =
    admin?.nom_complet ||
    admin?.nom ||
    admin?.prenom ||
    "Administrateur";

  // =========================================================
  // CARTES STATISTIQUES
  // =========================================================
  const cartesStats = [
    {
      titre: "Enseignants",
      valeur: statistiques.enseignants,
      description: "Personnel enseignant",
      icon: Users,
      bg: "bg-indigo-50",
      text: "text-indigo-600",
      lien: "/admin/enseignants",
    },
    {
      titre: "Élèves",
      valeur: statistiques.eleves,
      description: "Élèves enregistrés",
      icon: GraduationCap,
      bg: "bg-blue-50",
      text: "text-blue-600",
      lien: "/admin/eleves",
    },
    {
      titre: "Classes",
      valeur: statistiques.classes,
      description: "Classes configurées",
      icon: School,
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      lien: "/admin/classes",
    },
    {
      titre: "Préparations",
      valeur: statistiques.preparations,
      description: "À vérifier",
      icon: ClipboardList,
      bg: "bg-amber-50",
      text: "text-amber-600",
      lien: "/admin/preparations",
    },
  ];

  // =========================================================
  // CHARGEMENT
  // =========================================================
  if (chargement) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
        <div className="mx-auto flex min-h-[75vh] max-w-7xl items-center justify-center">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100">
              <RefreshCw
                size={28}
                className="animate-spin text-indigo-600"
              />
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-800">
              Chargement du tableau de bord
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Veuillez patienter...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERREUR
  // =========================================================
  if (erreur) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
        <div className="mx-auto flex min-h-[75vh] max-w-2xl items-center justify-center">
          <div className="w-full rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100">
              <ClipboardList size={28} className="text-red-600" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-800">
              Impossible de charger le tableau de bord
            </h2>

            <p className="mt-2 text-sm text-slate-500">{erreur}</p>

            <button
              onClick={chargerStatistiques}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <RefreshCw size={17} />
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // DASHBOARD
  // =========================================================
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl space-y-7 p-4 sm:p-6 lg:p-8">

        {/* =====================================================
            HERO
        ====================================================== */}
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-indigo-700 via-indigo-600 to-blue-600 p-6 text-white shadow-xl sm:p-8 lg:p-10">
          
          {/* décor */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10" />
          <div className="absolute -bottom-28 right-28 h-72 w-72 rounded-full bg-white/5" />
          <div className="absolute right-1/3 top-10 h-24 w-24 rounded-full bg-blue-300/10" />

          <div className="relative z-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

              <div className="max-w-3xl">

                {/* Badge */}
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold backdrop-blur-md">
                  <School size={15} />
                  KALÉBUKA SHALOOM
                </div>

                <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                  Tableau de bord
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-100 sm:text-base">
                  Gérez votre établissement, suivez les enseignants,
                  les élèves, les classes et les préparations scolaires
                  depuis un seul espace.
                </p>

                {/* Infos */}
                <div className="mt-6 flex flex-wrap gap-3">

                  <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs backdrop-blur-sm sm:text-sm">
                    <UserRound size={16} />
                    <span>{nomAdmin}</span>
                  </div>

                  <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs capitalize backdrop-blur-sm sm:text-sm">
                    <CalendarDays size={16} />
                    <span>{dateFormatee}</span>
                  </div>

                </div>
              </div>

              {/* Icône desktop */}
              <div className="hidden lg:flex">
                <div className="flex h-32 w-32 items-center justify-center rounded-[30px] border border-white/20 bg-white/10 shadow-lg backdrop-blur-md">
                  <LayoutDashboard
                    size={62}
                    strokeWidth={1.4}
                  />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* =====================================================
            STATISTIQUES
        ====================================================== */}
        <section>

          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3
                  size={20}
                  className="text-indigo-600"
                />

                <h2 className="text-xl font-extrabold text-slate-800">
                  Vue d’ensemble
                </h2>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Les principales données de l'établissement
              </p>
            </div>

            <button
              onClick={chargerStatistiques}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600"
              title="Actualiser les données"
            >
              <RefreshCw size={17} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {cartesStats.map((stat) => {
              const Icon = stat.icon;

              return (
                <Link
                  key={stat.titre}
                  to={stat.lien}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-slate-50 transition group-hover:scale-125" />

                  <div className="relative">

                    <div className="flex items-start justify-between">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.bg}`}
                      >
                        <Icon
                          size={23}
                          className={stat.text}
                        />
                      </div>

                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-300 transition group-hover:bg-indigo-50 group-hover:text-indigo-600">
                        <ChevronRight size={17} />
                      </div>
                    </div>

                    <p className="mt-5 text-sm font-semibold text-slate-500">
                      {stat.titre}
                    </p>

                    <p className="mt-1 text-4xl font-black tracking-tight text-slate-800">
                      {stat.valeur}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {stat.description}
                    </p>

                  </div>
                </Link>
              );
            })}

          </div>
        </section>

        {/* =====================================================
            ACTIONS RAPIDES
        ====================================================== */}
        <section>

          <div className="mb-5">
            <h2 className="text-xl font-extrabold text-slate-800">
              Actions rapides
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Accédez rapidement aux principales fonctionnalités
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <Link
              to="/admin/enseignants"
              className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                <UserPlus size={22} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-800">
                  Enseignants
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Ajouter et gérer
                </p>
              </div>

              <ArrowRight
                size={18}
                className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-indigo-600"
              />
            </Link>

            <Link
              to="/admin/eleves"
              className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                <GraduationCap size={22} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-800">
                  Élèves
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Gérer les élèves
                </p>
              </div>

              <ArrowRight
                size={18}
                className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600"
              />
            </Link>

            <Link
              to="/admin/classes"
              className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <School size={22} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-800">
                  Classes
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Gérer les classes
                </p>
              </div>

              <ArrowRight
                size={18}
                className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-emerald-600"
              />
            </Link>

            <Link
              to="/admin/rapports"
              className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-purple-600">
                <BarChart3 size={22} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-800">
                  Rapports
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Consulter les rapports
                </p>
              </div>

              <ArrowRight
                size={18}
                className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-purple-600"
              />
            </Link>

          </div>
        </section>

        {/* =====================================================
            SECTIONS SCOLAIRES
        ====================================================== */}
        <section>

          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
              <Layers3 size={21} />
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-slate-800">
                Sections scolaires
              </h2>

              <p className="text-sm text-slate-500">
                Répartition de l'établissement
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            {sections.map((section) => {

              const couleurs = {
                Maternelle: {
                  bg: "bg-pink-50",
                  icon: "bg-pink-100 text-pink-600",
                  badge: "bg-pink-50 text-pink-700",
                },

                Primaire: {
                  bg: "bg-blue-50",
                  icon: "bg-blue-100 text-blue-600",
                  badge: "bg-blue-50 text-blue-700",
                },

                Secondaire: {
                  bg: "bg-purple-50",
                  icon: "bg-purple-100 text-purple-600",
                  badge: "bg-purple-50 text-purple-700",
                },
              };

              const couleur =
                couleurs[section.nom] || couleurs.Primaire;

              return (
                <div
                  key={section.nom}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className={`h-1.5 ${couleur.bg}`} />

                  <div className="p-5">

                    <div className="flex items-center justify-between">

                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${couleur.icon}`}
                        >
                          <BookOpen size={21} />
                        </div>

                        <div>
                          <h3 className="font-extrabold text-slate-800">
                            {section.nom}
                          </h3>

                          <span
                            className={`mt-1 inline-flex rounded-full px-2 py-1 text-[10px] font-bold ${couleur.badge}`}
                          >
                            Section scolaire
                          </span>
                        </div>
                      </div>

                      <ChevronRight
                        size={18}
                        className="text-slate-300 transition group-hover:translate-x-1"
                      />
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-2">

                      <div className="rounded-xl bg-slate-50 p-3 text-center">
                        <p className="text-xl font-black text-slate-800">
                          {section.classes}
                        </p>

                        <p className="mt-1 text-[10px] font-medium text-slate-500">
                          Classes
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3 text-center">
                        <p className="text-xl font-black text-slate-800">
                          {section.enseignants}
                        </p>

                        <p className="mt-1 text-[10px] font-medium text-slate-500">
                          Enseignants
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3 text-center">
                        <p className="text-xl font-black text-slate-800">
                          {section.eleves}
                        </p>

                        <p className="mt-1 text-[10px] font-medium text-slate-500">
                          Élèves
                        </p>
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}

          </div>
        </section>

        {/* =====================================================
            SUIVI DES PRÉPARATIONS
        ====================================================== */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* Préparations à vérifier */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

            <div className="flex items-start justify-between gap-4">

              <div className="flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                  <Clock3 size={22} />
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-800">
                    Préparations à vérifier
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Préparations envoyées par les enseignants
                  </p>
                </div>

              </div>

              <Link
                to="/admin/preparations"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 sm:text-sm"
              >
                Voir tout
              </Link>

            </div>

            <div className="mt-6 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 p-5">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm font-semibold text-amber-800">
                    En attente de validation
                  </p>

                  <p className="mt-1 text-4xl font-black text-amber-700">
                    {statistiques.preparations}
                  </p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-sm">
                  <ClipboardList size={25} />
                </div>

              </div>

            </div>

            <Link
              to="/admin/preparations"
              className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              Consulter les préparations
              <ArrowRight size={17} />
            </Link>

          </div>

          {/* État global */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                <TrendingUp size={22} />
              </div>

              <div>
                <h3 className="font-extrabold text-slate-800">
                  Suivi des préparations
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  État global des documents
                </p>
              </div>

            </div>

            <div className="mt-6 space-y-3">

              <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3">

                <div className="flex items-center gap-3">
                  <CheckCircle2
                    size={19}
                    className="text-emerald-600"
                  />

                  <span className="text-sm font-semibold text-emerald-800">
                    Validées
                  </span>
                </div>

                <span className="font-black text-emerald-700">
                  {statistiques.validees}
                </span>

              </div>

              <div className="flex items-center justify-between rounded-xl bg-amber-50 px-4 py-3">

                <div className="flex items-center gap-3">
                  <Clock3
                    size={19}
                    className="text-amber-600"
                  />

                  <span className="text-sm font-semibold text-amber-800">
                    Soumises
                  </span>
                </div>

                <span className="font-black text-amber-700">
                  {statistiques.preparations}
                </span>

              </div>

              <div className="flex items-center justify-between rounded-xl bg-red-50 px-4 py-3">

                <div className="flex items-center gap-3">
                  <FileText
                    size={19}
                    className="text-red-600"
                  />

                  <span className="text-sm font-semibold text-red-800">
                    Rejetées
                  </span>
                </div>

                <span className="font-black text-red-700">
                  {statistiques.rejetees}
                </span>

              </div>

            </div>
          </div>

        </section>

        {/* =====================================================
            FOOTER
        ====================================================== */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <Settings size={20} />
              </div>

              <div>
                <p className="font-bold text-slate-800">
                  Administration Kalebuka Shaloom
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Gestion centralisée de l'établissement
                </p>
              </div>

            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Système opérationnel
            </div>

          </div>

        </section>

      </div>
    </div>
  );
}

export default DashboardAdmin;