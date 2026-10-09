/**
 * routes/auth/register/request.js
 * POST /api/auth/register/request
 *
 * Kirim kode OTP + link verifikasi untuk pendaftaran (user ATAU admin).
 * Untuk admin: token khusus divalidasi dulu sebelum OTP dikirim.
 *
 * Perubahan dari versi lama:
 * - Tidak lagi pakai ADMIN_SECRET_CODE statis
 * - Admin: validasi admin_invites (token hash dari admin_invites.invite_token_hash)
 * - Simpan link_token_hash di tabel otps (untuk verifikasi lewat tautan)
 * - Kirim OTP + link verifikasi dalam satu email
 */
import bcrypt from 'bcrypt';
import { supabase } from '../../_lib/supabase.js';
import { setCors, errorResponse } from '../../_lib/auth.js';
import { hmac, sha256, safeEqual, buatOTP, buatToken, kirimOTP } from '../../_lib/otp.js';
import env from '../../_lib/env.js';

const norm = (v) => String(v || '').toLowerCase().trim();

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return errorResponse(res, 'Method not allowed', 405);

  const email       = norm(req.body.email);
  const { password, username: rawUsername, role, adminToken } = req.body;
  const username    = norm(rawUsername);
  const userRole    = role === 'admin' ? 'admin' : 'user';

  // ── Validasi dasar ────────────────────────────────────────────────────────
  if (!email || !email.includes('@')) {
    return errorResponse(res, 'Email tidak valid.', 400);
  }
  if (!password || password.length < 8) {
    return errorResponse(res, 'Password minimal 8 karakter.', 400);
  }
  if (!username || username.length < 3 || username.length > 20 || !/^[a-z0-9_.]+$/.test(username)) {
    return errorResponse(res, 'Username tidak valid (3–20 karakter, huruf kecil/angka/titik/underscore).', 400);
  }

  try {
    // ── Untuk pendaftaran admin: validasi token khusus ────────────────────
    let validatedInviteId = null;
    if (userRole === 'admin') {
      if (!adminToken || adminToken.length < 10) {
        return errorResponse(res, 'Token khusus admin wajib diisi.', 400);
      }

      const tokenHash = sha256(String(adminToken).trim());

      const { data: invite } = await supabase
        .from('admin_invites')
        .select('id, for_email, invite_expires_at, invite_attempts, status')
        .eq('invite_token_hash', tokenHash)
        .eq('for_email', email)
        .eq('status', 'approved')
        .maybeSingle();

      if (!invite) {
        return errorResponse(res, 'Token admin tidak valid atau tidak terdaftar untuk email ini.', 403);
      }

      // Cek percobaan salah
      if ((invite.invite_attempts || 0) >= 5) {
        return errorResponse(res, 'Token admin telah diblokir karena terlalu banyak percobaan salah.', 429);
      }

      // Cek kedaluwarsa
      if (invite.invite_expires_at && new Date(invite.invite_expires_at) < new Date()) {
        return errorResponse(res, 'Token admin sudah kedaluwarsa. Silakan minta token baru.', 403);
      }

      // Token valid — tandai agar tidak dipakai ulang
      await supabase
        .from('admin_invites')
        .update({ status: 'used', used_by: null }) // used_by diisi setelah akun jadi
        .eq('id', invite.id);

      validatedInviteId = invite.id;
    }

    // ── Cek email sudah terdaftar ─────────────────────────────────────────
    const { data: existingUsers } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .eq('is_verified', true);

    if (existingUsers && existingUsers.length > 0) {
      return errorResponse(res, 'Email sudah terdaftar dan terverifikasi. Silakan login.', 400);
    }

    // ── Cek username sudah dipakai ────────────────────────────────────────
    const { data: existingProfiles } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username);

    if (existingProfiles && existingProfiles.length > 0) {
      return errorResponse(res, 'Username sudah dipakai.', 400);
    }

    // ── Rate limiting: maks 5 per jam, jeda 1 menit ───────────────────────
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { data: rateRows } = await supabase
      .from('otps')
      .select('created_at')
      .eq('email', email)
      .eq('purpose', 'register')
      .gt('created_at', oneHourAgo)
      .order('created_at', { ascending: false });

    const count   = rateRows ? rateRows.length : 0;
    const lastReq = count > 0 ? rateRows[0].created_at : null;

    if (lastReq && Date.now() - new Date(lastReq).getTime() < 60 * 1000) {
      return errorResponse(res, 'Tunggu 1 menit sebelum meminta kode baru.', 429);
    }
    if (count >= 5) {
      return errorResponse(res, 'Batas maksimal 5 permintaan per jam tercapai. Coba lagi nanti.', 429);
    }

    // ── Bersihkan OTP lama ────────────────────────────────────────────────
    await supabase
      .from('otps')
      .delete()
      .eq('email', email)
      .eq('purpose', 'register')
      .lte('created_at', oneHourAgo);

    // ── Buat OTP + token link verifikasi ──────────────────────────────────
    const otp           = buatOTP();
    const linkToken     = buatToken(32);
    const linkHash      = sha256(linkToken);
    const pendingHash   = await bcrypt.hash(password, 12);
    const expiresAt     = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await supabase.from('otps').insert({
      email,
      purpose:                'register',
      code_hash:              hmac(otp),
      pending_password_hash:  pendingHash,
      pending_username:       username,
      pending_role:           userRole,
      link_token_hash:        linkHash,
      link_expires_at:        expiresAt,
      link_used:              false,
      expires_at:             expiresAt,
    });

    // ── Kirim email OTP + link verifikasi ─────────────────────────────────
    await kirimOTP(email, otp, 'Pendaftaran', linkToken, userRole === 'admin');

    return res.status(200).json({ message: 'Kode verifikasi dan tautan telah dikirim ke email.' });
  } catch (error) {
    console.error('Error register/request:', error);
    const msg = error.message?.includes('Gagal mengirim') || error.message?.includes('email')
      ? error.message
      : 'Terjadi kesalahan pada server saat memproses permintaan.';
    return errorResponse(res, msg, 500);
  }
}
