import { supabase } from '../_lib/supabase.js';
import { requireAuth, setCors, errorResponse } from '../_lib/auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return errorResponse(res, 'Method not allowed', 405);

  try {
    const { profile } = await requireAuth(req);
    const userId = profile.id;

    const { data: rows, error } = await supabase
      .from('game_scores')
      .select('game_type, score')
      .eq('user_id', userId);

    if (error) {
      console.error('Supabase my-scores error:', error);
      return res.status(200).json({ scores: {} });
    }

    // Hitung best_score per game_type
    const scores = {};
    for (const row of (rows || [])) {
      const key = row.game_type;
      if (!scores[key] || row.score > scores[key].best_score) {
        scores[key] = { best_score: row.score };
      }
    }

    return res.status(200).json({ scores });
  } catch (err) {
    // Jika tidak login, return kosong bukan error
    if (err.status === 401) return res.status(200).json({ scores: {} });
    console.error(err);
    return errorResponse(res, err.message, err.status || 500);
  }
}
