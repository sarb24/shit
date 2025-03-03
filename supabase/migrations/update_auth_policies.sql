-- Reset policies
DROP POLICY IF EXISTS "Companies are viewable by authenticated users" ON companies;
DROP POLICY IF EXISTS "Companies are insertable by authenticated users" ON companies;
DROP POLICY IF EXISTS "Company users are viewable by authenticated users" ON company_users;
DROP POLICY IF EXISTS "Company users are insertable by authenticated users" ON company_users;

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;

-- Companies policies
CREATE POLICY "Companies are viewable by company members"
ON companies FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM company_users
        WHERE company_users.company_id = companies.id
        AND company_users.user_id = auth.uid()
    )
    OR admin_email = auth.email()
);

CREATE POLICY "Companies are insertable by authenticated users"
ON companies FOR INSERT
TO authenticated
WITH CHECK (
    admin_email = auth.email()
);

-- Company users policies
CREATE POLICY "Company users are viewable by company members"
ON company_users FOR SELECT
TO authenticated
USING (
    user_id = auth.uid()
    OR company_id IN (
        SELECT id FROM companies
        WHERE admin_email = auth.email()
    )
);

CREATE POLICY "Company users are insertable by company admin"
ON company_users FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM companies
        WHERE companies.id = company_id
        AND companies.admin_email = auth.email()
    )
);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON companies TO authenticated;
GRANT ALL ON company_users TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated; 