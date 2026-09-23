import express from 'express'
import pool from '../db.js'

const router = express.Router()

const CATEGORIES = [
  'Annonce',
  'Événement',
  'Information',
  'Communiqué',
]

// =====================================================
// RÉCUPÉRER LES COMMUNICATIONS
// =====================================================

router.get('/', async (req, res) => {
  try {
    const resultat = await pool.query(`
      SELECT
        id,
        titre,
        contenu,
        categorie,
        publie,
        date_publication,
        created_at,
        updated_at
      FROM communications
      ORDER BY date_publication DESC, id DESC
    `)

    res.json(resultat.rows)
  } catch (error) {
    console.error('Erreur communications :', error)

    res.status(500).json({
      erreur: 'Impossible de récupérer les communications.',
    })
  }
})

// =====================================================
// RÉCUPÉRER UNIQUEMENT LES COMMUNICATIONS PUBLIÉES
// POUR LA PAGE PUBLIQUE
// =====================================================

router.get('/public', async (req, res) => {
  try {
    const resultat = await pool.query(`
      SELECT
        id,
        titre,
        contenu,
        categorie,
        date_publication
      FROM communications
      WHERE publie = TRUE
      ORDER BY date_publication DESC, id DESC
    `)

    res.json(resultat.rows)
  } catch (error) {
    console.error('Erreur communications publiques :', error)

    res.status(500).json({
      erreur: 'Impossible de récupérer les communications publiques.',
    })
  }
})

// =====================================================
// CRÉER UNE COMMUNICATION
// =====================================================

router.post('/', async (req, res) => {
  try {
    const {
      titre,
      contenu,
      categorie = 'Information',
      publie = true,
    } = req.body

    if (!titre || !titre.trim()) {
      return res.status(400).json({
        erreur: 'Le titre est obligatoire.',
      })
    }

    if (!contenu || !contenu.trim()) {
      return res.status(400).json({
        erreur: 'Le contenu est obligatoire.',
      })
    }

    if (!CATEGORIES.includes(categorie)) {
      return res.status(400).json({
        erreur: 'Catégorie invalide.',
      })
    }

    const resultat = await pool.query(
      `
      INSERT INTO communications
        (titre, contenu, categorie, publie)
      VALUES
        ($1, $2, $3, $4)
      RETURNING
        id,
        titre,
        contenu,
        categorie,
        publie,
        date_publication,
        created_at,
        updated_at
      `,
      [
        titre.trim(),
        contenu.trim(),
        categorie,
        Boolean(publie),
      ]
    )

    res.status(201).json(resultat.rows[0])
  } catch (error) {
    console.error('Erreur création communication :', error)

    res.status(500).json({
      erreur: 'Impossible de créer la communication.',
    })
  }
})

// =====================================================
// MODIFIER UNE COMMUNICATION
// =====================================================

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const {
      titre,
      contenu,
      categorie,
      publie,
    } = req.body

    if (!titre || !titre.trim()) {
      return res.status(400).json({
        erreur: 'Le titre est obligatoire.',
      })
    }

    if (!contenu || !contenu.trim()) {
      return res.status(400).json({
        erreur: 'Le contenu est obligatoire.',
      })
    }

    if (!CATEGORIES.includes(categorie)) {
      return res.status(400).json({
        erreur: 'Catégorie invalide.',
      })
    }

    const resultat = await pool.query(
      `
      UPDATE communications
      SET
        titre = $1,
        contenu = $2,
        categorie = $3,
        publie = $4,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING
        id,
        titre,
        contenu,
        categorie,
        publie,
        date_publication,
        created_at,
        updated_at
      `,
      [
        titre.trim(),
        contenu.trim(),
        categorie,
        Boolean(publie),
        id,
      ]
    )

    if (resultat.rows.length === 0) {
      return res.status(404).json({
        erreur: 'Communication introuvable.',
      })
    }

    res.json(resultat.rows[0])
  } catch (error) {
    console.error('Erreur modification communication :', error)

    res.status(500).json({
      erreur: 'Impossible de modifier la communication.',
    })
  }
})

// =====================================================
// PUBLIER / MASQUER UNE COMMUNICATION
// =====================================================

router.patch('/:id/statut', async (req, res) => {
  try {
    const { id } = req.params
    const { publie } = req.body

    const resultat = await pool.query(
      `
      UPDATE communications
      SET
        publie = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING
        id,
        titre,
        contenu,
        categorie,
        publie,
        date_publication,
        created_at,
        updated_at
      `,
      [Boolean(publie), id]
    )

    if (resultat.rows.length === 0) {
      return res.status(404).json({
        erreur: 'Communication introuvable.',
      })
    }

    res.json(resultat.rows[0])
  } catch (error) {
    console.error('Erreur changement statut :', error)

    res.status(500).json({
      erreur: 'Impossible de modifier le statut.',
    })
  }
})

// =====================================================
// SUPPRIMER UNE COMMUNICATION
// =====================================================

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const resultat = await pool.query(
      `
      DELETE FROM communications
      WHERE id = $1
      RETURNING id
      `,
      [id]
    )

    if (resultat.rows.length === 0) {
      return res.status(404).json({
        erreur: 'Communication introuvable.',
      })
    }

    res.json({
      message: 'Communication supprimée avec succès.',
    })
  } catch (error) {
    console.error('Erreur suppression communication :', error)

    res.status(500).json({
      erreur: 'Impossible de supprimer la communication.',
    })
  }
})

export default router