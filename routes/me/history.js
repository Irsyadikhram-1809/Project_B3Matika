import db from '../_lib/db.js';
import { requireAuth, setCors, errorResponse } from '../_lib/auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return errorResponse(res, 'Method not allowed', 405);

  try {
    const { profile } = await requireAuth(req);
    const userId = profile.id;

    // Fetch topics history
    const { rows: topics } = await db.query(`
      SELECT 
        t.grade, 
        t.id as topic_id, 
        t.title as topic_title,
        SUM(CASE WHEN a.correct THEN 1 ELSE 0 END)::int as correct,
        SUM(CASE WHEN NOT a.correct THEN 1 ELSE 0 END)::int as wrong,
        MAX(a.created_at) as last_at
      FROM attempts a
      JOIN questions q ON a.question_id = q.id
      JOIN topics t ON q.topic_id = t.id
      WHERE a.user_id = $1
      GROUP BY t.id, t.grade, t.title
      ORDER BY last_at DESC
    `, [userId]);

    // Fetch games history
    const { rows: games } = await db.query(`
      SELECT 
        game as game_type,
        MAX(score) as best_score,
        SUM(score) as total_points,
        COUNT(id)::int as plays,
        MAX(created_at) as last_played
      FROM game_scores
      WHERE user_id = $1
      GROUP BY game
      ORDER BY last_played DESC
    `, [userId]);

    return res.status(200).json({ topics: topics || [], games: games || [] });
  } catch (err) {
    console.error(err);
    return errorResponse(res, err.message, err.status || 500);
  }
}
