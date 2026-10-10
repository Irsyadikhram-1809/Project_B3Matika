import { supabase } from '../_lib/supabase.js';
import { requireAuth, setCors, errorResponse, normalizeUser } from '../_lib/auth.js';

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
      
      const formatted = (rows || []).map(u => {
        const norm = normalizeUser(u);
        return {
          id: norm.id,
          email: norm.email,
          name: norm.name,
          points: norm.points,
          role: norm.role,
          is_active: !norm.is_blocked,
          is_verified: norm.is_verified,
          last_seen: norm.last_seen,
          created_at: norm.created_at
        };
      });

      return res.status(200).json({ users: formatted });
    }
    
    return errorResponse(res, 'Method not allowed', 405);
  } catch (err) {
    return errorResponse(res, err.message, err.status || 500);
  }
}
