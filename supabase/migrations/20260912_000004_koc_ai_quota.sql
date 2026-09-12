-- Server-only atomic quota reservation for AI generation.

create or replace function public.koc_reserve_ai_generation(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_plan text := 'free';
  v_limit integer := 0;
  v_period date := date_trunc('month', now())::date;
  v_used integer;
begin
  if exists (
    select 1 from public.koc_entitlements e
    where e.user_id = p_user_id
      and e.entitlement_key = 'premium'
      and e.is_active = true
      and (e.expires_at is null or e.expires_at > now())
  ) then
    v_plan := 'premium';
  end if;

  select coalesce((p.limits ->> 'ai_generations_per_month')::integer, 0)
  into v_limit
  from public.koc_plan_definitions p
  where p.key = v_plan and p.is_active = true;

  if v_limit <= 0 then
    return jsonb_build_object('allowed', false, 'plan', v_plan, 'limit', v_limit, 'used', 0);
  end if;

  insert into public.koc_usage_periods(user_id, period_start, ai_generations)
  values (p_user_id, v_period, 0)
  on conflict (user_id, period_start) do nothing;

  update public.koc_usage_periods
  set ai_generations = ai_generations + 1,
      updated_at = now()
  where user_id = p_user_id
    and period_start = v_period
    and ai_generations < v_limit
  returning ai_generations into v_used;

  if v_used is null then
    select ai_generations into v_used
    from public.koc_usage_periods
    where user_id = p_user_id and period_start = v_period;
    return jsonb_build_object('allowed', false, 'plan', v_plan, 'limit', v_limit, 'used', coalesce(v_used, 0));
  end if;

  return jsonb_build_object('allowed', true, 'plan', v_plan, 'limit', v_limit, 'used', v_used);
end;
$$;

create or replace function public.koc_record_ai_usage(
  p_user_id uuid,
  p_input_tokens integer,
  p_output_tokens integer
)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.koc_usage_periods(user_id, period_start, ai_input_tokens, ai_output_tokens)
  values (
    p_user_id,
    date_trunc('month', now())::date,
    greatest(coalesce(p_input_tokens, 0), 0),
    greatest(coalesce(p_output_tokens, 0), 0)
  )
  on conflict (user_id, period_start) do update set
    ai_input_tokens = public.koc_usage_periods.ai_input_tokens + excluded.ai_input_tokens,
    ai_output_tokens = public.koc_usage_periods.ai_output_tokens + excluded.ai_output_tokens,
    updated_at = now();
$$;

revoke all on function public.koc_reserve_ai_generation(uuid) from public, anon, authenticated;
revoke all on function public.koc_record_ai_usage(uuid, integer, integer) from public, anon, authenticated;
grant execute on function public.koc_reserve_ai_generation(uuid) to service_role;
grant execute on function public.koc_record_ai_usage(uuid, integer, integer) to service_role;
