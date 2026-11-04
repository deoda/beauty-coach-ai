-- Additional tables for TOP OUTFITS, calendar, profile, quotas, admin

-- Published outfits (TOP OUTFITS)
create table if not exists public.published_outfits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  occasion text,
  score integer,
  explanation text,
  items jsonb,
  image_url text,
  created_at timestamptz default now()
);

-- Calendar events
create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  event_date date not null,
  occasion text,
  outfit_id uuid,
  notes text,
  created_at timestamptz default now()
);

-- Usage quotas
create table if not exists public.usage_quotas (
  user_id uuid primary key references auth.users(id) on delete cascade,
  analyses_used integer default 0,
  analyses_limit integer default 20,
  uploads_used integer default 0,
  uploads_limit integer default 50,
  period_start date default current_date,
  updated_at timestamptz default now()
);

-- Extend profiles
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists is_admin boolean default false;

alter table public.published_outfits enable row level security;
alter table public.calendar_events enable row level security;
alter table public.usage_quotas enable row level security;

create policy "own published" on public.published_outfits for all using (auth.uid() = user_id);
create policy "public read published" on public.published_outfits for select using (true);
create policy "own calendar" on public.calendar_events for all using (auth.uid() = user_id);
create policy "own quotas" on public.usage_quotas for all using (auth.uid() = user_id);
