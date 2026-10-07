import { supabase } from '../_lib/supabase.js';
import { setCors, errorResponse } from '../_lib/auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  if (req.method !== 'GET') {
    return errorResponse(res, 'Method not allowed', 405);
  }

  try {
    const { data: games, error } = await supabase
      .from('games')
      .select('slug, title, description, badge_color, emoji, level, tutorial, learning_goal, tips')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Supabase games error:', error);
      return res.status(200).json({ games: [] });
    }

    // Normalisasi nama kolom agar cocok dengan frontend
    const normalized = (games || []).map(g => ({
      id: g.slug,
      label: g.title,
      desc: g.description,
      badge_color: g.badge_color,
      emoji: g.emoji,
      level: g.level,
      tutorial: g.tutorial,
      learningGoal: g.learning_goal,
      tips: g.tips,
    }));

    return res.status(200).json({ games: normalized });
  } catch (err) {
    console.error('Error fetching games:', err);
    return res.status(200).json({ games: [] });
  }
}
