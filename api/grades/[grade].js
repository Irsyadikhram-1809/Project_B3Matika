// api/grades/[grade].js  →  GET /api/grades/:grade
import { supabase } from '../../_lib/supabase.js';
import { setCors, errorResponse } from '../../_lib/auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return errorResponse(res, 'Method not allowed', 405);

  const grade = parseInt(req.query.grade);
  if (isNaN(grade) || grade < 1 || grade > 12)
    return errorResponse(res, 'Kelas tidak valid.', 422);

  const { data: topics, error } = await supabase
    .from('topics')
    .select('id, grade, title')
    .eq('grade', grade)
    .order('id');

  if (error) return errorResponse(res, 'Terjadi kesalahan.', 500);

  return res.status(200).json({ grade, topics: topics ?? [] });
}
