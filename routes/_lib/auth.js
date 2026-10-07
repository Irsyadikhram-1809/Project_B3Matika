import jwt from 'jsonwebtoken';
import { supabase } from './supabase.js';
import env from './env.js';

/**
 * Validasi token JWT dan kembalikan { user, profile }
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
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id, email, role, is_verified, is_blocked, created_at,
        profiles(name, points, avatar, is_active, last_seen, username)
      `)
      .eq('id', id)
      .single();

    if (error || !user) {
      const err = new Error('Pengguna tidak ditemukan.');
      err.status = 401;
      throw err;
    }
    
    const profile = (Array.isArray(user.profiles) ? user.profiles[0] : user.profiles) || {};
    
    // Fallback jika tidak ada di tabel profiles
    user.name = profile.name || user.email.split('@')[0];
    user.points = profile.points || 0;
    user.avatar = profile.avatar || '🎓';
    user.username = profile.username || null;
    user.last_seen = profile.last_seen || null;

    if (user.is_blocked) {
      const err = new Error('Akun diblokir oleh admin.');
      err.status = 403;
      throw err;
    }

    // Update last_seen asynchronously
    supabase.from('profiles').update({ last_seen: new Date().toISOString() }).eq('id', id).then(() => {});

    // Return object dengan field user agar kompatibel dengan existing code
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
