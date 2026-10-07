import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabase } from '../_lib/supabase.js';
import { setCors, errorResponse } from '../_lib/auth.js';
import env from '../_lib/env.js';

const norm = (v) => String(v || "").toLowerCase().trim();

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return errorResponse(res, 'Method not allowed', 405);

  const identifier = norm(req.body.email); // Frontend might send 'email' field containing username
  const password = req.body.password;

  if (!identifier || !password) return errorResponse(res, 'Nama pengguna/email dan password wajib diisi.', 422);

  try {
    const isEmail = identifier.includes('@');
    let user;
    let authError = null;

    if (isEmail) {
      const { data, error } = await supabase
        .from('users')
        .select(`*, profiles(name, username, points, avatar)`)
        .eq('email', identifier)
        .single();
      user = data;
      authError = error;
    } else {
      // Find user by username
      const { data: profileMatch, error: pErr } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', identifier)
        .single();

      if (profileMatch) {
        const { data, error } = await supabase
          .from('users')
          .select(`*, profiles(name, username, points, avatar)`)
          .eq('id', profileMatch.id)
          .single();
        user = data;
        authError = error;
      }
    }

    const valid = user && user.is_verified && !user.is_blocked &&
      (await bcrypt.compare(password, user.password_hash));

    if (!valid) {
      if (user && user.is_blocked) return errorResponse(res, 'Akun dinonaktifkan oleh admin.', 403);
      return errorResponse(res, 'Nama pengguna/email atau password salah.', 422);
    }

    const token = jwt.sign({ id: user.id }, env.JWT_SECRET, { expiresIn: '7d' });

    const profileData = user.profiles?.[0] || {};
    
    const profile = {
      id: user.id,
      email: user.email,
      name: profileData.name || user.email.split('@')[0],
      username: profileData.username,
      role: user.role,
      points: profileData.points || 0,
      avatar: profileData.avatar || '🎓',
      is_active: !user.is_blocked,
    };

    return res.status(200).json({
      token,
      user: profile,
      role: user.role
    });
  } catch (error) {
    console.error("Error login:", error);
    return errorResponse(res, `Internal Server Error: ${error.message}`, 500);
  }
}
