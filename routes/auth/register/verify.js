import db from '../../_lib/db.js';
import { setCors, errorResponse } from '../../_lib/auth.js';
import { hmac, safeEqual } from '../../_lib/otp.js';

const norm = (v) => String(v || "").toLowerCase().trim();

async function cekOtp(email, purpose, code) {
  const { rows } = await db.query(
    "SELECT * FROM otps WHERE email=$1 AND purpose=$2 LIMIT 1", 
    [email, purpose]
  );
  const rec = rows[0];
  if (!rec || new Date(rec.expires_at) < new Date() || rec.attempts >= 5) return null;
  if (!safeEqual(rec.code_hash, hmac(String(code || "")))) {
    await db.query("UPDATE otps SET attempts = attempts + 1 WHERE id = $1", [rec.id]);
    return null;
  }
  return rec;
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return errorResponse(res, 'Method not allowed', 405);

  const email = norm(req.body.email);
  const code = req.body.code;

  if (!email || !code) return errorResponse(res, 'Email dan kode wajib diisi.', 400);

  try {
    const rec = await cekOtp(email, "register", code);
    if (!rec) return errorResponse(res, 'Kode salah atau sudah kedaluwarsa.', 400);

    // Upsert user (jika belum ada, insert; jika ada tapi belum verify, update)
    await db.query(
      `INSERT INTO users (email, password_hash, is_verified, role) VALUES ($1, $2, true, 'user')
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, is_verified = true
       WHERE users.role = 'user'`,
      [email, rec.pending_password_hash]
    );

    // Dapatkan ID user yang baru (atau yang sudah ada)
    const userRes = await db.query("SELECT id FROM users WHERE email=$1", [email]);
    if (userRes.rows.length > 0) {
      const userId = userRes.rows[0].id;
      // Upsert profiles
      await db.query(
        `INSERT INTO profiles (id, email, name, role, points, is_active, avatar) 
         VALUES ($1, $2, $3, 'user', 0, true, '🎓')
         ON CONFLICT (id) DO NOTHING`,
        [userId, email, email.split('@')[0]]
      );
    }

    await db.query("DELETE FROM otps WHERE id=$1", [rec.id]);

    return res.status(200).json({ message: "Akun berhasil dibuat, silakan login." });
  } catch (error) {
    console.error("Error register verify:", error);
    return errorResponse(res, 'Terjadi kesalahan pada server.', 500);
  }
}
