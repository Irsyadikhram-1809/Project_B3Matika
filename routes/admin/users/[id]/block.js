import { supabase } from '../../../_lib/supabase.js';
import { requireAuth, setCors, errorResponse } from '../../../_lib/auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'PATCH') return errorResponse(res, 'Method not allowed', 405);

  try {
    const { user } = await requireAuth(req);
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return errorResponse(res, 'Tidak punya izin', 403);
    }

    const { id } = req.query; // Diambil dari URL oleh custom index.js

    const { data: target, error: fetchErr } = await supabase
      .from('users')
      .select('id, role, is_blocked')
      .eq('id', id)
      .single();
      
    if (fetchErr || !target) return errorResponse(res, 'User tidak ditemukan', 404);

    if (target.role === 'superadmin') {
      return errorResponse(res, 'Super admin tidak bisa diubah', 403);
    }
    if (target.role === 'admin' && user.role !== 'superadmin') {
      return errorResponse(res, 'Hanya super admin yang bisa mengelola admin', 403);
    }

    const isBlocked = !!req.body.blocked;
    const { error: updateErr } = await supabase
      .from('users')
      .update({ is_blocked: isBlocked })
      .eq('id', id);
      
    if (updateErr) throw updateErr;

    res.json({ msg: isBlocked ? "User diblokir" : "Blokir dibuka" });
  } catch (err) {
    console.error("Error block user:", err);
    return errorResponse(res, err.message, err.status || 500);
  }
}
