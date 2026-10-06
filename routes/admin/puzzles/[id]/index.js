import db from '../../../_lib/db.js';
import { requireRole, setCors, errorResponse } from '../../../_lib/auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  try {
    await requireRole(['admin', 'superadmin'])(req, res, async () => {
      const { id } = req.query;
      
      if (req.method === 'GET') {
        const { rows } = await db.query("SELECT * FROM puzzles WHERE id = $1", [id]);
        if (!rows[0]) return errorResponse(res, 'Not found', 404);
        res.json({ row: rows[0] });
      } else if (req.method === 'PUT') {
        let { type, title, description, data, solution, points } = req.body;
        await db.query(
          "UPDATE puzzles SET type = $1, title = $2, description = $3, data = $4, solution = $5, points = $6 WHERE id = $7",
          [type, title, description, JSON.stringify(data || {}), JSON.stringify(solution || {}), points, id]
        );
        res.json({ success: true });
      } else if (req.method === 'DELETE') {
        await db.query("DELETE FROM puzzles WHERE id = $1", [id]);
        res.json({ success: true });
      } else {
        return errorResponse(res, 'Method not allowed', 405);
      }
    });
  } catch (err) {
    if (!res.headersSent) errorResponse(res, err.message, err.status || 500);
  }
}
