import crypto from 'crypto';
import db from '../_lib/db.js';
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
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 jam
    
    await db.query(
      "INSERT INTO admin_invites (code_hash, for_email, created_by, expires_at) VALUES ($1, $2, $3, $4)",
      [hmac(code), forEmail, user.id, expiresAt]
    );

    res.json({ code, msg: "Simpan kode ini, hanya ditampilkan sekali. Berlaku 24 jam." });
  } catch (err) {
    console.error("Error creating invite:", err);
    return errorResponse(res, 'Gagal membuat undangan.', 500);
  }
}
