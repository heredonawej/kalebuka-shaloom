import pool from './db.js'

const sqlScript = `

-- ============================================
-- 1. TABLE DES CLASSES
-- ============================================

CREATE TABLE IF NOT EXISTS classes (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(50) NOT NULL,
    section VARCHAR(50) NOT NULL
);


-- ============================================
-- 2. TABLE DES UTILISATEURS
-- ============================================

CREATE TABLE IF NOT EXISTS utilisateurs (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'enseignant',
    classe_id INT REFERENCES classes(id) ON DELETE SET NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================
-- 3. TABLE DES PRÉPARATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS cours (
    id SERIAL PRIMARY KEY,
    titre VARCHAR(200) NOT NULL,
    matiere VARCHAR(100) NOT NULL,
    objectifs TEXT,
    deroule TEXT,
    statut VARCHAR(30) DEFAULT 'brouillon',
    motif_rejet TEXT,
    enseignant_id INT REFERENCES utilisateurs(id) ON DELETE CASCADE,
    classe_id INT REFERENCES classes(id) ON DELETE SET NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_soumission TIMESTAMP,
    date_validation TIMESTAMP
);


-- ============================================
-- 4. TABLE DES ÉLÈVES
-- ============================================

CREATE TABLE IF NOT EXISTS eleves (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    classe_id INT REFERENCES classes(id) ON DELETE SET NULL,
    date_inscription TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================
-- 5. TABLE DES NOTES
-- ============================================

CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    eleve_id INT REFERENCES eleves(id) ON DELETE CASCADE,
    matiere VARCHAR(100) NOT NULL,
    type_eval VARCHAR(50) DEFAULT 'Interrogation',
    valeur NUMERIC(5, 2) NOT NULL,
    commentaire VARCHAR(255),
    date_evaluation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================
-- 6. TABLE DES PRÉSENCES
-- ============================================

CREATE TABLE IF NOT EXISTS presences (
    id SERIAL PRIMARY KEY,

    eleve_id INT NOT NULL
        REFERENCES eleves(id)
        ON DELETE CASCADE,

    enseignant_id INT NOT NULL
        REFERENCES utilisateurs(id)
        ON DELETE CASCADE,

    classe_id INT
        REFERENCES classes(id)
        ON DELETE SET NULL,

    date_presence DATE NOT NULL DEFAULT CURRENT_DATE,

    statut VARCHAR(20) NOT NULL DEFAULT 'present',

    heure_enregistrement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT statut_presence_valide
        CHECK (statut IN ('present', 'absent', 'retard', 'justifie'))
);


-- ============================================
-- 7. TABLE DES APPRÉCIATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS appreciations (
    id SERIAL PRIMARY KEY,

    eleve_id INT NOT NULL
        REFERENCES eleves(id)
        ON DELETE CASCADE,

    enseignant_id INT NOT NULL
        REFERENCES utilisateurs(id)
        ON DELETE CASCADE,

    classe_id INT
        REFERENCES classes(id)
        ON DELETE SET NULL,

    appreciation TEXT NOT NULL,

    date_appreciation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================
-- 8. DONNÉES INITIALES
-- ============================================

INSERT INTO classes (nom, section)
VALUES
    ('1ère Maternelle', 'Maternelle'),
    ('6ème Primaire', 'Primaire'),
    ('3ème Secondaire', 'Secondaire'),
    ('4ème Scientifique', 'Secondaire')
ON CONFLICT DO NOTHING;


INSERT INTO utilisateurs (
    nom,
    email,
    mot_de_passe,
    role
)
VALUES
    (
        'Professeur Martin',
        'martin@ecole.fr',
        'secret123',
        'enseignant'
    ),
    (
        'Préfet des Études',
        'prefet@ecole.fr',
        'prefet123',
        'prefet'
    ),
    (
        'Direction Kalebuka',
        'direction@ecole.fr',
        'admin123',
        'admin'
    )
ON CONFLICT (email) DO NOTHING;

`


async function creerLesTables() {

  try {

    console.log(
      'Construction / mise à jour de la base de données...'
    )

    await pool.query(sqlScript)

    console.log(
      '✅ Base de données mise à jour avec succès !'
    )

    process.exit(0)

  } catch (err) {

    console.error(
      '❌ Erreur lors de la création des tables :',
      err.message
    )

    process.exit(1)
  }
}


creerLesTables()