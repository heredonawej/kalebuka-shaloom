import express from 'express'
import pool from '../db.js'

const router = express.Router()


// =====================================================
// 1. LISTE DE TOUTES LES CLASSES
// =====================================================

router.get('/', async (req, res) => {
  try {
    const resultat = await pool.query(`
      SELECT
        c.*,
        COUNT(e.id) AS total_eleves
      FROM classes c
      LEFT JOIN eleves e ON c.id = e.classe_id
      GROUP BY c.id
      ORDER BY c.id ASC;
    `)

    res.json(resultat.rows)

  } catch (err) {
    console.error('Erreur chargement classes :', err)

    res.status(500).json({
      erreur: 'Impossible de charger les classes.'
    })
  }
})


// =====================================================
// 2. CRÉER UNE CLASSE
// =====================================================

router.post('/', async (req, res) => {
  try {
    const { nom, section } = req.body

    // Vérification du nom
    if (!nom || !nom.trim()) {
      return res.status(400).json({
        erreur: 'Le nom de la classe est obligatoire.'
      })
    }

    // Vérification de la section
    const sectionsAutorisees = [
      'Maternelle',
      'Primaire',
      'Secondaire'
    ]

    if (!section || !sectionsAutorisees.includes(section)) {
      return res.status(400).json({
        erreur:
          'La section doit être Maternelle, Primaire ou Secondaire.'
      })
    }

    // Vérifier si la classe existe déjà
    const classeExistante = await pool.query(
      `
      SELECT id
      FROM classes
      WHERE LOWER(nom) = LOWER($1)
      AND section = $2
      `,
      [nom.trim(), section]
    )

    if (classeExistante.rows.length > 0) {
      return res.status(409).json({
        erreur: 'Cette classe existe déjà dans cette section.'
      })
    }

    // Créer la classe
    const resultat = await pool.query(
      `
      INSERT INTO classes (nom, section)
      VALUES ($1, $2)
      RETURNING *;
      `,
      [nom.trim(), section]
    )

    res.status(201).json(resultat.rows[0])

  } catch (err) {
    console.error('Erreur création classe :', err)

    res.status(500).json({
      erreur: 'Impossible de créer la classe.'
    })
  }
})


// =====================================================
// 3. LISTE DES ÉLÈVES D'UNE CLASSE
// =====================================================

router.get('/:id/eleves', async (req, res) => {
  try {
    const { id } = req.params

    const resultat = await pool.query(`
      SELECT
        e.id,
        e.nom,
        e.prenom,
        e.classe_id,
        ROUND(AVG(n.valeur), 2) AS moyenne,
        COUNT(n.id) AS nombre_notes
      FROM eleves e
      LEFT JOIN notes n
        ON e.id = n.eleve_id
      WHERE e.classe_id = $1
      GROUP BY
        e.id,
        e.nom,
        e.prenom,
        e.classe_id
      ORDER BY
        e.nom ASC,
        e.prenom ASC;
    `, [id])

    res.json(resultat.rows)

  } catch (err) {
    console.error('Erreur chargement élèves :', err)

    res.status(500).json({
      erreur: 'Impossible de charger les élèves.'
    })
  }
})


// =====================================================
// 4. ATTRIBUER UNE NOTE À UN ÉLÈVE
// =====================================================

router.post('/notes', async (req, res) => {
  try {
    const {
      eleve_id,
      matiere,
      type_eval,
      valeur,
      commentaire
    } = req.body

    const resultat = await pool.query(
      `
      INSERT INTO notes
        (eleve_id, matiere, type_eval, valeur, commentaire)
      VALUES
        ($1, $2, $3, $4, $5)
      RETURNING *;
      `,
      [
        eleve_id,
        matiere,
        type_eval || 'Interrogation',
        valeur,
        commentaire || null
      ]
    )

    res.status(201).json(resultat.rows[0])

  } catch (err) {
    console.error('Erreur ajout note :', err)

    res.status(500).json({
      erreur: 'Impossible d’enregistrer la note.'
    })
  }
})


export default router