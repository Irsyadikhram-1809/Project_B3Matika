import db from '../routes/_lib/db.js';

async function main() {
  try {
    const { rows } = await db.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);
    console.log(rows);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

main();
