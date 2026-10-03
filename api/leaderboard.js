// api/leaderboard.js  →  GET /api/leaderboard
import { supabase } from './_lib/supabase.js';
import { setCors, errorResponse } from './_lib/auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return errorResponse(res, 'Method not allowed', 405);

  const { data: leaderboard, error } = await supabase
    .from('profiles')
    .select('id, name, points, avatar')
    .eq('role', 'user')
    .eq('is_active', true)
    .order('points', { ascending: false })
    .limit(20);

  if (error) return errorResponse(res, 'Terjadi kesalahan.', 500);

  return res.status(200).json({ leaderboard: leaderboard ?? [] });
}
