alter table if exists public.eras
  add column if not exists story_image_url text,
  add column if not exists story_image_alt text;

create table if not exists public.staff_members (
  id text primary key,
  display_name text not null,
  real_name text,
  role text,
  join_date date not null,
  leave_date date,
  is_active boolean default false,
  impact text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.staff_eras (
  id text primary key,
  staff_id text references public.staff_members(id) on delete cascade,
  era_id text references public.eras(id) on delete cascade,
  created_at timestamptz default now(),
  unique (staff_id, era_id)
);

create table if not exists public.blob_assets (
  id text primary key,
  relative_path text not null unique,
  url text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
