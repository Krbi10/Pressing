import { Router } from 'express';
import { readDB, writeDB } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/teams/me  -> vraća sačuvani tim ulogovanog korisnika (ili null)
router.get('/me', requireAuth, async (req, res) => {
  const db = await readDB();
  const team = db.teams[req.username.toLowerCase()] || null;
  res.json({ team });
});

// PUT /api/teams/me  -> čuva tim ulogovanog korisnika
router.put('/me', requireAuth, async (req, res) => {
  const { name, formation, slots, bench, captain, bought } = req.body || {};
  if (!formation || !Array.isArray(slots))
    return res.status(400).json({ error: 'Neispravni podaci tima.' });

  const db = await readDB();
  db.teams[req.username.toLowerCase()] = {
    name: (name || 'Moj tim').slice(0, 40),
    formation, slots, bench: bench || [],
    captain: captain || null,
    bought: bought || {},
    updatedAt: Date.now(),
  };
  await writeDB(db);
  res.json({ ok: true, team: db.teams[req.username.toLowerCase()] });
});

export default router;
