-- Jalankan script ini di SQL Editor pada dashboard Supabase Anda:

-- 1. Tabel OTP
CREATE TABLE otps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  purpose text NOT NULL CHECK (purpose IN ('register', 'reset')),
  code_hash text NOT NULL,
  pending_password_hash text,
  attempts int DEFAULT 0,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Index untuk mempercepat query OTP
CREATE INDEX idx_otps_email_purpose ON otps(email, purpose);

-- 2. Tabel Admin Invites
CREATE TABLE admin_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code_hash text NOT NULL,
  for_email text,
  created_by uuid REFERENCES auth.users(id),
  expires_at timestamp with time zone NOT NULL,
  used_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now()
);
