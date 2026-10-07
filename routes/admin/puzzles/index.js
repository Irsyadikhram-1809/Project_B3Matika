import { supabase } from '../../_lib/supabase.js';
import { requireRole, setCors, errorResponse } from '../../_lib/auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await requireRole(['admin', 'superadmin'])(req, res, async () => {
      if (req.method === 'GET') {
        const { data, error } = await supabase
          .from('puzzles')
          .select('*')
          .order('id', { ascending: true });
        if (error) throw error;
        res.json({ rows: data || [] });
      } else if (req.method === 'POST') {
        const { type, title, description, data: puzzleData, solution, points } = req.body;
        const { data, error } = await supabase
          .from('puzzles')
          .insert({ type, title, description, data: puzzleData, solution, points: points || 10 })
          .select('id')
          .single();
        if (error) throw error;
        res.json({ id: data.id });
      } else {
        return errorResponse(res, 'Method not allowed', 405);
      }
    });
  } catch (err) {
    if (!res.headersSent) errorResponse(res, err.message, err.status || 500);
  }
}
