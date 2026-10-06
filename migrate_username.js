import 'dotenv/config';
import pool from './routes/_lib/db.js';

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Add username column if it doesn't exist
    await client.query(`
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE
    `);

    // Fetch users that have no username
    const res = await client.query(`SELECT id, email, name FROM profiles WHERE username IS NULL`);
    for (const row of res.rows) {
      let baseUsername = (row.email || '').split('@')[0].toLowerCase().replace(/[^a-z0-9_.]/g, '');
      if (baseUsername.length < 3) baseUsername = baseUsername.padEnd(3, '0');
      if (baseUsername.length > 20) baseUsername = baseUsername.substring(0, 20);
      
      let username = baseUsername;
      let counter = 1;
      let unique = false;
      while (!unique) {
        const check = await client.query(`SELECT id FROM profiles WHERE username = $1`, [username]);
        if (check.rows.length === 0) {
          unique = true;
        } else {
          username = `${baseUsername}${counter}`.substring(0, 20);
          counter++;
        }
      }
      
      await client.query(`UPDATE profiles SET username = $1 WHERE id = $2`, [username, row.id]);
    }
    
    await client.query('COMMIT');
    console.log("Migration successful");
  } catch (e) {
    await client.query('ROLLBACK');
    console.error("Migration failed", e);
  } finally {
    client.release();
    process.exit(0);
  }
}

migrate();
