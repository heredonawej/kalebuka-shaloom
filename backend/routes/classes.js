import express from 'express';
import pool from '../db.js';

const router = express.Router();

// 1. Liste de toutes les classes avec le nombre d'élèves
router.get('/', async (req, res) => {
  try {
    const resultat = await pool.query(`
      SELECT c.*, COUNT(e.id) AS total_eleves
      FROM classes c
      LEFT JOIN eleves e ON c.id = e.classe_id
      GROUP BY c.id
      ORDER BY c.id ASC;
    `);
    res.json(resultat.rows);
  } catch (err) {
    res.status(500).json({ erreur: 'Impossible de charger les classes.' });
  }
});

// 2. Liste des élèves d'une classe avec calcul automatique des moyennes
router.get('/:id/eleves', async (req, res) => {
  try {
    const { id } = req.params;
    const resultat = await pool.query(`
      SELECT 
        e.id, 
        e.nom, 
        e.prenom, 
        e.classe_id,
        ROUND(AVG(n.valeur), 2) AS moyenne,
        COUNT(n.id) AS nombre_notes
      FROM eleves e
      LEFT JOIN notes n ON e.id = n.eleve_id
      WHERE e.classe_id = $1
      GROUP BY e.id, e.nom, e.prenom, e.classe_id
      ORDER BY e.nom ASC, e.prenom ASC;
    `, [id]);

    res.json(resultat.rows);
  } catch (err) {
    res.status(500).json({ erreur: 'Impossible de charger les élèves.' });
  }
});

// 3. Attribuer une note à un élève
router.post('/notes', async (req, res) => {
  try {
    const { eleve_id, matiere, type_eval, valeur, commentaire } = req.body;

    const resultat = await pool.query(`
      INSERT INTO notes (eleve_id, matiere, type_eval, valeur, commentaire)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `, [eleve_id, matiere, type_eval || 'Interrogation', valeur, commentaire || null]);

    res.status(201).json(resultat.rows[0]);
  } catch (err) {
    res.status(500).json({ erreur: 'Impossible d\'enregistrer la note.' });
  }
});

export default router;