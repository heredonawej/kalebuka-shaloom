import express from 'express'
import pool from '../db.js'

const router = express.Router()

// =====================================================
// ENREGISTRER L'APPEL
// =====================================================

router.post('/', async (req, res) => {
  const client = await pool.connect()

  try {
    const {
      enseignant_id,
      classe_id,
      presences,
    } = req.body

    // -----------------------------------------------
    // Vérifications
    // -----------------------------------------------

    if (!enseignant_id) {
      return res.status(400).json({
        erreur: 'Enseignant non identifié.',
      })
    }

    if (!classe_id) {
      return res.status(400).json({
        erreur: 'Classe non identifiée.',
      })
    }

    if (!Array.isArray(presences)) {
      return res.status(400).json({
        erreur: 'Les données de présence sont invalides.',
      })
    }

    // -----------------------------------------------
    // Vérifier l'enseignant
    // -----------------------------------------------

    const enseignant = await client.query(
      `
      SELECT id, nom, classe_id
      FROM utilisateurs
      WHERE id = $1
        AND role = 'enseignant'
      `,
      [enseignant_id]
    )

    if (enseignant.rows.length === 0) {
      return res.status(404).json({
        erreur: 'Enseignant introuvable.',
      })
    }

    const classeEnseignant =
      enseignant.rows[0].classe_id

    if (!classeEnseignant) {
      return res.status(400).json({
        erreur:
          'Aucune classe n’est affectée à cet enseignant.',
      })
    }

    // L'enseignant ne peut faire l'appel que de sa classe
    if (Number(classeEnseignant) !== Number(classe_id)) {
      return res.status(403).json({
        erreur:
          'Vous ne pouvez pas enregistrer l’appel d’une autre classe.',
      })
    }

    // -----------------------------------------------
    // Vérifier la classe
    // -----------------------------------------------

    const classe = await client.query(
      `
      SELECT id, nom, section
      FROM classes
      WHERE id = $1
      `,
      [classe_id]
    )

    if (classe.rows.length === 0) {
      return res.status(404).json({
        erreur: 'Classe introuvable.',
      })
    }

    // -----------------------------------------------
    // Transaction
    // -----------------------------------------------

    await client.query('BEGIN')

    for (const presence of presences) {
      const {
        eleve_id,
        statut,
      } = presence

      if (!eleve_id) {
        continue
      }

      if (!['present', 'absent'].includes(statut)) {
        continue
      }

      // Vérifier que l'élève appartient bien à la classe
      const eleve = await client.query(
        `
        SELECT id
        FROM eleves
        WHERE id = $1
          AND classe_id = $2
        `,
        [eleve_id, classe_id]
      )

      if (eleve.rows.length === 0) {
        continue
      }

      // ---------------------------------------------
      // Vérifier si l'appel existe déjà aujourd'hui
      // ---------------------------------------------

      const existante = await client.query(
        `
        SELECT id
        FROM presences
        WHERE eleve_id = $1
          AND classe_id = $2
          AND date_appel = CURRENT_DATE
        LIMIT 1
        `,
        [eleve_id, classe_id]
      )

      if (existante.rows.length > 0) {

        // Mise à jour
        await client.query(
          `
          UPDATE presences
          SET
            statut = $1,
            enseignant_id = $2
          WHERE id = $3
          `,
          [
            statut,
            enseignant_id,
            existante.rows[0].id,
          ]
        )

      } else {

        // Nouvelle présence
        await client.query(
          `
          INSERT INTO presences (
            eleve_id,
            classe_id,
            enseignant_id,
            statut,
            date_appel
          )
          VALUES (
            $1,
            $2,
            $3,
            $4,
            CURRENT_DATE
          )
          `,
          [
            eleve_id,
            classe_id,
            enseignant_id,
            statut,
          ]
        )
      }
    }

    await client.query('COMMIT')

    res.json({
      message:
        'Présences enregistrées avec succès.',
      date:
        new Date().toISOString().split('T')[0],
      classe:
        classe.rows[0],
    })

  } catch (error) {

    await client.query('ROLLBACK')

    console.error(
      'Erreur enregistrement présences :',
      error
    )

    res.status(500).json({
      erreur:
        'Impossible d’enregistrer les présences.',
    })

  } finally {
    client.release()
  }
})


// =====================================================
// RÉCUPÉRER LES PRÉSENCES
// =====================================================

router.get('/', async (req, res) => {
  try {

    const {
      classe_id,
      date,
    } = req.query

    let requete = `
      SELECT
        p.id,
        p.eleve_id,
        p.classe_id,
        p.enseignant_id,
        p.statut,
        p.date_appel,

        e.nom AS eleve_nom,
        e.prenom AS eleve_prenom,

        c.nom AS classe_nom,
        c.section AS classe_section,

        u.nom AS enseignant_nom

      FROM presences p

      INNER JOIN eleves e
        ON e.id = p.eleve_id

      INNER JOIN classes c
        ON c.id = p.classe_id

      LEFT JOIN utilisateurs u
        ON u.id = p.enseignant_id

      WHERE 1 = 1
    `

    const valeurs = []
    let numero = 1

    // Filtre classe
    if (classe_id) {
      requete += ` AND p.classe_id = $${numero}`
      valeurs.push(classe_id)
      numero++
    }

    // Filtre date
    if (date) {
      requete += ` AND p.date_appel = $${numero}`
      valeurs.push(date)
      numero++
    }

    // Par défaut : aujourd'hui
    if (!date) {
      requete += ` AND p.date_appel = CURRENT_DATE`
    }

    requete += `
      ORDER BY
        c.section,
        c.nom,
        e.nom,
        e.prenom
    `

    const resultat = await pool.query(
      requete,
      valeurs
    )

    res.json(resultat.rows)

  } catch (error) {

    console.error(
      'Erreur récupération présences :',
      error
    )

    res.status(500).json({
      erreur:
        'Impossible de récupérer les présences.',
    })
  }
})
// =====================================================
// HISTORIQUE DES APPELS - ADMIN
// GET /api/presences/historique
// =====================================================

router.get('/historique', async (req, res) => {
  try {
    const {
      section,
      classe_id,
      enseignant_id,
      date_debut,
      date_fin,
    } = req.query

    const conditions = []
    const valeurs = []

    let numero = 1

    // -------------------------------------------------
    // FILTRE SECTION
    // -------------------------------------------------

    if (section) {
      conditions.push(`c.section = $${numero}`)
      valeurs.push(section)
      numero++
    }

    // -------------------------------------------------
    // FILTRE CLASSE
    // -------------------------------------------------

    if (classe_id) {
      conditions.push(`p.classe_id = $${numero}`)
      valeurs.push(Number(classe_id))
      numero++
    }

    // -------------------------------------------------
    // FILTRE ENSEIGNANT
    // -------------------------------------------------

    if (enseignant_id) {
      conditions.push(`p.enseignant_id = $${numero}`)
      valeurs.push(Number(enseignant_id))
      numero++
    }

    // -------------------------------------------------
    // FILTRE DATE DEBUT
    // -------------------------------------------------

    if (date_debut) {
      conditions.push(`p.date_appel >= $${numero}`)
      valeurs.push(date_debut)
      numero++
    }

    // -------------------------------------------------
    // FILTRE DATE FIN
    // -------------------------------------------------

    if (date_fin) {
      conditions.push(`p.date_appel <= $${numero}`)
      valeurs.push(date_fin)
      numero++
    }

    const where =
      conditions.length > 0
        ? `WHERE ${conditions.join(' AND ')}`
        : ''

    const resultat = await pool.query(
      `
      SELECT
        p.date_appel,
        p.classe_id,
        c.nom AS classe_nom,
        c.section AS classe_section,
        p.enseignant_id,
        CONCAT(
          COALESCE(u.prenom, ''),
          ' ',
          COALESCE(u.nom, '')
        ) AS enseignant_nom,

        COUNT(*) AS total_eleves,

        COUNT(
          CASE
            WHEN p.statut = 'present'
            THEN 1
          END
        ) AS presents,

        COUNT(
          CASE
            WHEN p.statut = 'absent'
            THEN 1
          END
        ) AS absents

      FROM presences p

      INNER JOIN classes c
        ON c.id = p.classe_id

      LEFT JOIN utilisateurs u
        ON u.id = p.enseignant_id

      ${where}

      GROUP BY
        p.date_appel,
        p.classe_id,
        c.nom,
        c.section,
        p.enseignant_id,
        u.prenom,
        u.nom

      ORDER BY
        p.date_appel DESC,
        c.section ASC,
        c.nom ASC
      `,
      valeurs
    )

    const historique = resultat.rows.map((ligne) => {
      const total = Number(ligne.total_eleves)
      const presents = Number(ligne.presents)
      const absents = Number(ligne.absents)

      const taux =
        total > 0
          ? Math.round((presents / total) * 100)
          : 0

      return {
        date_appel: ligne.date_appel,
        classe_id: ligne.classe_id,
        classe_nom: ligne.classe_nom,
        classe_section: ligne.classe_section,
        enseignant_id: ligne.enseignant_id,
        enseignant_nom:
          ligne.enseignant_nom?.trim() ||
          'Enseignant non renseigné',
        total_eleves: total,
        presents,
        absents,
        taux_presence: taux,
      }
    })

    res.json(historique)
  } catch (error) {
    console.error(
      "Erreur historique des appels :",
      error
    )

    res.status(500).json({
      erreur:
        "Impossible de récupérer l'historique des appels.",
    })
  }
})


// =====================================================
// RÉCUPÉRER L'APPEL D'UNE CLASSE
// =====================================================

router.get('/classe/:classeId', async (req, res) => {

  try {

    const { classeId } = req.params
    const { date } = req.query

    const resultat = await pool.query(
      `
      SELECT
        p.id,
        p.eleve_id,
        p.classe_id,
        p.enseignant_id,
        p.statut,
        p.date_appel,

        e.nom AS eleve_nom,
        e.prenom AS eleve_prenom,

        c.nom AS classe_nom,
        c.section AS classe_section,

        u.nom AS enseignant_nom

      FROM presences p

      INNER JOIN eleves e
        ON e.id = p.eleve_id

      INNER JOIN classes c
        ON c.id = p.classe_id

      LEFT JOIN utilisateurs u
        ON u.id = p.enseignant_id

      WHERE p.classe_id = $1

      AND p.date_appel =
        COALESCE(
          $2::date,
          CURRENT_DATE
        )

      ORDER BY
        e.nom,
        e.prenom
      `,
      [
        classeId,
        date || null,
      ]
    )

    res.json(resultat.rows)

  } catch (error) {

    console.error(
      'Erreur récupération appel classe :',
      error
    )

    res.status(500).json({
      erreur:
        'Impossible de récupérer l’appel de cette classe.',
    })
  }
})


export default router