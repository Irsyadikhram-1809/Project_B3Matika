
import "dotenv/config";
import db from "./routes/_lib/db.js";

async function test() {
  const userId = "00000000-0000-0000-0000-000000000000";
  try {
    const { rows: topics } = await db.query(`SELECT t.grade, t.id as topic_id, t.title as topic_title, SUM(CASE WHEN a.correct THEN 1 ELSE 0 END)::int as correct, SUM(CASE WHEN NOT a.correct THEN 1 ELSE 0 END)::int as wrong, MAX(a.created_at) as last_at FROM attempts a JOIN questions q ON a.question_id = q.id JOIN topics t ON q.topic_id = t.id WHERE a.user_id = $1 GROUP BY t.id, t.grade, t.title ORDER BY last_at DESC`, [userId]);
    console.log("topics query ok", topics);
    
    const { rows: games } = await db.query(`SELECT game as game_type, MAX(score) as best_score, SUM(score) as total_points, COUNT(id)::int as plays, MAX(created_at) as last_played FROM game_scores WHERE user_id = $1 GROUP BY game ORDER BY last_played DESC`, [userId]);
    console.log("games query ok", games);
  } catch (err) {
    console.error("QUERY ERR:", err.message);
  }
  process.exit(0);
}
test();

