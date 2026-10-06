import 'dotenv/config';
import db from './routes/_lib/db.js';

async function fix() {
  try {
    console.log("Deleting dangling profiles...");
    await db.query(`DELETE FROM profiles WHERE id NOT IN (SELECT id FROM users)`);
    
    console.log("Dropping old constraint...");
    await db.query(`ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey`);
    
    console.log("Adding new constraint to public.users...");
    await db.query(`ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE`);
    
    console.log("Success!");
  } catch (err) {
    console.error("Error:", err);
  }
  process.exit(0);
}
fix();
