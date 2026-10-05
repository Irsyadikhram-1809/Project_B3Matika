// api/auth/logout.js  →  POST /api/auth/logout
import { setCors, errorResponse } from '../_lib/auth.js';
import { supabase } from '../_lib/supabase.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return errorResponse(res, 'Method not allowed', 405);

  const token = (req.headers['authorization'] || '').replace('Bearer ', '').trim();
  if (token) {
    // Invalidate token di Supabase (best-effort)
    await supabase.auth.admin.signOut(token).catch(() => {});
  }

  return res.status(200).json({ ok: true });
}
