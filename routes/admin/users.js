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
      const { rows } = await db.query(`
        SELECT u.id, u.email, u.role, u.is_verified, u.is_blocked, u.created_at,
               COALESCE(p.name, split_part(u.email, '@', 1)) as name,
               COALESCE(p.points, 0) as points,
               p.last_seen
        FROM users u
        LEFT JOIN profiles p ON u.email = p.email
        ORDER BY u.created_at DESC
      `);
      
      const formatted = rows.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        points: parseInt(u.points, 10),
        role: u.role,
        is_active: !u.is_blocked,
        is_verified: u.is_verified,
        last_seen: u.last_seen,
        created_at: u.created_at
      }));

      return res.status(200).json({ users: formatted });
    }
    
    return errorResponse(res, 'Method not allowed', 405);
  } catch (err) {
    return errorResponse(res, err.message, err.status || 500);
  }
}
