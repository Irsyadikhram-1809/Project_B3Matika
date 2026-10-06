import db from '../../../_lib/db.js';
import { requireAuth, setCors, errorResponse } from '../../../_lib/auth.js';
import { kirimEmailNotifikasi } from '../../../_lib/otp.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  if (req.method !== 'POST') {
    return errorResponse(res, 'Method not allowed', 405);
  }

  try {
    const { user } = await requireAuth(req);
    const { id } = req.params;

    if (user.role !== 'superadmin') {
      return errorResponse(res, 'Akses ditolak. Hanya Superadmin yang bisa menolak.', 403);
    }

    const { rows } = await db.query("SELECT * FROM admin_requests WHERE id = $1", [id]);
    const request = rows[0];

    if (!request) return errorResponse(res, 'Permintaan tidak ditemukan.', 404);
    if (request.status !== 'pending') return errorResponse(res, 'Permintaan sudah diproses sebelumnya.', 400);

    // Update request
    await db.query(
      "UPDATE admin_requests SET status = 'rejected', reviewed_by = $1, reviewed_at = NOW() WHERE id = $2",
      [user.id, id]
    );

    // Log Audit
    await db.query(
      "INSERT INTO audit_logs (admin_id, action, entity, entity_id, details) VALUES ($1, $2, $3, $4, $5)",
      [user.id, 'REJECT_ADMIN', 'admin_requests', id, JSON.stringify({ target_user: request.user_id })]
    );

    // Send Notification
    const { rows: uRows } = await db.query("SELECT email FROM users WHERE id = $1", [request.user_id]);
    if (uRows.length > 0) {
      await kirimEmailNotifikasi(
        uRows[0].email,
        "Pengajuan Admin Ditolak",
        `<p>Halo!</p><p>Mohon maaf, pengajuan Anda untuk menjadi Admin di B3Matika <strong>ditolak</strong> untuk saat ini.</p><p>Terima kasih atas partisipasi Anda.</p>`,
        `Halo!\n\nMohon maaf, pengajuan Anda untuk menjadi Admin di B3Matika ditolak untuk saat ini.\n\nTerima kasih.`
      );
    }

    return res.status(200).json({ message: 'Permintaan admin ditolak.' });
  } catch (err) {
    console.error("Error reject request:", err);
    return errorResponse(res, 'Terjadi kesalahan pada server.', 500);
  }
}
