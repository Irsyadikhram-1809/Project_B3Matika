// api/leaderboard.js  →  GET /api/leaderboard
import { supabase } from './_lib/supabase.js';
import { setCors, errorResponse } from './_lib/auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return errorResponse(res, 'Method not allowed', 405);

  try {
    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, name, points, avatar')
      .eq('role', 'user')
      .eq('is_active', true)
      .order('points', { ascending: false })
      .limit(20);

    if (error) throw error;

    // Kalkulasi level: tiap 100 poin = 1 level
    const formattedUsers = (users || []).map(u => ({
      ...u,
      level: Math.floor((u.points || 0) / 100) + 1
    }));

    return res.status(200).json({ users: formattedUsers });
  } catch {
    return res.status(200).json({ users: [] });
  }
}
