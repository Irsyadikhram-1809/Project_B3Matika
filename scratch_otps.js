import 'dotenv/config';
import db from './routes/_lib/db.js';

async function check() {
  const { rows } = await db.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'otps'
  `);
  console.log(rows);
  
  const { rows: constraints } = await db.query(`
    SELECT conname, pg_get_constraintdef(oid) 
    FROM pg_constraint 
    WHERE conrelid = 'otps'::regclass
  `);
  console.log(constraints);
  
  process.exit(0);
}
check();
