-- 001_admin_system.sql
-- Script Migrasi untuk Tahap 0B

-- 1. Tabel audit_logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255),
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel admin_requests
CREATE TABLE IF NOT EXISTS public.admin_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    request_reason TEXT,
    reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabel games
CREATE TABLE IF NOT EXISTS public.games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    badge_color VARCHAR(50) DEFAULT '#2563eb',
    is_active BOOLEAN DEFAULT true,
    max_score INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabel riwayat
CREATE TABLE IF NOT EXISTS public.riwayat (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL, -- e.g., 'game', 'quiz', 'puzzle'
    activity_id VARCHAR(255),
    score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabel rate_limits
CREATE TABLE IF NOT EXISTS public.rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ip_address VARCHAR(45) NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexing untuk optimasi query rate_limit
CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_endpoint ON public.rate_limits(ip_address, endpoint);

-- 6. Update Row Level Security (RLS)
-- Pastikan RLS diaktifkan
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.riwayat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Kebijakan RLS sangat ketat (Deny All dari client anon/authenticated)
-- Akses hanya melalui service_role di backend.

-- (Opsional) Hapus policy lama jika ada agar bersih (ignore if not exists)
DO $$ BEGIN
    DROP POLICY IF EXISTS "Deny all for anon" ON public.users;
    DROP POLICY IF EXISTS "Deny all for anon" ON public.audit_logs;
    DROP POLICY IF EXISTS "Deny all for anon" ON public.admin_requests;
    DROP POLICY IF EXISTS "Deny all for anon" ON public.games;
    DROP POLICY IF EXISTS "Deny all for anon" ON public.riwayat;
    DROP POLICY IF EXISTS "Deny all for anon" ON public.rate_limits;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- Buat policy tolock semua dari akses publik (anon/authenticated role) jika diakses dari frontend Supabase JS
CREATE POLICY "Deny all for anon" ON public.users FOR ALL TO public USING (false);
CREATE POLICY "Deny all for anon" ON public.audit_logs FOR ALL TO public USING (false);
CREATE POLICY "Deny all for anon" ON public.admin_requests FOR ALL TO public USING (false);
CREATE POLICY "Deny all for anon" ON public.games FOR ALL TO public USING (false);
CREATE POLICY "Deny all for anon" ON public.riwayat FOR ALL TO public USING (false);
CREATE POLICY "Deny all for anon" ON public.rate_limits FOR ALL TO public USING (false);
