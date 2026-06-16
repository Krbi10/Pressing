import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'pressing-dev-secret-change-me';

export function sign(username) {
  return jwt.sign({ username }, SECRET, { expiresIn: '30d' });
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Nedostaje token. Prijavi se.' });
  try {
    const payload = jwt.verify(token, SECRET);
    req.username = payload.username;
    next();
  } catch {
    return res.status(401).json({ error: 'Token nije validan ili je istekao.' });
  }
}
