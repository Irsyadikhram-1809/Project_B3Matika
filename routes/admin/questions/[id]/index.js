import { supabase } from '../../../_lib/supabase.js';
import { requireRole, setCors, errorResponse } from '../../../_lib/auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  try {
    await requireRole(['admin', 'superadmin'])(req, res, async () => {
      const { id } = req.query;
      
      if (req.method === 'GET') {
        const { data, error } = await supabase.from('questions').select('*').eq('id', id).single();
        if (error || !data) return errorResponse(res, 'Not found', 404);
        res.json({ row: data });
      } else if (req.method === 'PUT') {
        const { topic_id, question_text, options, answer, explanation, points } = req.body;
        const { error } = await supabase.from('questions')
          .update({ topic_id, question_text, options, answer, explanation, points })
          .eq('id', id);
        if (error) throw error;
        res.json({ success: true });
      } else if (req.method === 'DELETE') {
        const { error } = await supabase.from('questions').delete().eq('id', id);
        if (error) throw error;
        res.json({ success: true });
      } else {
        return errorResponse(res, 'Method not allowed', 405);
      }
    });
  } catch (err) {
    if (!res.headersSent) errorResponse(res, err.message, err.status || 500);
  }
}
