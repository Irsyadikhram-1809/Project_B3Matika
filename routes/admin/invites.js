import crypto from 'crypto';
import { supabase } from '../_lib/supabase.js';
import { requireAuth, setCors, errorResponse } from '../_lib/auth.js';
import { hmac } from '../_lib/otp.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return errorResponse(res, 'Method not allowed', 405);

  try {
    const { user } = await requireAuth(req);
    if (user.role !== 'superadmin') {
      return errorResponse(res, 'Tidak punya izin', 403);
    }

    const code = crypto.randomBytes(5).toString("hex").toUpperCase();
    const forEmail = req.body.email ? String(req.body.email).toLowerCase() : null;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); 
    
    await supabase.from('admin_invites').insert({
      code_hash: hmac(code),
      for_email: forEmail,
      created_by: user.id,
      expires_at: expiresAt
    });

    res.json({ code, msg: "Simpan kode ini, hanya ditampilkan sekali. Berlaku 24 jam." });
  } catch (err) {
    console.error("Error creating invite:", err);
    return errorResponse(res, 'Gagal membuat undangan.', 500);
  }
}
