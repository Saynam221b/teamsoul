-- Team SouL Archive relational schema

create table if not exists public.organizations (
  id text primary key,
  name text not null,
  founded text not null,
  parent_org text not null,
  parent_org_formed text not null,
  total_earnings numeric,
  bgmi_earnings numeric,
  total_tournaments integer,
  total_matches integer,
  peak_viewership integer,
  peak_viewership_event text,
  peak_viewership_year integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.viewership_milestones (
  id text primary key,
  organization_id text references public.organizations(id) on delete cascade,
  event text not null,
  viewers integer not null,
  year integer not null,
  created_at timestamptz default now()
);

create table if not exists public.eras (
  id text primary key,
  name text not null,
  year_start integer not null,
  year_end integer not null,
  description text not null,
  defining_moment text,
  outcome text check (outcome in ('triumph','decline','rebuild','dominance')),
  story_image_url text,
  story_image_alt text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table if exists public.eras
  add column if not exists story_image_url text,
  add column if not exists story_image_alt text;

create table if not exists public.era_key_players (
  id text primary key,
  era_id text references public.eras(id) on delete cascade,
  player_id text not null,
  created_at timestamptz default now(),
  unique (era_id, player_id)
);

create table if not exists public.players (
  id text primary key,
  display_name text not null,
  real_name text,
  role text,
  impact text,
  is_founder boolean default false,
  is_active boolean default false,
  current_status text check (current_status in ('active','retired','departed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

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

create table if not exists public.player_stints (
  id text primary key,
  player_id text references public.players(id) on delete cascade,
  join_date date not null,
  leave_date date,
  join_context text,
  leave_reason text,
  era_id text references public.eras(id),
  created_at timestamptz default now()
);

create table if not exists public.tournaments (
  id text primary key,
  name text not null,
  year integer not null,
  month integer,
  tier text,
  placement text,
  approx_price numeric,
  is_win boolean default false,
  status text not null default 'completed' check (status in ('completed','upcoming','live')),
  event_date date,
  location text,
  details text,
  coach text,
  analyst text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table if exists public.tournaments
  add column if not exists coach text,
  add column if not exists analyst text;

create table if not exists public.tournament_rosters (
  id text primary key,
  tournament_id text references public.tournaments(id) on delete cascade,
  player_id text references public.players(id) on delete cascade,
  created_at timestamptz default now(),
  unique (tournament_id, player_id)
);

create table if not exists public.awards (
  id text primary key,
  name text not null,
  recipient text not null,
  approx_price numeric,
  tournament_id text references public.tournaments(id) on delete set null,
  player_id text references public.players(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.roster_snapshots (
  id text primary key,
  year integer not null,
  event text,
  note text,
  created_at timestamptz default now()
);

create table if not exists public.roster_snapshot_players (
  id text primary key,
  snapshot_id text references public.roster_snapshots(id) on delete cascade,
  player_id text references public.players(id) on delete cascade,
  created_at timestamptz default now(),
  unique (snapshot_id, player_id)
);

create table if not exists public.roster_changes (
  id text primary key,
  player_id text references public.players(id) on delete cascade,
  action text check (action in ('JOINED','LEFT','RETIRED','ROLE_CHANGE')),
  date date not null,
  context text,
  created_at timestamptz default now()
);

create table if not exists public.aggregate_stats (
  id text primary key,
  total_wins integer,
  total_approx_price numeric,
  wins_by_tier jsonb,
  tournaments_by_year jsonb,
  best_placement_tournament text,
  best_placement text,
  best_placement_approx_price numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.blob_assets (
  id text primary key,
  relative_path text not null unique,
  url text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
