import db from '../_lib/db.js';
import { setCors, errorResponse } from '../_lib/auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  if (req.method !== 'GET') {
    return errorResponse(res, 'Method not allowed', 405);
  }

  try {
    const { rows } = await db.query(`
      SELECT slug as id, title as label, description as desc, badge_color, emoji, level, tutorial, learning_goal as "learningGoal", tips
      FROM games
      WHERE is_active = true
      ORDER BY created_at ASC
    `);

    return res.status(200).json({ games: rows });
  } catch (err) {
    console.error("Error fetching games:", err);
    return errorResponse(res, 'Terjadi kesalahan pada server.', 500);
  }
}
