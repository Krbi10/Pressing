import { Router } from 'express';
import { readDB, writeDB } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/predictions/me -> { picks: { matchId: {a,b}, ... } }
router.get('/me', requireAuth, async (req, res) => {
  const db = await readDB();
  const picks = (db.predictions || {})[req.username.toLowerCase()] || {};
  res.json({ picks });
});

// PUT /api/predictions/me -> čuva sve tipove korisnika
router.put('/me', requireAuth, async (req, res) => {
  const { picks } = req.body || {};
  if (!picks || typeof picks !== 'object')
    return res.status(400).json({ error: 'Neispravni tipovi.' });

  // sanitizacija: samo brojevi 0..99
  const clean = {};
  for (const [id, v] of Object.entries(picks)) {
    if (!v) continue;
    const a = Math.max(0, Math.min(99, parseInt(v.a, 10)));
    const b = Math.max(0, Math.min(99, parseInt(v.b, 10)));
    if (Number.isFinite(a) && Number.isFinite(b)) clean[id] = { a, b };
  }

  const db = await readDB();
  if (!db.predictions) db.predictions = {};
  db.predictions[req.username.toLowerCase()] = clean;
  await writeDB(db);
  res.json({ ok: true, picks: clean });
});

export default router;
