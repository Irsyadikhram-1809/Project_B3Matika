import jwt from 'jsonwebtoken';
import db from './db.js';

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
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    
    // Ambil user dari tabel users yang baru
    const { rows } = await db.query("SELECT * FROM users WHERE id = $1", [id]);
    const user = rows[0];

    if (!user) {
      const err = new Error('Pengguna tidak ditemukan.');
      err.status = 401;
      throw err;
    }

    if (user.is_blocked) {
      const err = new Error('Akun diblokir oleh admin.');
      err.status = 403;
      throw err;
    }

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
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
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
