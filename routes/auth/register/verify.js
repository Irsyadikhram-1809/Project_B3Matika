import { supabase } from '../../_lib/supabase.js';
import { setCors, errorResponse } from '../../_lib/auth.js';
import { hmac, safeEqual, decryptPassword } from '../../_lib/otp.js';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return errorResponse(res, 'Method not allowed', 405);

  let { email, code } = req.body;
  email = String(email || "").toLowerCase().trim();

  if (!email || !code) return errorResponse(res, 'Email dan kode wajib diisi', 400);

  // Cari OTP
  const { data: rec } = await supabase
    .from('otps')
    .select('*')
    .eq('email', email)
    .eq('purpose', 'register')
    .single();

  if (!rec || new Date(rec.expires_at) < new Date() || rec.attempts >= 5) {
    return errorResponse(res, 'Kode salah atau kedaluwarsa', 400);
  }

  // Verifikasi hash
  if (!safeEqual(rec.code_hash, hmac(code))) {
    await supabase.from('otps').update({ attempts: rec.attempts + 1 }).eq('id', rec.id);
    return errorResponse(res, 'Kode salah atau kedaluwarsa', 400);
  }

  // Ekstrak data yang disimpan
  let name = "";
  let plaintextPassword = "";
  try {
    const pendingData = JSON.parse(rec.pending_password_hash);
    name = pendingData.name;
    plaintextPassword = decryptPassword(pendingData.password);
  } catch (e) {
    return errorResponse(res, 'Gagal memproses data pendaftaran', 500);
  }

  // Buat User di Supabase Auth menggunakan Service Role Key
  // Note: Karena ini di backend, pastikan SUPABASE_SERVICE_ROLE_KEY di .env
  const adminAuth = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  ).auth.admin;

  const { data: userData, error: createError } = await adminAuth.createUser({
    email,
    password: plaintextPassword,
    email_confirm: true, // Akun HANYA dibuat setelah OTP benar, langsung confirmed
    user_metadata: { name }
  });

  if (createError) {
    return errorResponse(res, 'Gagal membuat akun: ' + createError.message, 500);
  }

  // Buat profil
  const { error: profileError } = await supabase.from('profiles').insert({
    id: userData.user.id,
    name,
    email,
    role: 'user', // Default role user
    points: 0,
    is_active: true,
  });

  if (profileError) {
    console.error("Gagal buat profil", profileError);
  }

  // Hapus OTP yang sudah dipakai
  await supabase.from('otps').delete().eq('id', rec.id);

  res.status(200).json({ msg: "Akun berhasil dibuat, silakan login" });
}
