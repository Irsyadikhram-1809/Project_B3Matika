import bcrypt from 'bcrypt';
import db from '../_lib/db.js';
import { setCors, errorResponse } from '../_lib/auth.js';
import { hmac, safeEqual } from '../_lib/otp.js';

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
  const { code, password: newPassword } = req.body;

  if (!email || !code || !newPassword || newPassword.length < 8) {
    return errorResponse(res, 'Data tidak valid (sandi minimal 8 karakter).', 400);
  }

  try {
    const rec = await cekOtp(email, "reset", code);
    if (!rec) return errorResponse(res, 'Kode salah atau kedaluwarsa.', 400);

    const hash = await bcrypt.hash(newPassword, 12);
    await db.query("UPDATE users SET password_hash=$1 WHERE email=$2", [hash, email]);
    await db.query("DELETE FROM otps WHERE id=$1", [rec.id]);

    return res.status(200).json({ message: "Sandi berhasil diubah." });
  } catch (error) {
    console.error("Error reset password:", error);
    return errorResponse(res, 'Terjadi kesalahan pada server.', 500);
  }
}
