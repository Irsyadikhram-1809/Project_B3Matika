import { supabase } from '../_lib/supabase.js';
import { setCors, errorResponse } from '../_lib/auth.js';
import { hmac, buatOTP, kirimOTP } from '../_lib/otp.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return errorResponse(res, 'Method not allowed', 405);

  let { email } = req.body;
  email = String(email || "").toLowerCase().trim();
  if (!email) return errorResponse(res, 'Email wajib diisi', 400);

  // Cek apakah user ada dan aktif
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, is_active')
    .eq('email', email)
    .single();

  if (profile && profile.is_active) {
    // Cek spam
    const { data: lastOtp } = await supabase
      .from('otps')
      .select('created_at')
      .eq('email', email)
      .eq('purpose', 'reset')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let canSend = true;
    if (lastOtp) {
      const elapsed = Date.now() - new Date(lastOtp.created_at).getTime();
      if (elapsed < 60 * 1000) canSend = false;
    }

    if (canSend) {
      await supabase.from('otps').delete().eq('email', email).eq('purpose', 'reset');
      const otp = buatOTP();
      await supabase.from('otps').insert({
        email,
        purpose: 'reset',
        code_hash: hmac(otp),
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString()
      });
      kirimOTP(email, otp, "Reset Sandi").catch(console.error);
    }
  }

  // Selalu respons sukses agar tidak membocorkan email
  res.status(200).json({ msg: "Jika data valid, kode verifikasi telah dikirim ke email." });
}
