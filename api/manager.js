import { authorized, readBody } from './_lib.js';

// POST /api/manager { messages, tools } -> the Anthropic Messages API response.
// The page runs the tool calls itself (they change the plan in the browser) and
// sends the results back on the next call, so this function stays a thin proxy.
export default async function handler(req, res) {
  if (!authorized(req)) return res.status(401).json({ error: 'passcode' });
  if (req.method !== 'POST') { res.setHeader('allow', 'POST'); return res.status(405).json({ error: 'Use POST.' }); }
  if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not set in this Vercel project.' });
  const { messages, tools } = readBody(req);
  if (!Array.isArray(messages) || !messages.length) return res.status(400).json({ error: 'Send { messages: [...] }.' });
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5',
        max_tokens: 1500,
        messages,
        ...(Array.isArray(tools) && tools.length ? { tools } : {}),
      }),
    });
    const data = await r.json();
    return res.status(r.status).json(data);
  } catch (e) {
    return res.status(502).json({ error: String(e.message || e) });
  }
}
