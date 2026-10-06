import 'dotenv/config';
import db from './routes/_lib/db.js';
async function test() {
  try {
    await db.query("ALTER TABLE profiles ADD COLUMN last_seen TIMESTAMP WITH TIME ZONE");
    console.log('Added last_seen');
  } catch (e) {
    console.error('Error or already exists:', e.message);
  }
  process.exit(0);
}
test();
