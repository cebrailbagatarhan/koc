-- Idempotent external event log for subscription/webhook processing.

create table if not exists public.koc_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  external_event_id text not null,
  event_type text,
  app_user_id text,
  payload jsonb not null,
  processing_status text not null default 'received' check (processing_status in ('received','processed','ignored','failed')),
  error_message text,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  unique (provider, external_event_id)
);

create index if not exists koc_webhook_events_status_idx
  on public.koc_webhook_events(provider, processing_status, received_at desc);

alter table public.koc_webhook_events enable row level security;

create policy koc_webhook_events_admin_read on public.koc_webhook_events
for select to authenticated using (private.koc_is_admin());

-- Browser clients never insert/update webhook rows. Edge Functions use service-role and bypass RLS.
