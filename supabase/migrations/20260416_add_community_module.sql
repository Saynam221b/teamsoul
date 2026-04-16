create table if not exists public.community_users (
  id text primary key,
  username text not null unique,
  username_normalized text not null unique,
  password_hash text not null,
  password_salt text not null,
  created_at timestamptz default now()
);

create table if not exists public.community_sessions (
  id text primary key,
  user_id text not null references public.community_users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz default now(),
  last_seen_at timestamptz default now()
);

create table if not exists public.community_boards (
  id text primary key,
  tournament_id text not null references public.tournaments(id) on delete cascade unique,
  headline text,
  description text,
  is_featured boolean not null default false,
  voting_state text not null default 'draft' check (voting_state in ('draft','open','locked')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.community_board_teams (
  id text primary key,
  board_id text not null references public.community_boards(id) on delete cascade,
  name text not null,
  short_name text,
  sort_order integer not null default 0
);

create table if not exists public.community_board_players (
  id text primary key,
  team_id text not null references public.community_board_teams(id) on delete cascade,
  display_name text not null,
  role text,
  is_mvp_candidate boolean not null default true,
  is_igl_candidate boolean not null default false,
  sort_order integer not null default 0
);

create table if not exists public.community_board_votes (
  id text primary key,
  board_id text not null references public.community_boards(id) on delete cascade,
  user_id text not null references public.community_users(id) on delete cascade,
  mvp_player_id text not null references public.community_board_players(id),
  best_igl_player_id text not null references public.community_board_players(id),
  winner_team_id text not null references public.community_board_teams(id),
  created_at timestamptz default now(),
  unique (board_id, user_id)
);

create unique index if not exists community_boards_single_featured_idx
  on public.community_boards ((is_featured))
  where is_featured = true;

create or replace function public.community_board_live_guard()
returns trigger
language plpgsql
as $$
declare
  tournament_status text;
begin
  if new.is_featured = false and new.voting_state <> 'open' then
    return new;
  end if;

  select status into tournament_status
  from public.tournaments
  where id = new.tournament_id;

  if tournament_status is null then
    raise exception 'Community board tournament does not exist';
  end if;

  if tournament_status <> 'live' then
    raise exception 'Featured/open community boards require a live tournament';
  end if;

  return new;
end;
$$;

drop trigger if exists community_board_live_guard_trigger on public.community_boards;
create trigger community_board_live_guard_trigger
before insert or update on public.community_boards
for each row
execute function public.community_board_live_guard();
