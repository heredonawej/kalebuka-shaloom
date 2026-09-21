import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import routesAuth from './routes/auth.js';
import routesCours from './routes/cours.js';
import routesClasses from './routes/classes.js';
import routesPresences from './routes/presences.js'
import routesAdmin from './routes/admin.js'
import routesNotes from './routes/notes.js';
import routesHoraires from './routes/horaires.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Filtres de sécurité
app.use(cors());
app.use(express.json());

// Enregistrement des routes officielles de l'école
app.use('/api/auth', routesAuth);
app.use('/api/cours', routesCours);
app.use('/api/classes', routesClasses);
app.use('/api/presences', routesPresences)
app.use('/api/admin', routesAdmin)
app.use('/api/notes', routesNotes);
app.use('/api/horaires', routesHoraires);

app.get('/', (req, res) => {
  res.send('<h1>Serveur Kalebuka Shaloom Actif 🚀</h1><p>API prête et connectée à PostgreSQL.</p>');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur actif sur : http://localhost:${PORT}`);
});