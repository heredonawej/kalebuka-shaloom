import express from 'express'
import pool from '../db.js'

const router = express.Router()

// =====================================
// GÉNÉRER UN MOT DE PASSE TEMPORAIRE
// =====================================

function genererMotDePasse() {
  const caracteres =
    'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'

  let motDePasse = ''

  for (let i = 0; i < 10; i++) {
    const position = Math.floor(
      Math.random() * caracteres.length
    )

    motDePasse += caracteres[position]
  }

  return motDePasse
}


// =====================================
// CRÉER UN ENSEIGNANT
// =====================================

router.post('/enseignants', async (req, res) => {
  try {
    const {
      nom,
      matricule,
      classe_id
    } = req.body

    if (!nom || !matricule) {
      return res.status(400).json({
        erreur:
          'Le nom complet et le matricule sont obligatoires.'
      })
    }

    // Vérifier le matricule
    const verification = await pool.query(
      `
      SELECT id
      FROM utilisateurs
      WHERE UPPER(matricule) = UPPER($1)
      `,
      [matricule.trim()]
    )

    if (verification.rows.length > 0) {
      return res.status(409).json({
        erreur:
          'Ce matricule existe déjà.'
      })
    }

    // Vérifier que la classe existe si elle est renseignée
    if (classe_id) {
      const classe = await pool.query(
        `
        SELECT id
        FROM classes
        WHERE id = $1
        `,
        [classe_id]
      )

      if (classe.rows.length === 0) {
        return res.status(404).json({
          erreur:
            'La classe sélectionnée n’existe pas.'
        })
      }
    }

    // Générer le mot de passe
    const motDePasse = genererMotDePasse()

    // Créer le compte
    const resultat = await pool.query(
      `
      INSERT INTO utilisateurs (
        nom,
        matricule,
        mot_de_passe,
        role,
        classe_id
      )
      VALUES (
        $1,
        $2,
        $3,
        'enseignant',
        $4
      )
      RETURNING
        id,
        nom,
        matricule,
        role,
        classe_id,
        date_creation
      `,
      [
        nom.trim(),
        matricule.trim().toUpperCase(),
        motDePasse,
        classe_id || null
      ]
    )

    res.status(201).json({
      message:
        'Compte enseignant créé avec succès.',

      enseignant:
        resultat.rows[0],

      mot_de_passe_temporaire:
        motDePasse
    })

  } catch (err) {

    console.error(
      'Erreur création enseignant :',
      err
    )

    res.status(500).json({
      erreur:
        'Impossible de créer le compte enseignant.'
    })
  }
})


// =====================================
// LISTE DES ENSEIGNANTS
// =====================================

router.get('/enseignants', async (req, res) => {
  try {

    const resultat = await pool.query(
      `
      SELECT
        u.id,
        u.nom,
        u.matricule,
        u.role,
        u.classe_id,
        u.actif,
        c.nom AS classe_nom,
        c.section,
        u.date_creation

      FROM utilisateurs u

      LEFT JOIN classes c
        ON u.classe_id = c.id

      WHERE u.role = 'enseignant'

      ORDER BY u.date_creation DESC
      `
    )

    res.json(resultat.rows)

  } catch (err) {

    console.error(
      'Erreur récupération enseignants :',
      err
    )

    res.status(500).json({
      erreur:
        'Impossible de récupérer les enseignants.'
    })
  }
})


// =====================================
// MODIFIER L'AFFECTATION D'UN ENSEIGNANT
// =====================================

router.put('/enseignants/:id/classe', async (req, res) => {
  try {

    const { id } = req.params
    const { classe_id } = req.body

    // Vérifier que l'enseignant existe
    const enseignant = await pool.query(
      `
      SELECT id
      FROM utilisateurs
      WHERE id = $1
      AND role = 'enseignant'
      `,
      [id]
    )

    if (enseignant.rows.length === 0) {
      return res.status(404).json({
        erreur:
          'Enseignant introuvable.'
      })
    }

    // Vérifier la classe
    if (classe_id) {

      const classe = await pool.query(
        `
        SELECT
          id,
          nom,
          section
        FROM classes
        WHERE id = $1
        `,
        [classe_id]
      )

      if (classe.rows.length === 0) {
        return res.status(404).json({
          erreur:
            'La classe sélectionnée n’existe pas.'
        })
      }
    }

    // Modifier l'affectation
    const resultat = await pool.query(
      `
      UPDATE utilisateurs
      SET classe_id = $1
      WHERE id = $2
      AND role = 'enseignant'

      RETURNING
        id,
        nom,
        matricule,
        classe_id
      `,
      [
        classe_id || null,
        id
      ]
    )

    res.json({
      message:
        'Affectation modifiée avec succès.',

      enseignant:
        resultat.rows[0]
    })

  } catch (err) {

    console.error(
      'Erreur modification affectation :',
      err
    )

    res.status(500).json({
      erreur:
        'Impossible de modifier l’affectation.'
    })
  }
})


// =====================================
// ACTIVER / DÉSACTIVER UN ENSEIGNANT
// =====================================

router.put('/enseignants/:id/statut', async (req, res) => {
  try {

    const { id } = req.params
    const { actif } = req.body

    if (typeof actif !== 'boolean') {
      return res.status(400).json({
        erreur:
          'Le statut doit être true ou false.'
      })
    }

    const resultat = await pool.query(
      `
      UPDATE utilisateurs
      SET actif = $1
      WHERE id = $2
      AND role = 'enseignant'

      RETURNING
        id,
        nom,
        matricule,
        actif
      `,
      [
        actif,
        id
      ]
    )

    if (resultat.rows.length === 0) {
      return res.status(404).json({
        erreur:
          'Enseignant introuvable.'
      })
    }

    res.json({
      message: actif
        ? 'Enseignant activé avec succès.'
        : 'Enseignant désactivé avec succès.',

      enseignant:
        resultat.rows[0]
    })

  } catch (err) {

    console.error(
      'Erreur modification statut :',
      err
    )

    res.status(500).json({
      erreur:
        'Impossible de modifier le statut.'
    })
  }
})


// =====================================
// SUPPRIMER UN ENSEIGNANT
// =====================================

router.delete('/enseignants/:id', async (req, res) => {
  try {

    const { id } = req.params

    const resultat = await pool.query(
      `
      DELETE FROM utilisateurs
      WHERE id = $1
      AND role = 'enseignant'

      RETURNING
        id,
        nom,
        matricule
      `,
      [id]
    )

    if (resultat.rows.length === 0) {
      return res.status(404).json({
        erreur:
          'Enseignant introuvable.'
      })
    }

    res.json({
      message:
        'Enseignant supprimé avec succès.',

      enseignant:
        resultat.rows[0]
    })

  } catch (err) {

    console.error(
      'Erreur suppression enseignant :',
      err
    )

    res.status(500).json({
      erreur:
        'Impossible de supprimer l’enseignant.'
    })
  }
})
// =====================================
// RÉINITIALISER LE MOT DE PASSE
// =====================================

router.post('/enseignants/:id/reset-password', async (req, res) => {
  try {
    const { id } = req.params

    // Vérifier que l'enseignant existe
    const verification = await pool.query(
      `
      SELECT id, nom, matricule
      FROM utilisateurs
      WHERE id = $1
        AND role = 'enseignant'
      `,
      [id]
    )

    if (verification.rows.length === 0) {
      return res.status(404).json({
        erreur: 'Enseignant introuvable.'
      })
    }

    // Générer un nouveau mot de passe
    const nouveauMotDePasse = genererMotDePasse()

    // Remplacer l'ancien mot de passe
    await pool.query(
      `
      UPDATE utilisateurs
      SET mot_de_passe = $1
      WHERE id = $2
        AND role = 'enseignant'
      `,
      [nouveauMotDePasse, id]
    )

    res.json({
      message: 'Mot de passe réinitialisé avec succès.',
      mot_de_passe_temporaire: nouveauMotDePasse,
      enseignant: verification.rows[0]
    })

  } catch (err) {
    console.error(
      'Erreur réinitialisation mot de passe :',
      err
    )

    res.status(500).json({
      erreur:
        'Impossible de réinitialiser le mot de passe.'
    })
  }
})


export default router