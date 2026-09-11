import express from 'express'
import pool from '../db.js'

const router = express.Router()


// ============================================
// ENREGISTRER LES PRÉSENCES D'UNE CLASSE
// ============================================

router.post('/', async (req, res) => {

  try {

    const {
      enseignant_id,
      classe_id,
      presences
    } = req.body

    if (!enseignant_id || !classe_id || !Array.isArray(presences)) {
      return res.status(400).json({
        erreur: 'Données de présence invalides.'
      })
    }

    for (const presence of presences) {

      await pool.query(
        `
        INSERT INTO presences (
          eleve_id,
          enseignant_id,
          classe_id,
          date_presence,
          statut
        )
        VALUES ($1, $2, $3, CURRENT_DATE, $4)
        `,
        [
          presence.eleve_id,
          enseignant_id,
          classe_id,
          presence.statut
        ]
      )

    }

    res.status(201).json({
      message: 'Présences enregistrées avec succès.'
    })

  } catch (err) {

    console.error(
      'Erreur enregistrement présences :',
      err
    )

    res.status(500).json({
      erreur: 'Impossible d’enregistrer les présences.'
    })
  }
})


// ============================================
// RÉCUPÉRER LES PRÉSENCES D'UNE CLASSE
// ============================================

router.get('/classe/:classe_id', async (req, res) => {

  try {

    const { classe_id } = req.params

    const resultat = await pool.query(
      `
      SELECT
        p.id,
        p.eleve_id,
        e.nom,
        e.prenom,
        p.date_presence,
        p.statut,
        p.heure_enregistrement
      FROM presences p

      INNER JOIN eleves e
        ON e.id = p.eleve_id

      WHERE p.classe_id = $1

      ORDER BY
        p.date_presence DESC,
        e.nom ASC,
        e.prenom ASC
      `,
      [classe_id]
    )

    res.json(resultat.rows)

  } catch (err) {

    console.error(
      'Erreur récupération présences :',
      err
    )

    res.status(500).json({
      erreur: 'Impossible de récupérer les présences.'
    })
  }
})


export default router