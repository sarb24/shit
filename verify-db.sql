-- Verify and create tables if they don't exist
DO $$ 
BEGIN
    -- Check and create companies table
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'companies') THEN
        CREATE TABLE public.companies (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            name text NOT NULL,
            admin_email text NOT NULL,
            created_by uuid REFERENCES auth.users(id),
            created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
        );
        
        ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Check and create company_users table
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'company_users') THEN
        CREATE TABLE public.company_users (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            company_id uuid REFERENCES public.companies(id) NOT NULL,
            user_id uuid REFERENCES auth.users(id) NOT NULL,
            role text NOT NULL CHECK (role IN ('admin', 'member')),
            created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
            UNIQUE(company_id, user_id)
        );
        
        ALTER TABLE public.company_users ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Check and create profiles table
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        CREATE TABLE public.profiles (
            id uuid REFERENCES auth.users(id) PRIMARY KEY,
            email text NOT NULL,
            updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
        );
        
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Verify and create policies
DO $$ 
BEGIN
    -- Companies policies
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'companies' AND policyname = 'Enable read for all') THEN
        CREATE POLICY "Enable read for all" ON public.companies
            FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'companies' AND policyname = 'Enable insert for all') THEN
        CREATE POLICY "Enable insert for all" ON public.companies
            FOR INSERT WITH CHECK (true);
    END IF;

    -- Company_users policies
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'company_users' AND policyname = 'Enable read for all') THEN
        CREATE POLICY "Enable read for all" ON public.company_users
            FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'company_users' AND policyname = 'Enable insert for all') THEN
        CREATE POLICY "Enable insert for all" ON public.company_users
            FOR INSERT WITH CHECK (true);
    END IF;

    -- Profiles policies
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Enable read for all') THEN
        CREATE POLICY "Enable read for all" ON public.profiles
            FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Enable insert for all') THEN
        CREATE POLICY "Enable insert for all" ON public.profiles
            FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Verify trigger for new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (new.id, new.email);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user(); 