// api/_lib/supabase.js
// Shared Supabase client untuk semua API routes

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_service_key';

// Jangan throw error saat inisialisasi modul, biarkan gagal saat request agar tidak 500 error seluruh fungsi
if (!process.env.SUPABASE_URL) {
  console.warn('⚠️ SUPABASE_URL tidak ditemukan di environment variables!');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
