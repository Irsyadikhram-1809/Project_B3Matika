import { supabase } from '../_lib/supabase.js';
import { requireAuth, setCors, errorResponse } from '../_lib/auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  if (req.method !== 'GET') {
    return errorResponse(res, 'Method not allowed', 405);
  }

  try {
    const { user } = await requireAuth(req);
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return errorResponse(res, 'Tidak punya izin', 403);
    }

    // Hitung total pengguna (kecuali superadmin)
    const { count: totalUsers } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .neq('role', 'superadmin');

    // Hitung total soal
    const { count: totalQuestions } = await supabase
      .from('questions')
      .select('id', { count: 'exact', head: true });

    // Hitung total topik
    const { count: totalTopics } = await supabase
      .from('topics')
      .select('id', { count: 'exact', head: true });

    // Hitung total puzzle
    const { count: totalPuzzles } = await supabase
      .from('puzzles')
      .select('id', { count: 'exact', head: true });

    // Evaluasi tingkat kesulitan soal (berdasarkan tabel attempts)
    let evaluation = [];
    try {
      const { data: attemptsData } = await supabase
        .from('attempts')
        .select('question_id, correct');

      if (attemptsData && attemptsData.length > 0) {
        // Kelompokkan per question_id
        const qMap = {};
        for (const a of attemptsData) {
          if (!qMap[a.question_id]) qMap[a.question_id] = { total: 0, correct: 0 };
          qMap[a.question_id].total++;
          if (a.correct) qMap[a.question_id].correct++;
        }

        // Ambil soal yang punya >= 3 jawaban
        const qualifiedIds = Object.keys(qMap).filter(id => qMap[id].total >= 3);
        if (qualifiedIds.length > 0) {
          const { data: questions } = await supabase
            .from('questions')
            .select('id, question_text')
            .in('id', qualifiedIds.slice(0, 10));

          evaluation = (questions || []).map(q => {
            const stats = qMap[q.id];
            const rate = Math.round((stats.correct / stats.total) * 100);
            let verdict = 'Normal';
            if (rate > 70) verdict = 'Terlalu Mudah';
            else if (rate < 40) verdict = 'Terlalu Sulit';
            return { id: q.id, text: q.question_text, total: stats.total, rate: rate.toFixed(1), verdict };
          });
        }
      }
    } catch (e) {
      console.error('Eval Error:', e);
    }

    res.status(200).json({
      stats: {
        'Total Pengguna': totalUsers || 0,
        'Total Soal': totalQuestions || 0,
        'Total Materi': totalTopics || 0,
        'Puzzle': totalPuzzles || 0,
      },
      evaluation,
    });
  } catch (err) {
    console.error('Stats Error:', err);
    return errorResponse(res, err.message, err.status || 500);
  }
}
