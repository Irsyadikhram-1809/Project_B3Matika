import { supabase } from '../../../_lib/supabase.js';
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
    const { id } = req.query; // dynamic route /api/admin/requests/:id/approve

    if (user.role !== 'superadmin') {
      return errorResponse(res, 'Akses ditolak. Hanya Superadmin yang bisa menyetujui.', 403);
    }

    const { data: request } = await supabase.from('admin_requests').select('*').eq('id', id).single();

    if (!request) return errorResponse(res, 'Permintaan tidak ditemukan.', 404);
    if (request.status !== 'pending') return errorResponse(res, 'Permintaan sudah diproses sebelumnya.', 400);

    await supabase.from('admin_requests').update({
      status: 'approved',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString()
    }).eq('id', id);

    await supabase.from('users').update({ role: 'admin' }).eq('id', request.user_id);
    await supabase.from('profiles').update({ role: 'admin' }).eq('id', request.user_id);
    
    await supabase.from('audit_logs').insert({
      admin_id: user.id,
      action: 'APPROVE_ADMIN',
      entity: 'admin_requests',
      entity_id: id,
      details: JSON.stringify({ target_user: request.user_id })
    });

    const { data: u } = await supabase.from('users').select('email').eq('id', request.user_id).single();
    if (u) {
      await kirimEmailNotifikasi(
        u.email,
        "Selamat! Pengajuan Admin Disetujui",
        `<p>Selamat!</p><p>Pengajuan Anda untuk menjadi Admin di B3Matika telah <strong>disetujui</strong>.</p><p>Sekarang Anda dapat mengakses panel admin.</p>`,
        `Selamat!\n\nPengajuan Anda untuk menjadi Admin di B3Matika telah disetujui.\n\nSekarang Anda dapat mengakses panel admin.`
      );
    }

    return res.status(200).json({ message: 'Permintaan admin disetujui.' });
  } catch (err) {
    console.error("Error approve request:", err);
    return errorResponse(res, 'Terjadi kesalahan pada server.', 500);
  }
}
