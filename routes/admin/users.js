import db from '../_lib/db.js';
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
      const { rows } = await db.query(
        "SELECT id, email, role, is_verified, is_blocked, created_at FROM users ORDER BY created_at DESC"
      );
      
      // Adaptasi dengan format frontend jika memungkinkan (misal field name dan is_active)
      const formatted = rows.map(u => ({
        id: u.id,
        email: u.email,
        name: u.email.split('@')[0],
        role: u.role,
        is_active: !u.is_blocked,
        is_verified: u.is_verified,
        created_at: u.created_at
      }));

      return res.status(200).json(formatted);
    }
    
    return errorResponse(res, 'Method not allowed', 405);
  } catch (err) {
    return errorResponse(res, err.message, err.status || 500);
  }
}
