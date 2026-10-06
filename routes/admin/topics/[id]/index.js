import db from '../../../_lib/db.js';
import { requireRole, setCors, errorResponse } from '../../../_lib/auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  try {
    await requireRole(['admin', 'superadmin'])(req, res, async () => {
      const { id } = req.query;
      
      if (req.method === 'GET') {
        const { rows } = await db.query("SELECT * FROM topics WHERE id = $1", [id]);
        if (!rows[0]) return errorResponse(res, 'Not found', 404);
        res.json({ row: rows[0] });
      } else if (req.method === 'PUT') {
        const { grade, title, content } = req.body;
        await db.query(
          "UPDATE topics SET grade = $1, title = $2, content = $3 WHERE id = $4",
          [grade, title, content, id]
        );
        res.json({ success: true });
      } else if (req.method === 'DELETE') {
        await db.query("DELETE FROM topics WHERE id = $1", [id]);
        res.json({ success: true });
      } else {
        return errorResponse(res, 'Method not allowed', 405);
      }
    });
  } catch (err) {
    if (!res.headersSent) errorResponse(res, err.message, err.status || 500);
  }
}
