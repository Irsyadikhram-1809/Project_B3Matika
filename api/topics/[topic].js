// api/topics/[topic].js  →  GET /api/topics/:id
import { supabase } from '../../_lib/supabase.js';
import { setCors, errorResponse } from '../../_lib/auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return errorResponse(res, 'Method not allowed', 405);

  const id = parseInt(req.query.topic);
  if (isNaN(id)) return errorResponse(res, 'Tidak ditemukan.', 404);

  const { data: topic, error } = await supabase
    .from('topics')
    .select('id, grade, title, content')
    .eq('id', id)
    .single();

  if (error || !topic) return errorResponse(res, 'Tidak ditemukan.', 404);

  // Ambil soal latihan untuk topik ini
  const { data: rawQuestions } = await supabase
    .from('questions')
    .select('id, body, options, points')
    .eq('topic_id', id)
    .order('id');

  const questions = (rawQuestions || []).map(q => ({
    id: q.id,
    text: q.body,
    options: q.options,
    difficulty: q.points // map points ke difficulty jika frontend mengandalkannya
  }));

  return res.status(200).json({ topic, questions });
}
