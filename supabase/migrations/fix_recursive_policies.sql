-- First, drop all existing policies
DROP POLICY IF EXISTS "Companies are viewable by company users" ON companies;
DROP POLICY IF EXISTS "Companies are insertable by anyone" ON companies;
DROP POLICY IF EXISTS "Company users are viewable by company members" ON company_users;
DROP POLICY IF EXISTS "Company users are insertable by anyone" ON company_users;

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;

-- Simple policies for initial registration
CREATE POLICY "Companies are viewable by authenticated users"
ON companies FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Companies are insertable by authenticated users"
ON companies FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Company users are viewable by authenticated users"
ON company_users FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Company users are insertable by authenticated users"
ON company_users FOR INSERT
TO authenticated
WITH CHECK (true);

-- Add policies for update and delete if needed
CREATE POLICY "Companies are updatable by company admin"
ON companies FOR UPDATE
TO authenticated
USING (
    admin_email = auth.email()
);

CREATE POLICY "Company users are updatable by company admin"
ON company_users FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM companies c
        WHERE c.id = company_users.company_id
        AND c.admin_email = auth.email()
    )
);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON companies TO authenticated;
GRANT ALL ON company_users TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated; 