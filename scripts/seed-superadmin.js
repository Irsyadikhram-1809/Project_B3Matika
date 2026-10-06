import bcrypt from 'bcrypt';
import db from '../routes/_lib/db.js';
import env from '../routes/_lib/env.js';

export async function ensureSuperAdmin() {
  try {
    console.log("Menjalankan seeder Superadmin...");
    
    // Values are already validated by env.js
    const email = env.SUPERADMIN_EMAIL;
    const username = env.SUPERADMIN_USERNAME;
    const password = env.SUPERADMIN_PASSWORD;

    const { rows } = await db.query("SELECT id, role, is_blocked, is_verified FROM users WHERE email = $1", [email]);
    
    if (rows.length === 0) {
      const hash = await bcrypt.hash(password, 12);
      
      // We need to insert into users, then into profiles
      const insertUserRes = await db.query(
        "INSERT INTO users (email, password_hash, role, is_verified) VALUES ($1, $2, 'superadmin', true) RETURNING id",
        [email, hash]
      );
      
      const userId = insertUserRes.rows[0].id;
      
      // Ensure profile exists with the required username
      await db.query(
        "INSERT INTO profiles (id, username, name, avatar) VALUES ($1, $2, 'Super Admin', '🎓') ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username",
        [userId, username]
      );
      
      console.log("✅ Akun Superadmin baru berhasil dibuat.");
    } else {
      const user = rows[0];
      const hash = await bcrypt.hash(password, 12);
      
      await db.query(
        "UPDATE users SET password_hash = $1, role = 'superadmin', is_blocked = false, is_verified = true WHERE email = $2",
        [hash, email]
      );
      
      // Update profile username
      await db.query(
        "INSERT INTO profiles (id, username, name, avatar) VALUES ($1, $2, 'Super Admin', '🎓') ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username",
        [user.id, username]
      );
      
      console.log("✅ Akun Superadmin berhasil diperbarui (termasuk password dan username).");
    }
  } catch (err) {
    console.error("❌ Error ensureSuperAdmin:", err);
  } finally {
    // Tutup koneksi db karena ini dipanggil dari command line
    db.end();
  }
}

// Hanya jalankan jika dipanggil langsung lewat command line
if (import.meta.url === `file://${process.argv[1]}`) {
  ensureSuperAdmin();
}
