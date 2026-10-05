import bcrypt from 'bcrypt';
import db from '../../routes/_lib/db.js';
import dotenv from 'dotenv';
dotenv.config();

export async function ensureSuperAdmin() {
  try {
    const email = (process.env.SUPERADMIN_EMAIL || '').toLowerCase().trim();
    const password = process.env.SUPERADMIN_PASSWORD;

    if (!email || !password) return;

    const { rows } = await db.query("SELECT role, is_blocked, is_verified FROM users WHERE email = $1", [email]);
    
    if (rows.length === 0) {
      const hash = await bcrypt.hash(password, 12);
      await db.query(
        "INSERT INTO users (email, password_hash, role, is_verified) VALUES ($1, $2, 'superadmin', true)",
        [email, hash]
      );
      console.log("Super admin dibuat.");
    } else {
      const user = rows[0];
      const hash = await bcrypt.hash(password, 12);
      await db.query(
        "UPDATE users SET password_hash = $1, role = 'superadmin', is_blocked = false, is_verified = true WHERE email = $2",
        [hash, email]
      );
      console.log("Super admin diperbarui (termasuk password).");
    }
  } catch (err) {
    console.error("Error ensureSuperAdmin:", err);
  }
}
