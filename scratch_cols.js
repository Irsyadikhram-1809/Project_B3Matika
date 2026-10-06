import 'dotenv/config';
import db from './routes/_lib/db.js';
async function test() {
  const t = await db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'questions'");
  console.log('Questions:', t.rows);
  const p = await db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'puzzles'");
  console.log('Puzzles:', p.rows);
  process.exit(0);
}
test();
