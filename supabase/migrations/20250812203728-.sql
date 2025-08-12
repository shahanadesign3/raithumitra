-- Create user_profiles table
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  state text,
  village text,
  preferred_crop text,
  fcm_token text,
  selected_language text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.user_profiles enable row level security;

-- Policies: owner-only access
create policy if not exists "Users can view their own profile"
  on public.user_profiles
  for select
  to authenticated
  using (id = auth.uid());

create policy if not exists "Users can insert their own profile"
  on public.user_profiles
  for insert
  to authenticated
  with check (id = auth.uid());

create policy if not exists "Users can update their own profile"
  on public.user_profiles
  for update
  to authenticated
  using (id = auth.uid());

create policy if not exists "Users can delete their own profile"
  on public.user_profiles
  for delete
  to authenticated
  using (id = auth.uid());

-- Timestamp trigger function (shared)
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Attach trigger to user_profiles
create trigger if not exists update_user_profiles_updated_at
before update on public.user_profiles
for each row execute function public.update_updated_at_column();

-- Auto-create profile row on new auth user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.user_profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Trigger on auth.users insert
create trigger if not exists on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create crop_data table
create table if not exists public.crop_data (
  id uuid primary key default gen_random_uuid(),
  state_english text,
  state_telugu text,
  village_english text,
  village_telugu text,
  crop_name_english text,
  crop_name_telugu text
);

-- Enable RLS and allow public read access
alter table public.crop_data enable row level security;
create policy if not exists "Anyone can read crop_data"
  on public.crop_data
  for select
  using (true);

-- Sample data for Andhra Pradesh (English and Telugu)
insert into public.crop_data (
  state_english, state_telugu, village_english, village_telugu, crop_name_english, crop_name_telugu
) values
  ('Andhra Pradesh', 'ఆంధ్ర ప్రదేశ్', 'Guntur', 'గుంటూరు', 'Cotton', 'పత్తి'),
  ('Andhra Pradesh', 'ఆంధ్ర ప్రదేశ్', 'Guntur', 'గుంటూరు', 'Rice', 'బియ్యం'),
  ('Andhra Pradesh', 'ఆంధ్ర ప్రదేశ్', 'Vijayawada', 'విజయవాడ', 'Rice', 'బియ్యం'),
  ('Andhra Pradesh', 'ఆంధ్ర ప్రదేశ్', 'Vijayawada', 'విజయవాడ', 'Maize', 'మొక్కజొన్న'),
  ('Andhra Pradesh', 'ఆంధ్ర ప్రదేశ్', 'Visakhapatnam', 'విశాఖపట్నం', 'Rice', 'బియ్యం'),
  ('Andhra Pradesh', 'ఆంధ్ర ప్రదేశ్', 'Visakhapatnam', 'విశాఖపట్నం', 'Groundnut', 'వేరుశెనగ'),
  ('Andhra Pradesh', 'ఆంధ్ర ప్రదేశ్', 'Tirupati', 'తిరుపతి', 'Rice', 'బియ్యం'),
  ('Andhra Pradesh', 'ఆంధ్ర ప్రదేశ్', 'Tirupati', 'తిరుపతి', 'Groundnut', 'వేరుశెనగ'),
  ('Andhra Pradesh', 'ఆంధ్ర ప్రదేశ్', 'Anantapur', 'అనంతపూర్', 'Groundnut', 'వేరుశెనగ'),
  ('Andhra Pradesh', 'ఆంధ్ర ప్రదేశ్', 'Anantapur', 'అనంతపూర్', 'Cotton', 'పత్తి')
  on conflict do nothing;