import crypto from 'crypto';
import { supabase } from '../../_lib/supabase.js';
import { requireAuth, setCors, errorResponse } from '../../_lib/auth.js';
import { hmac } from '../../_lib/otp.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return errorResponse(res, 'Method not allowed', 405);

  try {
    const { user, profile } = await requireAuth(req);
    if (profile.role !== 'superadmin') {
      return errorResponse(res, 'Tidak punya izin', 403);
    }

    const code = crypto.randomBytes(5).toString("hex").toUpperCase();
    
    const { error } = await supabase.from('admin_invites').insert({
      code_hash: hmac(code),
      for_email: req.body.email ? String(req.body.email).toLowerCase() : null,
      created_by: user.id,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });

    if (error) return errorResponse(res, 'Gagal membuat undangan: ' + error.message, 500);

    res.json({ code, msg: "Simpan kode ini, hanya ditampilkan sekali. Berlaku 24 jam." });
  } catch (err) {
    return errorResponse(res, err.message, err.status || 500);
  }
}
