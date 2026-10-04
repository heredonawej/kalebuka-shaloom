import express from 'express'
import pool from '../db.js'

const router = express.Router()

// =====================================================
// ENREGISTRER L'APPEL
// =====================================================

router.post('/', async (req, res) => {
  let client = null
  let transactionCommencee = false

  try {
    const {
      enseignant_id,
      classe_id,
      presences,
    } = req.body

    // -------------------------------------------------
    // VALIDATION DES DONNÉES
    // -------------------------------------------------

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

    if (presences.length === 0) {
      return res.status(400).json({
        erreur:
          'Aucun élève à enregistrer.',
      })
    }

    // -------------------------------------------------
    // CONNEXION
    // -------------------------------------------------

    client = await pool.connect()

    // -------------------------------------------------
    // VÉRIFIER L'ENSEIGNANT
    // -------------------------------------------------

    const enseignant =
      await client.query(
        `
        SELECT
          id,
          classe_id
        FROM utilisateurs
        WHERE id = $1
          AND role = 'enseignant'
        `,
        [Number(enseignant_id)]
      )

    if (enseignant.rows.length === 0) {
      return res.status(404).json({
        erreur:
          'Enseignant introuvable.',
      })
    }

    // -------------------------------------------------
    // VÉRIFIER LA CLASSE DE L'ENSEIGNANT
    // -------------------------------------------------

    if (
      Number(
        enseignant.rows[0].classe_id
      ) !== Number(classe_id)
    ) {
      return res.status(403).json({
        erreur:
          "Cet enseignant n'est pas affecté à cette classe.",
      })
    }

    // -------------------------------------------------
    // VÉRIFIER QUE LA CLASSE EXISTE
    // -------------------------------------------------

    const classe =
      await client.query(
        `
        SELECT
          id,
          nom,
          section
        FROM classes
        WHERE id = $1
        `,
        [Number(classe_id)]
      )

    if (classe.rows.length === 0) {
      return res.status(404).json({
        erreur:
          'Classe introuvable.',
      })
    }

    // -------------------------------------------------
    // COMMENCER LA TRANSACTION
    // -------------------------------------------------

    await client.query('BEGIN')
    transactionCommencee = true

    let nombreEnregistres = 0

    // -------------------------------------------------
    // ENREGISTRER CHAQUE ÉLÈVE
    // -------------------------------------------------

    for (const presence of presences) {
      if (
        !presence.eleve_id ||
        !presence.statut
      ) {
        continue
      }

      const eleveId =
        Number(presence.eleve_id)

      const statut =
        String(presence.statut).toLowerCase()

      // ------------------------------------------------
      // VÉRIFIER LE STATUT
      // ------------------------------------------------

      if (
        statut !== 'present' &&
        statut !== 'absent'
      ) {
        continue
      }

      // ------------------------------------------------
      // VÉRIFIER QUE L'ÉLÈVE APPARTIENT À LA CLASSE
      // ------------------------------------------------

      const eleve =
        await client.query(
          `
          SELECT
            id,
            classe_id
          FROM eleves
          WHERE id = $1
          `,
          [eleveId]
        )

      if (eleve.rows.length === 0) {
        continue
      }

      if (
        Number(
          eleve.rows[0].classe_id
        ) !== Number(classe_id)
      ) {
        continue
      }

      // ------------------------------------------------
      // VÉRIFIER SI L'ÉLÈVE A DÉJÀ UN APPEL AUJOURD'HUI
      // ------------------------------------------------

      const existant =
        await client.query(
          `
          SELECT id
          FROM presences
          WHERE eleve_id = $1
            AND date_appel = CURRENT_DATE
          LIMIT 1
          `,
          [eleveId]
        )

      // ------------------------------------------------
      // SI EXISTE → MODIFIER
      // ------------------------------------------------

      if (existant.rows.length > 0) {
        await client.query(
          `
          UPDATE presences
          SET
            enseignant_id = $1,
            classe_id = $2,
            statut = $3
          WHERE id = $4
          `,
          [
            Number(enseignant_id),
            Number(classe_id),
            statut,
            existant.rows[0].id,
          ]
        )
      }

      // ------------------------------------------------
      // SINON → CRÉER
      // ------------------------------------------------

      else {
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
          `,
          [
            eleveId,
            Number(enseignant_id),
            Number(classe_id),
            statut,
          ]
        )
      }

      nombreEnregistres++
    }

    // -------------------------------------------------
    // VÉRIFIER QU'ON A BIEN ENREGISTRÉ DES ÉLÈVES
    // -------------------------------------------------

    if (nombreEnregistres === 0) {
      await client.query('ROLLBACK')
      transactionCommencee = false

      return res.status(400).json({
        erreur:
          'Aucune présence valide à enregistrer.',
      })
    }

    // -------------------------------------------------
    // VALIDER
    // -------------------------------------------------

    await client.query('COMMIT')
    transactionCommencee = false

    console.log(
      `✅ Appel enregistré : ${nombreEnregistres} élève(s), classe ${classe_id}, enseignant ${enseignant_id}`
    )

    res.status(200).json({
      message:
        "L'appel a été enregistré avec succès.",
      nombre_enregistres:
        nombreEnregistres,
    })

  } catch (error) {

    // -------------------------------------------------
    // ANNULER LA TRANSACTION EN CAS D'ERREUR
    // -------------------------------------------------

    if (
      client &&
      transactionCommencee
    ) {
      try {
        await client.query(
          'ROLLBACK'
        )
      } catch (rollbackError) {
        console.error(
          'ERREUR ROLLBACK :',
          rollbackError
        )
      }
    }

    console.error(
      '❌ ERREUR ENREGISTREMENT PRESENCES :',
      error
    )

    res.status(500).json({
      erreur:
        "Impossible d'enregistrer l'appel.",
      detail:
        process.env.NODE_ENV !==
        'production'
          ? error.message
          : undefined,
    })

  } finally {

    if (client) {
      client.release()
    }
  }
})
// =====================================================
// RÉCUPÉRER L'HISTORIQUE DES PRÉSENCES D'UN ÉLÈVE
// À placer AVANT router.get('/classe/:classeId', ...)
// =====================================================

router.get('/eleve/:eleveId', async (req, res) => {
  try {
    const { eleveId } = req.params

    const resultat = await pool.query(
      `
      SELECT
        p.id,
        p.eleve_id,
        p.classe_id,
        p.statut,
        p.date_appel,
        c.nom AS classe_nom,
        c.section AS classe_section
      FROM presences p
      LEFT JOIN classes c
        ON p.classe_id = c.id
      WHERE p.eleve_id = $1
      ORDER BY p.date_appel DESC, p.id DESC
      `,
      [eleveId]
    )

    res.json(resultat.rows)

  } catch (err) {
    console.error(
      'Erreur récupération présences élève :',
      err
    )

    res.status(500).json({
      erreur:
        'Impossible de récupérer les présences de cet élève.'
    })
  }
})


// =====================================================
// APPEL D'UNE CLASSE POUR UNE DATE
// =====================================================

router.get(
  '/classe/:classeId',
  async (req, res) => {
    try {
      const { classeId } =
        req.params

      const date =
        req.query.date ||
        new Date()
          .toISOString()
          .slice(0, 10)

      const resultat =
        await pool.query(
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
          ORDER BY
            e.nom ASC,
            e.prenom ASC
          `,
          [
            Number(classeId),
            date,
          ]
        )

      res.json(
        resultat.rows
      )

    } catch (error) {

      console.error(
        '❌ ERREUR APPEL CLASSE :',
        error
      )

      res.status(500).json({
        erreur:
          "Impossible de récupérer l'appel.",
        detail:
          process.env.NODE_ENV !==
          'production'
            ? error.message
            : undefined,
      })
    }
  }
)

// =====================================================
// HISTORIQUE DES APPELS
// =====================================================

router.get(
  '/historique',
  async (req, res) => {
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

      // -------------------------------------------------
      // FILTRE SECTION
      // -------------------------------------------------

      if (section) {
        conditions.push(
          `c.section = $${numero}`
        )

        valeurs.push(section)
        numero++
      }

      // -------------------------------------------------
      // FILTRE CLASSE
      // -------------------------------------------------

      if (classe_id) {
        conditions.push(
          `p.classe_id = $${numero}`
        )

        valeurs.push(
          Number(classe_id)
        )

        numero++
      }

      // -------------------------------------------------
      // DATE DÉBUT
      // -------------------------------------------------

      if (date_debut) {
        conditions.push(
          `p.date_appel >= $${numero}`
        )

        valeurs.push(date_debut)
        numero++
      }

      // -------------------------------------------------
      // DATE FIN
      // -------------------------------------------------

      if (date_fin) {
        conditions.push(
          `p.date_appel <= $${numero}`
        )

        valeurs.push(date_fin)
        numero++
      }

      const where =
        conditions.length > 0
          ? `WHERE ${conditions.join(
              ' AND '
            )}`
          : ''

      // -------------------------------------------------
      // REQUÊTE HISTORIQUE
      // -------------------------------------------------

      const resultat =
        await pool.query(
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

      // -------------------------------------------------
      // CALCUL DU TAUX
      // -------------------------------------------------

      const historique =
        resultat.rows.map(
          (ligne) => {

            const total =
              Number(
                ligne.total_eleves
              )

            const presents =
              Number(
                ligne.presents
              )

            const absents =
              Number(
                ligne.absents
              )

            const taux =
              total > 0
                ? Math.round(
                    (presents /
                      total) *
                      100
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
          }
        )

      console.log(
        '✅ HISTORIQUE APPELS :',
        historique
      )

      res.status(200).json(
        historique
      )

    } catch (error) {

      console.error(
        '❌ ERREUR SQL HISTORIQUE APPELS :',
        error
      )

      res.status(500).json({
        erreur:
          "Impossible de récupérer l'historique des appels.",

        detail:
          process.env.NODE_ENV !==
          'production'
            ? error.message
            : undefined,
      })
    }
  }
)

// =====================================================
// HISTORIQUE GLOBAL SIMPLE
// =====================================================

router.get(
  '/',
  async (req, res) => {
    try {

      const resultat =
        await pool.query(
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

      res.json(
        resultat.rows
      )

    } catch (error) {

      console.error(
        '❌ ERREUR GET PRESENCES :',
        error
      )

      res.status(500).json({
        erreur:
          'Impossible de récupérer les présences.',
        detail:
          process.env.NODE_ENV !==
          'production'
            ? error.message
            : undefined,
      })
    }
  }
)

export default router