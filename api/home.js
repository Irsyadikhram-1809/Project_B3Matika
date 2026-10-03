// api/home.js  →  GET /api/home
import { supabase } from './_lib/supabase.js';
import { setCors, errorResponse } from './_lib/auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return errorResponse(res, 'Method not allowed', 405);

  const { data: topics } = await supabase
    .from('topics')
    .select('id, grade, title')
    .order('grade')
    .order('id');

  const { data: puzzles } = await supabase
    .from('puzzles')
    .select('id, type, title, points')
    .limit(6);

  const { data: leaderboard } = await supabase
    .from('profiles')
    .select('id, name, points, avatar')
    .eq('role', 'user')
    .eq('is_active', true)
    .order('points', { ascending: false })
    .limit(5);

  return res.status(200).json({ topics: topics ?? [], puzzles: puzzles ?? [], leaderboard: leaderboard ?? [] });
}
