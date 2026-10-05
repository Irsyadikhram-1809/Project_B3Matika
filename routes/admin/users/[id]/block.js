import { supabase } from '../../../_lib/supabase.js';
import { requireAuth, setCors, errorResponse } from '../../../_lib/auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'PATCH') return errorResponse(res, 'Method not allowed', 405);

  try {
    const { profile } = await requireAuth(req);
    if (profile.role !== 'admin' && profile.role !== 'superadmin') {
      return errorResponse(res, 'Tidak punya izin', 403);
    }

    const { id } = req.query; // Diambil dari URL oleh custom index.js

    const { data: target } = await supabase.from('profiles').select('id, role, is_active').eq('id', id).single();
    if (!target) return errorResponse(res, 'User tidak ditemukan', 404);

    if (target.role === 'superadmin') {
      return errorResponse(res, 'Super admin tidak bisa diubah', 403);
    }
    if (target.role === 'admin' && profile.role !== 'superadmin') {
      return errorResponse(res, 'Hanya super admin yang bisa mengelola admin', 403);
    }

    const isBlocked = !!req.body.blocked;
    const { error } = await supabase.from('profiles').update({ is_active: !isBlocked }).eq('id', id);
    if (error) return errorResponse(res, 'Gagal update status', 500);

    res.json({ msg: isBlocked ? "User diblokir" : "Blokir dibuka" });
  } catch (err) {
    return errorResponse(res, err.message, err.status || 500);
  }
}
