import express from 'express';
import pool from '../db.js';

const router = express.Router();

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
  { heure_debut: '10:00', heure_fin: '10:45' },
  { heure_debut: '10:45', heure_fin: '11:30' },
  { heure_debut: '11:30', heure_fin: '12:15' },
];

/*
  GET : récupérer l'emploi du temps d'une classe
*/
router.get('/classe/:classeId', async (req, res) => {
  try {
    const { classeId } = req.params;

    const resultat = await pool.query(
      `SELECT id, classe_id, jour, heure_debut, heure_fin, matiere
       FROM horaires
       WHERE classe_id = $1
       ORDER BY
         CASE jour
           WHEN 'Lundi' THEN 1
           WHEN 'Mardi' THEN 2
           WHEN 'Mercredi' THEN 3
           WHEN 'Jeudi' THEN 4
           WHEN 'Vendredi' THEN 5
           WHEN 'Samedi' THEN 6
         END,
         heure_debut`,
      [classeId]
    );

    res.json(resultat.rows);
  } catch (error) {
    console.error('Erreur récupération horaires :', error);
    res.status(500).json({
      erreur: 'Impossible de récupérer les horaires.',
    });
  }
});

/*
  POST : enregistrer toute la grille d'une classe
*/
router.post('/grille', async (req, res) => {
  const client = await pool.connect();

  try {
    const { classe_id, horaires } = req.body;

    if (!classe_id) {
      return res.status(400).json({
        erreur: 'La classe est obligatoire.',
      });
    }

    if (!Array.isArray(horaires)) {
      return res.status(400).json({
        erreur: 'Les horaires doivent être envoyés sous forme de tableau.',
      });
    }

    const classe = await client.query(
      `SELECT id FROM classes WHERE id = $1`,
      [classe_id]
    );

    if (classe.rows.length === 0) {
      return res.status(404).json({
        erreur: 'Classe introuvable.',
      });
    }

    await client.query('BEGIN');

    // On supprime l'ancien emploi du temps de cette classe
    await client.query(
      `DELETE FROM horaires WHERE classe_id = $1`,
      [classe_id]
    );

    // On enregistre uniquement les cases remplies
    for (const horaire of horaires) {
      const {
        jour,
        heure_debut,
        heure_fin,
        matiere,
      } = horaire;

      if (!JOURS.includes(jour)) continue;
      if (!heure_debut || !heure_fin) continue;
      if (!matiere || !matiere.trim()) continue;

      await client.query(
        `INSERT INTO horaires
          (classe_id, jour, heure_debut, heure_fin, matiere)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          classe_id,
          jour,
          heure_debut,
          heure_fin,
          matiere.trim(),
        ]
      );
    }

    await client.query('COMMIT');

    res.json({
      message: 'Emploi du temps enregistré avec succès.',
    });
  } catch (error) {
    await client.query('ROLLBACK');

    console.error('Erreur enregistrement grille :', error);

    res.status(500).json({
      erreur: "Impossible d'enregistrer l'emploi du temps.",
    });
  } finally {
    client.release();
  }
});

/*
  DELETE : supprimer tout l'emploi du temps d'une classe
*/
router.delete('/classe/:classeId', async (req, res) => {
  try {
    const { classeId } = req.params;

    await pool.query(
      `DELETE FROM horaires WHERE classe_id = $1`,
      [classeId]
    );

    res.json({
      message: 'Emploi du temps supprimé avec succès.',
    });
  } catch (error) {
    console.error('Erreur suppression horaires :', error);

    res.status(500).json({
      erreur: "Impossible de supprimer l'emploi du temps.",
    });
  }
});

export default router;