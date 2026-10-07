import { supabase } from '../../_lib/supabase.js';
import { setCors, errorResponse } from '../../_lib/auth.js';
import { hmac, safeEqual } from '../../_lib/otp.js';

const norm = (v) => String(v || "").toLowerCase().trim();

async function cekOtp(email, purpose, code) {
  const { data: rows } = await supabase
    .from('otps')
    .select('*')
    .eq('email', email)
    .eq('purpose', purpose)
    .order('created_at', { ascending: false })
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
  const code = req.body.code || req.body.otp;
  const name = req.body.name || email.split('@')[0];

  if (!email || !code) return errorResponse(res, 'Email dan kode wajib diisi.', 400);

  try {
    const rec = await cekOtp(email, "register", code);
    if (!rec) return errorResponse(res, 'Kode salah atau sudah kedaluwarsa.', 400);

    // Upsert user
    const { data: userData, error: userErr } = await supabase
      .from('users')
      .upsert({
        email,
        password_hash: rec.pending_password_hash,
        is_verified: true,
        role: 'user'
      }, { onConflict: 'email' })
      .select('id')
      .single();

    if (userErr) throw userErr;

    if (userData?.id) {
      const username = rec.pending_username || name;
      // Upsert profiles
      await supabase
        .from('profiles')
        .upsert({
          id: userData.id,
          email,
          name,
          username,
          role: 'user',
          points: 0,
          is_active: true,
          avatar: '🎓'
        }, { onConflict: 'id' });
    }

    await supabase.from('otps').delete().eq('id', rec.id);

    return res.status(200).json({ message: "Akun berhasil dibuat, silakan login." });
  } catch (error) {
    console.error("Error register verify:", error);
    return errorResponse(res, 'Terjadi kesalahan pada server.', 500);
  }
}
