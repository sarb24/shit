-- Create tables
create table if not exists public.companies (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  admin_email text not null,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.company_users (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies(id) not null,
  user_id uuid references auth.users(id) not null,
  role text not null check (role in ('admin', 'member')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(company_id, user_id)
);

create table if not exists public.profiles (
  id uuid references auth.users(id) primary key,
  email text not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table public.companies enable row level security;
alter table public.company_users enable row level security;
alter table public.profiles enable row level security;

-- Drop existing policies
drop policy if exists "Enable read access for authenticated users" on public.companies;
drop policy if exists "Enable insert for authenticated users" on public.companies;
drop policy if exists "Enable read access for authenticated users" on public.company_users;
drop policy if exists "Enable insert for authenticated users" on public.company_users;
drop policy if exists "Enable read access for authenticated users" on public.profiles;
drop policy if exists "Enable update for users based on email" on public.profiles;

-- Create policies for companies
create policy "Enable read for all users"
  on public.companies for select
  using (true);

create policy "Enable insert for all users"
  on public.companies for insert
  with check (true);

-- Create policies for company_users
create policy "Enable read for all users"
  on public.company_users for select
  using (true);

create policy "Enable insert for all users"
  on public.company_users for insert
  with check (true);

-- Create policies for profiles
create policy "Enable read for all users"
  on public.profiles for select
  using (true);

create policy "Enable insert for all users"
  on public.profiles for insert
  with check (true);

create policy "Enable update for matching email"
  on public.profiles for update
  using (auth.email() = email);

-- Create trigger for new user profiles
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Grant necessary permissions
grant usage on schema public to anon;
grant usage on schema public to authenticated;

grant all on public.companies to anon;
grant all on public.companies to authenticated;

grant all on public.company_users to anon;
grant all on public.company_users to authenticated;

grant all on public.profiles to anon;
grant all on public.profiles to authenticated; 