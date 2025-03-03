-- Create companies table
CREATE TABLE companies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    admin_email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create profiles table to extend auth.users
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create company_users junction table
CREATE TABLE company_users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(company_id, user_id)
);

-- Set up Row Level Security (RLS)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Companies are viewable by company users" ON companies
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM company_users
            WHERE company_users.company_id = companies.id
            AND company_users.user_id = auth.uid()
        )
    );

CREATE POLICY "Profiles are viewable by company users" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM company_users
            WHERE company_users.user_id = profiles.id
            AND company_users.company_id IN (
                SELECT company_id FROM company_users WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Company users are viewable by company users" ON company_users
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM company_users WHERE user_id = auth.uid()
        )
    );

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 