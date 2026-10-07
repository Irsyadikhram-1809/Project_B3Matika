import bcrypt from 'bcrypt';
import { supabase } from '../_lib/supabase.js';
import { requireAuth, setCors, errorResponse } from '../_lib/auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'PUT') return errorResponse(res, 'Method not allowed', 405);

  try {
    const { profile } = await requireAuth(req);
    const { current_password, password, password_confirmation } = req.body;

    if (!current_password || !password || !password_confirmation) {
      return errorResponse(res, 'Semua field password wajib diisi.', 400);
    }
    if (password !== password_confirmation) {
      return errorResponse(res, 'Konfirmasi password tidak cocok.', 400);
    }
    if (password.length < 8) {
      return errorResponse(res, 'Password baru minimal 8 karakter.', 400);
    }

    const { data: user } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', profile.id)
      .single();

    if (!user) return errorResponse(res, 'Pengguna tidak ditemukan.', 404);
    
    const valid = await bcrypt.compare(current_password, user.password_hash);
    if (!valid) {
      return errorResponse(res, 'Password saat ini salah.', 400);
    }

    const newHash = await bcrypt.hash(password, 12);
    await supabase.from('users').update({ password_hash: newHash }).eq('id', profile.id);

    return res.status(200).json({ message: "Password berhasil diubah" });
  } catch (err) {
    console.error(err);
    return errorResponse(res, err.message, err.status || 500);
  }
}
