import bcrypt from 'bcrypt';
import db from '../../_lib/db.js';
import { setCors, errorResponse } from '../../_lib/auth.js';
import { hmac, buatOTP, kirimOTP } from '../../_lib/otp.js';

const norm = (v) => String(v || "").toLowerCase().trim();

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return errorResponse(res, 'Method not allowed', 405);

  const email = norm(req.body.email);
  const { password } = req.body;

  if (!email || !password || password.length < 8) {
    return errorResponse(res, 'Email/sandi tidak valid (min. 8 karakter)', 400);
  }

  try {
    const { rows } = await db.query("SELECT 1 FROM users WHERE email=$1 AND is_verified=true", [email]);
    if (rows.length) {
      // Walau sudah terdaftar, demi keamanan tetap kirim 200 OK untuk menghindari email enumeration
      return res.status(200).json({ message: "Jika data valid, kode verifikasi telah dikirim ke email." });
    }

    const { rows: otpRows } = await db.query(
      "SELECT created_at FROM otps WHERE email=$1 AND purpose='register' ORDER BY created_at DESC LIMIT 1",
      [email]
    );

    if (otpRows[0] && Date.now() - new Date(otpRows[0].created_at).getTime() < 60 * 1000) {
      return errorResponse(res, 'Tunggu 1 menit sebelum meminta kode baru.', 429);
    }

    await db.query("DELETE FROM otps WHERE email=$1 AND purpose='register'", [email]);

    const otp = buatOTP();
    const pendingHash = await bcrypt.hash(password, 12);
    
    await db.query(
      "INSERT INTO otps (email, purpose, code_hash, pending_password_hash, expires_at) VALUES ($1, 'register', $2, $3, $4)",
      [email, hmac(otp), pendingHash, new Date(Date.now() + 10 * 60 * 1000)]
    );

    await kirimOTP(email, otp, "Pendaftaran");
    
    return res.status(200).json({ message: "Jika data valid, kode verifikasi telah dikirim ke email." });
  } catch (error) {
    console.error("Error register request:", error);
    return errorResponse(res, 'Terjadi kesalahan pada server.', 500);
  }
}
