import 'dotenv/config';
import db from './routes/_lib/db.js';

async function check() {
  const { rows } = await db.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users'
  `);
  console.log('users columns:', rows);
  
  const { rows: profilesRows } = await db.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles'
  `);
  console.log('profiles columns:', profilesRows);
  
  process.exit(0);
}
check();
