import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME,

  // SSL nécessaire pour une connexion PostgreSQL distante comme Neon
  ssl: process.env.DB_HOST !== 'localhost'
    ? { rejectUnauthorized: false }
    : false,
})

pool.on('connect', () => {
  console.log('✅ Connecté avec succès à PostgreSQL !')
})

pool.on('error', (err) => {
  console.error('❌ Erreur de base de données :', err.message)
})

export default pool