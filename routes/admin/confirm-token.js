/**
 * routes/admin/confirm-token.js
 * GET  /api/admin/confirm-token  — tampilkan halaman konfirmasi (data saja, frontend render)
 * POST /api/admin/confirm-token  — eksekusi approve/reject
 *
 * Alur:
 * - Superadmin klik link email → browser buka /konfirmasi-admin?action=...&token=...&id=...
 * - Frontend halaman konfirmasi panggil GET untuk validasi & tampil info
 * - Superadmin klik tombol konfirmasi → frontend POST ke sini
 * - Jika approve: buat token undangan, kirim ke pendaftar
 * - Jika reject: kirim email penolakan
 *
 * Keamanan:
 * - Link dibandingkan dengan SHA-256 hash (timing-safe)
 * - Link expired setelah 24 jam
 * - Sekali pakai (status berubah setelah diproses)
 * - Endpoint dicatat di audit_logs
 */
import crypto from 'crypto';
import { supabase } from '../_lib/supabase.js';
import { setCors, errorResponse } from '../_lib/auth.js';
import { sha256, safeEqual, buatToken, kirimTokenAdmin, kirimEmailPenolakan } from '../_lib/otp.js';
import env from '../_lib/env.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── GET: validasi link & kembalikan info untuk frontend ──────────────────
  if (req.method === 'GET') {
    const { action, token, id } = req.query;

    if (!action || !token || !id) {
      return errorResponse(res, 'Parameter tidak lengkap.', 400);
    }
    if (!['approve', 'reject'].includes(action)) {
      return errorResponse(res, 'Aksi tidak valid.', 400);
    }

    const { data: invite, error } = await supabase
      .from('admin_invites')
      .select('id, for_email, for_name, for_username, status, approval_token_hash, rejection_token_hash, approval_expires_at')
      .eq('id', id)
      .maybeSingle();

    if (error || !invite) {
      return errorResponse(res, 'Permintaan tidak ditemukan.', 404);
    }
    if (invite.status !== 'pending') {
      return errorResponse(res, `Permintaan ini sudah diproses (status: ${invite.status}).`, 409);
    }
    if (new Date(invite.approval_expires_at) < new Date()) {
      return errorResponse(res, 'Tautan sudah kedaluwarsa.', 410);
    }

    const expectedHash = action === 'approve'
      ? invite.approval_token_hash
      : invite.rejection_token_hash;
    const tokenHash = sha256(token);

    if (!expectedHash || !safeEqual(tokenHash, expectedHash)) {
      return errorResponse(res, 'Token tidak valid.', 403);
    }

    return res.status(200).json({
      valid: true,
      action,
      invite: {
        id: invite.id,
        nama:     invite.for_name,
        username: invite.for_username,
        email:    invite.for_email,
      },
    });
  }

  // ── POST: eksekusi aksi ───────────────────────────────────────────────────
  if (req.method === 'POST') {
    const { action, token, id } = req.body;

    if (!action || !token || !id) {
      return errorResponse(res, 'Parameter tidak lengkap.', 400);
    }
    if (!['approve', 'reject'].includes(action)) {
      return errorResponse(res, 'Aksi tidak valid.', 400);
    }

    try {
      const { data: invite } = await supabase
        .from('admin_invites')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!invite) return errorResponse(res, 'Permintaan tidak ditemukan.', 404);
      if (invite.status !== 'pending') {
        return errorResponse(res, `Permintaan sudah diproses (status: ${invite.status}).`, 409);
      }
      if (new Date(invite.approval_expires_at) < new Date()) {
        return errorResponse(res, 'Tautan sudah kedaluwarsa.', 410);
      }

      const expectedHash = action === 'approve'
        ? invite.approval_token_hash
        : invite.rejection_token_hash;
      const tokenHash = sha256(token);

      if (!expectedHash || !safeEqual(tokenHash, expectedHash)) {
        return errorResponse(res, 'Token tidak valid.', 403);
      }

      if (action === 'approve') {
        // Buat token undangan acak (akan dikirim ke pendaftar)
        const inviteToken     = buatToken(32); // 43 karakter base64url
        const inviteTokenHash = sha256(inviteToken);
        const inviteExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        // Update admin_invites: status approved + simpan hash token undangan
        await supabase.from('admin_invites').update({
          status:             'approved',
          invite_token_hash:  inviteTokenHash,
          invite_expires_at:  inviteExpiresAt,
          reviewed_at:        new Date().toISOString(),
        }).eq('id', id);

        // Kirim token ke pendaftar
        try {
          await kirimTokenAdmin(invite.for_email, invite.for_username, inviteToken);
        } catch (emailErr) {
          // Rollback status jika email gagal
          await supabase.from('admin_invites').update({ status: 'pending' }).eq('id', id);
          return errorResponse(res, 'Gagal mengirim token ke email pendaftar. Coba lagi.', 502);
        }

        // Audit log
        await supabase.from('audit_logs').insert({
          admin_id:  null,
          action:    'ADMIN_TOKEN_APPROVED',
          entity:    'admin_invites',
          entity_id: id,
          details:   JSON.stringify({ email: invite.for_email, username: invite.for_username }),
        }).then(() => {});

        return res.status(200).json({
          message: `Token admin berhasil dikirim ke ${invite.for_email}.`,
        });

      } else {
        // Reject
        await supabase.from('admin_invites').update({
          status:      'rejected',
          reviewed_at: new Date().toISOString(),
        }).eq('id', id);

        // Kirim email penolakan (tidak memblokir jika gagal)
        await kirimEmailPenolakan(invite.for_email, invite.for_username);

        // Audit log
        await supabase.from('audit_logs').insert({
          admin_id:  null,
          action:    'ADMIN_TOKEN_REJECTED',
          entity:    'admin_invites',
          entity_id: id,
          details:   JSON.stringify({ email: invite.for_email }),
        }).then(() => {});

        return res.status(200).json({
          message: `Permintaan dari ${invite.for_email} telah ditolak.`,
        });
      }
    } catch (err) {
      console.error('Error confirm-token:', err);
      return errorResponse(res, 'Terjadi kesalahan pada server.', 500);
    }
  }

  return errorResponse(res, 'Method not allowed', 405);
}
