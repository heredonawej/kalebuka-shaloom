import express from 'express'
import crypto from 'crypto'
import pool from '../db.js'

const router = express.Router()

// =====================================================
// CONFIGURATION
// =====================================================

const PIN_COFFRE = process.env.PIN_COFFRE_ADM || '2525'
const SECRET = process.env.SECRET_COFFRE_ADM || 'change-moi'

// Durée du jeton : 30 minutes
const DUREE_TOKEN = 30 * 60 * 1000

// =====================================================
// CRÉER UN JETON SÉCURISÉ
// =====================================================

const creerToken = () => {
  const expiration = Date.now() + DUREE_TOKEN

  const donnees = `coffre-adm:${expiration}`

  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(donnees)
    .digest('hex')

  return `${expiration}.${signature}`
}

// =====================================================
// VÉRIFIER UN JETON
// =====================================================

const verifierToken = (token) => {
  if (!token) {
    return false
  }

  const morceaux = token.split('.')

  if (morceaux.length !== 2) {
    return false
  }

  const [expiration, signature] = morceaux

  const expirationNombre = Number(expiration)

  if (!Number.isFinite(expirationNombre)) {
    return false
  }

  if (Date.now() > expirationNombre) {
    return false
  }

  const donnees = `coffre-adm:${expiration}`

  const signatureAttendue = crypto
    .createHmac('sha256', SECRET)
    .update(donnees)
    .digest('hex')

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(signatureAttendue)
    )
  } catch {
    return false
  }
}

// =====================================================
// MIDDLEWARE DE PROTECTION
// =====================================================

const protegerCoffre = (req, res, next) => {
  const autorisation = req.headers.authorization

  if (!autorisation) {
    return res.status(401).json({
      erreur: 'Accès au coffre non autorisé.',
    })
  }

  if (!autorisation.startsWith('Bearer ')) {
    return res.status(401).json({
      erreur: 'Jeton de sécurité invalide.',
    })
  }

  const token = autorisation.substring(7)

  if (!verifierToken(token)) {
    return res.status(401).json({
      erreur: 'Session du coffre expirée. Veuillez entrer à nouveau le PIN.',
    })
  }

  next()
}

// =====================================================
// VÉRIFIER LE PIN
// POST /api/coffre-adm/verifier
// =====================================================

router.post('/verifier', async (req, res) => {
  try {
    const { pin } = req.body

    if (!pin) {
      return res.status(400).json({
        erreur: 'Le code PIN est obligatoire.',
      })
    }

    const pinTexte = String(pin)

    if (!/^\d{4}$/.test(pinTexte)) {
      return res.status(400).json({
        erreur: 'Le code PIN doit contenir exactement 4 chiffres.',
      })
    }

    if (pinTexte !== String(PIN_COFFRE)) {
      return res.status(401).json({
        erreur: 'Code PIN incorrect.',
      })
    }

    const token = creerToken()

    res.json({
      autorise: true,
      token,
      message: 'Accès autorisé.',
    })
  } catch (error) {
    console.error('Erreur vérification PIN :', error)

    res.status(500).json({
      erreur: 'Impossible de vérifier le code PIN.',
    })
  }
})

// =====================================================
// RÉCUPÉRER LES INFORMATIONS
// GET /api/coffre-adm
// =====================================================

router.get('/', protegerCoffre, async (req, res) => {
  try {
    const resultat = await pool.query(`
      SELECT
        id,
        titre,
        contenu,
        created_at,
        updated_at
      FROM coffre_adm
      ORDER BY created_at DESC, id DESC
    `)

    res.json(resultat.rows)
  } catch (error) {
    console.error('Erreur récupération coffre :', error)

    res.status(500).json({
      erreur: 'Impossible de récupérer les informations.',
    })
  }
})

// =====================================================
// AJOUTER UNE INFORMATION
// POST /api/coffre-adm
// =====================================================

router.post('/', protegerCoffre, async (req, res) => {
  try {
    const { titre, contenu } = req.body

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

    const resultat = await pool.query(
      `
      INSERT INTO coffre_adm
        (titre, contenu)
      VALUES
        ($1, $2)
      RETURNING
        id,
        titre,
        contenu,
        created_at,
        updated_at
      `,
      [
        titre.trim(),
        contenu.trim(),
      ]
    )

    res.status(201).json(resultat.rows[0])
  } catch (error) {
    console.error('Erreur ajout coffre :', error)

    res.status(500).json({
      erreur: 'Impossible d’ajouter l’information.',
    })
  }
})

// =====================================================
// MODIFIER UNE INFORMATION
// PUT /api/coffre-adm/:id
// =====================================================

router.put('/:id', protegerCoffre, async (req, res) => {
  try {
    const { id } = req.params
    const { titre, contenu } = req.body

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

    const resultat = await pool.query(
      `
      UPDATE coffre_adm
      SET
        titre = $1,
        contenu = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING
        id,
        titre,
        contenu,
        created_at,
        updated_at
      `,
      [
        titre.trim(),
        contenu.trim(),
        id,
      ]
    )

    if (resultat.rows.length === 0) {
      return res.status(404).json({
        erreur: 'Information introuvable.',
      })
    }

    res.json(resultat.rows[0])
  } catch (error) {
    console.error('Erreur modification coffre :', error)

    res.status(500).json({
      erreur: 'Impossible de modifier l’information.',
    })
  }
})

// =====================================================
// SUPPRIMER UNE INFORMATION
// DELETE /api/coffre-adm/:id
// =====================================================

router.delete('/:id', protegerCoffre, async (req, res) => {
  try {
    const { id } = req.params

    const resultat = await pool.query(
      `
      DELETE FROM coffre_adm
      WHERE id = $1
      RETURNING id
      `,
      [id]
    )

    if (resultat.rows.length === 0) {
      return res.status(404).json({
        erreur: 'Information introuvable.',
      })
    }

    res.json({
      message: 'Information supprimée avec succès.',
    })
  } catch (error) {
    console.error('Erreur suppression coffre :', error)

    res.status(500).json({
      erreur: 'Impossible de supprimer l’information.',
    })
  }
})

export default router