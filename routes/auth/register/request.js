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
      return errorResponse(res, 'Email sudah terdaftar dan terverifikasi. Silakan login.', 400);
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const { rows: rateRows } = await db.query(
      "SELECT COUNT(*) as count, MAX(created_at) as last_req FROM otps WHERE email=$1 AND purpose='register' AND created_at > $2",
      [email, oneHourAgo]
    );

    const count = parseInt(rateRows[0]?.count || 0);
    const lastReq = rateRows[0]?.last_req;

    if (lastReq && Date.now() - new Date(lastReq).getTime() < 60 * 1000) {
      return errorResponse(res, 'Tunggu 1 menit sebelum meminta kode baru.', 429);
    }
    if (count >= 5) {
      return errorResponse(res, 'Batas maksimal 5 permintaan per jam tercapai. Coba lagi nanti.', 429);
    }

    // Bersihkan OTP lama untuk email ini agar tidak menumpuk
    await db.query("DELETE FROM otps WHERE email=$1 AND purpose='register' AND created_at <= $2", [email, oneHourAgo]);

    const otp = buatOTP();
    const pendingHash = await bcrypt.hash(password, 12);
    
    await db.query(
      "INSERT INTO otps (email, purpose, code_hash, pending_password_hash, expires_at) VALUES ($1, 'register', $2, $3, $4)",
      [email, hmac(otp), pendingHash, new Date(Date.now() + 10 * 60 * 1000)]
    );

    // Kirim email, jika gagal akan masuk ke catch block dan transaksi gagal secara logika di mata user
    await kirimOTP(email, otp, "Pendaftaran");
    
    return res.status(200).json({ message: "Kode verifikasi telah dikirim ke email." });
  } catch (error) {
    console.error("Error register request:", error);
    const msg = error.message?.includes('Gagal mengirim') ? error.message : 'Terjadi kesalahan pada server saat memproses permintaan.';
    return errorResponse(res, msg, 500);
  }
}
