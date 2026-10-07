/**
 * routes/auth/admin-token-request.js
 * POST /api/auth/admin-token-request
 *
 * Pendaftar meminta token admin. Sistem:
 * 1. Validasi input (nama, username, email, password, password2)
 * 2. Cek batas: 1 pending per email, jeda 5 menit antar permintaan
 * 3. Simpan permintaan ke admin_invites (status='pending')
 * 4. Kirim email ke superadmin dengan link approve/reject
 * 5. Kembalikan status berhasil (TANPA membocorkan token apapun)
 *
 * Keamanan:
 * - Link approval 24 jam, hash SHA-256
 * - Terikat ke email pendaftar
 * - Dicatat di audit_logs
 */
import crypto from 'crypto';
import { supabase } from '../_lib/supabase.js';
import { setCors, errorResponse } from '../_lib/auth.js';
import { sha256, kirimEmailPermintaanAdmin } from '../_lib/otp.js';
import env from '../_lib/env.js';

const norm = (v) => String(v || '').toLowerCase().trim();
const normRaw = (v) => String(v || '').trim();

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return errorResponse(res, 'Method not allowed', 405);

  const email     = norm(req.body.email);
  const username  = norm(req.body.username);
  const nama      = normRaw(req.body.name);
  const password  = req.body.password || '';
  const password2 = req.body.password2 || '';

  // ── Validasi input ────────────────────────────────────────────────────────
  if (!nama || nama.length < 2 || nama.length > 60) {
    return errorResponse(res, 'Nama lengkap harus diisi (2–60 karakter).', 400);
  }
  if (!username || username.length < 3 || username.length > 20 || !/^[a-z0-9_.]+$/.test(username)) {
    return errorResponse(res, 'Username tidak valid (3–20 karakter, huruf kecil/angka/titik/underscore).', 400);
  }
  if (!email || !email.includes('@')) {
    return errorResponse(res, 'Email tidak valid.', 400);
  }
  if (!password || password.length < 8) {
    return errorResponse(res, 'Password minimal 8 karakter.', 400);
  }
  if (password !== password2) {
    return errorResponse(res, 'Konfirmasi password tidak sama.', 400);
  }

  try {
    // ── Cek email sudah terdaftar ─────────────────────────────────────────
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .eq('is_verified', true)
      .maybeSingle();

    if (existingUser) {
      return errorResponse(res, 'Email sudah terdaftar dan terverifikasi. Silakan login.', 400);
    }

    // ── Cek username sudah dipakai ────────────────────────────────────────
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (existingProfile) {
      return errorResponse(res, 'Username sudah dipakai, pilih username lain.', 400);
    }

    // ── Batas: 1 pending per email, jeda 5 menit ─────────────────────────
    const { data: pendingInvites } = await supabase
      .from('admin_invites')
      .select('id, created_at')
      .eq('for_email', email)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (pendingInvites && pendingInvites.length > 0) {
      const lastReq = new Date(pendingInvites[0].created_at);
      const minutesPassed = (Date.now() - lastReq.getTime()) / (1000 * 60);
      if (minutesPassed < 5) {
        const sisaDetik = Math.ceil((5 - minutesPassed) * 60);
        return errorResponse(
          res,
          `Anda sudah memiliki permintaan pending. Tunggu ${sisaDetik} detik atau cek email superadmin.`,
          429
        );
      }
      // Lebih dari 5 menit: update record lama menjadi expired agar tidak menumpuk
      await supabase
        .from('admin_invites')
        .update({ status: 'rejected' })
        .in('id', pendingInvites.map((r) => r.id));
    }

    // ── Buat token approval & rejection (random, 32 byte) ─────────────────
    const approvalToken  = crypto.randomBytes(32).toString('hex');
    const rejectionToken = crypto.randomBytes(32).toString('hex');
    const approvalHash   = sha256(approvalToken);
    const rejectionHash  = sha256(rejectionToken);
    const expiresAt      = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const now            = new Date().toISOString();

    // ── Simpan ke admin_invites ───────────────────────────────────────────
    const { data: invite, error: insertErr } = await supabase
      .from('admin_invites')
      .insert({
        for_email:            email,
        for_name:             nama,
        for_username:         username,
        status:               'pending',
        approval_token_hash:  approvalHash,
        rejection_token_hash: rejectionHash,
        approval_expires_at:  expiresAt,
        created_at:           now,
      })
      .select('id')
      .single();

    if (insertErr) throw insertErr;

    // ── Kirim email ke superadmin ────────────────────────────────────────
    const approveUrl = `${env.APP_BASE_URL}/konfirmasi-admin?action=approve&token=${encodeURIComponent(approvalToken)}&id=${invite.id}`;
    const rejectUrl  = `${env.APP_BASE_URL}/konfirmasi-admin?action=reject&token=${encodeURIComponent(rejectionToken)}&id=${invite.id}`;

    try {
      await kirimEmailPermintaanAdmin({
        nama, username, email,
        waktu: now,
        approveUrl,
        rejectUrl,
      });
    } catch (emailErr) {
      // Jika email gagal, batalkan permintaan agar tidak ada record pending tanpa notifikasi
      await supabase.from('admin_invites').delete().eq('id', invite.id);
      return errorResponse(
        res,
        'Gagal mengirim notifikasi ke superadmin. Pastikan konfigurasi email server sudah benar.',
        502
      );
    }

    // ── Catat audit ──────────────────────────────────────────────────────
    await supabase.from('audit_logs').insert({
      admin_id:  null,
      action:    'ADMIN_TOKEN_REQUESTED',
      entity:    'admin_invites',
      entity_id: invite.id,
      details:   JSON.stringify({ email, username }),
    }).then(() => {});

    return res.status(200).json({
      message: 'Permintaan token admin berhasil dikirim ke superadmin. Cek email Anda setelah disetujui.',
    });
  } catch (err) {
    console.error('Error admin-token-request:', err);
    return errorResponse(res, 'Terjadi kesalahan pada server. Coba lagi nanti.', 500);
  }
}
