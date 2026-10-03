// api/home.js  →  GET /api/home
// Response format harus sama persis dengan Laravel HomeController:
// { counts: { "1": 5, "2": 3, ... } }
import { supabase } from './_lib/supabase.js';
import { setCors, errorResponse } from './_lib/auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return errorResponse(res, 'Method not allowed', 405);

  try {
    const { data: topics, error } = await supabase
      .from('topics')
      .select('grade');

    if (error) throw error;

    // Hitung jumlah topik per grade, persis seperti Laravel pluck('total', 'grade')
    const counts = {};
    (topics ?? []).forEach(({ grade }) => {
      counts[grade] = (counts[grade] || 0) + 1;
    });

    return res.status(200).json({ counts });
  } catch {
    // Jika Supabase belum setup, return empty counts agar halaman tidak crash
    return res.status(200).json({ counts: {} });
  }
}
