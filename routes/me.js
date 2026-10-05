// api/me.js  →  GET /api/me
import { requireAuth, setCors, errorResponse } from './_lib/auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return errorResponse(res, 'Method not allowed', 405);

  try {
    const { profile } = await requireAuth(req);
    return res.status(200).json({ user: profile });
  } catch (err) {
    return errorResponse(res, err.message, err.status || 401);
  }
}
