import { supabase } from '../../_lib/supabase.js';
import { requireAuth, setCors, errorResponse } from '../../_lib/auth.js';
import { kirimEmailNotifikasi } from '../../_lib/otp.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'PATCH') return errorResponse(res, 'Method not allowed', 405);

  try {
    const { user: currentUser } = await requireAuth(req);
    
    if (currentUser.role !== 'superadmin') {
      return errorResponse(res, 'Akses ditolak. Hanya superadmin yang dapat melakukan ini.', 403);
    }

    const { id } = req.query; // Admin request ID
    const { action } = req.body; // 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return errorResponse(res, 'Aksi tidak valid.', 400);
    }

    const { data: adminReq } = await supabase
      .from('admin_requests')
      .select('*, users:user_id(email)')
      .eq('id', id)
      .single();

    if (!adminReq) {
      return errorResponse(res, 'Pengajuan tidak ditemukan.', 404);
    }

    if (adminReq.status !== 'pending') {
      return errorResponse(res, 'Pengajuan ini sudah diproses sebelumnya.', 400);
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    
    await supabase.from('admin_requests').update({ status: newStatus }).eq('id', id);

    if (action === 'approve') {
      await supabase.from('users').update({ role: 'admin' }).eq('id', adminReq.user_id);
      await supabase.from('profiles').update({ role: 'admin' }).eq('id', adminReq.user_id);
    }

    const subject = action === 'approve' ? 'Pengajuan Admin Disetujui' : 'Pengajuan Admin Ditolak';
    const messageHtml = action === 'approve' 
      ? `<p>Selamat!</p><p>Pengajuan Anda untuk menjadi Admin di B3Matika telah <strong>disetujui</strong>.</p><p>Sekarang Anda dapat mengakses Panel Admin.</p>`
      : `<p>Halo,</p><p>Mohon maaf, pengajuan Anda untuk menjadi Admin di B3Matika telah <strong>ditolak</strong> saat ini.</p><p>Terima kasih atas pengertiannya.</p>`;
    const messageText = action === 'approve'
      ? `Selamat!\n\nPengajuan Anda untuk menjadi Admin di B3Matika telah disetujui.\n\nSekarang Anda dapat mengakses Panel Admin.`
      : `Halo,\n\nMohon maaf, pengajuan Anda untuk menjadi Admin di B3Matika telah ditolak saat ini.\n\nTerima kasih atas pengertiannya.`;

    if (adminReq.users?.email) {
      await kirimEmailNotifikasi(adminReq.users.email, subject, messageHtml, messageText);
    }

    return res.status(200).json({ message: `Pengajuan berhasil di-${action === 'approve' ? 'setujui' : 'tolak'}.` });

  } catch (err) {
    console.error("Error updating request:", err);
    return errorResponse(res, 'Terjadi kesalahan pada server.', 500);
  }
}
