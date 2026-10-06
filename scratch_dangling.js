import 'dotenv/config';
import db from './routes/_lib/db.js';

async function check() {
  const { rows } = await db.query(`
    SELECT * FROM profiles WHERE id NOT IN (SELECT id FROM users)
  `);
  console.log('Dangling profiles:', rows.length);
  console.log(rows);
  process.exit(0);
}
check();
