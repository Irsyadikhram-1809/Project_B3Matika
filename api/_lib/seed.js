import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function ensureSuperAdmin() {
  try {
    const email = (process.env.SUPERADMIN_EMAIL || '').toLowerCase().trim();
    const password = process.env.SUPERADMIN_PASSWORD;

    if (!email || !password) return; // Skip jika tidak di-set di .env

    // Cari user di tabel profiles
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (!profile) {
      // Buat akun baru via auth.admin
      const { data: userData, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name: 'Super Admin' }
      });
      if (error) {
        if (!error.message.includes('already')) {
          console.error("Gagal membuat super admin auth:", error.message);
        }
      } else {
        // Buat profil
        await supabaseAdmin.from('profiles').insert({
          id: userData.user.id,
          name: 'Super Admin',
          email,
          role: 'superadmin',
          points: 0,
          is_active: true
        });
        console.log("Super admin dibuat.");
      }
    } else if (profile.role !== 'superadmin' || !profile.is_active) {
      await supabaseAdmin.from('profiles').update({ role: 'superadmin', is_active: true }).eq('id', profile.id);
      console.log("Super admin di-update.");
    }
  } catch (err) {
    console.error("Error ensureSuperAdmin:", err);
  }
}
