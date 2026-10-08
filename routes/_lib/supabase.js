// api/_lib/supabase.js
// Shared Supabase client untuk semua API routes

import { createClient } from '@supabase/supabase-js';
import env from './env.js';

const supabaseUrl = env.SUPABASE_URL || '';
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || '';

// Logging aman tanpa membocorkan nilai lengkap
console.log('✅ Supabase URL berhasil dibaca oleh Backend:', supabaseUrl);
if (supabaseKey) {
  console.log('🔑 Key prefix yang dipakai:', supabaseKey.substring(0, 45) + '...');
} else {
  console.warn('⚠️ Supabase Key kosong, request database akan gagal.');
}

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
