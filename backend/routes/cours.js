import express from 'express'
import pool from '../db.js'

const router = express.Router()


// =====================================================
// RÉCUPÉRER LES PRÉPARATIONS
// =====================================================

router.get('/', async (req, res) => {
  try {
    const { enseignant_id } = req.query

    let requete = `
      SELECT
        c.*,
        cl.nom AS classe_nom,
        cl.section,
        u.nom AS enseignant_nom
      FROM cours c
      LEFT JOIN classes cl
        ON c.classe_id = cl.id
      LEFT JOIN utilisateurs u
        ON c.enseignant_id = u.id
    `

    const valeurs = []

    if (enseignant_id) {
      requete += `
        WHERE c.enseignant_id = $1
      `

      valeurs.push(enseignant_id)
    }

    requete += `
      ORDER BY c.date_creation DESC
    `

    const resultat = await pool.query(
      requete,
      valeurs
    )

    res.json(resultat.rows)

  } catch (err) {

    console.error(
      'Erreur récupération préparations :',
      err
    )

    res.status(500).json({
      erreur:
        'Impossible de récupérer les préparations.'
    })
  }
})


// =====================================================
// CRÉER UNE NOUVELLE PRÉPARATION
// =====================================================
// =====================================================
// RÉCUPÉRER UNE PRÉPARATION PAR SON ID
// =====================================================

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const resultat = await pool.query(
      `
      SELECT
        c.*,
        cl.nom AS classe_nom,
        cl.section,
        u.nom AS enseignant_nom
      FROM cours c
      LEFT JOIN classes cl
        ON c.classe_id = cl.id
      LEFT JOIN utilisateurs u
        ON c.enseignant_id = u.id
      WHERE c.id = $1
      `,
      [id]
    )

    if (resultat.rows.length === 0) {
      return res.status(404).json({
        erreur: 'Préparation introuvable.'
      })
    }

    res.json(resultat.rows[0])

  } catch (err) {
    console.error(
      'Erreur récupération préparation :',
      err
    )

    res.status(500).json({
      erreur:
        'Impossible de récupérer la préparation.'
    })
  }
})

router.post('/', async (req, res) => {
  try {

    const {
      enseignant_id,

      branche,
      sous_branche,
      jour,
      date_lecon,
      heure_debut,
      heure_fin,
      fiche_numero,

      sujet,
      materiel_didactique,
      reference,
      objectif_operationnel,

      rappel_enseignant,
      rappel_apprenants,

      motivation_enseignant,
      motivation_apprenants,

      annonce_enseignant,
      annonce_apprenants,

      analyse_enseignant,
      analyse_apprenants,

      synthese_enseignant,
      synthese_apprenants,

      questions_finales,
      reponses_finales,

      // Anciennes données conservées
      titre,
      matiere,
      objectifs,
      deroule,

    } = req.body


    // -----------------------------------------------
    // Vérification de l'enseignant
    // -----------------------------------------------

    if (!enseignant_id) {
      return res.status(400).json({
        erreur:
          'Enseignant non identifié.'
      })
    }


    // -----------------------------------------------
    // Récupérer la classe de l'enseignant
    // -----------------------------------------------

    const enseignantResultat =
      await pool.query(
        `
        SELECT
          id,
          nom,
          classe_id
        FROM utilisateurs
        WHERE id = $1
          AND role = 'enseignant'
        `,
        [enseignant_id]
      )


    if (
      enseignantResultat.rows.length === 0
    ) {
      return res.status(404).json({
        erreur:
          'Enseignant introuvable.'
      })
    }


    const enseignant =
      enseignantResultat.rows[0]


    // -----------------------------------------------
    // L'enseignant doit avoir une classe
    // -----------------------------------------------

    if (!enseignant.classe_id) {
      return res.status(400).json({
        erreur:
          'Aucune classe n’est encore affectée à cet enseignant. Contactez la direction.'
      })
    }


    // -----------------------------------------------
    // Vérification des champs principaux
    // -----------------------------------------------

    if (
      !branche ||
      !sous_branche ||
      !sujet ||
      !objectif_operationnel
    ) {
      return res.status(400).json({
        erreur:
          'Veuillez remplir les informations principales de la préparation.'
      })
    }


    // -----------------------------------------------
    // Création
    // -----------------------------------------------

    const resultat = await pool.query(
      `
      INSERT INTO cours (

        titre,
        matiere,
        objectifs,
        deroule,

        branche,
        sous_branche,
        jour,
        date_lecon,
        heure_debut,
        heure_fin,
        fiche_numero,

        sujet,
        materiel_didactique,
        reference,
        objectif_operationnel,

        rappel_enseignant,
        rappel_apprenants,

        motivation_enseignant,
        motivation_apprenants,

        annonce_enseignant,
        annonce_apprenants,

        analyse_enseignant,
        analyse_apprenants,

        synthese_enseignant,
        synthese_apprenants,

        questions_finales,
        reponses_finales,

        statut,
        enseignant_id,
        classe_id

      )
      VALUES (

        $1,
        $2,
        $3,
        $4,

        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,

        $12,
        $13,
        $14,
        $15,

        $16,
        $17,

        $18,
        $19,

        $20,
        $21,

        $22,
        $23,

        $24,
        $25,

        $26,
        $27,

        'brouillon',
        $28,
        $29

      )

      RETURNING *
      `,
      [

        // Anciennes colonnes
        titre || sujet,
        matiere || branche,
        objectifs || objectif_operationnel,
        deroule || null,

        // Nouvelles colonnes
        branche,
        sous_branche,
        jour || null,
        date_lecon || null,
        heure_debut || null,
        heure_fin || null,
        fiche_numero || null,

        sujet,
        materiel_didactique || null,
        reference || null,
        objectif_operationnel,

        rappel_enseignant || null,
        rappel_apprenants || null,

        motivation_enseignant || null,
        motivation_apprenants || null,

        annonce_enseignant || null,
        annonce_apprenants || null,

        analyse_enseignant || null,
        analyse_apprenants || null,

        synthese_enseignant || null,
        synthese_apprenants || null,

        questions_finales || null,
        reponses_finales || null,

        // IMPORTANT :
        // classe récupérée depuis l'enseignant
        enseignant.id,
        enseignant.classe_id,
      ]
    )


    res.status(201).json(
      resultat.rows[0]
    )

  } catch (err) {

    console.error(
      'Erreur création préparation :',
      err
    )

    res.status(500).json({
      erreur:
        'Impossible de créer la préparation.'
    })
  }
})


// =====================================================
// MODIFIER UNE PRÉPARATION
// =====================================================

router.put('/:id', async (req, res) => {
  try {

    const { id } = req.params

    const {
      enseignant_id,

      branche,
      sous_branche,
      jour,
      date_lecon,
      heure_debut,
      heure_fin,
      fiche_numero,

      sujet,
      materiel_didactique,
      reference,
      objectif_operationnel,

      rappel_enseignant,
      rappel_apprenants,

      motivation_enseignant,
      motivation_apprenants,

      annonce_enseignant,
      annonce_apprenants,

      analyse_enseignant,
      analyse_apprenants,

      synthese_enseignant,
      synthese_apprenants,

      questions_finales,
      reponses_finales,

      titre,
      matiere,
      objectifs,
      deroule,

    } = req.body


    // -----------------------------------------------
    // Vérifier la préparation
    // -----------------------------------------------

    const preparationResultat =
      await pool.query(
        `
        SELECT *
        FROM cours
        WHERE id = $1
          AND enseignant_id = $2
        `,
        [id, enseignant_id]
      )


    if (
      preparationResultat.rows.length === 0
    ) {
      return res.status(404).json({
        erreur:
          'Préparation introuvable ou accès refusé.'
      })
    }


    const preparation =
      preparationResultat.rows[0]


    // -----------------------------------------------
    // Seuls brouillons et rejets sont modifiables
    // -----------------------------------------------

    if (
      preparation.statut !== 'brouillon' &&
      preparation.statut !== 'rejete'
    ) {
      return res.status(400).json({
        erreur:
          'Cette préparation ne peut plus être modifiée.'
      })
    }


    // -----------------------------------------------
    // Récupérer la classe actuelle de l'enseignant
    // -----------------------------------------------

    const enseignantResultat =
      await pool.query(
        `
        SELECT classe_id
        FROM utilisateurs
        WHERE id = $1
          AND role = 'enseignant'
        `,
        [enseignant_id]
      )


    if (
      enseignantResultat.rows.length === 0
    ) {
      return res.status(404).json({
        erreur:
          'Enseignant introuvable.'
      })
    }


    const classeId =
      enseignantResultat.rows[0].classe_id


    if (!classeId) {
      return res.status(400).json({
        erreur:
          'Aucune classe n’est affectée à cet enseignant.'
      })
    }


    // -----------------------------------------------
    // Mise à jour
    // -----------------------------------------------

    const resultat = await pool.query(
      `
      UPDATE cours
      SET

        titre = $1,
        matiere = $2,
        objectifs = $3,
        deroule = $4,

        branche = $5,
        sous_branche = $6,
        jour = $7,
        date_lecon = $8,
        heure_debut = $9,
        heure_fin = $10,
        fiche_numero = $11,

        sujet = $12,
        materiel_didactique = $13,
        reference = $14,
        objectif_operationnel = $15,

        rappel_enseignant = $16,
        rappel_apprenants = $17,

        motivation_enseignant = $18,
        motivation_apprenants = $19,

        annonce_enseignant = $20,
        annonce_apprenants = $21,

        analyse_enseignant = $22,
        analyse_apprenants = $23,

        synthese_enseignant = $24,
        synthese_apprenants = $25,

        questions_finales = $26,
        reponses_finales = $27,

        classe_id = $28,

        statut = 'brouillon',
        motif_rejet = NULL,
        date_soumission = NULL,
        date_validation = NULL

      WHERE id = $29
        AND enseignant_id = $30

      RETURNING *
      `,
      [

        titre || sujet,
        matiere || branche,
        objectifs || objectif_operationnel,
        deroule || null,

        branche,
        sous_branche,
        jour || null,
        date_lecon || null,
        heure_debut || null,
        heure_fin || null,
        fiche_numero || null,

        sujet,
        materiel_didactique || null,
        reference || null,
        objectif_operationnel,

        rappel_enseignant || null,
        rappel_apprenants || null,

        motivation_enseignant || null,
        motivation_apprenants || null,

        annonce_enseignant || null,
        annonce_apprenants || null,

        analyse_enseignant || null,
        analyse_apprenants || null,

        synthese_enseignant || null,
        synthese_apprenants || null,

        questions_finales || null,
        reponses_finales || null,

        classeId,

        id,
        enseignant_id,
      ]
    )


    res.json(resultat.rows[0])

  } catch (err) {

    console.error(
      'Erreur modification préparation :',
      err
    )

    res.status(500).json({
      erreur:
        'Impossible de modifier la préparation.'
    })
  }
})


// =====================================================
// SOUMETTRE UNE PRÉPARATION
// =====================================================

router.post('/:id/soumettre', async (req, res) => {
  try {

    const { id } = req.params

    const resultat = await pool.query(
      `
      UPDATE cours
      SET
        statut = 'soumis',
        date_soumission = CURRENT_TIMESTAMP,
        motif_rejet = NULL
      WHERE id = $1
        AND statut = 'brouillon'
      RETURNING *
      `,
      [id]
    )


    if (resultat.rows.length === 0) {
      return res.status(400).json({
        erreur:
          'Cette préparation ne peut pas être soumise.'
      })
    }


    res.json({
      message:
        'Préparation soumise avec succès.',
      preparation:
        resultat.rows[0]
    })

  } catch (err) {

    console.error(
      'Erreur soumission préparation :',
      err
    )

    res.status(500).json({
      erreur:
        'Impossible de soumettre la préparation.'
    })
  }
})


// =====================================================
// VALIDER UNE PRÉPARATION
// =====================================================

router.post('/:id/valider', async (req, res) => {
  try {

    const { id } = req.params

    const resultat = await pool.query(
      `
      UPDATE cours
      SET
        statut = 'valide',
        date_validation = CURRENT_TIMESTAMP
      WHERE id = $1
        AND statut = 'soumis'
      RETURNING *
      `,
      [id]
    )


    if (resultat.rows.length === 0) {
      return res.status(400).json({
        erreur:
          'Cette préparation ne peut pas être validée.'
      })
    }


    res.json({
      message:
        'Préparation validée avec succès.',
      preparation:
        resultat.rows[0]
    })

  } catch (err) {

    console.error(
      'Erreur validation préparation :',
      err
    )

    res.status(500).json({
      erreur:
        'Impossible de valider la préparation.'
    })
  }
})


// =====================================================
// REJETER UNE PRÉPARATION
// =====================================================

router.post('/:id/rejeter', async (req, res) => {
  try {

    const { id } = req.params
    const { motif_rejet } = req.body

    if (!motif_rejet) {
      return res.status(400).json({
        erreur:
          'Le motif du rejet est obligatoire.'
      })
    }


    const resultat = await pool.query(
      `
      UPDATE cours
      SET
        statut = 'rejete',
        motif_rejet = $1,
        date_validation = NULL
      WHERE id = $2
        AND statut = 'soumis'
      RETURNING *
      `,
      [motif_rejet, id]
    )


    if (resultat.rows.length === 0) {
      return res.status(400).json({
        erreur:
          'Cette préparation ne peut pas être rejetée.'
      })
    }


    res.json({
      message:
        'Préparation rejetée.',
      preparation:
        resultat.rows[0]
    })

  } catch (err) {

    console.error(
      'Erreur rejet préparation :',
      err
    )

    res.status(500).json({
      erreur:
        'Impossible de rejeter la préparation.'
    })
  }
})


// =====================================================
// SUPPRIMER UNE PRÉPARATION
// =====================================================

router.delete('/:id', async (req, res) => {
  try {

    const { id } = req.params
    const { enseignant_id } = req.body


    const resultat = await pool.query(
      `
      DELETE FROM cours
      WHERE id = $1
        AND enseignant_id = $2
        AND statut = 'brouillon'
      RETURNING id
      `,
      [id, enseignant_id]
    )


    if (resultat.rows.length === 0) {
      return res.status(400).json({
        erreur:
          'Cette préparation ne peut pas être supprimée.'
      })
    }


    res.json({
      message:
        'Préparation supprimée avec succès.'
    })

  } catch (err) {

    console.error(
      'Erreur suppression préparation :',
      err
    )

    res.status(500).json({
      erreur:
        'Impossible de supprimer la préparation.'
    })
  }
})


export default router