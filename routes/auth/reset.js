import bcrypt from 'bcrypt';
import { supabase } from '../_lib/supabase.js';
import { setCors, errorResponse } from '../_lib/auth.js';
import { hmac, safeEqual } from '../_lib/otp.js';

const norm = (v) => String(v || "").toLowerCase().trim();

async function cekOtp(email, purpose, code) {
  const { data: rows } = await supabase
    .from('otps')
    .select('*')
    .eq('email', email)
    .eq('purpose', purpose)
    .limit(1);
    
  const rec = rows?.[0];
  if (!rec || new Date(rec.expires_at) < new Date() || rec.attempts >= 5) return null;
  if (!safeEqual(rec.code_hash, hmac(String(code || "")))) {
    await supabase.from('otps').update({ attempts: rec.attempts + 1 }).eq('id', rec.id);
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
    await supabase.from('users').update({ password_hash: hash }).eq('email', email);
    await supabase.from('otps').delete().eq('id', rec.id);

    return res.status(200).json({ message: "Sandi berhasil diubah." });
  } catch (error) {
    console.error("Error reset password:", error);
    return errorResponse(res, 'Terjadi kesalahan pada server.', 500);
  }
}
