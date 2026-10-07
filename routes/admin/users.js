import { supabase } from '../_lib/supabase.js';
import { requireAuth, setCors, errorResponse } from '../_lib/auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { user } = await requireAuth(req);
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return errorResponse(res, 'Tidak punya izin', 403);
    }

    if (req.method === 'GET') {
      let query = supabase
        .from('users')
        .select(`
          id, email, role, is_verified, is_blocked, created_at,
          profiles(name, points, last_seen)
        `)
        .order('created_at', { ascending: false });

      // Jika yang request adalah admin biasa, sembunyikan semua superadmin
      if (user.role === 'admin') {
        query = query.neq('role', 'superadmin');
      }

      const { data: rows, error } = await query;
      if (error) throw error;
      
      const formatted = (rows || []).map(u => ({
        id: u.id,
        email: u.email,
        name: u.profiles?.[0]?.name || u.email.split('@')[0],
        points: parseInt(u.profiles?.[0]?.points || 0, 10),
        role: u.role,
        is_active: !u.is_blocked,
        is_verified: u.is_verified,
        last_seen: u.profiles?.[0]?.last_seen,
        created_at: u.created_at
      }));

      return res.status(200).json({ users: formatted });
    }
    
    return errorResponse(res, 'Method not allowed', 405);
  } catch (err) {
    return errorResponse(res, err.message, err.status || 500);
  }
}
