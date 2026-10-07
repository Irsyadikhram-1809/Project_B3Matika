import { supabase } from './_lib/supabase.js';
import { setCors, errorResponse } from './_lib/auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return errorResponse(res, 'Method not allowed', 405);

  try {
    // Left join equivalent: Supabase automatically handles foreign key relations
    // Using inner join by default in select if it's referenced, but we only want users who are 'user' and not blocked.
    // However, users has points, and profiles has points. We should query users, or we can query profiles.
    // If we query users, we can get profiles as well.
    const { data: rows, error } = await supabase
      .from('users')
      .select(`
        id, email, points,
        profiles(name, avatar)
      `)
      .eq('role', 'user')
      .eq('is_blocked', false)
      .order('points', { ascending: false })
      .limit(20);

    if (error) throw error;

    // Kalkulasi level: tiap 100 poin = 1 level
    const formattedUsers = rows.map(u => {
      const profile = u.profiles?.[0] || {};
      return {
        id: u.id,
        name: profile.name || u.email.split('@')[0], // Extract name from email as fallback
        points: u.points || 0,
        avatar: profile.avatar || null,
        level: Math.floor((u.points || 0) / 100) + 1
      };
    });

    return res.status(200).json({ users: formattedUsers });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return res.status(200).json({ users: [] });
  }
}
