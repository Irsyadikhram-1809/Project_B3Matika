/**
 * routes/auth/register/verify.js
 * POST /api/auth/register/verify
 *
 * Verifikasi pendaftaran lewat kode OTP.
 * Untuk verifikasi lewat tautan, gunakan GET /api/auth/verify-email-link
 */
import { supabase } from '../../_lib/supabase.js';
import { setCors, errorResponse, normalizeUser } from '../../_lib/auth.js';
import { hmac, safeEqual, kirimEmailKonfirmasiAdmin } from '../../_lib/otp.js';
import env from '../../_lib/env.js';
import jwt from 'jsonwebtoken';

const norm = (v) => String(v || '').toLowerCase().trim();

async function cekOtp(email, purpose, code) {
  const { data: rows } = await supabase
    .from('otps')
    .select('*')
    .eq('email', email)
    .eq('purpose', purpose)
    .order('created_at', { ascending: false })
    .limit(1);

  const rec = rows?.[0];
  if (!rec) return { rec: null, err: 'Tidak ada kode verifikasi aktif untuk email ini.' };
  if (new Date(rec.expires_at) < new Date()) return { rec: null, err: 'Kode sudah kedaluwarsa. Minta kode baru.' };
  if ((rec.attempts || 0) >= 5) return { rec: null, err: 'Kode diblokir karena terlalu banyak percobaan salah. Minta kode baru.' };

  if (!safeEqual(rec.code_hash, hmac(String(code || '')))) {
    await supabase.from('otps').update({ attempts: (rec.attempts || 0) + 1 }).eq('id', rec.id);
    const sisaPercobaan = 4 - (rec.attempts || 0);
    return { rec: null, err: `Kode salah. Sisa percobaan: ${sisaPercobaan > 0 ? sisaPercobaan : 0}.` };
  }
  return { rec, err: null };
}

async function buatAkun(rec, email, name) {
  const username = rec.pending_username || name;
  const role     = rec.pending_role || 'user';

  const { data: userData, error: userErr } = await supabase
    .from('users')
    .upsert({
      email,
      password_hash: rec.pending_password_hash,
      is_verified:   true,
      role,
    }, { onConflict: 'email' })
    .select('id')
    .single();

  if (userErr) throw userErr;

  let profile;
  if (userData?.id) {
    const { data: profData } = await supabase.from('profiles').upsert({
      id:        userData.id,
      email,
      name:      name || username,
      username,
      role,
      points:    0,
      is_active: true,
    }, { onConflict: 'id' }).select('*').single();
    profile = profData;

    // Jika admin: update used_by di admin_invites
    if (role === 'admin') {
      await supabase
        .from('admin_invites')
        .update({ used_by: userData.id })
        .eq('for_email', email)
        .eq('status', 'used');
    }
  }

  await supabase.from('otps').delete().eq('id', rec.id);
  
  const token = jwt.sign({ id: userData.id }, env.JWT_SECRET, { expiresIn: '7d' });
  const fullUser = { ...userData, profiles: profile };
  return { userId: userData?.id, role, token, user: normalizeUser(fullUser) };
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return errorResponse(res, 'Method not allowed', 405);

  const email = norm(req.body.email);
  const code  = req.body.code || req.body.otp;
  const name  = req.body.name || email.split('@')[0];

  if (!email || !code) return errorResponse(res, 'Email dan kode wajib diisi.', 400);

  try {
    const { rec, err } = await cekOtp(email, 'register', code);
    if (!rec) return errorResponse(res, err, 400);

    const { role, token, user } = await buatAkun(rec, email, name);
    const isAdmin   = role === 'admin';
    // Kita arahkan ke /panel-rahasia (untuk admin) atau / (beranda user) jika auto-login sukses
    const redirectTo = isAdmin ? '/panel-rahasia' : '/';

    // Kirim email konfirmasi pasca-verifikasi untuk admin
    if (isAdmin) {
      kirimEmailKonfirmasiAdmin(email, name || email.split('@')[0]).catch((e) =>
        console.error('Gagal kirim email konfirmasi admin:', e.message)
      );
    }

    return res.status(200).json({
      message: isAdmin
        ? 'Akun admin berhasil dibuat dan diverifikasi.'
        : 'Akun berhasil dibuat.',
      role,
      token,
      user,
      redirectTo,
    });
  } catch (error) {
    console.error('Error register/verify:', error);
    return errorResponse(res, 'Terjadi kesalahan pada server.', 500);
  }
}
