import { supabase } from '../_lib/supabase.js';
import { requireAuth, setCors, errorResponse } from '../_lib/auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return errorResponse(res, 'Method not allowed', 405);

  try {
    const { user, profile } = await requireAuth(req);
    const { game_type, score } = req.body;

    if (!game_type || score == null) return errorResponse(res, 'Data tidak lengkap (game_type, score).', 422);

    // Simpan score di Supabase
    const { error: insertError } = await supabase
      .from('game_scores')
      .insert({ user_id: user.id, game_type, score });

    if (insertError) {
      console.error('Insert game_scores error:', insertError);
      // Tetap lanjutkan, jangan gagalkan seluruh request
    }

    // Tambah poin ke profil (max 50 per sesi)
    const earnedPoints = Math.min(Math.floor(score / 10), 50);
    if (earnedPoints > 0) {
      const currentPoints = profile.points || 0;
      await supabase
        .from('profiles')
        .update({ points: currentPoints + earnedPoints })
        .eq('id', user.id);
    }

    // Ambil user terbaru untuk respons
    const { data: updatedProfile } = await supabase
      .from('profiles')
      .select('id, name, points, avatar, username')
      .eq('id', user.id)
      .single();

    const updatedUser = updatedProfile
      ? { ...user, points: updatedProfile.points, name: updatedProfile.name, avatar: updatedProfile.avatar, username: updatedProfile.username }
      : { ...user, points: (profile.points || 0) + earnedPoints };

    return res.status(200).json({ ok: true, earned_points: earnedPoints, user: updatedUser });
  } catch (err) {
    return errorResponse(res, err.message, err.status || 500);
  }
}
