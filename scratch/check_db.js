import db from '../routes/_lib/db.js';

async function main() {
  try {
    const { rows } = await db.query(`SELECT table_name, column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema = 'public' AND table_name IN ('users', 'profiles')`);
    console.log(rows);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

main();
