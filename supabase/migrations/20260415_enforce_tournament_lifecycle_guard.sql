-- Normalize invalid non-completed rows before applying strict lifecycle constraints.
update public.tournaments
set is_win = false
where status in ('upcoming', 'live')
  and coalesce(is_win, false) = true;

update public.tournaments
set placement = null
where status in ('upcoming', 'live')
  and placement is not null;

alter table public.tournaments
  drop constraint if exists tournaments_non_completed_results_check;

alter table public.tournaments
  add constraint tournaments_non_completed_results_check check (
    status = 'completed'
    or (coalesce(is_win, false) = false and placement is null)
  );
