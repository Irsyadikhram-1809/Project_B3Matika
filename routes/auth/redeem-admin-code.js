import { supabase } from '../_lib/supabase.js';
import { requireAuth, setCors, errorResponse } from '../_lib/auth.js';
import { hmac } from '../_lib/otp.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return errorResponse(res, 'Method not allowed', 405);

  try {
    const { user, profile } = await requireAuth(req);
    const code = String(req.body.code || "").toUpperCase().trim();

    if (!code) return errorResponse(res, 'Kode wajib diisi', 400);

    // Cari invite code yang valid
    const codeHash = hmac(code);
    const { data: inv } = await supabase
      .from('admin_invites')
      .select('*')
      .eq('code_hash', codeHash)
      .is('used_by', null)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (!inv || (inv.for_email && inv.for_email.toLowerCase() !== user.email)) {
      return errorResponse(res, 'Kode tidak valid atau kedaluwarsa', 400);
    }

    // Jika berhasil, update role
    if (profile.role === 'user') {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', user.id);
        
      if (updateError) return errorResponse(res, 'Gagal update role', 500);
    }

    // Tandai invite sudah dipakai
    await supabase.from('admin_invites').update({ used_by: user.id }).eq('id', inv.id);

    res.status(200).json({ msg: "Kamu sekarang admin" });
  } catch (err) {
    return errorResponse(res, err.message, err.status || 500);
  }
}
