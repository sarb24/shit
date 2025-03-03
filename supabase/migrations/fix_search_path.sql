-- Set search_path explicitly
ALTER DATABASE postgres SET search_path TO "$user", public, extensions;

-- Reset policies with explicit schema references
DROP POLICY IF EXISTS "Companies are viewable by company members" ON public.companies;
DROP POLICY IF EXISTS "Companies are insertable by authenticated users" ON public.companies;
DROP POLICY IF EXISTS "Company users are viewable by company members" ON public.company_users;
DROP POLICY IF EXISTS "Company users are insertable by company admin" ON public.company_users;

-- Enable RLS with explicit schema
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_users ENABLE ROW LEVEL SECURITY;

-- Companies policies with explicit schema references
CREATE POLICY "Companies are viewable by company members"
ON public.companies FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.company_users
        WHERE company_users.company_id = companies.id
        AND company_users.user_id = auth.uid()
    )
    OR admin_email = auth.email()
);

CREATE POLICY "Companies are insertable by authenticated users"
ON public.companies FOR INSERT
TO authenticated
WITH CHECK (
    admin_email = auth.email()
);

-- Company users policies with explicit schema references
CREATE POLICY "Company users are viewable by company members"
ON public.company_users FOR SELECT
TO authenticated
USING (
    user_id = auth.uid()
    OR company_id IN (
        SELECT id FROM public.companies
        WHERE admin_email = auth.email()
    )
);

CREATE POLICY "Company users are insertable by company admin"
ON public.company_users FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.companies
        WHERE companies.id = company_id
        AND companies.admin_email = auth.email()
    )
);

-- Set search_path for specific functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$;

-- Grant permissions with explicit schema references
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.companies TO authenticated;
GRANT ALL ON public.company_users TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Verify triggers with explicit schema
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user(); 