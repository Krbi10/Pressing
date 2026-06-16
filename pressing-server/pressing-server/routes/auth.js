import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { readDB, writeDB } from '../db.js';
import { sign, requireAuth } from '../middleware/auth.js';

const router = Router();

const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body || {};
  if (!username || username.trim().length < 3)
    return res.status(400).json({ error: 'Korisničko ime mora imati bar 3 znaka.' });
  if (!emailRe.test(email || ''))
    return res.status(400).json({ error: 'Unesi ispravan e-mail.' });
  if (!password || password.length < 6)
    return res.status(400).json({ error: 'Lozinka mora imati bar 6 znakova.' });

  const db = await readDB();
  const key = username.trim().toLowerCase();
  if (db.users[key])
    return res.status(409).json({ error: 'Korisničko ime je već zauzeto.' });

  const hash = await bcrypt.hash(password, 10);
  db.users[key] = { user: username.trim(), email: email.trim(), pass: hash, createdAt: Date.now() };
  await writeDB(db);

  const token = sign(username.trim());
  res.json({ token, user: username.trim() });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password)
    return res.status(400).json({ error: 'Unesi korisničko ime i lozinku.' });

  const db = await readDB();
  const rec = db.users[username.trim().toLowerCase()];
  if (!rec || !(await bcrypt.compare(password, rec.pass)))
    return res.status(401).json({ error: 'Pogrešno korisničko ime ili lozinka.' });

  const token = sign(rec.user);
  res.json({ token, user: rec.user });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.username });
});

export default router;
