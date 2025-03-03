-- Check if tables exist and create them if they don't
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    admin_email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.company_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(company_id, user_id)
);

-- Reset policies
DROP POLICY IF EXISTS "Companies are viewable by company members" ON public.companies;
DROP POLICY IF EXISTS "Companies are insertable by authenticated users" ON public.companies;
DROP POLICY IF EXISTS "Company users are viewable by company members" ON public.company_users;
DROP POLICY IF EXISTS "Company users are insertable by company admin" ON public.company_users;

-- Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_users ENABLE ROW LEVEL SECURITY;

-- Simpler initial policies
CREATE POLICY "Companies are viewable by anyone" ON public.companies
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Companies are insertable by anyone" ON public.companies
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Company users are viewable by anyone" ON public.company_users
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Company users are insertable by anyone" ON public.company_users
    FOR INSERT TO authenticated WITH CHECK (true); 