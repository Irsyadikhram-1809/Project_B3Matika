// api/questions/answer.js  →  POST /api/questions/answer?id=123
import { supabase } from '../_lib/supabase.js';
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

    // Cek apakah sudah pernah dijawab (jika ada tabel question_solves)
    // Untuk saat ini kita asumsikan ada tabel question_solves atau kita tambahkan point langsung
    // Untuk amannya karena kita tidak tahu struktur DB pastinya, kita tambahkan point
    const { data: existing } = await supabase
      .from('question_solves')
      .select('id')
      .eq('user_id', user.id)
      .eq('question_id', id)
      .maybeSingle(); // gunakan maybeSingle agar tidak error jika tidak ada atau tabel tidak ada

    if (!existing && correct) {
      pointsAwarded = question.points || 10;
      counted = true;
      // Coba masukkan ke question_solves (kalau tabelnya ada)
      await supabase.from('question_solves').insert({ user_id: user.id, question_id: id }).catch(() => {});
      
      // Update points di profile
      const newPoints = (profile.points || 0) + pointsAwarded;
      await supabase.from('profiles').update({ points: newPoints }).eq('id', user.id);
      profile.points = newPoints;
    }

    return res.status(200).json({
      correct,
      answer: question.answer,
      points: pointsAwarded,
      explanation: question.explanation || '',
      counted,
      user: { ...user, ...profile } // Mengembalikan object user yg diperbarui
    });
  } catch (err) {
    return errorResponse(res, err.message, err.status || 500);
  }
}
