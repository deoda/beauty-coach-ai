-- Beauty Coach AI - Schema + RLS
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  preferred_language text default 'fr',
  style_preferences text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.wardrobe_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  category text not null,
  subcategory text,
  primary_color text,
  secondary_colors text[] default '{}',
  pattern text,
  style text,
  formality_level text,
  image_path text,
  status text default 'available',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.outfit_recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  occasion text,
  event_date date,
  preferences jsonb,
  recommendation_data jsonb,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.wardrobe_items enable row level security;
alter table public.outfit_recommendations enable row level security;

create policy "own profile" on public.profiles for all using (auth.uid() = id);
create policy "own wardrobe" on public.wardrobe_items for all using (auth.uid() = user_id);
create policy "own recommendations" on public.outfit_recommendations for all using (auth.uid() = user_id);

-- Storage bucket (create via dashboard or CLI)
-- insert into storage.buckets (id, name, public) values ('wardrobe', 'wardrobe', false);
