import { supabase } from '../_lib/supabase.js';
import { setCors, errorResponse, requireAuth } from '../_lib/auth.js';
import { hmac } from '../_lib/otp.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return errorResponse(res, 'Method not allowed', 405);

  try {
    const { user } = await requireAuth(req);
    const { code } = req.body;

    if (!code) return errorResponse(res, 'Kode wajib diisi.', 400);

    const codeHash = hmac(String(code).toUpperCase());

    const { data: inv } = await supabase
      .from('admin_invites')
      .select('*')
      .eq('code_hash', codeHash)
      .is('used_by', null)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (!inv || (inv.for_email && inv.for_email !== user.email)) {
      return errorResponse(res, 'Kode tidak valid atau kedaluwarsa.', 400);
    }

    const { data: usedData, error: usedErr } = await supabase
      .from('admin_invites')
      .update({ used_by: user.id })
      .eq('id', inv.id)
      .is('used_by', null)
      .select('id');

    if (usedErr || !usedData?.length) {
      return errorResponse(res, 'Kode sudah dipakai.', 400);
    }

    if (user.role === "user") {
      await supabase.from('users').update({ role: 'admin' }).eq('id', user.id);
      await supabase.from('profiles').update({ role: 'admin' }).eq('id', user.id);
    }

    return res.status(200).json({ message: "Kamu sekarang admin." });
  } catch (error) {
    if (error.status) return errorResponse(res, error.message, error.status);
    console.error("Error redeem admin code:", error);
    return errorResponse(res, 'Terjadi kesalahan pada server.', 500);
  }
}
