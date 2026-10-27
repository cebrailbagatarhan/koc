-- Koç V12 AI question lifecycle and bounded shared question pool.
-- Draft schema extension: apply only after the V8 platform foundation exists.
-- Do not apply to an unrelated Supabase project.

create table if not exists public.koc_question_pool_policies (
  topic_id uuid primary key references public.koc_topics(id) on delete cascade,
  max_published integer not null default 300 check (max_published between 20 and 2000),
  max_candidates integer not null default 1000 check (max_candidates between 50 and 10000),
  min_quality_score numeric(5,2) not null default 88 check (min_quality_score between 0 and 100),
  auto_publish_score numeric(5,2) not null default 95 check (auto_publish_score between 0 and 100),
  min_novelty_score numeric(5,4) not null default 0.82 check (min_novelty_score between 0 and 1),
  replacement_margin numeric(5,2) not null default 3 check (replacement_margin between 0 and 25),
  draft_retention_days integer not null default 14 check (draft_retention_days between 1 and 90),
  rejected_retention_days integer not null default 30 check (rejected_retention_days between 1 and 365),
  updated_at timestamptz not null default now()
);

create table if not exists public.koc_question_candidates (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.koc_topics(id) on delete cascade,
  generation_job_id uuid references public.koc_generation_jobs(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  model text,
  prompt_version text,
  fingerprint text not null,
  stem text not null,
  difficulty smallint not null default 2 check (difficulty between 1 and 5),
  options jsonb not null,
  correct_option_index smallint not null check (correct_option_index between 0 and 9),
  explanation text not null default '',
  citations jsonb not null default '[]'::jsonb,
  quality_score numeric(5,2) check (quality_score between 0 and 100),
  novelty_score numeric(5,4) check (novelty_score between 0 and 1),
  grounded boolean not null default false,
  validator_result jsonb not null default '{}'::jsonb,
  status text not null default 'generated'
    check (status in ('generated','validated','review','ready','published','rejected','expired')),
  published_question_id uuid references public.koc_questions(id) on delete set null,
  rejection_reason text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  validated_at timestamptz,
  published_at timestamptz,
  unique (topic_id, fingerprint)
);

create index if not exists koc_question_candidates_topic_status_idx
  on public.koc_question_candidates(topic_id, status, quality_score desc, created_at);

create index if not exists koc_question_candidates_expiry_idx
  on public.koc_question_candidates(status, expires_at)
  where status in ('generated','validated','review','rejected');

alter table public.koc_questions
  add column if not exists utility_score numeric(8,3) not null default 50,
  add column if not exists last_served_at timestamptz,
  add column if not exists retired_reason text,
  add column if not exists fingerprint text;

create unique index if not exists koc_questions_topic_fingerprint_unique
  on public.koc_questions(topic_id, fingerprint)
  where fingerprint is not null and status <> 'rejected';

create index if not exists koc_questions_pool_rank_idx
  on public.koc_questions(topic_id, status, utility_score asc, quality_score asc, updated_at asc);

insert into public.koc_question_pool_policies(topic_id)
select id from public.koc_topics
on conflict (topic_id) do nothing;

alter table public.koc_question_pool_policies enable row level security;
alter table public.koc_question_candidates enable row level security;

create policy koc_pool_policies_staff_read
on public.koc_question_pool_policies
for select to authenticated
using (private.koc_is_staff());

create policy koc_pool_policies_staff_write
on public.koc_question_pool_policies
for all to authenticated
using (private.koc_is_staff())
with check (private.koc_is_staff());

create policy koc_candidates_staff_read
on public.koc_question_candidates
for select to authenticated
using (private.koc_is_staff());

-- Candidate writes stay server-only. The mobile client never inserts model output directly.
revoke all on public.koc_question_candidates from anon, authenticated;
revoke all on public.koc_question_pool_policies from anon;
grant select on public.koc_question_pool_policies to authenticated;
grant select on public.koc_question_candidates to authenticated;

create or replace function private.koc_candidate_admission_score(
  p_quality numeric,
  p_novelty numeric,
  p_grounded boolean
)
returns numeric
language sql
immutable
set search_path = ''
as $$
  select
    coalesce(p_quality, 0) * 0.70
    + coalesce(p_novelty, 0) * 100 * 0.20
    + case when p_grounded then 10 else 0 end;
$$;

create or replace function private.koc_publish_question_candidate(p_candidate_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_candidate public.koc_question_candidates%rowtype;
  v_policy public.koc_question_pool_policies%rowtype;
  v_published_count integer;
  v_lowest public.koc_questions%rowtype;
  v_candidate_score numeric;
  v_question_id uuid;
  v_option jsonb;
  v_option_index integer := 0;
  v_option_id uuid;
  v_correct_option_id uuid;
begin
  select * into v_candidate
  from public.koc_question_candidates
  where id = p_candidate_id
  for update;

  if v_candidate.id is null then
    raise exception 'candidate_not_found';
  end if;

  if v_candidate.status not in ('validated','ready','review') then
    raise exception 'candidate_not_publishable';
  end if;

  select * into v_policy
  from public.koc_question_pool_policies
  where topic_id = v_candidate.topic_id
  for update;

  if v_policy.topic_id is null then
    insert into public.koc_question_pool_policies(topic_id)
    values (v_candidate.topic_id)
    returning * into v_policy;
  end if;

  if coalesce(v_candidate.quality_score, 0) < v_policy.min_quality_score then
    raise exception 'quality_below_threshold';
  end if;

  if coalesce(v_candidate.novelty_score, 0) < v_policy.min_novelty_score then
    raise exception 'novelty_below_threshold';
  end if;

  if not v_candidate.grounded then
    raise exception 'candidate_not_grounded';
  end if;

  if jsonb_typeof(v_candidate.options) <> 'array'
     or jsonb_array_length(v_candidate.options) <> 4
     or v_candidate.correct_option_index < 0
     or v_candidate.correct_option_index >= jsonb_array_length(v_candidate.options) then
    raise exception 'invalid_options';
  end if;

  if exists (
    select 1
    from public.koc_questions q
    where q.topic_id = v_candidate.topic_id
      and q.fingerprint = v_candidate.fingerprint
      and q.status <> 'rejected'
  ) then
    update public.koc_question_candidates
    set status = 'rejected',
        rejection_reason = 'duplicate_fingerprint'
    where id = p_candidate_id;

    return jsonb_build_object('published', false, 'reason', 'duplicate');
  end if;

  select count(*) into v_published_count
  from public.koc_questions
  where topic_id = v_candidate.topic_id
    and status = 'published';

  v_candidate_score := private.koc_candidate_admission_score(
    v_candidate.quality_score,
    v_candidate.novelty_score,
    v_candidate.grounded
  );

  if v_published_count >= v_policy.max_published then
    select * into v_lowest
    from public.koc_questions
    where topic_id = v_candidate.topic_id
      and status = 'published'
    order by utility_score asc, quality_score asc nulls first, updated_at asc
    limit 1
    for update;

    if v_lowest.id is null
       or v_candidate_score < (coalesce(v_lowest.utility_score, 0) + v_policy.replacement_margin) then
      update public.koc_question_candidates
      set status = 'rejected',
          rejection_reason = 'pool_full_not_better'
      where id = p_candidate_id;

      return jsonb_build_object('published', false, 'reason', 'pool_full');
    end if;

    update public.koc_questions
    set status = 'retired',
        retired_reason = 'replaced_by_higher_utility_ai_question',
        updated_at = now()
    where id = v_lowest.id;
  end if;

  insert into public.koc_questions(
    topic_id,
    origin,
    question_type,
    stem,
    difficulty,
    access_tier,
    status,
    quality_score,
    generation_job_id,
    created_by,
    published_at,
    utility_score,
    fingerprint
  )
  values (
    v_candidate.topic_id,
    'ai',
    'multiple_choice',
    v_candidate.stem,
    v_candidate.difficulty,
    'free',
    'published',
    v_candidate.quality_score,
    v_candidate.generation_job_id,
    v_candidate.created_by,
    now(),
    v_candidate_score,
    v_candidate.fingerprint
  )
  returning id into v_question_id;

  for v_option in
    select value from jsonb_array_elements(v_candidate.options)
  loop
    insert into public.koc_question_options(question_id, option_key, body, sort_order)
    values (
      v_question_id,
      chr(65 + v_option_index),
      trim(both '"' from v_option::text),
      (v_option_index + 1) * 10
    )
    returning id into v_option_id;

    if v_option_index = v_candidate.correct_option_index then
      v_correct_option_id := v_option_id;
    end if;

    v_option_index := v_option_index + 1;
  end loop;

  insert into public.koc_question_answers(
    question_id,
    correct_option_id,
    explanation
  )
  values (
    v_question_id,
    v_correct_option_id,
    v_candidate.explanation
  );

  update public.koc_question_candidates
  set status = 'published',
      published_question_id = v_question_id,
      published_at = now()
  where id = p_candidate_id;

  return jsonb_build_object(
    'published', true,
    'question_id', v_question_id,
    'pool_count_before', v_published_count
  );
end;
$$;

revoke all on function private.koc_publish_question_candidate(uuid) from public, anon, authenticated;
grant execute on function private.koc_publish_question_candidate(uuid) to service_role;

create or replace function private.koc_prune_question_pipeline()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_expired integer := 0;
  v_deleted integer := 0;
begin
  update public.koc_question_candidates c
  set status = 'expired'
  from public.koc_question_pool_policies p
  where p.topic_id = c.topic_id
    and c.status in ('generated','validated','review')
    and c.created_at < now() - make_interval(days => p.draft_retention_days);

  get diagnostics v_expired = row_count;

  delete from public.koc_question_candidates c
  using public.koc_question_pool_policies p
  where p.topic_id = c.topic_id
    and c.status in ('rejected','expired')
    and c.created_at < now() - make_interval(days => p.rejected_retention_days);

  get diagnostics v_deleted = row_count;

  return jsonb_build_object(
    'expired', v_expired,
    'deleted', v_deleted
  );
end;
$$;

revoke all on function private.koc_prune_question_pipeline() from public, anon, authenticated;
grant execute on function private.koc_prune_question_pipeline() to service_role;

comment on table public.koc_question_candidates is
  'Short-lived AI question staging area. Only admitted questions enter koc_questions.';

comment on table public.koc_question_pool_policies is
  'Per-topic capacity and quality thresholds for the shared published question pool.';

-- Recommended scheduling after enabling Supabase Cron:
-- select cron.schedule(
--   'koc-prune-question-pipeline',
--   '17 3 * * *',
--   $$select private.koc_prune_question_pipeline();$$
-- );
