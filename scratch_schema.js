import 'dotenv/config';
import pool from './routes/_lib/db.js';

async function run() {
  const tables = ['users', 'profiles', 'game_scores', 'attempts', 'puzzle_solves'];
  for (const t of tables) {
    const res = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1`, [t]);
    console.log(`\n--- ${t} ---`);
    console.log(res.rows);
  }
  process.exit(0);
}
run().catch(console.error);
