import { supabase } from '../_lib/supabase.js';
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
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .eq('is_verified', true)
      .eq('is_blocked', false);

    if (users && users.length) {
      // Sama seperti register, pastikan rate limit
      const { data: otpRows } = await supabase
        .from('otps')
        .select('created_at')
        .eq('email', email)
        .eq('purpose', 'reset')
        .order('created_at', { ascending: false })
        .limit(1);

      if (otpRows?.[0] && Date.now() - new Date(otpRows[0].created_at).getTime() < 60 * 1000) {
        return errorResponse(res, 'Tunggu 1 menit sebelum meminta kode baru.', 429);
      }

      await supabase.from('otps').delete().eq('email', email).eq('purpose', 'reset');
      
      const otp = buatOTP();
      await supabase.from('otps').insert({
        email,
        purpose: 'reset',
        code_hash: hmac(otp),
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString()
      });

      await kirimOTP(email, otp, "Reset Sandi");
    }

    return res.status(200).json({ message: "Jika email terdaftar, kode reset telah dikirim." });
  } catch (error) {
    console.error("Error forgot password:", error);
    return errorResponse(res, 'Terjadi kesalahan pada server.', 500);
  }
}
