-- Update RLS policies for existing tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Companies are viewable by company users" ON companies;
DROP POLICY IF EXISTS "Company users are viewable by company users" ON company_users;

-- Create or update policies
CREATE POLICY "Companies are viewable by company users" ON companies
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM company_users
            WHERE company_users.company_id = companies.id
            AND company_users.user_id = auth.uid()
        )
    );

CREATE POLICY "Companies are insertable by authenticated users" ON companies
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Company users are viewable by company users" ON company_users
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM company_users WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Company users are insertable by authenticated users" ON company_users
    FOR INSERT WITH CHECK (true); 