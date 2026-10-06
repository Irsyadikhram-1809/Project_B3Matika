import db from '../_lib/db.js';
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

    // Hitung total pengguna
    const usersRes = await db.query("SELECT COUNT(*) FROM users");
    const totalUsers = parseInt(usersRes.rows[0].count, 10);

    // Hitung total pertanyaan/soal
    const questionsRes = await db.query("SELECT COUNT(*) FROM questions");
    const totalQuestions = parseInt(questionsRes.rows[0].count, 10);

    // Hitung total topik/materi
    const topicsRes = await db.query("SELECT COUNT(*) FROM topics");
    const totalTopics = parseInt(topicsRes.rows[0].count, 10);
    
    // Hitung total puzzle
    const puzzleRes = await db.query("SELECT COUNT(*) FROM puzzles");
    const totalPuzzles = parseInt(puzzleRes.rows[0].count, 10);

    let evaluation = [];
    try {
        const evalRes = await db.query(`
            SELECT q.id, q.question_text as text, COUNT(a.id) as total, 
                   ROUND(SUM(CASE WHEN a.is_correct THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(a.id), 0)) as rate
            FROM questions q
            JOIN attempts a ON q.id = a.question_id
            GROUP BY q.id, q.question_text
            HAVING COUNT(a.id) >= 3
            ORDER BY total DESC
            LIMIT 10
        `);
        
        evaluation = evalRes.rows.map(r => {
            let verdict = "Normal";
            if (r.rate > 70) verdict = "Terlalu Mudah";
            else if (r.rate < 40) verdict = "Terlalu Sulit";
            
            return {
                id: r.id,
                text: r.text,
                total: parseInt(r.total, 10),
                rate: parseFloat(r.rate).toFixed(1),
                verdict
            };
        });
    } catch (e) {
        console.error("Eval Error:", e);
    }

    res.status(200).json({
      stats: {
        "Total Pengguna": totalUsers,
        "Total Soal": totalQuestions,
        "Total Materi": totalTopics,
        "Puzzle": totalPuzzles
      },
      evaluation: evaluation
    });
  } catch (err) {
    console.error("Stats Error:", err);
    return errorResponse(res, err.message, err.status || 500);
  }
}
