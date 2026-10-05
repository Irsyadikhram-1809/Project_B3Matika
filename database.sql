-- Migrasi Tabel Auth (Jalankan di SQL Editor Supabase)

-- 1. Buat ekstensi uuid-ossp (jika belum ada)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabel users
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'superadmin')),
    points INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    is_blocked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabel otps
CREATE TABLE IF NOT EXISTS public.otps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    purpose VARCHAR(50) NOT NULL CHECK (purpose IN ('register', 'reset')),
    code_hash VARCHAR(255) NOT NULL,
    pending_password_hash VARCHAR(255),
    attempts INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabel admin_invites
CREATE TABLE IF NOT EXISTS public.admin_invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code_hash VARCHAR(255) NOT NULL UNIQUE,
    for_email VARCHAR(255),
    created_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
    used_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Aktifkan Row Level Security (RLS) untuk memproteksi dari akses langsung API Supabase (anon)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_invites ENABLE ROW LEVEL SECURITY;

-- Karena kita mengakses via pg (backend) dengan DATABASE_URL,
-- RLS otomatis dilewati oleh role postgres/service_role.
-- Namun jika ingin memberikan akses spesifik, Anda bisa menambah policy di sini.
