import db from '../_lib/db.js';
import { requireAuth, setCors, errorResponse } from '../_lib/auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  if (req.method !== 'GET') {
    return errorResponse(res, 'Method not allowed', 405);
  }

  try {
    const { user } = await requireAuth(req);
    // Only superadmin can manage admin requests, though admin can view maybe? Let's limit to superadmin for action.
    if (user.role !== 'superadmin') {
      return errorResponse(res, 'Akses ditolak. Hanya Superadmin yang bisa mengakses halaman ini.', 403);
    }

    const { rows } = await db.query(`
      SELECT r.id, r.user_id, r.status, r.request_reason, r.created_at, 
             u.email, p.name 
      FROM admin_requests r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN profiles p ON u.email = p.email
      ORDER BY r.created_at DESC
    `);

    return res.status(200).json({ requests: rows });
  } catch (err) {
    console.error("Error fetching requests:", err);
    return errorResponse(res, 'Terjadi kesalahan pada server.', 500);
  }
}
