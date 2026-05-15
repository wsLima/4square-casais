-- ============================================================
-- Execute este SQL no Supabase Dashboard → SQL Editor
-- ============================================================

-- Sessão (controlada pelo host)
create table if not exists public.sessions (
  id          text    primary key,
  started     boolean not null default false,
  current_sit integer not null default 0,
  phase       text    not null default 'waiting'
);

-- Criar sessão padrão
insert into public.sessions (id) values ('main') on conflict (id) do nothing;

-- Casais participantes
create table if not exists public.couples (
  id         text        primary key,
  name       text        not null,
  created_at timestamptz not null default now()
);

-- Votos (um por casal por situação)
create table if not exists public.votes (
  couple_id text not null,
  sit_key   text not null,
  vote      text not null,
  primary key (couple_id, sit_key)
);

-- Row Level Security (política aberta — app fechado por convite)
alter table public.sessions enable row level security;
alter table public.couples  enable row level security;
alter table public.votes    enable row level security;

create policy "acesso aberto" on public.sessions for all using (true) with check (true);
create policy "acesso aberto" on public.couples  for all using (true) with check (true);
create policy "acesso aberto" on public.votes    for all using (true) with check (true);

-- Habilitar Realtime nas três tabelas
alter publication supabase_realtime add table public.sessions;
alter publication supabase_realtime add table public.couples;
alter publication supabase_realtime add table public.votes;
