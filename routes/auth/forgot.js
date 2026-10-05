import db from '../_lib/db.js';
import { setCors, errorResponse } from '../_lib/auth.js';
import { hmac, buatOTP, kirimOTP } from '../_lib/otp.js';

const norm = (v) => String(v || "").toLowerCase().trim();

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return errorResponse(res, 'Method not allowed', 405);

  const email = norm(req.body.email);
  if (!email) return errorResponse(res, 'Email wajib diisi.', 400);

  try {
    const { rows } = await db.query(
      "SELECT 1 FROM users WHERE email=$1 AND is_verified=true AND is_blocked=false", 
      [email]
    );

    if (rows.length) {
      // Sama seperti register, pastikan rate limit
      const { rows: otpRows } = await db.query(
        "SELECT created_at FROM otps WHERE email=$1 AND purpose='reset' ORDER BY created_at DESC LIMIT 1",
        [email]
      );

      if (otpRows[0] && Date.now() - new Date(otpRows[0].created_at).getTime() < 60 * 1000) {
        return errorResponse(res, 'Tunggu 1 menit sebelum meminta kode baru.', 429);
      }

      await db.query("DELETE FROM otps WHERE email=$1 AND purpose='reset'", [email]);
      
      const otp = buatOTP();
      await db.query(
        "INSERT INTO otps (email, purpose, code_hash, expires_at) VALUES ($1, 'reset', $2, $3)",
        [email, hmac(otp), new Date(Date.now() + 10 * 60 * 1000)]
      );

      await kirimOTP(email, otp, "Reset Sandi");
    }

    return res.status(200).json({ message: "Jika email terdaftar, kode reset telah dikirim." });
  } catch (error) {
    console.error("Error forgot password:", error);
    return errorResponse(res, 'Terjadi kesalahan pada server.', 500);
  }
}
