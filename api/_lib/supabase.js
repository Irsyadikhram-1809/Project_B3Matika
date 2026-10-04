// api/_lib/supabase.js
// Shared Supabase client untuk semua API routes

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'placeholder_service_key';

// Jangan throw error saat inisialisasi modul, biarkan gagal saat request agar tidak 500 error seluruh fungsi
if (!process.env.SUPABASE_URL && !process.env.VITE_SUPABASE_URL) {
  console.warn('⚠️ SUPABASE_URL dan VITE_SUPABASE_URL tidak ditemukan di environment variables!');
} else {
  console.log('✅ Supabase URL berhasil dibaca oleh Backend:', supabaseUrl);
  console.log('🔑 Key prefix yang dipakai:', supabaseKey.substring(0, 45) + '...');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
