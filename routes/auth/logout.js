import { setCors, errorResponse } from '../_lib/auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return errorResponse(res, 'Method not allowed', 405);

  // Custom JWT adalah stateless, client hanya perlu membuang tokennya
  return res.status(200).json({ ok: true, message: 'Berhasil logout' });
}
