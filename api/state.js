import { authorized, redis, readBody } from './_lib.js';
import seed from '../data/seed.js';

// GET  /api/state            -> { plan }   (the planner; falls back to the seed until the first save)
// GET  /api/state?doc=chat   -> { plan }   (the manager chat history)
// PUT  /api/state[?doc=chat] { plan }      -> { ok: true }
export default async function handler(req, res) {
  if (!authorized(req)) return res.status(401).json({ error: 'passcode' });
  const doc = req.query && req.query.doc === 'chat' ? 'chat' : 'planner';
  const key = `slh:${doc}`;
  try {
    if (req.method === 'GET') {
      const raw = await redis(['GET', key]);
      const plan = raw ? JSON.parse(raw) : (doc === 'planner' ? seed : null);
      res.setHeader('cache-control', 'no-store');
      return res.status(200).json({ plan });
    }
    if (req.method === 'PUT') {
      const { plan } = readBody(req);
      if (!plan || typeof plan !== 'object' || Array.isArray(plan)) return res.status(400).json({ error: 'Send { plan: {...} }.' });
      const text = JSON.stringify(plan);
      if (text.length > 900_000) return res.status(413).json({ error: 'The plan is too large to save (over 900 KB). Remove a custom drawing or two.' });
      await redis(['SET', key, text]);
      return res.status(200).json({ ok: true });
    }
    res.setHeader('allow', 'GET, PUT');
    return res.status(405).json({ error: 'Use GET or PUT.' });
  } catch (e) {
    return res.status(500).json({ error: String(e.message || e) });
  }
}
