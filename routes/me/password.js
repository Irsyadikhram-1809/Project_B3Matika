import bcrypt from 'bcrypt';
import db from '../_lib/db.js';
import { requireAuth, setCors, errorResponse } from '../_lib/auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'PUT') return errorResponse(res, 'Method not allowed', 405);

  try {
    const { profile } = await requireAuth(req);
    const { current_password, password, password_confirmation } = req.body;

    if (!current_password || !password || !password_confirmation) {
      return errorResponse(res, 'Semua field password wajib diisi.', 400);
    }
    if (password !== password_confirmation) {
      return errorResponse(res, 'Konfirmasi password tidak cocok.', 400);
    }
    if (password.length < 8) {
      return errorResponse(res, 'Password baru minimal 8 karakter.', 400);
    }

    const { rows } = await db.query("SELECT password_hash FROM users WHERE id = $1", [profile.id]);
    if (!rows.length) return errorResponse(res, 'Pengguna tidak ditemukan.', 404);
    
    const user = rows[0];
    const valid = await bcrypt.compare(current_password, user.password_hash);
    if (!valid) {
      return errorResponse(res, 'Password saat ini salah.', 400);
    }

    const newHash = await bcrypt.hash(password, 12);
    await db.query("UPDATE users SET password_hash = $1 WHERE id = $2", [newHash, profile.id]);

    return res.status(200).json({ message: "Password berhasil diubah" });
  } catch (err) {
    console.error(err);
    return errorResponse(res, err.message, err.status || 500);
  }
}
