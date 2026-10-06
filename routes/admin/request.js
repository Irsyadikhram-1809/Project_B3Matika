import db from '../_lib/db.js';
import { requireAuth, setCors, errorResponse } from '../_lib/auth.js';
import { kirimEmailNotifikasi } from '../_lib/otp.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return errorResponse(res, 'Method not allowed', 405);

  try {
    const { user } = await requireAuth(req);
    const { request_reason } = req.body;

    if (!request_reason || request_reason.trim().length < 10) {
      return errorResponse(res, 'Alasan pengajuan admin harus diisi (minimal 10 karakter).', 400);
    }

    // Check if already an admin or superadmin
    if (user.role === 'admin' || user.role === 'superadmin') {
      return errorResponse(res, 'Anda sudah menjadi admin/superadmin.', 400);
    }

    // Check if there's already a pending request
    const { rows: existing } = await db.query(
      "SELECT id FROM admin_requests WHERE user_id = $1 AND status = 'pending'",
      [user.id]
    );

    if (existing.length > 0) {
      return errorResponse(res, 'Anda sudah memiliki pengajuan admin yang sedang diproses.', 400);
    }

    await db.query(
      "INSERT INTO admin_requests (user_id, request_reason, status) VALUES ($1, $2, 'pending')",
      [user.id, request_reason.trim()]
    );

    // Send email notification to user
    await kirimEmailNotifikasi(
      user.email,
      "Pengajuan Admin Diproses",
      `<p>Halo!</p><p>Pengajuan Anda untuk menjadi Admin di B3Matika telah kami terima dan sedang dalam status <strong>pending</strong>. Tim kami akan meninjau alasan Anda segera.</p><p>Terima kasih!</p>`,
      `Halo!\n\nPengajuan Anda untuk menjadi Admin di B3Matika telah kami terima dan sedang dalam status pending.\n\nTerima kasih!`
    );

    return res.status(200).json({ message: 'Pengajuan admin berhasil dikirim dan sedang diproses.' });
  } catch (err) {
    console.error("Error admin request:", err);
    return errorResponse(res, 'Terjadi kesalahan pada server.', 500);
  }
}
