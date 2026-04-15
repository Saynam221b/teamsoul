insert into public.tournaments (
  id,
  name,
  year,
  month,
  tier,
  placement,
  approx_price,
  is_win,
  status,
  coach,
  analyst,
  updated_at
)
values (
  'bgms-s3-2024',
  'BGMI Masters Series Season 3',
  2024,
  8,
  'A-Tier',
  '1',
  65515,
  true,
  'completed',
  'Soul Ayogi',
  null,
  now()
)
on conflict (id)
do update set
  name = excluded.name,
  year = excluded.year,
  month = excluded.month,
  tier = excluded.tier,
  placement = excluded.placement,
  approx_price = excluded.approx_price,
  is_win = excluded.is_win,
  status = excluded.status,
  coach = excluded.coach,
  analyst = excluded.analyst,
  updated_at = now();

insert into public.tournament_rosters (id, tournament_id, player_id, created_at)
values
  ('tour_roster__bgms-s3-2024__manya', 'bgms-s3-2024', 'manya', now()),
  ('tour_roster__bgms-s3-2024__nakul', 'bgms-s3-2024', 'nakul', now()),
  ('tour_roster__bgms-s3-2024__jokerr', 'bgms-s3-2024', 'jokerr', now()),
  ('tour_roster__bgms-s3-2024__rony', 'bgms-s3-2024', 'rony', now()),
  ('tour_roster__bgms-s3-2024__spower', 'bgms-s3-2024', 'spower', now())
on conflict (id)
do nothing;
