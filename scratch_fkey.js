import 'dotenv/config';
import db from './routes/_lib/db.js';

async function check() {
  const { rows } = await db.query("SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conname = 'profiles_id_fkey'");
  console.log(rows);
  process.exit(0);
}
check();
