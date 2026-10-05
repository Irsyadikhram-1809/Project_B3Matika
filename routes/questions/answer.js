import { supabase } from '../_lib/supabase.js';
import db from '../_lib/db.js';
import { requireAuth, setCors, errorResponse } from '../_lib/auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return errorResponse(res, 'Method not allowed', 405);

  const id = parseInt(req.query.id);
  if (isNaN(id)) return errorResponse(res, 'Tidak ditemukan.', 404);

  try {
    const { user, profile } = await requireAuth(req);
    const { choice } = req.body;

    const { data: question, error } = await supabase
      .from('questions')
      .select('id, answer, points')
      .eq('id', id)
      .single();

    if (error || !question) return errorResponse(res, 'Soal tidak ditemukan.', 404);

    const correct = parseInt(choice) === parseInt(question.answer);
    let pointsAwarded = 0;
    let counted = false;

    // Cek apakah sudah pernah dijawab
    const { data: existing } = await supabase
      .from('question_solves')
      .select('id')
      .eq('user_id', user.id)
      .eq('question_id', id)
      .maybeSingle();

    if (!existing && correct) {
      pointsAwarded = question.points || 10;
      counted = true;
      // Masukkan ke question_solves
      await supabase.from('question_solves').insert({ user_id: user.id, question_id: id }).catch(() => {});
      
      // Update points di users tabel dengan Postgres agar bypass RLS
      const newPoints = (profile.points || 0) + pointsAwarded;
      await db.query("UPDATE users SET points = $1 WHERE id = $2", [newPoints, user.id]);
      profile.points = newPoints;
    }

    return res.status(200).json({
      correct,
      answer: question.answer,
      points: pointsAwarded,
      explanation: question.explanation || '',
      counted,
      user: { ...user, ...profile } 
    });
  } catch (err) {
    return errorResponse(res, err.message, err.status || 500);
  }
}
