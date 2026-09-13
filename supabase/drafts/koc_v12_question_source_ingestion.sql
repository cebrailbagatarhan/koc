-- External question source registry and ingestion audit layer.
-- Builds on the bounded AI question-pool draft.

create table if not exists public.koc_question_sources (
  id uuid primary key default gen_random_uuid(),
  source_key text not null unique,
  display_name text not null,
  source_type text not null check (source_type in ('api','dataset','repository','corpus')),
  base_url text,
  license_spdx text,
  license_url text,
  attribution_template text,
  commercial_use_allowed boolean not null default false,
  derivative_use_allowed boolean not null default false,
  redistribution_allowed boolean not null default false,
  enabled boolean not null default false,
  trust_score numeric(5,2) not null default 50 check (trust_score between 0 and 100),
  daily_import_limit integer not null default 500 check (daily_import_limit between 0 and 100000),
  notes text,
  verified_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.koc_question_import_runs (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.koc_question_sources(id) on delete restrict,
  status text not null default 'queued'
    check (status in ('queued','running','completed','partial','failed','cancelled')),
  requested_limit integer not null default 100,
  fetched_count integer not null default 0,
  accepted_count integer not null default 0,
  duplicate_count integer not null default 0,
  rejected_count integer not null default 0,
  cursor_state jsonb not null default '{}'::jsonb,
  error_summary text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.koc_question_candidates
  add column if not exists source_id uuid references public.koc_question_sources(id) on delete set null,
  add column if not exists external_id text,
  add column if not exists source_url text,
  add column if not exists source_license text,
  add column if not exists attribution text,
  add column if not exists original_hash text,
  add column if not exists import_run_id uuid references public.koc_question_import_runs(id) on delete set null;

create unique index if not exists koc_candidates_source_external_unique
  on public.koc_question_candidates(source_id, external_id)
  where source_id is not null and external_id is not null;

create index if not exists koc_import_runs_source_created_idx
  on public.koc_question_import_runs(source_id, created_at desc);

alter table public.koc_question_sources enable row level security;
alter table public.koc_question_import_runs enable row level security;

create policy koc_question_sources_staff_read
on public.koc_question_sources for select to authenticated
using (private.koc_is_staff());

create policy koc_import_runs_staff_read
on public.koc_question_import_runs for select to authenticated
using (private.koc_is_staff());

revoke all on public.koc_question_sources from anon, authenticated;
revoke all on public.koc_question_import_runs from anon, authenticated;
grant select on public.koc_question_sources to authenticated;
grant select on public.koc_question_import_runs to authenticated;

create or replace function private.koc_source_can_ingest(p_source_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.koc_question_sources s
    where s.id = p_source_id
      and s.enabled
      and s.verified_at is not null
      and s.commercial_use_allowed
      and s.derivative_use_allowed
      and s.redistribution_allowed
      and s.license_spdx is not null
  );
$$;

revoke all on function private.koc_source_can_ingest(uuid) from public, anon, authenticated;
grant execute on function private.koc_source_can_ingest(uuid) to service_role;

-- Sources are intentionally disabled by default.
-- A human must verify the current license/terms before setting enabled=true.
insert into public.koc_question_sources(
  source_key, display_name, source_type, base_url, notes
)
values
  ('opentdb', 'Open Trivia DB', 'api', 'https://opentdb.com/',
   'General-knowledge supplier candidate. Verify current license/attribution and commercial redistribution terms before enabling.'),
  ('hf-turkish-education', 'Hugging Face Turkish Education Dataset', 'dataset', 'https://huggingface.co/datasets/',
   'Dataset supplier candidate. Pin exact repository/revision and verify dataset-card license before enabling.'),
  ('wikimedia-corpus', 'Wikimedia corpus', 'corpus', 'https://www.wikimedia.org/',
   'Use as grounded source material for generating original questions; preserve page/revision/license attribution.')
on conflict (source_key) do nothing;

comment on table public.koc_question_sources is
  'Allowlist of external content suppliers. Disabled until license and redistribution rights are explicitly verified.';

comment on table public.koc_question_import_runs is
  'Audit and rate-limit accounting for external dataset/API ingestion.';
