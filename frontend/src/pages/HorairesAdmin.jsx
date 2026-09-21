import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  Clock3,
  Edit3,
  Plus,
  Trash2,
  X,
} from 'lucide-react';

const API_URL = 'https://kalebuka-shaloom.onrender.com/api';

const JOURS = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
];

function HorairesAdmin() {
  const [horaires, setHoraires] = useState([]);
  const [classes, setClasses] = useState([]);

  const [chargement, setChargement] = useState(true);
  const [enregistrement, setEnregistrement] = useState(false);

  const [message, setMessage] = useState('');
  const [erreur, setErreur] = useState('');

  const [horaireModification, setHoraireModification] = useState(null);

  const [formulaire, setFormulaire] = useState({
    classe_id: '',
    jour: 'Lundi',
    heure_debut: '',
    heure_fin: '',
    matiere: '',
  });

  const [filtreClasse, setFiltreClasse] = useState('Toutes');

  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    setChargement(true);
    setErreur('');

    try {
      const [classesResponse, horairesResponse] = await Promise.all([
        fetch(`${API_URL}/classes`),
        fetch(`${API_URL}/horaires`),
      ]);

      if (!classesResponse.ok) {
        throw new Error('Impossible de récupérer les classes.');
      }

      if (!horairesResponse.ok) {
        throw new Error('Impossible de récupérer les horaires.');
      }

      const classesData = await classesResponse.json();
      const horairesData = await horairesResponse.json();

      setClasses(
        Array.isArray(classesData) ? classesData : []
      );

      setHoraires(
        Array.isArray(horairesData) ? horairesData : []
      );
    } catch (error) {
      console.error(error);

      setErreur(
        error.message || 'Erreur lors du chargement.'
      );
    } finally {
      setChargement(false);
    }
  };

  const horairesFiltres = useMemo(() => {
    if (filtreClasse === 'Toutes') {
      return horaires;
    }

    return horaires.filter(
      (horaire) =>
        String(horaire.classe_id) === String(filtreClasse)
    );
  }, [horaires, filtreClasse]);

  const horairesParJour = useMemo(() => {
    return JOURS.reduce((acc, jour) => {
      acc[jour] = horairesFiltres
        .filter((horaire) => horaire.jour === jour)
        .sort((a, b) =>
          String(a.heure_debut).localeCompare(
            String(b.heure_debut)
          )
        );

      return acc;
    }, {});
  }, [horairesFiltres]);

  const modifierChamp = (champ, valeur) => {
    setFormulaire((ancien) => ({
      ...ancien,
      [champ]: valeur,
    }));
  };

  const reinitialiserFormulaire = () => {
    setFormulaire({
      classe_id: '',
      jour: 'Lundi',
      heure_debut: '',
      heure_fin: '',
      matiere: '',
    });

    setHoraireModification(null);
    setMessage('');
    setErreur('');
  };

  const enregistrerHoraire = async (e) => {
    e.preventDefault();

    setMessage('');
    setErreur('');

    if (
      !formulaire.classe_id ||
      !formulaire.jour ||
      !formulaire.heure_debut ||
      !formulaire.heure_fin ||
      !formulaire.matiere.trim()
    ) {
      setErreur('Veuillez remplir tous les champs.');
      return;
    }

    if (formulaire.heure_debut >= formulaire.heure_fin) {
      setErreur(
        "L'heure de fin doit être supérieure à l'heure de début."
      );
      return;
    }

    setEnregistrement(true);

    try {
      const url = horaireModification
        ? `${API_URL}/horaires/${horaireModification.id}`
        : `${API_URL}/horaires`;

      const method = horaireModification ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classe_id: Number(formulaire.classe_id),
          jour: formulaire.jour,
          heure_debut: formulaire.heure_debut,
          heure_fin: formulaire.heure_fin,
          matiere: formulaire.matiere.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.erreur ||
            data.message ||
            "Impossible d'enregistrer l'horaire."
        );
      }

      setMessage(
        horaireModification
          ? 'Horaire modifié avec succès.'
          : 'Horaire ajouté avec succès.'
      );

      reinitialiserFormulaire();

      await chargerDonnees();
    } catch (error) {
      console.error(error);

      setErreur(
        error.message || 'Une erreur est survenue.'
      );
    } finally {
      setEnregistrement(false);
    }
  };

  const modifierHoraire = (horaire) => {
    setHoraireModification(horaire);

    setFormulaire({
      classe_id: String(horaire.classe_id),
      jour: horaire.jour,
      heure_debut: String(horaire.heure_debut).slice(0, 5),
      heure_fin: String(horaire.heure_fin).slice(0, 5),
      matiere: horaire.matiere || '',
    });

    setMessage('');
    setErreur('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const supprimerHoraire = async (horaire) => {
    const confirmation = window.confirm(
      `Voulez-vous supprimer l'horaire "${horaire.matiere}" du ${horaire.jour} ?`
    );

    if (!confirmation) {
      return;
    }

    setMessage('');
    setErreur('');

    try {
      const response = await fetch(
        `${API_URL}/horaires/${horaire.id}`,
        {
          method: 'DELETE',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.erreur ||
            data.message ||
            "Impossible de supprimer l'horaire."
        );
      }

      setMessage('Horaire supprimé avec succès.');

      await chargerDonnees();
    } catch (error) {
      console.error(error);

      setErreur(
        error.message || 'Une erreur est survenue.'
      );
    }
  };

  const obtenirNomClasse = (classeId) => {
    const classe = classes.find(
      (item) =>
        String(item.id) === String(classeId)
    );

    return classe?.nom || 'Classe inconnue';
  };

  if (chargement) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-slate-500">
          Chargement des horaires...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">

      {/* EN-TÊTE */}

      <div>
        <p className="text-sm font-semibold text-blue-600">
          Organisation scolaire
        </p>

        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          Gestion des horaires
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Organisez l'horaire de chaque classe.
        </p>
      </div>

      {/* MESSAGES */}

      {message && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {message}
        </div>
      )}

      {erreur && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {erreur}
        </div>
      )}

      {/* FORMULAIRE */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="mb-5 flex items-center justify-between">

          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">

              {horaireModification ? (
                <>
                  <Edit3 size={20} />
                  Modifier un horaire
                </>
              ) : (
                <>
                  <Plus size={20} />
                  Ajouter un horaire
                </>
              )}

            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Définissez l'horaire de la classe.
            </p>
          </div>

          {horaireModification && (
            <button
              type="button"
              onClick={reinitialiserFormulaire}
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
            >
              <X size={20} />
            </button>
          )}

        </div>

        <form
          onSubmit={enregistrerHoraire}
          className="grid gap-4 md:grid-cols-2"
        >

          {/* CLASSE */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Classe *
            </label>

            <select
              value={formulaire.classe_id}
              onChange={(e) =>
                modifierChamp(
                  'classe_id',
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
            >
              <option value="">
                Sélectionner une classe
              </option>

              {classes.map((classe) => (
                <option
                  key={classe.id}
                  value={classe.id}
                >
                  {classe.nom}
                  {classe.section
                    ? ` — ${classe.section}`
                    : ''}
                </option>
              ))}
            </select>
          </div>

          {/* JOUR */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Jour *
            </label>

            <select
              value={formulaire.jour}
              onChange={(e) =>
                modifierChamp(
                  'jour',
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
            >
              {JOURS.map((jour) => (
                <option
                  key={jour}
                  value={jour}
                >
                  {jour}
                </option>
              ))}
            </select>
          </div>

          {/* MATIERE */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Matière *
            </label>

            <input
              type="text"
              value={formulaire.matiere}
              onChange={(e) =>
                modifierChamp(
                  'matiere',
                  e.target.value
                )
              }
              placeholder="Ex : Mathématiques"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          {/* HEURE DEBUT */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Heure de début *
            </label>

            <input
              type="time"
              value={formulaire.heure_debut}
              onChange={(e) =>
                modifierChamp(
                  'heure_debut',
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          {/* HEURE FIN */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Heure de fin *
            </label>

            <input
              type="time"
              value={formulaire.heure_fin}
              onChange={(e) =>
                modifierChamp(
                  'heure_fin',
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          {/* BOUTONS */}

          <div className="flex flex-col gap-3 pt-2 sm:flex-row md:col-span-2">

            <button
              type="submit"
              disabled={enregistrement}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {horaireModification ? (
                <Edit3 size={18} />
              ) : (
                <Plus size={18} />
              )}

              {enregistrement
                ? 'Enregistrement...'
                : horaireModification
                  ? "Modifier l'horaire"
                  : "Ajouter l'horaire"}
            </button>

            {horaireModification && (
              <button
                type="button"
                onClick={reinitialiserFormulaire}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Annuler
              </button>
            )}

          </div>

        </form>
      </div>

      {/* FILTRE */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Horaires enregistrés
          </h2>

          <p className="text-sm text-slate-500">
            Consultez les horaires des classes.
          </p>
        </div>

        <select
          value={filtreClasse}
          onChange={(e) =>
            setFiltreClasse(e.target.value)
          }
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
        >
          <option value="Toutes">
            Toutes les classes
          </option>

          {classes.map((classe) => (
            <option
              key={classe.id}
              value={classe.id}
            >
              {classe.nom}
            </option>
          ))}
        </select>

      </div>

      {/* HORAIRES PAR JOUR */}

      <div className="grid gap-5 lg:grid-cols-2">

        {JOURS.map((jour) => {

          const horairesJour =
            horairesParJour[jour] || [];

          return (
            <div
              key={jour}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >

              <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-5 py-4">

                <div className="rounded-xl bg-blue-600 p-2 text-white">
                  <CalendarDays size={18} />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900">
                    {jour}
                  </h3>

                  <p className="text-xs text-slate-500">
                    {horairesJour.length}{' '}
                    {horairesJour.length > 1
                      ? 'cours'
                      : 'cours'}
                  </p>
                </div>

              </div>

              {horairesJour.length === 0 ? (

                <div className="p-6 text-center text-sm text-slate-400">
                  Aucun cours prévu.
                </div>

              ) : (

                <div className="divide-y divide-slate-100">

                  {horairesJour.map((horaire) => (

                    <div
                      key={horaire.id}
                      className="p-4 transition hover:bg-slate-50"
                    >

                      <div className="flex items-start justify-between gap-4">

                        <div className="flex min-w-0 gap-3">

                          <div className="mt-0.5 rounded-xl bg-blue-50 p-2 text-blue-600">
                            <Clock3 size={18} />
                          </div>

                          <div className="min-w-0">

                            <p className="font-bold text-slate-900">
                              {horaire.matiere}
                            </p>

                            <p className="mt-1 text-sm font-medium text-blue-600">
                              {String(
                                horaire.heure_debut
                              ).slice(0, 5)}

                              {' — '}

                              {String(
                                horaire.heure_fin
                              ).slice(0, 5)}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {obtenirNomClasse(
                                horaire.classe_id
                              )}
                            </p>

                          </div>

                        </div>

                        <div className="flex shrink-0 gap-1">

                          <button
                            type="button"
                            onClick={() =>
                              modifierHoraire(
                                horaire
                              )
                            }
                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-600"
                            title="Modifier"
                          >
                            <Edit3 size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              supprimerHoraire(
                                horaire
                              )
                            }
                            className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                            title="Supprimer"
                          >
                            <Trash2 size={17} />
                          </button>

                        </div>

                      </div>

                    </div>

                  ))}

                </div>

              )}

            </div>
          );
        })}

      </div>

    </div>
  );
}

export default HorairesAdmin;