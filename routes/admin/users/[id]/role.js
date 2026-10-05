import db from '../../../_lib/db.js';
import { requireAuth, setCors, errorResponse } from '../../../_lib/auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'PATCH') return errorResponse(res, 'Method not allowed', 405);

  try {
    const { user } = await requireAuth(req);
    if (user.role !== 'superadmin') {
      return errorResponse(res, 'Tidak punya izin', 403);
    }

    const { id } = req.query;

    const { rows } = await db.query("SELECT id, role FROM users WHERE id = $1", [id]);
    const target = rows[0];
    if (!target) return errorResponse(res, 'User tidak ditemukan', 404);

    if (target.role === 'superadmin') {
      return errorResponse(res, 'Super admin tidak bisa diubah', 403);
    }

    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return errorResponse(res, 'Role tidak valid', 400);
    }

    await db.query("UPDATE users SET role = $1 WHERE id = $2", [role, id]);

    res.json({ msg: `Role diubah menjadi ${role}` });
  } catch (err) {
    console.error("Error update role:", err);
    return errorResponse(res, err.message, err.status || 500);
  }
}
