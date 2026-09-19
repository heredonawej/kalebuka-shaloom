import express from 'express'
import pool from '../db.js'

const router = express.Router()

const BAREMES = {
  Exercice: 10,
  Interrogation: 10,
  Devoir: 10,
  Examen: 20,
}

const TYPES_EVALUATION = Object.keys(BAREMES)

/* =========================================================
   AJOUTER UNE NOTE
========================================================= */
router.post('/', async (req, res) => {
  try {
    const {
      eleve_id,
      matiere,
      type_eval,
      valeur,
      commentaire,
    } = req.body

    if (
      !eleve_id ||
      !matiere ||
      !type_eval ||
      valeur === undefined ||
      valeur === null
    ) {
      return res.status(400).json({
        erreur: 'Tous les champs obligatoires doivent être remplis.',
      })
    }

    if (!TYPES_EVALUATION.includes(type_eval)) {
      return res.status(400).json({
        erreur: 'Type d’évaluation invalide.',
      })
    }

    const noteNumerique = Number(valeur)
    const bareme = BAREMES[type_eval]

    if (Number.isNaN(noteNumerique)) {
      return res.status(400).json({
        erreur: 'La note doit être un nombre valide.',
      })
    }

    if (noteNumerique < 0 || noteNumerique > bareme) {
      return res.status(400).json({
        erreur: `La note pour ${type_eval} doit être comprise entre 0 et ${bareme}.`,
      })
    }

    const eleve = await pool.query(
      `SELECT id FROM eleves WHERE id = $1`,
      [eleve_id]
    )

    if (eleve.rows.length === 0) {
      return res.status(404).json({
        erreur: 'Élève introuvable.',
      })
    }

    const resultat = await pool.query(
      `INSERT INTO notes
        (eleve_id, matiere, type_eval, valeur, commentaire, date_evaluation)
       VALUES
        ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       RETURNING *`,
      [
        eleve_id,
        matiere.trim(),
        type_eval,
        noteNumerique,
        commentaire?.trim() || null,
      ]
    )

    res.status(201).json(resultat.rows[0])
  } catch (error) {
    console.error('Erreur ajout note :', error)

    res.status(500).json({
      erreur: 'Erreur serveur lors de l’enregistrement de la note.',
    })
  }
})

/* =========================================================
   NOTES D'UN ÉLÈVE
========================================================= */
router.get('/eleve/:eleveId', async (req, res) => {
  try {
    const { eleveId } = req.params

    const resultat = await pool.query(
      `
      SELECT *
      FROM notes
      WHERE eleve_id = $1
      ORDER BY date_evaluation DESC, id DESC
      `,
      [eleveId]
    )

    res.json(resultat.rows)
  } catch (error) {
    console.error('Erreur récupération notes élève :', error)

    res.status(500).json({
      erreur: 'Impossible de récupérer les notes.',
    })
  }
})

/* =========================================================
   NOTES D'UNE CLASSE
========================================================= */
router.get('/classe/:classeId', async (req, res) => {
  try {
    const { classeId } = req.params

    const resultat = await pool.query(
      `
      SELECT
        n.id,
        n.eleve_id,
        n.matiere,
        n.type_eval,
        n.valeur,
        n.commentaire,
        n.date_evaluation,
        e.nom,
        e.prenom
      FROM notes n
      INNER JOIN eleves e
        ON e.id = n.eleve_id
      WHERE e.classe_id = $1
      ORDER BY
        e.nom ASC,
        e.prenom ASC,
        n.date_evaluation DESC
      `,
      [classeId]
    )

    res.json(resultat.rows)
  } catch (error) {
    console.error('Erreur récupération notes classe :', error)

    res.status(500).json({
      erreur: 'Impossible de récupérer les notes de la classe.',
    })
  }
})

/* =========================================================
   MODIFIER UNE NOTE
========================================================= */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const {
      matiere,
      type_eval,
      valeur,
      commentaire,
    } = req.body

    if (
      !matiere ||
      !type_eval ||
      valeur === undefined ||
      valeur === null
    ) {
      return res.status(400).json({
        erreur: 'Les informations de la note sont incomplètes.',
      })
    }

    if (!TYPES_EVALUATION.includes(type_eval)) {
      return res.status(400).json({
        erreur: 'Type d’évaluation invalide.',
      })
    }

    const noteNumerique = Number(valeur)
    const bareme = BAREMES[type_eval]

    if (Number.isNaN(noteNumerique)) {
      return res.status(400).json({
        erreur: 'La note doit être un nombre valide.',
      })
    }

    if (noteNumerique < 0 || noteNumerique > bareme) {
      return res.status(400).json({
        erreur: `La note pour ${type_eval} doit être comprise entre 0 et ${bareme}.`,
      })
    }

    const resultat = await pool.query(
      `
      UPDATE notes
      SET
        matiere = $1,
        type_eval = $2,
        valeur = $3,
        commentaire = $4
      WHERE id = $5
      RETURNING *
      `,
      [
        matiere.trim(),
        type_eval,
        noteNumerique,
        commentaire?.trim() || null,
        id,
      ]
    )

    if (resultat.rows.length === 0) {
      return res.status(404).json({
        erreur: 'Note introuvable.',
      })
    }

    res.json(resultat.rows[0])
  } catch (error) {
    console.error('Erreur modification note :', error)

    res.status(500).json({
      erreur: 'Impossible de modifier la note.',
    })
  }
})

/* =========================================================
   SUPPRIMER UNE NOTE
========================================================= */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const resultat = await pool.query(
      `
      DELETE FROM notes
      WHERE id = $1
      RETURNING *
      `,
      [id]
    )

    if (resultat.rows.length === 0) {
      return res.status(404).json({
        erreur: 'Note introuvable.',
      })
    }

    res.json({
      message: 'Note supprimée avec succès.',
      note: resultat.rows[0],
    })
  } catch (error) {
    console.error('Erreur suppression note :', error)

    res.status(500).json({
      erreur: 'Impossible de supprimer la note.',
    })
  }
})

export default router