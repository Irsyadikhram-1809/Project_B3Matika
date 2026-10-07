import { supabase } from '../_lib/supabase.js';
import { requireAuth, setCors, errorResponse } from '../_lib/auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { user } = await requireAuth(req);
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return errorResponse(res, 'Akses ditolak', 403);
    }

    if (req.method === 'GET') {
      const { data: games, error } = await supabase.from('games').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json({ games });
    }

    if (req.method === 'POST') {
      const { slug, title, description, badge_color, emoji, level, tutorial, learning_goal, tips } = req.body;
      const { data: rows, error } = await supabase
        .from('games')
        .insert({
          slug, title, description, badge_color: badge_color || '#2563eb', emoji, level, tutorial, learning_goal, tips: tips || []
        })
        .select();
        
      if (error) throw error;
      
      // Audit log
      await supabase.from('audit_logs').insert({
        admin_id: user.id,
        action: 'CREATE',
        entity: 'games',
        entity_id: rows[0].id
      });
      
      return res.status(201).json({ game: rows[0] });
    }

    return errorResponse(res, 'Method not allowed', 405);
  } catch (err) {
    console.error("Error admin games:", err);
    return errorResponse(res, 'Terjadi kesalahan pada server.', 500);
  }
}
