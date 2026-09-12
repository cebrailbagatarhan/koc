-- Tighten role boundaries after the base Koç platform migration.

create or replace function private.koc_is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.koc_profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  );
$$;

create or replace function private.koc_can_edit_content()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.koc_profiles p
    where p.id = (select auth.uid()) and p.role in ('editor','admin')
  );
$$;

create or replace function private.koc_can_review()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.koc_profiles p
    where p.id = (select auth.uid()) and p.role in ('reviewer','admin')
  );
$$;

revoke all on function private.koc_is_admin() from public;
revoke all on function private.koc_can_edit_content() from public;
revoke all on function private.koc_can_review() from public;
grant execute on function private.koc_is_admin() to authenticated;
grant execute on function private.koc_can_edit_content() to authenticated;
grant execute on function private.koc_can_review() to authenticated;

-- A learner may edit their own profile fields, but may never change their own role.
drop policy if exists koc_profiles_own_update on public.koc_profiles;
create policy koc_profiles_own_update on public.koc_profiles
for update to authenticated
using (id = (select auth.uid()))
with check (
  id = (select auth.uid())
  and role = (select p.role from public.koc_profiles p where p.id = (select auth.uid()))
);

drop policy if exists koc_profiles_staff_update on public.koc_profiles;
create policy koc_profiles_admin_update on public.koc_profiles
for update to authenticated
using (private.koc_is_admin())
with check (private.koc_is_admin());

-- Billing, entitlements, plan limits and feature rollout are admin/service-role concerns.
drop policy if exists koc_plans_staff_write on public.koc_plan_definitions;
create policy koc_plans_admin_write on public.koc_plan_definitions
for all to authenticated using (private.koc_is_admin()) with check (private.koc_is_admin());

drop policy if exists koc_entitlements_staff_write on public.koc_entitlements;
create policy koc_entitlements_admin_write on public.koc_entitlements
for all to authenticated using (private.koc_is_admin()) with check (private.koc_is_admin());

drop policy if exists koc_subscriptions_staff_write on public.koc_subscriptions;
create policy koc_subscriptions_admin_write on public.koc_subscriptions
for all to authenticated using (private.koc_is_admin()) with check (private.koc_is_admin());

drop policy if exists koc_usage_staff_write on public.koc_usage_periods;
create policy koc_usage_admin_write on public.koc_usage_periods
for all to authenticated using (private.koc_is_admin()) with check (private.koc_is_admin());

drop policy if exists koc_flags_staff_write on public.koc_feature_flags;
create policy koc_flags_admin_write on public.koc_feature_flags
for all to authenticated using (private.koc_is_admin()) with check (private.koc_is_admin());

-- Curriculum/catalog and question authoring: editor or admin.
drop policy if exists koc_tracks_staff_write on public.koc_exam_tracks;
create policy koc_tracks_editor_write on public.koc_exam_tracks
for all to authenticated using (private.koc_can_edit_content()) with check (private.koc_can_edit_content());

drop policy if exists koc_courses_staff_write on public.koc_courses;
create policy koc_courses_editor_write on public.koc_courses
for all to authenticated using (private.koc_can_edit_content()) with check (private.koc_can_edit_content());

drop policy if exists koc_topics_staff_write on public.koc_topics;
create policy koc_topics_editor_write on public.koc_topics
for all to authenticated using (private.koc_can_edit_content()) with check (private.koc_can_edit_content());

drop policy if exists koc_questions_staff_write on public.koc_questions;
create policy koc_questions_editor_write on public.koc_questions
for all to authenticated using (private.koc_can_edit_content()) with check (private.koc_can_edit_content());

drop policy if exists koc_options_staff_write on public.koc_question_options;
create policy koc_options_editor_write on public.koc_question_options
for all to authenticated using (private.koc_can_edit_content()) with check (private.koc_can_edit_content());

drop policy if exists koc_answers_staff_only on public.koc_question_answers;
create policy koc_answers_editor_all on public.koc_question_answers
for all to authenticated using (private.koc_can_edit_content()) with check (private.koc_can_edit_content());

drop policy if exists koc_citations_staff_write on public.koc_question_citations;
create policy koc_citations_editor_write on public.koc_question_citations
for all to authenticated using (private.koc_can_edit_content()) with check (private.koc_can_edit_content());

-- Reviewers can inspect answer keys and write review rubrics, but not publish/edit questions.
create policy koc_answers_reviewer_read on public.koc_question_answers
for select to authenticated using (private.koc_can_review());

drop policy if exists koc_reviews_staff_all on public.koc_question_reviews;
create policy koc_reviews_reviewer_read on public.koc_question_reviews
for select to authenticated using (private.koc_can_review() or private.koc_can_edit_content());
create policy koc_reviews_reviewer_insert on public.koc_question_reviews
for insert to authenticated with check (reviewer_id = (select auth.uid()) and private.koc_can_review());
create policy koc_reviews_admin_update on public.koc_question_reviews
for update to authenticated using (private.koc_is_admin()) with check (private.koc_is_admin());
create policy koc_reviews_admin_delete on public.koc_question_reviews
for delete to authenticated using (private.koc_is_admin());

-- Version history and content bundles are authored by editors/admins.
drop policy if exists koc_versions_staff_all on public.koc_question_versions;
create policy koc_versions_staff_read on public.koc_question_versions
for select to authenticated using (private.koc_is_staff());
create policy koc_versions_editor_write on public.koc_question_versions
for insert to authenticated with check (private.koc_can_edit_content());

drop policy if exists koc_bundles_staff_write on public.koc_content_bundles;
create policy koc_bundles_editor_write on public.koc_content_bundles
for all to authenticated using (private.koc_can_edit_content()) with check (private.koc_can_edit_content());

-- Only admins can read the complete audit stream. Staff may append their own events.
drop policy if exists koc_audit_staff_read on public.koc_admin_audit_log;
create policy koc_audit_admin_read on public.koc_admin_audit_log
for select to authenticated using (private.koc_is_admin());
