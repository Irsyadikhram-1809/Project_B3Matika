import { supabase } from '../../../_lib/supabase.js';
import { requireAuth, setCors, errorResponse } from '../../../_lib/auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'PATCH') return errorResponse(res, 'Method not allowed', 405);

  try {
    const { user } = await requireAuth(req);
    if (user.role !== 'superadmin') {
      return errorResponse(res, 'Tidak punya izin', 403);
    }

    const { id } = req.query;

    const { data: target, error: fetchErr } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', id)
      .single();
      
    if (fetchErr || !target) return errorResponse(res, 'User tidak ditemukan', 404);

    if (target.role === 'superadmin') {
      return errorResponse(res, 'Super admin tidak bisa diubah', 403);
    }

    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return errorResponse(res, 'Role tidak valid', 400);
    }

    const { error: updateErr } = await supabase
      .from('users')
      .update({ role })
      .eq('id', id);
      
    if (updateErr) throw updateErr;

    res.json({ msg: `Role diubah menjadi ${role}` });
  } catch (err) {
    console.error("Error update role:", err);
    return errorResponse(res, err.message, err.status || 500);
  }
}
