create table if not exists public.community_posts (
  id text primary key,
  author_user_id text not null references public.community_users(id) on delete cascade,
  body text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.community_post_reactions (
  id text primary key,
  post_id text not null references public.community_posts(id) on delete cascade,
  user_id text not null references public.community_users(id) on delete cascade,
  reaction_type text not null check (reaction_type in ('like', 'dislike')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (post_id, user_id)
);

create index if not exists community_posts_created_at_idx
  on public.community_posts (created_at desc);

create index if not exists community_post_reactions_post_id_idx
  on public.community_post_reactions (post_id);
