import db from './_lib/db.js';
import { setCors, errorResponse } from './_lib/auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return errorResponse(res, 'Method not allowed', 405);

  try {
    const { rows } = await db.query(
      "SELECT id, email, points FROM users WHERE role='user' AND is_blocked=false ORDER BY points DESC LIMIT 20"
    );

    // Kalkulasi level: tiap 100 poin = 1 level
    const formattedUsers = rows.map(u => ({
      id: u.id,
      name: u.email.split('@')[0], // Extract name from email as fallback
      points: u.points || 0,
      avatar: null, // Jika butuh avatar, bisa ditambahkan kolomnya
      level: Math.floor((u.points || 0) / 100) + 1
    }));

    return res.status(200).json({ users: formattedUsers });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return res.status(200).json({ users: [] });
  }
}
