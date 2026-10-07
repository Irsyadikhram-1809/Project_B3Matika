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

    // 1) Ambil pengajuan saja (tanpa embed relasi, supaya tidak bergantung pada foreign key)
    const { data: rows, error } = await supabase
      .from('admin_requests')
      .select('id, user_id, status, request_reason, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin_requests:', error);
      return errorResponse(res, `Gagal membaca pengajuan: ${error.message}`, 500);
    }

    const list = rows || [];
    const ids = [...new Set(list.map((r) => r.user_id).filter(Boolean))];

    // 2) Ambil email dan nama pengguna secara terpisah
    const emailMap = {};
    const nameMap = {};
    if (ids.length > 0) {
      const { data: users } = await supabase.from('users').select('id, email').in('id', ids);
      (users || []).forEach((u) => { emailMap[u.id] = u.email; });

      const { data: profiles } = await supabase.from('profiles').select('id, name, username').in('id', ids);
      (profiles || []).forEach((p) => { nameMap[p.id] = p.name || p.username; });
    }

    const formatted = list.map((r) => ({
      id: r.id,
      user_id: r.user_id,
      status: r.status,
      request_reason: r.request_reason,
      created_at: r.created_at,
      email: emailMap[r.user_id] || null,
      name: nameMap[r.user_id] || null,
    }));

    return res.status(200).json({ requests: formatted });
  } catch (err) {
    console.error('Error fetching requests:', err);
    return errorResponse(res, err.message || 'Terjadi kesalahan pada server.', err.status || 500);
  }
}