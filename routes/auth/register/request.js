import bcrypt from 'bcrypt';
import { supabase } from '../../_lib/supabase.js';
import { setCors, errorResponse } from '../../_lib/auth.js';
import { hmac, buatOTP, kirimOTP } from '../../_lib/otp.js';

const norm = (v) => String(v || "").toLowerCase().trim();

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return errorResponse(res, 'Method not allowed', 405);

  const email = norm(req.body.email);
  const { password, username: rawUsername } = req.body;
  const username = norm(rawUsername);

  if (!email || !password || password.length < 8) {
    return errorResponse(res, 'Email/sandi tidak valid (min. 8 karakter)', 400);
  }

  if (!username || username.length < 3 || username.length > 20 || !/^[a-z0-9_.]+$/.test(username)) {
    return errorResponse(res, 'Nama pengguna tidak valid (3-20 karakter, huruf/angka/titik/underscore).', 400);
  }

  try {
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .eq('is_verified', true);
      
    if (users && users.length) {
      return errorResponse(res, 'Email sudah terdaftar dan terverifikasi. Silakan login.', 400);
    }

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username);
      
    if (profiles && profiles.length) {
      return errorResponse(res, 'Nama pengguna sudah dipakai.', 400);
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    // Hitung jumlah request 1 jam terakhir
    const { data: rateRows } = await supabase
      .from('otps')
      .select('created_at')
      .eq('email', email)
      .eq('purpose', 'register')
      .gt('created_at', oneHourAgo)
      .order('created_at', { ascending: false });

    const count = rateRows ? rateRows.length : 0;
    const lastReq = count > 0 ? rateRows[0].created_at : null;

    if (lastReq && Date.now() - new Date(lastReq).getTime() < 60 * 1000) {
      return errorResponse(res, 'Tunggu 1 menit sebelum meminta kode baru.', 429);
    }
    if (count >= 5) {
      return errorResponse(res, 'Batas maksimal 5 permintaan per jam tercapai. Coba lagi nanti.', 429);
    }

    // Bersihkan OTP lama untuk email ini agar tidak menumpuk
    await supabase
      .from('otps')
      .delete()
      .eq('email', email)
      .eq('purpose', 'register')
      .lte('created_at', oneHourAgo);

    const otp = buatOTP();
    const pendingHash = await bcrypt.hash(password, 12);
    
    await supabase.from('otps').insert({
      email,
      purpose: 'register',
      code_hash: hmac(otp),
      pending_password_hash: pendingHash,
      pending_username: username,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString()
    });

    // Kirim email
    await kirimOTP(email, otp, "Pendaftaran");
    
    return res.status(200).json({ message: "Kode verifikasi telah dikirim ke email." });
  } catch (error) {
    console.error("Error register request:", error);
    const msg = error.message?.includes('Gagal mengirim') ? error.message : 'Terjadi kesalahan pada server saat memproses permintaan.';
    return errorResponse(res, msg, 500);
  }
}
