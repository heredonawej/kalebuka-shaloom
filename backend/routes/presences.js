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

    if (
      !enseignant_id ||
      !classe_id ||
      !Array.isArray(presences)
    ) {
      return res.status(400).json({
        erreur:
          'Données de présence invalides.',
      })
    }

    const enseignant = await client.query(
      `
      SELECT id, classe_id
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

    if (
      Number(enseignant.rows[0].classe_id) !==
      Number(classe_id)
    ) {
      return res.status(403).json({
        erreur:
          "Cet enseignant n'est pas affecté à cette classe.",
      })
    }

    await client.query('BEGIN')

    for (const presence of presences) {
      if (!presence.eleve_id || !presence.statut) {
        continue
      }

      await client.query(
        `
        INSERT INTO presences (
          eleve_id,
          enseignant_id,
          classe_id,
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
        ON CONFLICT (
          eleve_id,
          date_appel
        )
        DO UPDATE SET
          enseignant_id = EXCLUDED.enseignant_id,
          classe_id = EXCLUDED.classe_id,
          statut = EXCLUDED.statut
        `,
        [
          presence.eleve_id,
          enseignant_id,
          classe_id,
          presence.statut,
        ]
      )
    }

    await client.query('COMMIT')

    res.json({
      message:
        "L'appel a été enregistré avec succès.",
    })
  } catch (error) {
    await client.query('ROLLBACK')

    console.error(
      'ERREUR ENREGISTREMENT PRESENCES :',
      error
    )

    res.status(500).json({
      erreur:
        "Impossible d'enregistrer l'appel.",
    })
  } finally {
    client.release()
  }
})

// =====================================================
// APPEL D'UNE CLASSE POUR UNE DATE
// =====================================================

router.get('/classe/:classeId', async (req, res) => {
  try {
    const { classeId } = req.params

    const date =
      req.query.date ||
      new Date().toISOString().slice(0, 10)

    const resultat = await pool.query(
      `
      SELECT
        p.id,
        p.eleve_id,
        p.enseignant_id,
        p.classe_id,
        p.statut,
        p.date_appel,
        e.nom,
        e.prenom
      FROM presences p
      INNER JOIN eleves e
        ON e.id = p.eleve_id
      WHERE p.classe_id = $1
        AND p.date_appel = $2
      ORDER BY e.nom ASC, e.prenom ASC
      `,
      [Number(classeId), date]
    )

    res.json(resultat.rows)
  } catch (error) {
    console.error(
      'ERREUR APPEL CLASSE :',
      error
    )

    res.status(500).json({
      erreur:
        "Impossible de récupérer l'appel.",
    })
  }
})

// =====================================================
// HISTORIQUE DES APPELS
// =====================================================

router.get('/historique', async (req, res) => {
  try {
    const {
      section,
      classe_id,
      date_debut,
      date_fin,
    } = req.query

    const conditions = []
    const valeurs = []
    let numero = 1

    // -----------------------------
    // FILTRE SECTION
    // -----------------------------

    if (section) {
      conditions.push(
        `c.section = $${numero}`
      )

      valeurs.push(section)
      numero++
    }

    // -----------------------------
    // FILTRE CLASSE
    // -----------------------------

    if (classe_id) {
      conditions.push(
        `p.classe_id = $${numero}`
      )

      valeurs.push(Number(classe_id))
      numero++
    }

    // -----------------------------
    // DATE DEBUT
    // -----------------------------

    if (date_debut) {
      conditions.push(
        `p.date_appel >= $${numero}`
      )

      valeurs.push(date_debut)
      numero++
    }

    // -----------------------------
    // DATE FIN
    // -----------------------------

    if (date_fin) {
      conditions.push(
        `p.date_appel <= $${numero}`
      )

      valeurs.push(date_fin)
      numero++
    }

    const where =
      conditions.length > 0
        ? `WHERE ${conditions.join(' AND ')}`
        : ''

    /*
      IMPORTANT :
      On ne dépend PAS de utilisateurs ici.
      L'historique fonctionnera même si certaines
      informations enseignant sont absentes.
    */

    const resultat = await pool.query(
      `
      SELECT
        p.date_appel,
        p.classe_id,
        c.nom AS classe_nom,
        c.section AS classe_section,
        p.enseignant_id,

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

      ${where}

      GROUP BY
        p.date_appel,
        p.classe_id,
        c.nom,
        c.section,
        p.enseignant_id

      ORDER BY
        p.date_appel DESC,
        c.section ASC,
        c.nom ASC
      `,
      valeurs
    )

    const historique =
      resultat.rows.map((ligne) => {
        const total =
          Number(ligne.total_eleves)

        const presents =
          Number(ligne.presents)

        const absents =
          Number(ligne.absents)

        const taux =
          total > 0
            ? Math.round(
                (presents / total) * 100
              )
            : 0

        return {
          date_appel:
            ligne.date_appel,

          classe_id:
            ligne.classe_id,

          classe_nom:
            ligne.classe_nom,

          classe_section:
            ligne.classe_section,

          enseignant_id:
            ligne.enseignant_id,

          total_eleves:
            total,

          presents,

          absents,

          taux_presence:
            taux,
        }
      })

    console.log(
      'HISTORIQUE APPELS :',
      historique
    )

    res.status(200).json(historique)

  } catch (error) {

    console.error(
      'ERREUR SQL HISTORIQUE APPELS :',
      error
    )

    res.status(500).json({
      erreur:
        "Impossible de récupérer l'historique des appels.",
      detail:
        process.env.NODE_ENV !== 'production'
          ? error.message
          : undefined,
    })
  }
})

// =====================================================
// HISTORIQUE GLOBAL SIMPLE
// =====================================================

router.get('/', async (req, res) => {
  try {
    const resultat = await pool.query(
      `
      SELECT
        p.id,
        p.eleve_id,
        p.enseignant_id,
        p.classe_id,
        p.statut,
        p.date_appel
      FROM presences p
      ORDER BY
        p.date_appel DESC,
        p.id DESC
      `
    )

    res.json(resultat.rows)
  } catch (error) {
    console.error(
      'ERREUR GET PRESENCES :',
      error
    )

    res.status(500).json({
      erreur:
        'Impossible de récupérer les présences.',
    })
  }
})

export default router