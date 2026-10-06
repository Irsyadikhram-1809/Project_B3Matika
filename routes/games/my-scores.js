import db from '../_lib/db.js';
import { requireAuth, setCors, errorResponse } from '../_lib/auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return errorResponse(res, 'Method not allowed', 405);

  try {
    const { profile } = await requireAuth(req);
    const userId = profile.id;

    const { rows } = await db.query(`
      SELECT game, MAX(score) as best_score
      FROM game_scores
      WHERE user_id = $1
      GROUP BY game
    `, [userId]);

    const scores = {};
    for (const row of rows) {
      scores[row.game] = row.best_score;
    }

    return res.status(200).json({ scores });
  } catch (err) {
    console.error(err);
    return errorResponse(res, err.message, err.status || 500);
  }
}
