/**
 * routes/auth/verify-email-link.js
 * GET /api/auth/verify-email-link?token=...&email=...
 *
 * Verifikasi pendaftaran lewat tautan di email.
 * Tautan unik, sekali pakai, kadaluwarsa 10 menit.
 * Tidak perlu login — pengguna langsung masuk dari tautan.
 *
 * Sukses: { success: true, message: '...' }
 * Gagal:  status 4xx + { error: '...' }
 */
import { supabase } from '../_lib/supabase.js';
import { setCors, errorResponse } from '../_lib/auth.js';
import { sha256, safeEqual, kirimEmailKonfirmasiAdmin } from '../_lib/otp.js';

const norm = (v) => String(v || '').toLowerCase().trim();

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return errorResponse(res, 'Method not allowed', 405);

  const email = norm(req.query.email);
  const token = req.query.token;

  if (!email || !token) {
    return errorResponse(res, 'Parameter tidak lengkap.', 400);
  }

  try {
    const tokenHash = sha256(String(token).trim());

    // Ambil OTP record dengan link_token_hash cocok
    const { data: rows } = await supabase
      .from('otps')
      .select('*')
      .eq('email', email)
      .eq('purpose', 'register')
      .eq('link_token_hash', tokenHash)
      .order('created_at', { ascending: false })
      .limit(1);

    const rec = rows?.[0];

    if (!rec) {
      return errorResponse(res, 'Tautan verifikasi tidak valid.', 400);
    }
    if (rec.link_used) {
      return errorResponse(res, 'Tautan ini sudah digunakan sebelumnya. Silakan login jika akun sudah dibuat.', 409);
    }
    if (!rec.link_expires_at || new Date(rec.link_expires_at) < new Date()) {
      return errorResponse(res, 'Tautan verifikasi sudah kedaluwarsa. Silakan minta kode baru.', 410);
    }

    // Tandai link sudah dipakai SEBELUM membuat akun (idempotent guard)
    const { data: updated } = await supabase
      .from('otps')
      .update({ link_used: true })
      .eq('id', rec.id)
      .eq('link_used', false)  // hanya update jika belum dipakai (atomic check)
      .select('id');

    if (!updated || updated.length === 0) {
      return errorResponse(res, 'Tautan ini sudah digunakan. Silakan login.', 409);
    }

    // Buat akun
    const username = rec.pending_username || email.split('@')[0];
    const role     = rec.pending_role || 'user';
    const name     = username;

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

    if (userData?.id) {
      await supabase.from('profiles').upsert({
        id:        userData.id,
        email,
        name,
        username,
        role,
        points:    0,
        is_active: true,
        avatar:    '🎓',
      }, { onConflict: 'id' });

      if (role === 'admin') {
        await supabase
          .from('admin_invites')
          .update({ used_by: userData.id })
          .eq('for_email', email)
          .eq('status', 'used');
      }
    }

    // Hapus OTP setelah akun berhasil dibuat
    await supabase.from('otps').delete().eq('id', rec.id);

    const isAdmin    = role === 'admin';
    const redirectTo = isAdmin ? '/panel-rahasia/login' : '/masuk';

    // Kirim email konfirmasi pasca-verifikasi untuk admin
    if (isAdmin) {
      const displayName = rec.pending_username || email.split('@')[0];
      kirimEmailKonfirmasiAdmin(email, displayName).catch((e) =>
        console.error('Gagal kirim email konfirmasi admin (link):', e.message)
      );
    }

    return res.status(200).json({
      success: true,
      message: isAdmin
        ? 'Akun admin berhasil diverifikasi. Silakan masuk melalui halaman login admin.'
        : 'Email berhasil diverifikasi! Akun Anda sudah aktif.',
      role,
      redirectTo,
    });
  } catch (error) {
    console.error('Error verify-email-link:', error);
    return errorResponse(res, 'Terjadi kesalahan pada server.', 500);
  }
}
