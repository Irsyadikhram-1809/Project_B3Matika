import db from '../_lib/db.js';
import { requireAuth, setCors, errorResponse } from '../_lib/auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { user } = await requireAuth(req);
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return errorResponse(res, 'Akses ditolak', 403);
    }

    if (req.method === 'GET') {
      const { rows } = await db.query("SELECT * FROM games ORDER BY created_at DESC");
      return res.status(200).json({ games: rows });
    }

    if (req.method === 'POST') {
      const { slug, title, description, badge_color, emoji, level, tutorial, learning_goal, tips } = req.body;
      const { rows } = await db.query(
        `INSERT INTO games (slug, title, description, badge_color, emoji, level, tutorial, learning_goal, tips) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [slug, title, description, badge_color || '#2563eb', emoji, level, tutorial, learning_goal, JSON.stringify(tips || [])]
      );
      
      // Audit log
      await db.query(
        "INSERT INTO audit_logs (admin_id, action, entity, entity_id) VALUES ($1, 'CREATE', 'games', $2)",
        [user.id, rows[0].id]
      );
      
      return res.status(201).json({ game: rows[0] });
    }

    return errorResponse(res, 'Method not allowed', 405);
  } catch (err) {
    console.error("Error admin games:", err);
    return errorResponse(res, 'Terjadi kesalahan pada server.', 500);
  }
}
