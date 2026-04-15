alter table if exists public.tournaments
  add column if not exists coach text,
  add column if not exists analyst text;
