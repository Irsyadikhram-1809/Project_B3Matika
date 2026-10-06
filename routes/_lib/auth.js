import jwt from 'jsonwebtoken';
import db from './db.js';
import env from './env.js';

/**
 * Validasi token JWT dan kembalikan { user, profile }
 * Ini menggantikan Supabase Auth, namun karena data user 
 * kini di tabel users, kita return user sebagai profile juga.
 */
export async function requireAuth(req) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace('Bearer ', '').trim();

  if (!token) {
    const err = new Error('Silakan masuk.');
    err.status = 401;
    throw err;
  }

  try {
    const { id } = jwt.verify(token, env.JWT_SECRET);
    
    // Ambil user dan profile dari database
    const { rows } = await db.query(`
      SELECT u.id, u.email, u.role, u.is_verified, u.is_blocked, u.created_at,
             p.name, p.points, p.avatar, p.is_active, p.last_seen
      FROM users u
      LEFT JOIN profiles p ON u.id = p.id
      WHERE u.id = $1
    `, [id]);
    const user = rows[0];

    if (!user) {
      const err = new Error('Pengguna tidak ditemukan.');
      err.status = 401;
      throw err;
    }
    
    // Fallback jika tidak ada di tabel profiles
    if (!user.name) {
      user.name = user.email.split('@')[0];
      user.points = user.points || 0;
      user.avatar = user.avatar || '🎓';
    }

    if (user.is_blocked) {
      const err = new Error('Akun diblokir oleh admin.');
      err.status = 403;
      throw err;
    }

    // Update last_seen asynchronously
    db.query("UPDATE profiles SET last_seen = NOW() WHERE id = $1", [id]).catch(() => {});

    // Return object dengan field user agar kompatibel dengan existing code (walau mungkin perlu disesuaikan)
    return { user, profile: user }; 
  } catch (e) {
    if (e.status) throw e;
    const err = new Error('Token tidak valid atau kedaluwarsa.');
    err.status = 401;
    throw err;
  }
}

/** Helper: kirim response JSON error terstandar */
export function errorResponse(res, message, status = 500) {
  return res.status(status).json({ error: message });
}

/** Helper: CORS headers untuk semua response */
export function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', env.FRONTEND_URL);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
}

/** Middleware: requireRole */
export function requireRole(allowedRoles) {
  return async (req, res, next) => {
    try {
      const { user } = await requireAuth(req);
      if (!allowedRoles.includes(user.role)) {
        return errorResponse(res, 'Akses ditolak: Tidak punya izin.', 403);
      }
      req.user = user;
      next();
    } catch (e) {
      return errorResponse(res, e.message, e.status || 401);
    }
  };
}
