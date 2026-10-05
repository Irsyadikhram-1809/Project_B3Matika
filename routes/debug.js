// api/debug.js
import { supabase } from './_lib/supabase.js';

export default async function handler(req, res) {
  try {
    const { data: allTopics } = await supabase.from('topics').select('*');
    const { data: eq1Num } = await supabase.from('topics').select('*').eq('grade', 1);
    const { data: eq1Str } = await supabase.from('topics').select('*').eq('grade', '1');
    const { data: allPuzzles } = await supabase.from('puzzles').select('*');
    
    return res.status(200).json({
      totalTopics: allTopics?.length,
      topicsEq1Num: eq1Num?.length,
      topicsEq1Str: eq1Str?.length,
      totalPuzzles: allPuzzles?.length,
      envUrl: !!process.env.SUPABASE_URL,
      envKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      envViteUrl: !!process.env.VITE_SUPABASE_URL,
      envViteKey: !!process.env.VITE_SUPABASE_ANON_KEY,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
