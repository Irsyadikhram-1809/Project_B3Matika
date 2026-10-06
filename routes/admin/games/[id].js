import db from '../../_lib/db.js';
import { requireAuth, setCors, errorResponse } from '../../_lib/auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { user } = await requireAuth(req);
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return errorResponse(res, 'Akses ditolak', 403);
    }

    const { id } = req.query;

    if (req.method === 'PUT') {
      const { slug, title, description, badge_color, emoji, level, tutorial, learning_goal, tips, is_active } = req.body;
      const { rows } = await db.query(
        `UPDATE games 
         SET slug = $1, title = $2, description = $3, badge_color = $4, emoji = $5, level = $6, tutorial = $7, learning_goal = $8, tips = $9, is_active = $10, updated_at = NOW()
         WHERE id = $11 RETURNING *`,
        [slug, title, description, badge_color, emoji, level, tutorial, learning_goal, JSON.stringify(tips || []), is_active, id]
      );

      if (rows.length === 0) return errorResponse(res, 'Game tidak ditemukan', 404);

      await db.query(
        "INSERT INTO audit_logs (admin_id, action, entity, entity_id) VALUES ($1, 'UPDATE', 'games', $2)",
        [user.id, id]
      );
      
      return res.status(200).json({ game: rows[0] });
    }

    if (req.method === 'DELETE') {
      const { rowCount } = await db.query("DELETE FROM games WHERE id = $1", [id]);
      if (rowCount === 0) return errorResponse(res, 'Game tidak ditemukan', 404);

      await db.query(
        "INSERT INTO audit_logs (admin_id, action, entity, entity_id) VALUES ($1, 'DELETE', 'games', $2)",
        [user.id, id]
      );

      return res.status(200).json({ success: true });
    }

    return errorResponse(res, 'Method not allowed', 405);
  } catch (err) {
    console.error("Error admin games by id:", err);
    return errorResponse(res, 'Terjadi kesalahan pada server.', 500);
  }
}
