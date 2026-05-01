create table if not exists public.community_live_events (
  id text primary key,
  board_id text references public.community_boards(id) on delete cascade,
  tournament_id text references public.tournaments(id) on delete set null,
  event_type text not null default 'announcement' check (event_type in ('announcement','score_update','poll','moment','countdown')),
  title text not null,
  body text,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft','published','pinned','expired','archived')),
  is_pinned boolean not null default false,
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.community_reactions (
  id text primary key,
  live_event_id text not null references public.community_live_events(id) on delete cascade,
  user_id text not null references public.community_users(id) on delete cascade,
  reaction_key text not null check (reaction_key in ('soul','hype','clutch','respect')),
  created_at timestamptz default now(),
  unique (live_event_id, user_id, reaction_key)
);

create table if not exists public.community_badges (
  id text primary key,
  user_id text not null references public.community_users(id) on delete cascade,
  badge_key text not null,
  label text not null,
  description text not null,
  source text,
  earned_at timestamptz default now(),
  unique (user_id, badge_key)
);

create table if not exists public.media_moments (
  id text primary key,
  tournament_id text references public.tournaments(id) on delete set null,
  title text not null,
  description text,
  template_key text not null default 'trophy_pulse' check (template_key in ('trophy_pulse','roster_intro','match_countdown')),
  status text not null default 'draft' check (status in ('draft','published','pinned','expired','archived')),
  duration_seconds integer not null default 18 check (duration_seconds between 6 and 60),
  accent text not null default 'cyan' check (accent in ('cyan','gold','energy')),
  thumbnail_url text,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.fan_engagement_rollups (
  id text primary key,
  rollup_date date not null,
  board_id text references public.community_boards(id) on delete cascade,
  votes_count integer not null default 0,
  reactions_count integer not null default 0,
  active_users_count integer not null default 0,
  badges_awarded_count integer not null default 0,
  created_at timestamptz default now(),
  unique (rollup_date, board_id)
);

create index if not exists community_live_events_board_status_idx
  on public.community_live_events (board_id, status, published_at desc);

create index if not exists community_live_events_tournament_status_idx
  on public.community_live_events (tournament_id, status, published_at desc);

create index if not exists community_live_events_public_idx
  on public.community_live_events (status, is_pinned, published_at desc);

create index if not exists community_reactions_event_user_idx
  on public.community_reactions (live_event_id, user_id);

create index if not exists community_reactions_user_idx
  on public.community_reactions (user_id, created_at desc);

create index if not exists community_badges_user_key_idx
  on public.community_badges (user_id, badge_key);

create index if not exists media_moments_tournament_status_idx
  on public.media_moments (tournament_id, status, published_at desc);

create index if not exists media_moments_public_idx
  on public.media_moments (status, published_at desc);

create index if not exists fan_engagement_rollups_day_idx
  on public.fan_engagement_rollups (rollup_date desc, board_id);

alter table public.community_live_events enable row level security;
alter table public.community_reactions enable row level security;
alter table public.community_badges enable row level security;
alter table public.media_moments enable row level security;
alter table public.fan_engagement_rollups enable row level security;

drop policy if exists "Public can read published community live events" on public.community_live_events;
create policy "Public can read published community live events"
  on public.community_live_events
  for select
  using (status in ('published','pinned') and (expires_at is null or expires_at > now()));

drop policy if exists "Public can read published media moments" on public.media_moments;
create policy "Public can read published media moments"
  on public.media_moments
  for select
  using (status in ('published','pinned'));
