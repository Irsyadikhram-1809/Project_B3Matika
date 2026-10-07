import { supabase } from '../../_lib/supabase.js';
import { requireAuth, setCors, errorResponse } from '../../_lib/auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { user } = await requireAuth(req);
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return errorResponse(res, 'Akses ditolak', 403);
    }

    const { id } = req.query;

    if (req.method === 'PUT') {
      const { slug, title, description, badge_color, emoji, level, tutorial, learning_goal, tips, is_active } = req.body;
      const { data: rows, error } = await supabase
        .from('games')
        .update({
          slug, title, description, badge_color, emoji, level, tutorial, learning_goal, tips: tips || [], is_active, updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();

      if (error || !rows || rows.length === 0) return errorResponse(res, 'Game tidak ditemukan', 404);

      await supabase.from('audit_logs').insert({
        admin_id: user.id,
        action: 'UPDATE',
        entity: 'games',
        entity_id: id
      });
      
      return res.status(200).json({ game: rows[0] });
    }

    if (req.method === 'DELETE') {
      const { data: rows, error } = await supabase.from('games').delete().eq('id', id).select('id');
      
      if (error || !rows || rows.length === 0) return errorResponse(res, 'Game tidak ditemukan', 404);

      await supabase.from('audit_logs').insert({
        admin_id: user.id,
        action: 'DELETE',
        entity: 'games',
        entity_id: id
      });

      return res.status(200).json({ success: true });
    }

    return errorResponse(res, 'Method not allowed', 405);
  } catch (err) {
    console.error("Error admin games by id:", err);
    return errorResponse(res, 'Terjadi kesalahan pada server.', 500);
  }
}
