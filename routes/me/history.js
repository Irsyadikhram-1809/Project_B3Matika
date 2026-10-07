import { supabase } from '../_lib/supabase.js';
import { requireAuth, setCors, errorResponse } from '../_lib/auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return errorResponse(res, 'Method not allowed', 405);

  try {
    const { profile } = await requireAuth(req);
    const userId = profile.id;

    // --- Riwayat Topik (dari tabel attempts) ---
    const { data: attemptsRaw, error: attErr } = await supabase
      .from('attempts')
      .select('question_id, correct, created_at, questions(topic_id, topics(id, grade, title))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    let topicsMap = {};
    if (!attErr && attemptsRaw) {
      for (const a of attemptsRaw) {
        const topic = a.questions?.topics;
        if (!topic) continue;
        const tid = topic.id;
        if (!topicsMap[tid]) {
          topicsMap[tid] = {
            topic_id: tid,
            grade: topic.grade,
            topic_title: topic.title,
            correct: 0,
            wrong: 0,
            last_at: a.created_at,
          };
        }
        if (a.correct) topicsMap[tid].correct++;
        else topicsMap[tid].wrong++;
        if (a.created_at > topicsMap[tid].last_at) topicsMap[tid].last_at = a.created_at;
      }
    }
    const topics = Object.values(topicsMap);

    // --- Riwayat Game (dari tabel game_scores) ---
    const { data: gameScoresRaw, error: gsErr } = await supabase
      .from('game_scores')
      .select('game_type, score, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    let gamesMap = {};
    if (!gsErr && gameScoresRaw) {
      for (const g of gameScoresRaw) {
        const key = g.game_type;
        if (!gamesMap[key]) {
          gamesMap[key] = { game_type: key, best_score: g.score, total_points: 0, plays: 0, last_played: g.created_at };
        }
        if (g.score > gamesMap[key].best_score) gamesMap[key].best_score = g.score;
        gamesMap[key].total_points += g.score;
        gamesMap[key].plays++;
        if (g.created_at > gamesMap[key].last_played) gamesMap[key].last_played = g.created_at;
      }
    }
    const games = Object.values(gamesMap);

    return res.status(200).json({ topics, games });
  } catch (err) {
    console.error(err);
    return errorResponse(res, err.message, err.status || 500);
  }
}
