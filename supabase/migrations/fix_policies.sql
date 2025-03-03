-- Drop existing policies
DROP POLICY IF EXISTS "Companies are viewable by company users" ON companies;
DROP POLICY IF EXISTS "Companies are insertable by authenticated users" ON companies;
DROP POLICY IF EXISTS "Company users are viewable by company users" ON company_users;
DROP POLICY IF EXISTS "Company users are insertable by authenticated users" ON company_users;

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;

-- Companies policies
CREATE POLICY "Companies are viewable by company users"
ON companies FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM company_users
        WHERE company_users.company_id = companies.id
        AND company_users.user_id = auth.uid()
    )
);

CREATE POLICY "Companies are insertable by anyone"
ON companies FOR INSERT
WITH CHECK (true);

-- Company users policies
CREATE POLICY "Company users are viewable by company members"
ON company_users FOR SELECT
USING (
    company_id IN (
        SELECT company_id FROM company_users
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Company users are insertable by anyone"
ON company_users FOR INSERT
WITH CHECK (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON companies TO anon, authenticated;
GRANT ALL ON company_users TO anon, authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated; 