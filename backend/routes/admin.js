import express from 'express'
import pool from '../db.js'

const router = express.Router()

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

    // Vérifier si le matricule existe déjà
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

    // Génération du mot de passe
    const motDePasse =
      genererMotDePasse()

    // Création du compte
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


export default router