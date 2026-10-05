import { supabase } from '../_lib/supabase.js';
import db from '../_lib/db.js';
import { requireAuth, setCors, errorResponse } from '../_lib/auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return errorResponse(res, 'Method not allowed', 405);

  try {
    const { user, profile } = await requireAuth(req);
    const { game, score } = req.body;

    if (!game || score == null) return errorResponse(res, 'Data tidak lengkap.', 422);

    // Simpan score
    await supabase.from('game_scores').insert({ user_id: user.id, game, score });

    // Tambah poin (max 50 per game session)
    const earnedPoints = Math.min(Math.floor(score / 10), 50);
    if (earnedPoints > 0) {
      await db.query("UPDATE users SET points = $1 WHERE id = $2", [(profile.points ?? 0) + earnedPoints, user.id]);
    }

    return res.status(200).json({ ok: true, earned_points: earnedPoints });
  } catch (err) {
    return errorResponse(res, err.message, err.status || 500);
  }
}
