// api/_lib/supabase.js
// Shared Supabase client untuk semua API routes

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY harus diisi di environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
