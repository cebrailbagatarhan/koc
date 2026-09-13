-- Koç cloud platform foundation.
-- Intentionally namespaced with koc_ prefixes so it can coexist with other Supabase apps.

create schema if not exists private;

create table if not exists public.koc_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  role text not null default 'learner' check (role in ('learner','editor','reviewer','admin')),
  onboarding_completed boolean not null default false,
  selected_level text,
  selected_exam_track text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.koc_plan_definitions (
  key text primary key,
  title text not null,
  description text not null default '',
  entitlement_key text not null,
  limits jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.koc_entitlements (
  user_id uuid not null references auth.users(id) on delete cascade,
  entitlement_key text not null,
  source text not null check (source in ('revenuecat','manual','promo','migration')),
  is_active boolean not null default false,
  external_customer_id text,
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, entitlement_key)
);

create table if not exists public.koc_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('revenuecat','app_store','play_store','web','manual')),
  external_subscription_id text,
  product_id text not null,
  store text,
  status text not null check (status in ('trialing','active','grace_period','paused','cancelled','expired','billing_issue')),
  current_period_end timestamptz,
  will_renew boolean,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, external_subscription_id)
);

create table if not exists public.koc_usage_periods (
  user_id uuid not null references auth.users(id) on delete cascade,
  period_start date not null,
  ai_generations integer not null default 0 check (ai_generations >= 0),
  ai_input_tokens bigint not null default 0 check (ai_input_tokens >= 0),
  ai_output_tokens bigint not null default 0 check (ai_output_tokens >= 0),
  source_pages_processed integer not null default 0 check (source_pages_processed >= 0),
  source_bytes_processed bigint not null default 0 check (source_bytes_processed >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, period_start)
);

create table if not exists public.koc_exam_tracks (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  is_active boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.koc_courses (
  id uuid primary key default gen_random_uuid(),
  track_id uuid references public.koc_exam_tracks(id) on delete set null,
  level_name text not null,
  slug text not null,
  title text not null,
  description text not null default '',
  is_active boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (level_name, slug)
);

create table if not exists public.koc_topics (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.koc_courses(id) on delete cascade,
  parent_topic_id uuid references public.koc_topics(id) on delete set null,
  slug text not null,
  title text not null,
  summary text not null default '',
  curriculum_code text,
  is_active boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, slug)
);

create table if not exists public.koc_notebooks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  course_id uuid references public.koc_courses(id) on delete set null,
  topic_id uuid references public.koc_topics(id) on delete set null,
  visibility text not null default 'private' check (visibility in ('private','shared','public')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.koc_source_documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  title text not null,
  source_kind text not null check (source_kind in ('pdf','text','note','url','audio','video','other')),
  mime_type text,
  storage_path text,
  source_url text,
  sha256 text,
  byte_size bigint,
  page_count integer,
  extraction_status text not null default 'pending' check (extraction_status in ('pending','processing','ready','image_only','failed')),
  visibility text not null default 'private' check (visibility in ('private','curated','public')),
  access_tier text not null default 'free' check (access_tier in ('free','premium')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.koc_notebook_sources (
  notebook_id uuid not null references public.koc_notebooks(id) on delete cascade,
  source_id uuid not null references public.koc_source_documents(id) on delete cascade,
  is_enabled boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  primary key (notebook_id, source_id)
);

create table if not exists public.koc_source_chunks (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.koc_source_documents(id) on delete cascade,
  chunk_index integer not null,
  page_from integer,
  page_to integer,
  content text not null,
  token_count integer,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (source_id, chunk_index)
);

create table if not exists public.koc_generation_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  notebook_id uuid references public.koc_notebooks(id) on delete set null,
  kind text not null check (kind in ('answer','summary','study_guide','flashcards','quiz','questions','audio_script','other')),
  status text not null default 'queued' check (status in ('queued','running','succeeded','failed','cancelled')),
  provider text,
  model text,
  prompt_version text,
  request jsonb not null default '{}'::jsonb,
  input_tokens integer,
  output_tokens integer,
  cost_microunits bigint,
  error_code text,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.koc_generated_artifacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  notebook_id uuid references public.koc_notebooks(id) on delete cascade,
  generation_job_id uuid references public.koc_generation_jobs(id) on delete set null,
  artifact_type text not null check (artifact_type in ('answer','summary','study_guide','flashcards','quiz','questions','audio_script','other')),
  title text not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.koc_prompt_templates (
  id uuid primary key default gen_random_uuid(),
  key text not null,
  version integer not null,
  purpose text not null,
  system_prompt text not null,
  user_template text not null,
  output_schema jsonb not null default '{}'::jsonb,
  is_active boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (key, version)
);

create table if not exists public.koc_questions (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.koc_topics(id) on delete restrict,
  origin text not null default 'curated' check (origin in ('curated','ai','import','user')),
  question_type text not null default 'multiple_choice' check (question_type in ('multiple_choice','true_false','short_answer')),
  stem text not null,
  difficulty smallint not null default 2 check (difficulty between 1 and 5),
  access_tier text not null default 'free' check (access_tier in ('free','premium')),
  status text not null default 'draft' check (status in ('draft','auto_check','review','published','retired','rejected')),
  quality_score numeric(5,2) check (quality_score between 0 and 100),
  generation_job_id uuid references public.koc_generation_jobs(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  published_at timestamptz,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.koc_question_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.koc_questions(id) on delete cascade,
  option_key text not null,
  body text not null,
  sort_order integer not null default 100,
  unique (question_id, option_key)
);

create table if not exists public.koc_question_answers (
  question_id uuid primary key references public.koc_questions(id) on delete cascade,
  correct_option_id uuid references public.koc_question_options(id) on delete restrict,
  accepted_answers jsonb not null default '[]'::jsonb,
  explanation text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.koc_question_citations (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.koc_questions(id) on delete cascade,
  source_id uuid references public.koc_source_documents(id) on delete set null,
  source_chunk_id uuid references public.koc_source_chunks(id) on delete set null,
  citation_text text not null default '',
  source_label text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now()
);

create table if not exists public.koc_question_reviews (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.koc_questions(id) on delete cascade,
  reviewer_id uuid not null references auth.users(id) on delete restrict,
  verdict text not null check (verdict in ('approve','changes_requested','reject')),
  accuracy_score smallint check (accuracy_score between 1 and 5),
  clarity_score smallint check (clarity_score between 1 and 5),
  distractor_score smallint check (distractor_score between 1 and 5),
  source_support_score smallint check (source_support_score between 1 and 5),
  note text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.koc_question_versions (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.koc_questions(id) on delete cascade,
  version integer not null,
  snapshot jsonb not null,
  changed_by uuid references auth.users(id) on delete set null,
  change_note text,
  created_at timestamptz not null default now(),
  unique (question_id, version)
);

create table if not exists public.koc_question_stats (
  question_id uuid primary key references public.koc_questions(id) on delete cascade,
  attempts bigint not null default 0,
  correct_attempts bigint not null default 0,
  avg_duration_ms integer,
  discrimination numeric(8,5),
  report_count integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.koc_question_reports (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.koc_questions(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  reason text not null check (reason in ('wrong_answer','ambiguous','typo','outdated','off_topic','other')),
  note text not null default '',
  status text not null default 'open' check (status in ('open','reviewing','resolved','dismissed')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references auth.users(id) on delete set null
);

create table if not exists public.koc_user_question_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references public.koc_questions(id) on delete cascade,
  selected_option_id uuid references public.koc_question_options(id) on delete set null,
  is_correct boolean not null,
  duration_ms integer,
  mode text not null default 'practice' check (mode in ('practice','review','exam','diagnostic','source_studio')),
  answered_at timestamptz not null default now()
);

create table if not exists public.koc_content_bundles (
  id uuid primary key default gen_random_uuid(),
  bundle_key text not null,
  version integer not null,
  access_tier text not null default 'free' check (access_tier in ('free','premium')),
  status text not null default 'draft' check (status in ('draft','published','retired')),
  storage_path text not null,
  checksum_sha256 text not null,
  manifest jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (bundle_key, version)
);

create table if not exists public.koc_feature_flags (
  key text primary key,
  enabled boolean not null default false,
  rollout_percent integer not null default 100 check (rollout_percent between 0 and 100),
  config jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.koc_admin_audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

create index if not exists koc_subscriptions_user_idx on public.koc_subscriptions(user_id, status);
create index if not exists koc_topics_course_idx on public.koc_topics(course_id, sort_order);
create index if not exists koc_sources_owner_idx on public.koc_source_documents(owner_id, created_at desc);
create index if not exists koc_chunks_source_idx on public.koc_source_chunks(source_id, chunk_index);
create index if not exists koc_questions_topic_status_idx on public.koc_questions(topic_id, status, difficulty);
create index if not exists koc_questions_review_idx on public.koc_questions(status, quality_score nulls first, created_at);
create index if not exists koc_attempts_user_question_idx on public.koc_user_question_attempts(user_id, question_id, answered_at desc);
create index if not exists koc_generation_user_idx on public.koc_generation_jobs(user_id, created_at desc);
create index if not exists koc_reports_status_idx on public.koc_question_reports(status, created_at);

create or replace function private.koc_is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.koc_profiles p
    where p.id = (select auth.uid())
      and p.role in ('editor','reviewer','admin')
  );
$$;

create or replace function private.koc_has_entitlement(entitlement text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.koc_entitlements e
    where e.user_id = (select auth.uid())
      and e.entitlement_key = entitlement
      and e.is_active = true
      and (e.expires_at is null or e.expires_at > now())
  );
$$;

revoke all on function private.koc_is_staff() from public;
revoke all on function private.koc_has_entitlement(text) from public;
grant execute on function private.koc_is_staff() to anon, authenticated;
grant execute on function private.koc_has_entitlement(text) to anon, authenticated;

create or replace function public.koc_touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.koc_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.koc_profiles(id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'full_name')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists koc_on_auth_user_created on auth.users;
create trigger koc_on_auth_user_created
  after insert on auth.users
  for each row execute function public.koc_handle_new_user();

-- Add updated_at triggers to mutable entities.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'koc_profiles','koc_plan_definitions','koc_entitlements','koc_subscriptions','koc_usage_periods',
    'koc_exam_tracks','koc_courses','koc_topics','koc_notebooks','koc_source_documents',
    'koc_generated_artifacts','koc_questions','koc_question_answers','koc_question_stats'
  ]
  loop
    execute format('drop trigger if exists %I on public.%I', table_name || '_touch', table_name);
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.koc_touch_updated_at()',
      table_name || '_touch', table_name
    );
  end loop;
end $$;

insert into public.koc_plan_definitions(key, title, description, entitlement_key, limits, sort_order)
values
  ('free', 'Free', 'Temel öğrenme, tekrar ve sınırlı bulut AI kullanımı.', 'free', '{"ai_generations_per_month":12,"cloud_notebooks":1}'::jsonb, 10),
  ('premium', 'Premium', 'Tam soru bankası, yüksek AI kotası ve bulut senkronizasyonu.', 'premium', '{"ai_generations_per_month":300,"cloud_notebooks":50}'::jsonb, 20)
on conflict (key) do update set
  title = excluded.title,
  description = excluded.description,
  entitlement_key = excluded.entitlement_key,
  limits = excluded.limits,
  sort_order = excluded.sort_order;

insert into public.koc_exam_tracks(slug, title, description, sort_order)
values
  ('ilkokul', 'İlkokul', 'Temel okul dersleri', 10),
  ('ortaokul', 'Ortaokul', 'Ortaokul dersleri ve sınav temeli', 20),
  ('lise', 'Lise', 'Lise dersleri ve ileri konu çalışması', 30),
  ('ales', 'ALES', 'ALES sayısal ve sözel hazırlık', 40)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  sort_order = excluded.sort_order;

-- RLS
alter table public.koc_profiles enable row level security;
alter table public.koc_plan_definitions enable row level security;
alter table public.koc_entitlements enable row level security;
alter table public.koc_subscriptions enable row level security;
alter table public.koc_usage_periods enable row level security;
alter table public.koc_exam_tracks enable row level security;
alter table public.koc_courses enable row level security;
alter table public.koc_topics enable row level security;
alter table public.koc_notebooks enable row level security;
alter table public.koc_source_documents enable row level security;
alter table public.koc_notebook_sources enable row level security;
alter table public.koc_source_chunks enable row level security;
alter table public.koc_generation_jobs enable row level security;
alter table public.koc_generated_artifacts enable row level security;
alter table public.koc_prompt_templates enable row level security;
alter table public.koc_questions enable row level security;
alter table public.koc_question_options enable row level security;
alter table public.koc_question_answers enable row level security;
alter table public.koc_question_citations enable row level security;
alter table public.koc_question_reviews enable row level security;
alter table public.koc_question_versions enable row level security;
alter table public.koc_question_stats enable row level security;
alter table public.koc_question_reports enable row level security;
alter table public.koc_user_question_attempts enable row level security;
alter table public.koc_content_bundles enable row level security;
alter table public.koc_feature_flags enable row level security;
alter table public.koc_admin_audit_log enable row level security;

create policy koc_profiles_own_or_staff_select on public.koc_profiles
for select to authenticated
using (id = (select auth.uid()) or private.koc_is_staff());
create policy koc_profiles_own_update on public.koc_profiles
for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()) and role = (select p.role from public.koc_profiles p where p.id = (select auth.uid())));
create policy koc_profiles_staff_update on public.koc_profiles
for update to authenticated
using (private.koc_is_staff()) with check (private.koc_is_staff());

create policy koc_plans_public_read on public.koc_plan_definitions
for select to anon, authenticated using (is_active = true or private.koc_is_staff());
create policy koc_plans_staff_write on public.koc_plan_definitions
for all to authenticated using (private.koc_is_staff()) with check (private.koc_is_staff());

create policy koc_entitlements_own_or_staff_read on public.koc_entitlements
for select to authenticated using (user_id = (select auth.uid()) or private.koc_is_staff());
create policy koc_entitlements_staff_write on public.koc_entitlements
for all to authenticated using (private.koc_is_staff()) with check (private.koc_is_staff());

create policy koc_subscriptions_own_or_staff_read on public.koc_subscriptions
for select to authenticated using (user_id = (select auth.uid()) or private.koc_is_staff());
create policy koc_subscriptions_staff_write on public.koc_subscriptions
for all to authenticated using (private.koc_is_staff()) with check (private.koc_is_staff());

create policy koc_usage_own_or_staff_read on public.koc_usage_periods
for select to authenticated using (user_id = (select auth.uid()) or private.koc_is_staff());
create policy koc_usage_staff_write on public.koc_usage_periods
for all to authenticated using (private.koc_is_staff()) with check (private.koc_is_staff());

create policy koc_tracks_public_read on public.koc_exam_tracks
for select to anon, authenticated using (is_active = true or private.koc_is_staff());
create policy koc_tracks_staff_write on public.koc_exam_tracks
for all to authenticated using (private.koc_is_staff()) with check (private.koc_is_staff());

create policy koc_courses_public_read on public.koc_courses
for select to anon, authenticated using (is_active = true or private.koc_is_staff());
create policy koc_courses_staff_write on public.koc_courses
for all to authenticated using (private.koc_is_staff()) with check (private.koc_is_staff());

create policy koc_topics_public_read on public.koc_topics
for select to anon, authenticated using (is_active = true or private.koc_is_staff());
create policy koc_topics_staff_write on public.koc_topics
for all to authenticated using (private.koc_is_staff()) with check (private.koc_is_staff());

create policy koc_notebooks_owner_all on public.koc_notebooks
for all to authenticated
using (owner_id = (select auth.uid()) or private.koc_is_staff())
with check (owner_id = (select auth.uid()) or private.koc_is_staff());

create policy koc_sources_read on public.koc_source_documents
for select to anon, authenticated
using (
  owner_id = (select auth.uid())
  or private.koc_is_staff()
  or (
    visibility in ('curated','public')
    and extraction_status = 'ready'
    and (access_tier = 'free' or private.koc_has_entitlement('premium'))
  )
);
create policy koc_sources_owner_write on public.koc_source_documents
for all to authenticated
using (owner_id = (select auth.uid()) or private.koc_is_staff())
with check (owner_id = (select auth.uid()) or private.koc_is_staff());

create policy koc_notebook_sources_owner_all on public.koc_notebook_sources
for all to authenticated
using (
  exists(select 1 from public.koc_notebooks n where n.id = notebook_id and (n.owner_id = (select auth.uid()) or private.koc_is_staff()))
)
with check (
  exists(select 1 from public.koc_notebooks n where n.id = notebook_id and (n.owner_id = (select auth.uid()) or private.koc_is_staff()))
);

create policy koc_chunks_read on public.koc_source_chunks
for select to anon, authenticated
using (
  exists(
    select 1 from public.koc_source_documents s
    where s.id = source_id
      and (
        s.owner_id = (select auth.uid())
        or private.koc_is_staff()
        or (s.visibility in ('curated','public') and s.extraction_status = 'ready' and (s.access_tier = 'free' or private.koc_has_entitlement('premium')))
      )
  )
);
create policy koc_chunks_staff_write on public.koc_source_chunks
for all to authenticated using (private.koc_is_staff()) with check (private.koc_is_staff());

create policy koc_generation_owner_read on public.koc_generation_jobs
for select to authenticated using (user_id = (select auth.uid()) or private.koc_is_staff());
create policy koc_generation_owner_insert on public.koc_generation_jobs
for insert to authenticated with check (user_id = (select auth.uid()) or private.koc_is_staff());
create policy koc_generation_staff_update on public.koc_generation_jobs
for update to authenticated using (private.koc_is_staff()) with check (private.koc_is_staff());

create policy koc_artifacts_owner_all on public.koc_generated_artifacts
for all to authenticated
using (user_id = (select auth.uid()) or private.koc_is_staff())
with check (user_id = (select auth.uid()) or private.koc_is_staff());

create policy koc_prompts_staff_all on public.koc_prompt_templates
for all to authenticated using (private.koc_is_staff()) with check (private.koc_is_staff());

create policy koc_questions_public_read on public.koc_questions
for select to anon, authenticated
using (
  private.koc_is_staff()
  or (status = 'published' and (access_tier = 'free' or private.koc_has_entitlement('premium')))
);
create policy koc_questions_staff_write on public.koc_questions
for all to authenticated using (private.koc_is_staff()) with check (private.koc_is_staff());

create policy koc_options_public_read on public.koc_question_options
for select to anon, authenticated
using (
  exists(
    select 1 from public.koc_questions q
    where q.id = question_id
      and (private.koc_is_staff() or (q.status = 'published' and (q.access_tier = 'free' or private.koc_has_entitlement('premium'))))
  )
);
create policy koc_options_staff_write on public.koc_question_options
for all to authenticated using (private.koc_is_staff()) with check (private.koc_is_staff());

create policy koc_answers_staff_only on public.koc_question_answers
for all to authenticated using (private.koc_is_staff()) with check (private.koc_is_staff());

create policy koc_citations_public_read on public.koc_question_citations
for select to anon, authenticated
using (
  exists(
    select 1 from public.koc_questions q
    where q.id = question_id
      and (private.koc_is_staff() or (q.status = 'published' and (q.access_tier = 'free' or private.koc_has_entitlement('premium'))))
  )
);
create policy koc_citations_staff_write on public.koc_question_citations
for all to authenticated using (private.koc_is_staff()) with check (private.koc_is_staff());

create policy koc_reviews_staff_all on public.koc_question_reviews
for all to authenticated using (private.koc_is_staff()) with check (private.koc_is_staff());
create policy koc_versions_staff_all on public.koc_question_versions
for all to authenticated using (private.koc_is_staff()) with check (private.koc_is_staff());
create policy koc_stats_read on public.koc_question_stats
for select to authenticated using (private.koc_is_staff());
create policy koc_stats_staff_write on public.koc_question_stats
for all to authenticated using (private.koc_is_staff()) with check (private.koc_is_staff());

create policy koc_reports_user_insert on public.koc_question_reports
for insert to authenticated with check (user_id = (select auth.uid()));
create policy koc_reports_own_or_staff_read on public.koc_question_reports
for select to authenticated using (user_id = (select auth.uid()) or private.koc_is_staff());
create policy koc_reports_staff_update on public.koc_question_reports
for update to authenticated using (private.koc_is_staff()) with check (private.koc_is_staff());

create policy koc_attempts_owner_select on public.koc_user_question_attempts
for select to authenticated using (user_id = (select auth.uid()) or private.koc_is_staff());
create policy koc_attempts_owner_insert on public.koc_user_question_attempts
for insert to authenticated with check (user_id = (select auth.uid()));

create policy koc_bundles_public_read on public.koc_content_bundles
for select to anon, authenticated
using (
  private.koc_is_staff()
  or (status = 'published' and (access_tier = 'free' or private.koc_has_entitlement('premium')))
);
create policy koc_bundles_staff_write on public.koc_content_bundles
for all to authenticated using (private.koc_is_staff()) with check (private.koc_is_staff());

create policy koc_flags_read on public.koc_feature_flags
for select to authenticated using (true);
create policy koc_flags_staff_write on public.koc_feature_flags
for all to authenticated using (private.koc_is_staff()) with check (private.koc_is_staff());

create policy koc_audit_staff_read on public.koc_admin_audit_log
for select to authenticated using (private.koc_is_staff());
create policy koc_audit_staff_insert on public.koc_admin_audit_log
for insert to authenticated with check (private.koc_is_staff() and actor_id = (select auth.uid()));
