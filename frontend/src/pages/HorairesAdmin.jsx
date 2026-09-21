import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  Clock3,
  Save,
  RefreshCw,
  CheckCircle2,
  Trash2,
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

const CRENEAUX = [
  { heure_debut: '07:30', heure_fin: '08:15' },
  { heure_debut: '08:15', heure_fin: '09:00' },
  { heure_debut: '09:00', heure_fin: '09:45' },

  // Récréation automatique
  { recreation: true, heure_debut: '09:45', heure_fin: '10:00' },

  { heure_debut: '10:00', heure_fin: '10:45' },
  { heure_debut: '10:45', heure_fin: '11:30' },
  { heure_debut: '11:30', heure_fin: '12:15' },
];

function HorairesAdmin() {
  const [classes, setClasses] = useState([]);
  const [classeId, setClasseId] = useState('');
  const [horaires, setHoraires] = useState({});
  const [chargement, setChargement] = useState(false);
  const [enregistrement, setEnregistrement] = useState(false);
  const [message, setMessage] = useState('');
  const [erreur, setErreur] = useState('');

  /*
   * Charger les classes
   */
  const chargerClasses = async () => {
    try {
      setChargement(true);
      setErreur('');

      const response = await fetch(`${API_URL}/classes`);

      if (!response.ok) {
        throw new Error('Impossible de récupérer les classes.');
      }

      const data = await response.json();

      setClasses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setErreur(error.message);
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    chargerClasses();
  }, []);

  /*
   * Charger l'emploi du temps de la classe sélectionnée
   */
  const chargerHoraireClasse = async (id) => {
    if (!id) {
      setHoraires({});
      return;
    }

    try {
      setChargement(true);
      setErreur('');
      setMessage('');

      const response = await fetch(
        `${API_URL}/horaires/classe/${id}`
      );

      if (!response.ok) {
        throw new Error(
          "Impossible de récupérer l'emploi du temps."
        );
      }

      const data = await response.json();

      const grille = {};

      data.forEach((horaire) => {
        const cle = `${horaire.jour}_${horaire.heure_debut}`;

        grille[cle] = horaire.matiere;
      });

      setHoraires(grille);
    } catch (error) {
      console.error(error);
      setErreur(error.message);
      setHoraires({});
    } finally {
      setChargement(false);
    }
  };

  /*
   * Changement de classe
   */
  const handleClasseChange = async (event) => {
    const id = event.target.value;

    setClasseId(id);
    await chargerHoraireClasse(id);
  };

  /*
   * Modifier une case
   */
  const modifierMatiere = (jour, heure, valeur) => {
    const cle = `${jour}_${heure}`;

    setHoraires((ancien) => ({
      ...ancien,
      [cle]: valeur,
    }));
  };

  /*
   * Enregistrer toute la grille
   */
  const enregistrerHoraire = async () => {
    if (!classeId) {
      setErreur('Veuillez sélectionner une classe.');
      return;
    }

    try {
      setEnregistrement(true);
      setErreur('');
      setMessage('');

      const grille = [];

      JOURS.forEach((jour) => {
        CRENEAUX.forEach((creneau) => {
          if (creneau.recreation) return;

          const cle = `${jour}_${creneau.heure_debut}`;
          const matiere = horaires[cle]?.trim();

          if (matiere) {
            grille.push({
              jour,
              heure_debut: creneau.heure_debut,
              heure_fin: creneau.heure_fin,
              matiere,
            });
          }
        });
      });

      const response = await fetch(
        `${API_URL}/horaires/grille`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            classe_id: classeId,
            horaires: grille,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.erreur ||
            "Impossible d'enregistrer l'emploi du temps."
        );
      }

      setMessage('Emploi du temps enregistré avec succès.');
    } catch (error) {
      console.error(error);
      setErreur(error.message);
    } finally {
      setEnregistrement(false);
    }
  };

  /*
   * Supprimer l'emploi du temps
   */
  const supprimerHoraire = async () => {
    if (!classeId) return;

    const confirmation = window.confirm(
      "Voulez-vous vraiment supprimer tout l'emploi du temps de cette classe ?"
    );

    if (!confirmation) return;

    try {
      setChargement(true);
      setErreur('');
      setMessage('');

      const response = await fetch(
        `${API_URL}/horaires/classe/${classeId}`,
        {
          method: 'DELETE',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.erreur ||
            "Impossible de supprimer l'emploi du temps."
        );
      }

      setHoraires({});
      setMessage('Emploi du temps supprimé.');
    } catch (error) {
      console.error(error);
      setErreur(error.message);
    } finally {
      setChargement(false);
    }
  };

  const classeSelectionnee = useMemo(() => {
    return classes.find(
      (classe) => String(classe.id) === String(classeId)
    );
  }, [classes, classeId]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-[1500px]">

        {/* EN-TÊTE */}
        <div className="mb-6 rounded-3xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 p-6 text-white shadow-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <div className="rounded-2xl bg-white/20 p-3">
                  <CalendarDays size={28} />
                </div>

                <div>
                  <h1 className="text-2xl font-bold md:text-3xl">
                    Emploi du temps
                  </h1>

                  <p className="text-sm text-blue-100">
                    Organisation des cours par classe
                  </p>
                </div>
              </div>

              <p className="max-w-2xl text-sm leading-6 text-blue-50">
                Sélectionnez une classe puis complétez directement
                les matières dans la grille.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-3">
              <Clock3 size={20} />

              <div>
                <p className="text-xs text-blue-100">
                  Durée d'un cours
                </p>

                <p className="font-bold">
                  45 minutes
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CHOIX DE LA CLASSE */}
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
              <CalendarDays size={21} />
            </div>

            <div>
              <h2 className="font-bold text-slate-800">
                Choisir une classe
              </h2>

              <p className="text-sm text-slate-500">
                L'emploi du temps sera enregistré pour cette classe.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="w-full md:max-w-md">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Classe
              </label>

              <select
                value={classeId}
                onChange={handleClasseChange}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              >
                <option value="">
                  -- Sélectionner une classe --
                </option>

                {classes.map((classe) => (
                  <option key={classe.id} value={classe.id}>
                    {classe.nom}
                    {classe.section
                      ? ` — ${classe.section}`
                      : ''}
                  </option>
                ))}
              </select>
            </div>

            {classeSelectionnee && (
              <div className="rounded-2xl bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
                <span className="font-semibold">
                  Classe sélectionnée :
                </span>{' '}
                {classeSelectionnee.nom}
              </div>
            )}
          </div>
        </div>

        {/* MESSAGES */}
        {message && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
            <CheckCircle2 size={20} />
            {message}
          </div>
        )}

        {erreur && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {erreur}
          </div>
        )}

        {/* GRILLE */}
        {!classeId ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <CalendarDays
              size={48}
              className="mx-auto mb-4 text-slate-300"
            />

            <h3 className="mb-2 text-lg font-bold text-slate-700">
              Sélectionnez une classe
            </h3>

            <p className="text-sm text-slate-500">
              La grille de l'emploi du temps apparaîtra ici.
            </p>
          </div>
        ) : (
          <>
            {/* GRILLE RESPONSIVE */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] border-collapse">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="sticky left-0 z-10 w-[145px] border-b border-r border-slate-200 bg-slate-100 px-4 py-4 text-left text-sm font-bold text-slate-700">
                        Heure
                      </th>

                      {JOURS.map((jour) => (
                        <th
                          key={jour}
                          className="border-b border-r border-slate-200 px-4 py-4 text-center text-sm font-bold text-slate-700"
                        >
                          {jour}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {CRENEAUX.map((creneau, index) => {
                      if (creneau.recreation) {
                        return (
                          <tr key={`recreation-${index}`}>
                            <td
                              colSpan={7}
                              className="border-b border-slate-200 bg-amber-50 px-4 py-3 text-center"
                            >
                              <div className="flex items-center justify-center gap-2 font-bold text-amber-700">
                                <Clock3 size={18} />
                                RÉCRÉATION
                                <span className="font-normal">
                                  ({creneau.heure_debut} –{' '}
                                  {creneau.heure_fin})
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      }

                      return (
                        <tr
                          key={`${creneau.heure_debut}-${creneau.heure_fin}`}
                          className="hover:bg-slate-50"
                        >
                          <td className="sticky left-0 z-10 border-b border-r border-slate-200 bg-white px-4 py-3">
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                              <Clock3
                                size={16}
                                className="text-indigo-500"
                              />

                              <span>
                                {creneau.heure_debut}
                                <br />
                                <span className="font-normal text-slate-400">
                                  {creneau.heure_fin}
                                </span>
                              </span>
                            </div>
                          </td>

                          {JOURS.map((jour) => {
                            const cle = `${jour}_${creneau.heure_debut}`;

                            return (
                              <td
                                key={cle}
                                className="border-b border-r border-slate-200 p-2"
                              >
                                <input
                                  type="text"
                                  value={horaires[cle] || ''}
                                  onChange={(e) =>
                                    modifierMatiere(
                                      jour,
                                      creneau.heure_debut,
                                      e.target.value
                                    )
                                  }
                                  placeholder="Matière..."
                                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-center text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                                />
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* BOUTONS */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={supprimerHoraire}
                disabled={chargement || enregistrement}
                className="flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={18} />
                Vider l'emploi du temps
              </button>

              <button
                type="button"
                onClick={() => chargerHoraireClasse(classeId)}
                disabled={chargement || enregistrement}
                className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw size={18} />
                Actualiser
              </button>

              <button
                type="button"
                onClick={enregistrerHoraire}
                disabled={enregistrement}
                className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save size={18} />

                {enregistrement
                  ? 'Enregistrement...'
                  : "Enregistrer l'emploi du temps"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default HorairesAdmin;