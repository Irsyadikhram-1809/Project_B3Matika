// api/puzzles/[puzzle].js  →  GET /api/puzzles/:id  &  POST /api/puzzles/:id/check
import { supabase } from '../_lib/supabase.js';
import { requireAuth, setCors, errorResponse } from '../_lib/auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const id = parseInt(req.query.puzzle);
  if (isNaN(id)) return errorResponse(res, 'Tidak ditemukan.', 404);

  // GET /api/puzzles/:id  — detail puzzle (tanpa solution)
  if (req.method === 'GET') {
    const { data: puzzle, error } = await supabase
      .from('puzzles')
      .select('id, type, title, description, data, points')
      .eq('id', id)
      .single();

    if (error || !puzzle) return errorResponse(res, 'Tidak ditemukan.', 404);
    return res.status(200).json({ puzzle });
  }

  // POST /api/puzzles/:id/check  — cek jawaban (perlu login)
  if (req.method === 'POST') {
    try {
      const { user, profile } = await requireAuth(req);

      const { data: puzzle } = await supabase
        .from('puzzles')
        .select('id, solution, points')
        .eq('id', id)
        .single();

      if (!puzzle) return errorResponse(res, 'Tidak ditemukan.', 404);

      const { answer } = req.body;
      const correct = JSON.stringify(answer) === JSON.stringify(puzzle.solution);

      if (correct) {
        // Cek apakah sudah pernah solve
        const { data: existing } = await supabase
          .from('puzzle_solves')
          .select('id')
          .eq('user_id', user.id)
          .eq('puzzle_id', id)
          .single();

        let awarded = 0;
        if (!existing) {
          await supabase.from('puzzle_solves').insert({ user_id: user.id, puzzle_id: id });
          awarded = puzzle.points;
          profile.points = (profile.points ?? 0) + awarded;
          await supabase
            .from('profiles')
            .update({ points: profile.points })
            .eq('id', user.id);
        }
        return res.status(200).json({ correct, awarded, points: awarded, user: { ...user, ...profile } });
      }

      return res.status(200).json({ correct: false });
    } catch (err) {
      return errorResponse(res, err.message, err.status || 500);
    }
  }

  return errorResponse(res, 'Method not allowed', 405);
}
