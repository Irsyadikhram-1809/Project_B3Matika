// api/_lib/auth.js
// Helper: validasi Bearer token dari Supabase Auth

import { supabase } from './supabase.js';

/**
 * Ambil user dari Authorization header.
 * Return { user } jika valid, atau throw jika tidak.
 */
export async function requireAuth(req) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace('Bearer ', '').trim();

  if (!token) {
    const err = new Error('Silakan masuk.');
    err.status = 401;
    throw err;
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    const err = new Error('Silakan masuk.');
    err.status = 401;
    throw err;
  }

  // Ambil profil user dari tabel profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (profile && !profile.is_active) {
    const err = new Error('Akun dinonaktifkan oleh admin.');
    err.status = 403;
    throw err;
  }

  return { user: data.user, profile };
}

/** Helper: kirim response JSON error terstandar */
export function errorResponse(res, message, status = 500) {
  return res.status(status).json({ error: message });
}

/** Helper: CORS headers untuk semua response */
export function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
}
