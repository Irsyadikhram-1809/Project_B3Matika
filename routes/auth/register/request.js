import { supabase } from '../../_lib/supabase.js';
import { setCors, errorResponse } from '../../_lib/auth.js';
import { hmac, buatOTP, kirimOTP, encryptPassword } from '../../_lib/otp.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return errorResponse(res, 'Method not allowed', 405);

  let { name, email, password } = req.body;
  email = String(email || "").toLowerCase().trim();
  
  if (!name || !email || !password || password.length < 8) {
    return errorResponse(res, 'Nama, email, dan sandi (min. 8 karakter) wajib diisi', 400);
  }

  // Cek apakah user sudah terdaftar di auth.users (kalau pakai Supabase Auth)
  // Cara paling aman cek profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();

  if (profile) {
    // Kita jalankan pura-pura agar tidak membocorkan email yang terdaftar,
    // tapi kalau sudah ada, biarkan saja response berhasil.
    // Tapi user tidak akan pernah dapat OTP registrasi jika emailnya sudah ada.
    return res.status(200).json({ msg: "Jika data valid, kode verifikasi telah dikirim ke email." });
  }

  // Cek spam OTP (jeda 60 detik)
  const { data: lastOtp } = await supabase
    .from('otps')
    .select('created_at')
    .eq('email', email)
    .eq('purpose', 'register')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (lastOtp) {
    const elapsed = Date.now() - new Date(lastOtp.created_at).getTime();
    if (elapsed < 60 * 1000) {
      return res.status(200).json({ msg: "Jika data valid, kode verifikasi telah dikirim ke email." });
    }
  }

  // Hapus OTP lama
  await supabase.from('otps').delete().eq('email', email).eq('purpose', 'register');

  // Buat OTP baru
  const otp = buatOTP();
  const encryptedPassword = encryptPassword(password);
  
  // Karena kita ingin menyimpan "name" juga, kita simpan name & encryptedPassword di JSON/text.
  // Tapi untuk mempermudah, kita simpan name:encryptedPassword dengan delimiter, atau hanya encryptedPassword.
  // Wait, Supabase `pending_password_hash` adalah tipe text. Kita simpan JSON string saja.
  const pendingData = JSON.stringify({ name, password: encryptedPassword });

  const { error } = await supabase.from('otps').insert({
    email,
    purpose: 'register',
    code_hash: hmac(otp),
    pending_password_hash: pendingData,
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString()
  });

  if (error) {
    console.error("Gagal insert OTP:", error);
    return errorResponse(res, "Gagal membuat OTP", 500);
  }

  // Kirim email (asinkron)
  kirimOTP(email, otp, "Pendaftaran").catch(console.error);

  return res.status(200).json({ msg: "Jika data valid, kode verifikasi telah dikirim ke email." });
}
