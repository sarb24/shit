-- First disable RLS temporarily
alter table companies disable row level security;
alter table company_users disable row level security;

-- Drop all existing policies
drop policy if exists "allow_select_companies" on companies;
drop policy if exists "allow_select_company_users" on company_users;

-- Create view for user permissions
create or replace view user_permissions as
select distinct
    au.id as user_id,
    au.email as user_email,
    c.id as company_id
from auth.users au
cross join companies c
where 
    au.email = c.admin_email
union
select distinct
    cu.user_id,
    au.email as user_email,
    cu.company_id
from company_users cu
join auth.users au on au.id = cu.user_id;

-- Create new simple policies
create policy "allow_select_companies"
on companies for select
to authenticated
using (
    exists (
        select 1 
        from user_permissions up 
        where up.user_id = auth.uid()
        and up.company_id = companies.id
    )
);

create policy "allow_select_company_users"
on company_users for select
to authenticated
using (
    exists (
        select 1 
        from user_permissions up 
        where up.user_id = auth.uid()
        and up.company_id = company_users.company_id
    )
);

-- Re-enable RLS
alter table companies enable row level security;
alter table company_users enable row level security;

-- Grant necessary permissions
grant select on user_permissions to authenticated; 