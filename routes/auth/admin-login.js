/**
 * routes/auth/admin-login.js
 * POST /api/auth/admin-login
 *
 * Login untuk superadmin dan admin panel.
 * Perbaikan: mengambil data profil lengkap dari tabel profiles
 * (nama, username, avatar) agar profil header panel admin benar
 * sejak login pertama tanpa harus reload atau pindah panel.
 */
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabase } from '../_lib/supabase.js';
import { setCors, errorResponse } from '../_lib/auth.js';
import env from '../_lib/env.js';

const norm = (v) => String(v || '').toLowerCase().trim();

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return errorResponse(res, 'Method not allowed', 405);

  const email    = norm(req.body.email);
  const password = req.body.password;

  if (!email || !password) return errorResponse(res, 'Email dan password wajib diisi.', 422);

  try {
    // Ambil user DAN profil sekaligus (sama seperti login user biasa)
    const { data: user } = await supabase
      .from('users')
      .select(`*, profiles(name, username, points, avatar, last_seen, is_active)`)
      .eq('email', email)
      .single();

    const valid = user && user.is_verified && !user.is_blocked &&
      (await bcrypt.compare(password, user.password_hash));

    if (!valid) {
      if (user && user.is_blocked) return errorResponse(res, 'Akun dinonaktifkan oleh admin.', 403);
      return errorResponse(res, 'Email atau password salah.', 422);
    }

    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return errorResponse(res, 'Anda tidak memiliki akses admin.', 403);
    }

    const token = jwt.sign({ id: user.id }, env.JWT_SECRET, { expiresIn: '7d' });

    // Normalisasi profil — kompatibel dengan profiles sebagai object atau array
    const profileData = Array.isArray(user.profiles) ? (user.profiles[0] || {}) : (user.profiles || {});
    const prevLastSeen = profileData.last_seen || null;

    // Update last_seen asinkron
    supabase.from('profiles').update({ last_seen: new Date().toISOString() })
      .eq('id', user.id).then(() => {});

    const profile = {
      id:         user.id,
      email:      user.email,
      role:       user.role,
      name:       profileData.name       || user.email.split('@')[0],
      username:   profileData.username   || null,
      avatar:     profileData.avatar     || '🎓',
      points:     profileData.points     || 0,
      is_active:  profileData.is_active  !== undefined ? profileData.is_active : true,
      last_seen:  prevLastSeen,
    };

    return res.status(200).json({
      token,
      user: profile,
      role: user.role,
    });
  } catch (error) {
    console.error('Error admin login:', error);
    return errorResponse(res, 'Terjadi kesalahan pada server.', 500);
  }
}
