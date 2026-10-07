import { pathToFileURL } from 'url';
import bcrypt from 'bcrypt';
import db from '../routes/_lib/db.js';
import env from '../routes/_lib/env.js';

export async function ensureSuperAdmin() {
  const email = env.SUPERADMIN_EMAIL;
  const username = env.SUPERADMIN_USERNAME;
  const password = env.SUPERADMIN_PASSWORD;

  if (!email || !username || !password) {
    throw new Error('SUPERADMIN_EMAIL / SUPERADMIN_USERNAME / SUPERADMIN_PASSWORD belum diisi di .env');
  }

  console.log('Menjalankan seeder Superadmin untuk:', email);
  const hash = await bcrypt.hash(password, 12);

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // UPSERT: akun dibuat bila belum ada, bila sudah ada hash/role/status diperbarui
    const { rows } = await client.query(
      `INSERT INTO users (email, password_hash, role, is_verified, is_blocked)
       VALUES ($1, $2, 'superadmin', true, false)
       ON CONFLICT (email) DO UPDATE
         SET password_hash = EXCLUDED.password_hash,
             role = 'superadmin',
             is_verified = true,
             is_blocked = false,
       RETURNING id`,
      [email, hash]
    );
    const userId = rows[0].id;

    await client.query(
      `INSERT INTO profiles (id, email, username, name, role, avatar)
       VALUES ($1, $2, $3, 'Super Admin', 'superadmin', '🎓')
       ON CONFLICT (id) DO UPDATE
         SET email = EXCLUDED.email,
             username = EXCLUDED.username,
             role = 'superadmin'`,
      [userId, email, username]
    );

    await client.query('COMMIT');
    console.log('✅ Superadmin siap. Login lewat /panel-rahasia/login dengan email di atas.');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Cara membandingkan yang benar di Windows maupun Linux/Mac
// (versi lama membandingkan dengan `file://${process.argv[1]}` yang selalu salah di Windows,
// sehingga skrip berjalan tanpa melakukan apa-apa).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  ensureSuperAdmin()
    .catch((err) => { console.error('❌ Gagal seed superadmin:', err.message); process.exitCode = 1; })
    .finally(() => db.end());
}