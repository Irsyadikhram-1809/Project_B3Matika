import { supabase } from '../../../_lib/supabase.js';
import { requireAuth, setCors, errorResponse } from '../../../_lib/auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'DELETE') return errorResponse(res, 'Method not allowed', 405);

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
      return errorResponse(res, 'Super admin tidak bisa dihapus', 403);
    }

    const { error: delErr } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
      
    if (delErr) throw delErr;

    res.json({ msg: 'Akun dihapus' });
  } catch (err) {
    console.error("Error delete user:", err);
    return errorResponse(res, err.message, err.status || 500);
  }
}
