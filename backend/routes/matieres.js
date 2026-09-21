import express from 'express';
import pool from '../db.js';

const router = express.Router();

const SECTIONS = [
  'Maternelle',
  'Primaire',
  'Secondaire',
];

/*
  GET /api/matieres
  Récupérer toutes les matières
*/
router.get('/', async (req, res) => {
  try {
    const resultat = await pool.query(`
      SELECT id, nom, section, created_at
      FROM matieres
      ORDER BY section, nom
    `);

    res.json(resultat.rows);
  } catch (error) {
    console.error('Erreur récupération matières :', error);

    res.status(500).json({
      erreur: 'Impossible de récupérer les matières.',
    });
  }
});


/*
  POST /api/matieres
  Ajouter une matière
*/
router.post('/', async (req, res) => {
  try {
    const { nom, section } = req.body;

    if (!nom || !section) {
      return res.status(400).json({
        erreur: 'Le nom et la section sont obligatoires.',
      });
    }

    if (!SECTIONS.includes(section)) {
      return res.status(400).json({
        erreur: 'Section invalide.',
      });
    }

    const nomPropre = nom.trim();

    if (!nomPropre) {
      return res.status(400).json({
        erreur: 'Le nom de la matière est invalide.',
      });
    }

    // Vérifier si elle existe déjà dans cette section
    const existante = await pool.query(
      `
      SELECT id
      FROM matieres
      WHERE LOWER(nom) = LOWER($1)
      AND section = $2
      `,
      [nomPropre, section]
    );

    if (existante.rows.length > 0) {
      return res.status(409).json({
        erreur: 'Cette matière existe déjà dans cette section.',
      });
    }

    const resultat = await pool.query(
      `
      INSERT INTO matieres (nom, section)
      VALUES ($1, $2)
      RETURNING id, nom, section, created_at
      `,
      [nomPropre, section]
    );

    res.status(201).json(resultat.rows[0]);

  } catch (error) {
    console.error('Erreur ajout matière :', error);

    res.status(500).json({
      erreur: "Impossible d'ajouter la matière.",
    });
  }
});


/*
  PUT /api/matieres/:id
  Modifier une matière
*/
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, section } = req.body;

    if (!nom || !section) {
      return res.status(400).json({
        erreur: 'Le nom et la section sont obligatoires.',
      });
    }

    if (!SECTIONS.includes(section)) {
      return res.status(400).json({
        erreur: 'Section invalide.',
      });
    }

    const nomPropre = nom.trim();

    if (!nomPropre) {
      return res.status(400).json({
        erreur: 'Le nom de la matière est invalide.',
      });
    }

    const resultat = await pool.query(
      `
      UPDATE matieres
      SET nom = $1,
          section = $2
      WHERE id = $3
      RETURNING id, nom, section, created_at
      `,
      [nomPropre, section, id]
    );

    if (resultat.rows.length === 0) {
      return res.status(404).json({
        erreur: 'Matière introuvable.',
      });
    }

    res.json(resultat.rows[0]);

  } catch (error) {
    console.error('Erreur modification matière :', error);

    res.status(500).json({
      erreur: 'Impossible de modifier la matière.',
    });
  }
});


/*
  DELETE /api/matieres/:id
  Supprimer une matière
*/
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const resultat = await pool.query(
      `
      DELETE FROM matieres
      WHERE id = $1
      RETURNING id, nom, section
      `,
      [id]
    );

    if (resultat.rows.length === 0) {
      return res.status(404).json({
        erreur: 'Matière introuvable.',
      });
    }

    res.json({
      message: 'Matière supprimée avec succès.',
      matiere: resultat.rows[0],
    });

  } catch (error) {
    console.error('Erreur suppression matière :', error);

    res.status(500).json({
      erreur: 'Impossible de supprimer la matière.',
    });
  }
});

export default router;