import { supabase } from '../_lib/supabase.js';
import { requireAuth, setCors, errorResponse } from '../_lib/auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  if (req.method !== 'GET') {
    return errorResponse(res, 'Method not allowed', 405);
  }

  try {
    const { user } = await requireAuth(req);
    if (user.role !== 'superadmin') {
      return errorResponse(res, 'Akses ditolak. Hanya Superadmin yang bisa mengakses halaman ini.', 403);
    }

    const { data: rows, error } = await supabase
      .from('admin_requests')
      .select(`
        id, user_id, status, request_reason, created_at,
        users:user_id(email),
        profiles:user_id(name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formatted = rows.map(r => ({
      id: r.id,
      user_id: r.user_id,
      status: r.status,
      request_reason: r.request_reason,
      created_at: r.created_at,
      email: r.users?.email,
      name: r.profiles?.name
    }));

    return res.status(200).json({ requests: formatted });
  } catch (err) {
    console.error("Error fetching requests:", err);
    return errorResponse(res, 'Terjadi kesalahan pada server.', 500);
  }
}
