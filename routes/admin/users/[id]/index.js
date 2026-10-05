import db from '../../../_lib/db.js';
import { requireAuth, setCors, errorResponse } from '../../../_lib/auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'DELETE') return errorResponse(res, 'Method not allowed', 405);

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
      return errorResponse(res, 'Super admin tidak bisa dihapus', 403);
    }

    // Hapus dari tabel users (cascading seharusnya otomatis ke tabel lain jika di set di DB)
    await db.query("DELETE FROM users WHERE id = $1", [id]);

    res.json({ msg: 'Akun dihapus' });
  } catch (err) {
    console.error("Error delete user:", err);
    return errorResponse(res, err.message, err.status || 500);
  }
}
