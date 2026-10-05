// api/auth/register.js  →  POST /api/auth/register
import { supabase } from '../_lib/supabase.js';
import { setCors, errorResponse } from '../_lib/auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return errorResponse(res, 'Method not allowed', 405);

  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return errorResponse(res, 'Nama, email, dan password wajib diisi.', 422);
  if (password.length < 8)
    return errorResponse(res, 'Password minimal 8 karakter.', 422);

  // Buat user di Supabase Auth
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // langsung aktif tanpa verifikasi email
    user_metadata: { name },
  });

  if (error) {
    if (error.message.includes('already registered'))
      return errorResponse(res, 'Email sudah terdaftar.', 422);
    return errorResponse(res, error.message, 422);
  }

  // Buat profil di tabel profiles
  const { error: profileError } = await supabase.from('profiles').insert({
    id: data.user.id,
    name,
    email,
    role: 'user',
    points: 0,
    is_active: true,
  });

  if (profileError) {
    return errorResponse(res, `Gagal membuat profil: ${profileError.message}`, 500);
  }

  // Login otomatis setelah register
  const { data: session } = await supabase.auth.signInWithPassword({ email, password });

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name, email, role, points, is_active, avatar')
    .eq('id', data.user.id)
    .single();

  return res.status(201).json({
    token: session.session.access_token,
    user: profile,
  });
}
