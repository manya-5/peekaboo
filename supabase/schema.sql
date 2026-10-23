-- Peekaboo schema. Single profile for now; everything hangs off profile_id so
-- auth can be added later by pointing profile.id at auth.users.

create extension if not exists pgcrypto;

create table if not exists profile (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  lat double precision,
  lng double precision,
  timezone text not null default 'America/New_York',
  shared_context text,               -- only what she chose to tell Boo
  sass_level smallint not null default 2 check (sass_level between 0 and 3),
  quiet_from time,
  quiet_to time,
  personal_theme text,
  created_at timestamptz not null default now()
);

create table if not exists contests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  theme text not null,
  description text,
  deadline date not null,
  url text,
  is_sample boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists spots (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profile(id) on delete cascade,
  date date not null,
  title text not null,
  spotting text,
  habitat text not null,
  best_from time not null,
  best_to time not null,
  nudge text,
  source text not null default 'daily' check (source in ('daily', 'contest', 'personal')),
  contest_id uuid references contests(id) on delete set null,
  status text not null default 'active' check (status in ('active', 'swapped', 'skipped')),
  created_at timestamptz not null default now()
);
create index if not exists spots_profile_date on spots (profile_id, date, created_at desc);

create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profile(id) on delete cascade,
  taken_at timestamptz not null default now(),
  storage_path text not null,
  spot_id uuid references spots(id) on delete set null,  -- null means "just shot something"
  what text,
  tags text[] not null default '{}',
  matches_spot boolean,
  boo_reaction text[],
  craft_note text,
  repeat_of uuid[] not null default '{}',
  kept boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists photos_profile_taken on photos (profile_id, kept, taken_at desc);

create table if not exists contest_matches (
  photo_id uuid not null references photos(id) on delete cascade,
  contest_id uuid not null references contests(id) on delete cascade,
  reason text,
  confidence real,
  created_at timestamptz not null default now(),
  primary key (photo_id, contest_id)
);

-- Row level security on, with no public policies: only the server (service
-- role) reads and writes. Add per-user policies when login arrives.
alter table profile enable row level security;
alter table contests enable row level security;
alter table spots enable row level security;
alter table photos enable row level security;
alter table contest_matches enable row level security;

-- Private bucket; the app hands out short-lived signed URLs.
insert into storage.buckets (id, name, public)
values ('photos', 'photos', false)
on conflict (id) do nothing;
