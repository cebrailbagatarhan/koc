-- Guardrails for profile self-updates, AI provenance and verified question attempts.

create or replace function private.koc_current_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select p.role from public.koc_profiles p where p.id = (select auth.uid());
$$;

revoke all on function private.koc_current_role() from public;
grant execute on function private.koc_current_role() to authenticated;

drop policy if exists koc_profiles_own_update on public.koc_profiles;
create policy koc_profiles_own_update on public.koc_profiles
for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()) and role = private.koc_current_role());

-- AI job/artifact records are written by server functions, not forged by clients.
drop policy if exists koc_generation_owner_insert on public.koc_generation_jobs;

drop policy if exists koc_artifacts_owner_all on public.koc_generated_artifacts;
create policy koc_artifacts_owner_read on public.koc_generated_artifacts
for select to authenticated using (user_id = (select auth.uid()) or private.koc_is_staff());
create policy koc_artifacts_owner_delete on public.koc_generated_artifacts
for delete to authenticated using (user_id = (select auth.uid()) or private.koc_is_admin());

alter table public.koc_user_question_attempts
  add column if not exists verified boolean not null default false;

drop policy if exists koc_attempts_owner_insert on public.koc_user_question_attempts;
create policy koc_attempts_owner_insert_unverified on public.koc_user_question_attempts
for insert to authenticated
with check (user_id = (select auth.uid()) and verified = false);

create or replace function public.koc_record_verified_attempt(
  p_question_id uuid,
  p_is_correct boolean,
  p_duration_ms integer
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.koc_question_stats(question_id, attempts, correct_attempts, avg_duration_ms)
  values (
    p_question_id,
    1,
    case when p_is_correct then 1 else 0 end,
    case when p_duration_ms is null or p_duration_ms < 0 then null else p_duration_ms end
  )
  on conflict (question_id) do update set
    avg_duration_ms = case
      when excluded.avg_duration_ms is null then public.koc_question_stats.avg_duration_ms
      when public.koc_question_stats.avg_duration_ms is null then excluded.avg_duration_ms
      else round((public.koc_question_stats.avg_duration_ms * public.koc_question_stats.attempts + excluded.avg_duration_ms)::numeric / (public.koc_question_stats.attempts + 1))::integer
    end,
    attempts = public.koc_question_stats.attempts + 1,
    correct_attempts = public.koc_question_stats.correct_attempts + case when p_is_correct then 1 else 0 end,
    updated_at = now();
end;
$$;

revoke all on function public.koc_record_verified_attempt(uuid, boolean, integer) from public, anon, authenticated;
grant execute on function public.koc_record_verified_attempt(uuid, boolean, integer) to service_role;
