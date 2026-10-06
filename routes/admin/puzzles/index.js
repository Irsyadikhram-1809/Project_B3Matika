import db from '../../_lib/db.js';
import { requireRole, setCors, errorResponse } from '../../_lib/auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await requireRole(['admin', 'superadmin'])(req, res, async () => {
      if (req.method === 'GET') {
        const { rows } = await db.query("SELECT * FROM puzzles ORDER BY id ASC");
        res.json({ rows });
      } else if (req.method === 'POST') {
        let { type, title, description, data, solution, points } = req.body;
        const { rows } = await db.query(
          "INSERT INTO puzzles (type, title, description, data, solution, points) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
          [type, title, description, JSON.stringify(data || {}), JSON.stringify(solution || {}), points]
        );
        res.json({ id: rows[0].id });
      } else {
        return errorResponse(res, 'Method not allowed', 405);
      }
    });
  } catch (err) {
    if (!res.headersSent) errorResponse(res, err.message, err.status || 500);
  }
}
