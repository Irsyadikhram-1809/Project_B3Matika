import db from '../../../_lib/db.js';
import { requireRole, setCors, errorResponse } from '../../../_lib/auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  try {
    await requireRole(['admin', 'superadmin'])(req, res, async () => {
      const { id } = req.query;
      
      if (req.method === 'GET') {
        const { rows } = await db.query("SELECT * FROM questions WHERE id = $1", [id]);
        if (!rows[0]) return errorResponse(res, 'Not found', 404);
        res.json({ row: rows[0] });
      } else if (req.method === 'PUT') {
        let { topic_id, body, options, answer, points } = req.body;
        await db.query(
          "UPDATE questions SET topic_id = $1, body = $2, options = $3, answer = $4, points = $5 WHERE id = $6",
          [topic_id, body, JSON.stringify(options || []), JSON.stringify(answer || 0), points, id]
        );
        res.json({ success: true });
      } else if (req.method === 'DELETE') {
        await db.query("DELETE FROM questions WHERE id = $1", [id]);
        res.json({ success: true });
      } else {
        return errorResponse(res, 'Method not allowed', 405);
      }
    });
  } catch (err) {
    if (!res.headersSent) errorResponse(res, err.message, err.status || 500);
  }
}
