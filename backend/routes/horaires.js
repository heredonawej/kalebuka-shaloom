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

/* =========================================================
   AJOUTER UN HORAIRE
========================================================= */

router.post('/', async (req, res) => {
  try {
    const {
      classe_id,
      jour,
      heure_debut,
      heure_fin,
      matiere,
    } = req.body;

    if (
      !classe_id ||
      !jour ||
      !heure_debut ||
      !heure_fin ||
      !matiere
    ) {
      return res.status(400).json({
        erreur: 'Tous les champs sont obligatoires.',
      });
    }

    if (!JOURS.includes(jour)) {
      return res.status(400).json({
        erreur: 'Jour invalide.',
      });
    }

    if (heure_debut >= heure_fin) {
      return res.status(400).json({
        erreur: "L'heure de fin doit être après l'heure de début.",
      });
    }

    const classe = await pool.query(
      `SELECT id FROM classes WHERE id = $1`,
      [classe_id]
    );

    if (classe.rows.length === 0) {
      return res.status(404).json({
        erreur: 'Classe introuvable.',
      });
    }

    const resultat = await pool.query(
      `
      INSERT INTO horaires
        (classe_id, jour, heure_debut, heure_fin, matiere)
      VALUES
        ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        classe_id,
        jour,
        heure_debut,
        heure_fin,
        matiere.trim(),
      ]
    );

    res.status(201).json(resultat.rows[0]);
  } catch (error) {
    console.error('Erreur ajout horaire :', error);

    res.status(500).json({
      erreur: "Erreur serveur lors de l'ajout de l'horaire.",
    });
  }
});

/* =========================================================
   HORAIRES D'UNE CLASSE
========================================================= */

router.get('/classe/:classeId', async (req, res) => {
  try {
    const { classeId } = req.params;

    const resultat = await pool.query(
      `
      SELECT
        h.id,
        h.classe_id,
        h.jour,
        h.heure_debut,
        h.heure_fin,
        h.matiere
      FROM horaires h
      WHERE h.classe_id = $1
      ORDER BY
        CASE h.jour
          WHEN 'Lundi' THEN 1
          WHEN 'Mardi' THEN 2
          WHEN 'Mercredi' THEN 3
          WHEN 'Jeudi' THEN 4
          WHEN 'Vendredi' THEN 5
          WHEN 'Samedi' THEN 6
          ELSE 7
        END,
        h.heure_debut ASC
      `,
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

/* =========================================================
   TOUS LES HORAIRES
========================================================= */

router.get('/', async (req, res) => {
  try {
    const resultat = await pool.query(
      `
      SELECT
        h.id,
        h.classe_id,
        h.jour,
        h.heure_debut,
        h.heure_fin,
        h.matiere,
        c.nom AS classe_nom,
        c.section AS classe_section
      FROM horaires h
      INNER JOIN classes c
        ON c.id = h.classe_id
      ORDER BY
        c.section ASC,
        c.nom ASC,
        CASE h.jour
          WHEN 'Lundi' THEN 1
          WHEN 'Mardi' THEN 2
          WHEN 'Mercredi' THEN 3
          WHEN 'Jeudi' THEN 4
          WHEN 'Vendredi' THEN 5
          WHEN 'Samedi' THEN 6
          ELSE 7
        END,
        h.heure_debut ASC
      `
    );

    res.json(resultat.rows);
  } catch (error) {
    console.error('Erreur récupération horaires :', error);

    res.status(500).json({
      erreur: 'Impossible de récupérer les horaires.',
    });
  }
});

/* =========================================================
   MODIFIER UN HORAIRE
========================================================= */

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const {
      classe_id,
      jour,
      heure_debut,
      heure_fin,
      matiere,
    } = req.body;

    if (
      !classe_id ||
      !jour ||
      !heure_debut ||
      !heure_fin ||
      !matiere
    ) {
      return res.status(400).json({
        erreur: 'Tous les champs sont obligatoires.',
      });
    }

    if (!JOURS.includes(jour)) {
      return res.status(400).json({
        erreur: 'Jour invalide.',
      });
    }

    if (heure_debut >= heure_fin) {
      return res.status(400).json({
        erreur: "L'heure de fin doit être après l'heure de début.",
      });
    }

    const resultat = await pool.query(
      `
      UPDATE horaires
      SET
        classe_id = $1,
        jour = $2,
        heure_debut = $3,
        heure_fin = $4,
        matiere = $5
      WHERE id = $6
      RETURNING *
      `,
      [
        classe_id,
        jour,
        heure_debut,
        heure_fin,
        matiere.trim(),
        id,
      ]
    );

    if (resultat.rows.length === 0) {
      return res.status(404).json({
        erreur: 'Horaire introuvable.',
      });
    }

    res.json(resultat.rows[0]);
  } catch (error) {
    console.error('Erreur modification horaire :', error);

    res.status(500).json({
      erreur: "Impossible de modifier l'horaire.",
    });
  }
});

/* =========================================================
   SUPPRIMER UN HORAIRE
========================================================= */

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const resultat = await pool.query(
      `
      DELETE FROM horaires
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    if (resultat.rows.length === 0) {
      return res.status(404).json({
        erreur: 'Horaire introuvable.',
      });
    }

    res.json({
      message: 'Horaire supprimé avec succès.',
      horaire: resultat.rows[0],
    });
  } catch (error) {
    console.error('Erreur suppression horaire :', error);

    res.status(500).json({
      erreur: "Impossible de supprimer l'horaire.",
    });
  }
});

export default router;