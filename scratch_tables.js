import 'dotenv/config';
import db from './routes/_lib/db.js';

async function check() {
  const { rows } = await db.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'");
  console.log(rows);
  process.exit(0);
}
check();
