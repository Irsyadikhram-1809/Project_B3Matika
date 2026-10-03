// api/puzzles/index.js  →  GET /api/puzzles
import { supabase } from '../_lib/supabase.js';
import { setCors, errorResponse } from '../_lib/auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return errorResponse(res, 'Method not allowed', 405);

  const { data: puzzles, error } = await supabase
    .from('puzzles')
    .select('id, type, title, description, points')
    .order('id');

  if (error) return errorResponse(res, 'Terjadi kesalahan.', 500);

  return res.status(200).json({ puzzles: puzzles ?? [] });
}
