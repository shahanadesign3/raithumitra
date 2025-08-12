-- Ensure required extension
create extension if not exists pgcrypto with schema public;

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

-- Policies: owner-only access (use DO blocks to avoid errors if they already exist)
DO $$ BEGIN
  CREATE POLICY "Users can view their own profile"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their own profile"
  ON public.user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own profile"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their own profile"
  ON public.user_profiles
  FOR DELETE
  TO authenticated
  USING (id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Timestamp trigger function (shared)
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Attach trigger to user_profiles (drop/create to avoid duplicates)
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

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

-- Trigger on auth.users insert (drop/create to avoid duplicates)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

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

-- Add a uniqueness constraint to avoid sample data duplicates
DO $$ BEGIN
  ALTER TABLE public.crop_data
  ADD CONSTRAINT crop_data_unique UNIQUE (state_english, village_english, crop_name_english);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Enable RLS and allow public read access
alter table public.crop_data enable row level security;
DO $$ BEGIN
  CREATE POLICY "Anyone can read crop_data"
  ON public.crop_data
  FOR SELECT
  USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

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
ON CONFLICT (state_english, village_english, crop_name_english) DO NOTHING;