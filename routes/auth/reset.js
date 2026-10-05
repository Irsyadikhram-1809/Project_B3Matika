import { supabase } from '../_lib/supabase.js';
import { setCors, errorResponse } from '../_lib/auth.js';
import { hmac, safeEqual } from '../_lib/otp.js';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return errorResponse(res, 'Method not allowed', 405);

  let { email, code, newPassword } = req.body;
  email = String(email || "").toLowerCase().trim();

  if (!email || !code || !newPassword || newPassword.length < 8) {
    return errorResponse(res, 'Email, kode, dan sandi baru (min. 8 karakter) wajib diisi', 400);
  }

  // Cari OTP
  const { data: rec } = await supabase
    .from('otps')
    .select('*')
    .eq('email', email)
    .eq('purpose', 'reset')
    .single();

  if (!rec || new Date(rec.expires_at) < new Date() || rec.attempts >= 5) {
    return errorResponse(res, 'Kode salah atau kedaluwarsa', 400);
  }

  // Verifikasi hash
  if (!safeEqual(rec.code_hash, hmac(code))) {
    await supabase.from('otps').update({ attempts: rec.attempts + 1 }).eq('id', rec.id);
    return errorResponse(res, 'Kode salah atau kedaluwarsa', 400);
  }

  // Cari user id di auth.users lewat profiles
  const { data: profile } = await supabase.from('profiles').select('id').eq('email', email).single();
  if (!profile) return errorResponse(res, 'User tidak ditemukan', 404);

  // Update password via Supabase Admin API
  const adminAuth = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  ).auth.admin;

  const { error: updateError } = await adminAuth.updateUserById(profile.id, { password: newPassword });

  if (updateError) {
    return errorResponse(res, 'Gagal mengubah sandi: ' + updateError.message, 500);
  }

  // Hapus OTP yang sudah dipakai
  await supabase.from('otps').delete().eq('id', rec.id);

  res.status(200).json({ msg: "Sandi berhasil diubah" });
}
