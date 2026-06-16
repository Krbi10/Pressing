import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import teamRoutes from './routes/teams.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// API
app.get('/api/health', (_req, res) => res.json({ ok: true, name: 'PRESSING API' }));
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);

// U produkciji serviraj izgrađeni React (client/dist)
const clientDist = join(__dirname, '..', 'client', 'dist');
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => res.sendFile(join(clientDist, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`PRESSING API sluša na http://localhost:${PORT}`);
});
