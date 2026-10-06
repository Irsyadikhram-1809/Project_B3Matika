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

  const identifier = norm(req.body.email); // Frontend might send 'email' field containing username
  const password = req.body.password;

  if (!identifier || !password) return errorResponse(res, 'Nama pengguna/email dan password wajib diisi.', 422);

  try {
    const isEmail = identifier.includes('@');
    let user;
    if (isEmail) {
      const { rows } = await db.query("SELECT * FROM users WHERE email = $1", [identifier]);
      user = rows[0];
    } else {
      const { rows } = await db.query(`
        SELECT u.* FROM users u 
        JOIN profiles p ON u.id = p.id 
        WHERE p.username = $1
      `, [identifier]);
      user = rows[0];
    }

    const valid = user && user.is_verified && !user.is_blocked &&
      (await bcrypt.compare(password, user.password_hash));

    if (!valid) {
      if (user && user.is_blocked) return errorResponse(res, 'Akun dinonaktifkan oleh admin.', 403);
      return errorResponse(res, 'Nama pengguna/email atau password salah.', 422);
    }

    const token = jwt.sign({ id: user.id }, env.JWT_SECRET, { expiresIn: '7d' });

    delete user.password_hash;
    
    const profileRes = await db.query("SELECT * FROM profiles WHERE id = $1", [user.id]);
    const profileData = profileRes.rows[0] || {};
    
    const profile = {
      id: user.id,
      email: user.email,
      name: profileData.name || user.email.split('@')[0],
      username: profileData.username,
      role: user.role,
      points: profileData.points || 0,
      avatar: profileData.avatar || '🎓',
      is_active: !user.is_blocked,
    };

    return res.status(200).json({
      token,
      user: profile,
      role: user.role
    });
  } catch (error) {
    console.error("Error login:", error);
    return errorResponse(res, `Internal Server Error: ${error.message}`, 500);
  }
}
