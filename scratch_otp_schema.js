import 'dotenv/config';
import pool from './routes/_lib/db.js';

async function run() {
  const client = await pool.connect();
  try {
    await client.query(`ALTER TABLE otps ADD COLUMN IF NOT EXISTS pending_username VARCHAR(50)`);
    console.log("Success");
  } catch (e) {
    console.error(e);
  } finally {
    client.release();
    process.exit(0);
  }
}
run();
