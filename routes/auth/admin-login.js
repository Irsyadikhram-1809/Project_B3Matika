import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../_lib/db.js';
import { setCors, errorResponse } from '../_lib/auth.js';
import env from '../_lib/env.js';

const norm = (v) => String(v || "").toLowerCase().trim();

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return errorResponse(res, 'Method not allowed', 405);

  const email = norm(req.body.email);
  const password = req.body.password;

  if (!email || !password) return errorResponse(res, 'Email dan password wajib diisi.', 422);

  try {
    const { rows } = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = rows[0];

    const valid = user && user.is_verified && !user.is_blocked &&
      (await bcrypt.compare(password, user.password_hash));

    if (!valid) {
      if (user && user.is_blocked) return errorResponse(res, 'Akun dinonaktifkan oleh admin.', 403);
      return errorResponse(res, 'Email atau password salah.', 422);
    }

    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return errorResponse(res, 'Anda tidak memiliki akses admin.', 403);
    }

    const token = jwt.sign({ id: user.id }, env.JWT_SECRET, { expiresIn: '7d' });

    delete user.password_hash;
    
    const profile = {
      id: user.id,
      email: user.email,
      name: user.email.split('@')[0],
      role: user.role,
      points: 0,
      is_active: !user.is_blocked,
    };

    return res.status(200).json({
      token,
      user: profile,
      role: user.role
    });
  } catch (error) {
    console.error("Error admin login:", error);
    return errorResponse(res, `Internal Server Error: ${error.message}`, 500);
  }
}
