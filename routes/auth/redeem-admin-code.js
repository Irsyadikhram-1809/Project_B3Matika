import db from '../_lib/db.js';
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

    const { rows } = await db.query(
      "SELECT * FROM admin_invites WHERE code_hash=$1 AND used_by IS NULL AND expires_at > NOW()",
      [codeHash]
    );
    const inv = rows[0];

    if (!inv || (inv.for_email && inv.for_email !== user.email)) {
      return errorResponse(res, 'Kode tidak valid atau kedaluwarsa.', 400);
    }

    const { rows: usedRows } = await db.query(
      "UPDATE admin_invites SET used_by=$1 WHERE id=$2 AND used_by IS NULL RETURNING id",
      [user.id, inv.id]
    );

    if (!usedRows.length) {
      return errorResponse(res, 'Kode sudah dipakai.', 400);
    }

    if (user.role === "user") {
      await db.query("UPDATE users SET role='admin' WHERE id=$1", [user.id]);
    }

    return res.status(200).json({ message: "Kamu sekarang admin." });
  } catch (error) {
    if (error.status) return errorResponse(res, error.message, error.status);
    console.error("Error redeem admin code:", error);
    return errorResponse(res, 'Terjadi kesalahan pada server.', 500);
  }
}
