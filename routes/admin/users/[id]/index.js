import { supabase } from '../../../_lib/supabase.js';
import { requireAuth, setCors, errorResponse } from '../../../_lib/auth.js';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'DELETE') return errorResponse(res, 'Method not allowed', 405);

  try {
    const { profile } = await requireAuth(req);
    if (profile.role !== 'superadmin') {
      return errorResponse(res, 'Tidak punya izin', 403);
    }

    const { id } = req.query;

    const { data: target } = await supabase.from('profiles').select('id, role').eq('id', id).single();
    if (!target) return errorResponse(res, 'User tidak ditemukan', 404);

    if (target.role === 'superadmin') {
      return errorResponse(res, 'Super admin tidak bisa dihapus', 403);
    }

    const adminAuth = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    ).auth.admin;

    // Hapus dari auth.users (akan cascade ke profiles jika Supabase di-set cascade, jika tidak kita hapus manual)
    await supabase.from('profiles').delete().eq('id', id);
    const { error } = await adminAuth.deleteUser(id);

    if (error) return errorResponse(res, 'Gagal menghapus user', 500);

    res.json({ msg: 'Akun dihapus' });
  } catch (err) {
    return errorResponse(res, err.message, err.status || 500);
  }
}
