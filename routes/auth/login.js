// api/auth/login.js  →  POST /api/auth/login
import { supabase } from '../_lib/supabase.js';
import { setCors, errorResponse } from '../_lib/auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return errorResponse(res, 'Method not allowed', 405);

  const { email, password } = req.body;
  if (!email || !password) return errorResponse(res, 'Email dan password wajib diisi.', 422);

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return errorResponse(res, 'Email atau password salah.', 422);

  // Ambil profil
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name, email, role, points, is_active, avatar')
    .eq('id', data.user.id)
    .single();

  if (profile && !profile.is_active) return errorResponse(res, 'Akun dinonaktifkan oleh admin.', 403);

  return res.status(200).json({
    token: data.session.access_token,
    user: profile,
  });
}
