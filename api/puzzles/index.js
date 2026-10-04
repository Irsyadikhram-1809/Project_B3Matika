// api/puzzles/index.js  →  GET /api/puzzles
import { supabase } from '../_lib/supabase.js';
import { setCors, errorResponse, requireAuth } from '../_lib/auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return errorResponse(res, 'Method not allowed', 405);

  try {
    const { data: puzzles, error } = await supabase
      .from('puzzles')
      .select('id, type, title, description, points')
      .order('id');

    if (error) throw error;

    // Cek auth secara opsional untuk melihat puzzle yang sudah di-solve
    let solved = [];
    try {
      const { user } = await requireAuth(req);
      if (user) {
        const { data: solves } = await supabase
          .from('puzzle_solves')
          .select('puzzle_id')
          .eq('user_id', user.id);
        solved = (solves || []).map(s => s.puzzle_id);
      }
    } catch {
      // User tidak login atau token tidak valid, abaikan (solved tetap kosong)
    }

    return res.status(200).json({ 
      puzzles: puzzles || [], 
      solved 
    });
  } catch {
    return res.status(200).json({ puzzles: [], solved: [] });
  }
}
