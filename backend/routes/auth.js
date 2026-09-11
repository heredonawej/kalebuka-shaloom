import express from 'express'
import pool from '../db.js'

const router = express.Router()

// ===============================
// CONNEXION
// ===============================
router.post('/connexion', async (req, res) => {
  try {
    const { matricule, mot_de_passe } = req.body

    if (!matricule || !mot_de_passe) {
      return res.status(400).json({
        erreur:
          'Veuillez renseigner votre matricule et votre mot de passe.'
      })
    }

    const resultat = await pool.query(
      `
      SELECT
        u.id,
        u.nom,
        u.matricule,
        u.email,
        u.role,
        u.classe_id,
        u.mot_de_passe,
        c.nom AS classe_nom,
        c.section AS section
      FROM utilisateurs u
      LEFT JOIN classes c
        ON u.classe_id = c.id
      WHERE UPPER(u.matricule) = UPPER($1)
      `,
      [matricule.trim()]
    )

    if (resultat.rows.length === 0) {
      return res.status(401).json({
        erreur: 'Matricule ou mot de passe incorrect.'
      })
    }

    const utilisateur = resultat.rows[0]

    if (utilisateur.mot_de_passe !== mot_de_passe) {
      return res.status(401).json({
        erreur: 'Matricule ou mot de passe incorrect.'
      })
    }

    // Ne jamais envoyer le mot de passe au frontend
    delete utilisateur.mot_de_passe

    res.json({
      message: 'Connexion réussie !',
      utilisateur
    })
  } catch (err) {
    console.error('Erreur de connexion :', err)

    res.status(500).json({
      erreur: 'Erreur lors de la connexion.'
    })
  }
})

// ===============================
// AFFECTER UNE CLASSE
// ===============================
router.put('/classe', async (req, res) => {
  try {
    const { utilisateur_id, classe_id } = req.body

    if (!utilisateur_id || !classe_id) {
      return res.status(400).json({
        erreur: 'Utilisateur et classe obligatoires.'
      })
    }

    await pool.query(
      `
      UPDATE utilisateurs
      SET classe_id = $1
      WHERE id = $2
      `,
      [classe_id, utilisateur_id]
    )

    const misAJour = await pool.query(
      `
      SELECT
        u.id,
        u.nom,
        u.matricule,
        u.email,
        u.role,
        u.classe_id,
        c.nom AS classe_nom,
        c.section AS section
      FROM utilisateurs u
      LEFT JOIN classes c
        ON u.classe_id = c.id
      WHERE u.id = $1
      `,
      [utilisateur_id]
    )

    if (misAJour.rows.length === 0) {
      return res.status(404).json({
        erreur: 'Utilisateur introuvable.'
      })
    }

    res.json(misAJour.rows[0])
  } catch (err) {
    console.error('Erreur affectation classe :', err)

    res.status(500).json({
      erreur: 'Impossible d’affecter la classe.'
    })
  }
})

export default router