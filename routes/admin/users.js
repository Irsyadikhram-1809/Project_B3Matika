import { supabase } from '../_lib/supabase.js';
import { requireAuth, setCors, errorResponse } from '../_lib/auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { profile } = await requireAuth(req);
    if (profile.role !== 'admin' && profile.role !== 'superadmin') {
      return errorResponse(res, 'Tidak punya izin', 403);
    }

    if (req.method === 'GET') {
      const { data } = await supabase.from('profiles').select('id, name, email, role, is_active');
      return res.status(200).json(data || []);
    }
    
    return errorResponse(res, 'Method not allowed', 405);
  } catch (err) {
    return errorResponse(res, err.message, err.status || 500);
  }
}
