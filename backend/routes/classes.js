import express from 'express'
import pool from '../db.js'

const router = express.Router()


// =====================================================
// 1. LISTE DE TOUTES LES CLASSES
// =====================================================

router.get('/', async (req, res) => {
  try {
    const resultat = await pool.query(`
      SELECT
        c.*,
        COUNT(e.id) AS total_eleves
      FROM classes c
      LEFT JOIN eleves e ON c.id = e.classe_id
      GROUP BY c.id
      ORDER BY c.id ASC;
    `)

    res.json(resultat.rows)

  } catch (err) {
    console.error('Erreur chargement classes :', err)

    res.status(500).json({
      erreur: 'Impossible de charger les classes.'
    })
  }
})


// =====================================================
// 2. CRÉER UNE CLASSE
// =====================================================

router.post('/', async (req, res) => {
  try {
    const { nom, section } = req.body

    if (!nom || !nom.trim()) {
      return res.status(400).json({
        erreur: 'Le nom de la classe est obligatoire.'
      })
    }

    const sectionsAutorisees = [
      'Maternelle',
      'Primaire',
      'Secondaire'
    ]

    if (!section || !sectionsAutorisees.includes(section)) {
      return res.status(400).json({
        erreur:
          'La section doit être Maternelle, Primaire ou Secondaire.'
      })
    }

    const classeExistante = await pool.query(
      `
      SELECT id
      FROM classes
      WHERE LOWER(nom) = LOWER($1)
      AND section = $2
      `,
      [nom.trim(), section]
    )

    if (classeExistante.rows.length > 0) {
      return res.status(409).json({
        erreur: 'Cette classe existe déjà dans cette section.'
      })
    }

    const resultat = await pool.query(
      `
      INSERT INTO classes (nom, section)
      VALUES ($1, $2)
      RETURNING *;
      `,
      [nom.trim(), section]
    )

    res.status(201).json(resultat.rows[0])

  } catch (err) {
    console.error('Erreur création classe :', err)

    res.status(500).json({
      erreur: 'Impossible de créer la classe.'
    })
  }
})
// =====================================
// SUPPRIMER UNE CLASSE
// =====================================

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    // Vérifier que la classe existe
    const classe = await pool.query(
      `
      SELECT id, nom, section
      FROM classes
      WHERE id = $1
      `,
      [id]
    )

    if (classe.rows.length === 0) {
      return res.status(404).json({
        erreur: 'Classe introuvable.'
      })
    }

    // Vérifier les élèves
    const eleves = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM eleves
      WHERE classe_id = $1
      `,
      [id]
    )

    const totalEleves = Number(eleves.rows[0].total)

    if (totalEleves > 0) {
      return res.status(409).json({
        erreur:
          `Impossible de supprimer cette classe car elle contient ${totalEleves} élève(s).`
      })
    }

    // Vérifier les enseignants affectés
    const enseignants = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM utilisateurs
      WHERE classe_id = $1
      AND role = 'enseignant'
      `,
      [id]
    )

    const totalEnseignants =
      Number(enseignants.rows[0].total)

    if (totalEnseignants > 0) {
      return res.status(409).json({
        erreur:
          `Impossible de supprimer cette classe car ${totalEnseignants} enseignant(s) y sont affecté(s).`
      })
    }

    // Supprimer la classe
    const resultat = await pool.query(
      `
      DELETE FROM classes
      WHERE id = $1
      RETURNING id, nom, section
      `,
      [id]
    )

    res.json({
      message:
        `La classe « ${resultat.rows[0].nom} » a été supprimée avec succès.`,

      classe: resultat.rows[0]
    })

  } catch (err) {

    console.error(
      'Erreur suppression classe :',
      err
    )

    res.status(500).json({
      erreur:
        'Impossible de supprimer la classe.'
    })
  }
})


// =====================================================
// 3. AJOUTER UN ÉLÈVE
// =====================================================

router.post('/:id/eleves', async (req, res) => {
  try {

    const { id } = req.params

    const {
      nom,
      prenom,
      sexe,
      date_naissance,
      lieu_naissance,
      adresse,
      nom_tuteur,
      telephone_tuteur
    } = req.body


    // -----------------------------------------------
    // Vérification des informations obligatoires
    // -----------------------------------------------

    if (!nom || !nom.trim()) {
      return res.status(400).json({
        erreur: 'Le nom de l’élève est obligatoire.'
      })
    }

    if (!prenom || !prenom.trim()) {
      return res.status(400).json({
        erreur: 'Le prénom de l’élève est obligatoire.'
      })
    }

    if (!sexe) {
      return res.status(400).json({
        erreur: 'Le sexe de l’élève est obligatoire.'
      })
    }

    if (!date_naissance) {
      return res.status(400).json({
        erreur: 'La date de naissance est obligatoire.'
      })
    }

    if (!lieu_naissance || !lieu_naissance.trim()) {
      return res.status(400).json({
        erreur: 'Le lieu de naissance est obligatoire.'
      })
    }

    if (!adresse || !adresse.trim()) {
      return res.status(400).json({
        erreur: 'Le lieu de domicile est obligatoire.'
      })
    }

    if (!nom_tuteur || !nom_tuteur.trim()) {
      return res.status(400).json({
        erreur: 'Le nom du tuteur est obligatoire.'
      })
    }

    if (!telephone_tuteur || !telephone_tuteur.trim()) {
      return res.status(400).json({
        erreur: 'Le téléphone du tuteur est obligatoire.'
      })
    }


    // -----------------------------------------------
    // Vérifier le sexe
    // -----------------------------------------------

    const sexesAutorises = [
      'Masculin',
      'Féminin'
    ]

    if (!sexesAutorises.includes(sexe)) {
      return res.status(400).json({
        erreur: 'Le sexe doit être Masculin ou Féminin.'
      })
    }


    // -----------------------------------------------
    // Vérifier que la classe existe
    // -----------------------------------------------

    const classe = await pool.query(
      `
      SELECT id, nom, section
      FROM classes
      WHERE id = $1
      `,
      [id]
    )

    if (classe.rows.length === 0) {
      return res.status(404).json({
        erreur: 'Classe introuvable.'
      })
    }


    // -----------------------------------------------
    // Ajouter l'élève
    // -----------------------------------------------

    const resultat = await pool.query(
      `
      INSERT INTO eleves (
        nom,
        prenom,
        sexe,
        date_naissance,
        lieu_naissance,
        adresse,
        nom_tuteur,
        telephone_tuteur,
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
        $9
      )
      RETURNING *;
      `,
      [
        nom.trim(),
        prenom.trim(),
        sexe,
        date_naissance,
        lieu_naissance.trim(),
        adresse.trim(),
        nom_tuteur.trim(),
        telephone_tuteur.trim(),
        id
      ]
    )


    res.status(201).json({
      message: 'Élève ajouté avec succès.',
      eleve: resultat.rows[0]
    })

  } catch (err) {

    console.error('Erreur ajout élève :', err)

    res.status(500).json({
      erreur: 'Impossible d’ajouter l’élève.'
    })
  }
})
// =====================================================
// LISTE DE TOUS LES ÉLÈVES
// =====================================================

router.get('/eleves', async (req, res) => {
  try {
    const resultat = await pool.query(`
      SELECT
        e.id,
        e.nom,
        e.prenom,
        e.sexe,
        e.date_naissance,
        e.lieu_naissance,
        e.adresse,
        e.nom_tuteur,
        e.telephone_tuteur,
        e.classe_id,
        e.date_inscription,

        c.nom AS classe_nom,
        c.section AS classe_section,

        ROUND(AVG(n.valeur), 2) AS moyenne,
        COUNT(n.id) AS nombre_notes

      FROM eleves e

      LEFT JOIN classes c
        ON e.classe_id = c.id

      LEFT JOIN notes n
        ON e.id = n.eleve_id

      GROUP BY
        e.id,
        e.nom,
        e.prenom,
        e.sexe,
        e.date_naissance,
        e.lieu_naissance,
        e.adresse,
        e.nom_tuteur,
        e.telephone_tuteur,
        e.classe_id,
        e.date_inscription,
        c.nom,
        c.section

      ORDER BY e.date_inscription DESC, e.nom ASC;
    `)

    res.json(resultat.rows)

  } catch (err) {
    console.error(
      'Erreur chargement de tous les élèves :',
      err
    )

    res.status(500).json({
      erreur: 'Impossible de charger les élèves.'
    })
  }
})

// =====================================================
// 4. MODIFIER UN ÉLÈVE
// =====================================================

router.put('/eleves/:eleve_id', async (req, res) => {
  try {

    const { eleve_id } = req.params

    const {
      nom,
      prenom,
      sexe,
      date_naissance,
      lieu_naissance,
      adresse,
      nom_tuteur,
      telephone_tuteur,
      classe_id
    } = req.body


    // -----------------------------------------------
    // Vérifications
    // -----------------------------------------------

    if (!nom || !nom.trim()) {
      return res.status(400).json({
        erreur: 'Le nom de l’élève est obligatoire.'
      })
    }

    if (!prenom || !prenom.trim()) {
      return res.status(400).json({
        erreur: 'Le prénom de l’élève est obligatoire.'
      })
    }

    if (!sexe) {
      return res.status(400).json({
        erreur: 'Le sexe de l’élève est obligatoire.'
      })
    }

    if (!date_naissance) {
      return res.status(400).json({
        erreur: 'La date de naissance est obligatoire.'
      })
    }

    if (!lieu_naissance || !lieu_naissance.trim()) {
      return res.status(400).json({
        erreur: 'Le lieu de naissance est obligatoire.'
      })
    }

    if (!adresse || !adresse.trim()) {
      return res.status(400).json({
        erreur: 'Le lieu de domicile est obligatoire.'
      })
    }

    if (!nom_tuteur || !nom_tuteur.trim()) {
      return res.status(400).json({
        erreur: 'Le nom du tuteur est obligatoire.'
      })
    }

    if (!telephone_tuteur || !telephone_tuteur.trim()) {
      return res.status(400).json({
        erreur: 'Le téléphone du tuteur est obligatoire.'
      })
    }

    if (!classe_id) {
      return res.status(400).json({
        erreur: 'La classe est obligatoire.'
      })
    }


    // -----------------------------------------------
    // Vérifier le sexe
    // -----------------------------------------------

    const sexesAutorises = [
      'Masculin',
      'Féminin'
    ]

    if (!sexesAutorises.includes(sexe)) {
      return res.status(400).json({
        erreur: 'Le sexe doit être Masculin ou Féminin.'
      })
    }


    // -----------------------------------------------
    // Vérifier la classe
    // -----------------------------------------------

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
        erreur: 'Classe introuvable.'
      })
    }


    // -----------------------------------------------
    // Modifier l'élève
    // -----------------------------------------------

    const resultat = await pool.query(
      `
      UPDATE eleves
      SET
        nom = $1,
        prenom = $2,
        sexe = $3,
        date_naissance = $4,
        lieu_naissance = $5,
        adresse = $6,
        nom_tuteur = $7,
        telephone_tuteur = $8,
        classe_id = $9
      WHERE id = $10
      RETURNING *;
      `,
      [
        nom.trim(),
        prenom.trim(),
        sexe,
        date_naissance,
        lieu_naissance.trim(),
        adresse.trim(),
        nom_tuteur.trim(),
        telephone_tuteur.trim(),
        classe_id,
        eleve_id
      ]
    )


    if (resultat.rows.length === 0) {
      return res.status(404).json({
        erreur: 'Élève introuvable.'
      })
    }


    res.json({
      message: 'Élève modifié avec succès.',
      eleve: resultat.rows[0]
    })

  } catch (err) {

    console.error('Erreur modification élève :', err)

    res.status(500).json({
      erreur: 'Impossible de modifier l’élève.'
    })
  }
})


// =====================================================
// 5. SUPPRIMER UN ÉLÈVE
// =====================================================

router.delete('/eleves/:eleve_id', async (req, res) => {
  try {

    const { eleve_id } = req.params

    const resultat = await pool.query(
      `
      DELETE FROM eleves
      WHERE id = $1
      RETURNING *;
      `,
      [eleve_id]
    )

    if (resultat.rows.length === 0) {
      return res.status(404).json({
        erreur: 'Élève introuvable.'
      })
    }

    res.json({
      message: 'Élève supprimé avec succès.'
    })

  } catch (err) {

    console.error('Erreur suppression élève :', err)

    res.status(500).json({
      erreur: 'Impossible de supprimer l’élève.'
    })
  }
})


// =====================================================
// 6. LISTE DES ÉLÈVES D'UNE CLASSE
// =====================================================

router.get('/:id/eleves', async (req, res) => {
  try {

    const { id } = req.params

    const resultat = await pool.query(
      `
      SELECT
        e.id,
        e.nom,
        e.prenom,
        e.sexe,
        e.date_naissance,
        e.lieu_naissance,
        e.adresse,
        e.nom_tuteur,
        e.telephone_tuteur,
        e.classe_id,

        ROUND(AVG(n.valeur), 2) AS moyenne,

        COUNT(n.id) AS nombre_notes

      FROM eleves e

      LEFT JOIN notes n
        ON e.id = n.eleve_id

      WHERE e.classe_id = $1

      GROUP BY
        e.id,
        e.nom,
        e.prenom,
        e.sexe,
        e.date_naissance,
        e.lieu_naissance,
        e.adresse,
        e.nom_tuteur,
        e.telephone_tuteur,
        e.classe_id

      ORDER BY
        e.nom ASC,
        e.prenom ASC;
      `,
      [id]
    )

    res.json(resultat.rows)

  } catch (err) {

    console.error('Erreur chargement élèves :', err)

    res.status(500).json({
      erreur: 'Impossible de charger les élèves.'
    })
  }
})


// =====================================================
// 7. ATTRIBUER UNE NOTE À UN ÉLÈVE
// =====================================================

router.post('/notes', async (req, res) => {
  try {

    const {
      eleve_id,
      matiere,
      type_eval,
      valeur,
      commentaire
    } = req.body

    const resultat = await pool.query(
      `
      INSERT INTO notes
        (eleve_id, matiere, type_eval, valeur, commentaire)
      VALUES
        ($1, $2, $3, $4, $5)
      RETURNING *;
      `,
      [
        eleve_id,
        matiere,
        type_eval || 'Interrogation',
        valeur,
        commentaire || null
      ]
    )

    res.status(201).json(resultat.rows[0])

  } catch (err) {

    console.error('Erreur ajout note :', err)

    res.status(500).json({
      erreur: 'Impossible d’enregistrer la note.'
    })
  }
})


export default router