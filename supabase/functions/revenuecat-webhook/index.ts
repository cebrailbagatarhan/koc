import { createClient } from 'jsr:@supabase/supabase-js@2';

type RevenueCatEvent = {
  id?: string;
  type?: string;
  app_user_id?: string;
  original_app_user_id?: string;
  aliases?: string[];
  entitlement_ids?: string[] | null;
  product_id?: string | null;
  store?: string | null;
  environment?: string | null;
  original_transaction_id?: string | null;
  transaction_id?: string | null;
  expiration_at_ms?: number | null;
  period_type?: string | null;
  cancel_reason?: string | null;
  expiration_reason?: string | null;
};

type RevenueCatPayload = {
  api_version?: string;
  event?: RevenueCatEvent;
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8' },
});

function isUuid(value?: string | null) {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
}

function resolveUserId(event: RevenueCatEvent) {
  const candidates = [event.app_user_id, event.original_app_user_id, ...(event.aliases ?? [])];
  return candidates.find(isUuid) ?? null;
}

function subscriptionStatus(type?: string) {
  switch (type) {
    case 'INITIAL_PURCHASE':
    case 'RENEWAL':
    case 'UNCANCELLATION':
    case 'SUBSCRIPTION_EXTENDED':
    case 'PRODUCT_CHANGE':
      return 'active';
    case 'CANCELLATION':
      return 'cancelled';
    case 'BILLING_ISSUE':
      return 'billing_issue';
    case 'SUBSCRIPTION_PAUSED':
      return 'paused';
    case 'EXPIRATION':
    case 'REFUND':
      return 'expired';
    default:
      return 'active';
  }
}

function entitlementIsActive(event: RevenueCatEvent) {
  if (event.type === 'EXPIRATION' || event.type === 'REFUND' || event.type === 'SUBSCRIPTION_PAUSED') return false;
  if (event.expiration_at_ms == null) return true;
  return event.expiration_at_ms > Date.now();
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const expectedAuth = Deno.env.get('REVENUECAT_WEBHOOK_AUTH');
  if (!expectedAuth || req.headers.get('authorization') !== expectedAuth) {
    return json({ error: 'unauthorized' }, 401);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) return json({ error: 'server_not_configured' }, 500);

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let payload: RevenueCatPayload;
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  const event = payload.event;
  if (!event?.id || !event.type) return json({ error: 'invalid_event' }, 400);

  const insertEvent = await admin.from('koc_webhook_events').insert({
    provider: 'revenuecat',
    external_event_id: event.id,
    event_type: event.type,
    app_user_id: event.app_user_id ?? null,
    payload,
  });

  if (insertEvent.error) {
    if (insertEvent.error.code === '23505') return json({ ok: true, duplicate: true });
    return json({ error: 'event_log_failed' }, 500);
  }

  const mark = async (processing_status: 'processed' | 'ignored' | 'failed', error_message?: string) => {
    await admin
      .from('koc_webhook_events')
      .update({ processing_status, error_message: error_message ?? null, processed_at: new Date().toISOString() })
      .eq('provider', 'revenuecat')
      .eq('external_event_id', event.id!);
  };

  const userId = resolveUserId(event);
  if (!userId) {
    await mark('ignored', 'No Supabase UUID found in app_user_id/original_app_user_id/aliases.');
    return json({ ok: true, ignored: 'unmapped_user' });
  }

  const premiumEntitlement = Deno.env.get('REVENUECAT_PREMIUM_ENTITLEMENT') ?? 'premium';
  const entitlementIds = event.entitlement_ids ?? [];
  const touchesPremium = entitlementIds.includes(premiumEntitlement);

  try {
    const externalSubscriptionId = event.original_transaction_id ?? event.transaction_id ?? event.id;
    const expiresAt = event.expiration_at_ms ? new Date(event.expiration_at_ms).toISOString() : null;

    if (event.product_id) {
      const subResult = await admin.from('koc_subscriptions').upsert({
        user_id: userId,
        provider: 'revenuecat',
        external_subscription_id: externalSubscriptionId,
        product_id: event.product_id,
        store: event.store ?? null,
        status: subscriptionStatus(event.type),
        current_period_end: expiresAt,
        will_renew: !['CANCELLATION', 'EXPIRATION', 'REFUND', 'SUBSCRIPTION_PAUSED'].includes(event.type),
        metadata: {
          environment: event.environment ?? null,
          period_type: event.period_type ?? null,
          cancel_reason: event.cancel_reason ?? null,
          expiration_reason: event.expiration_reason ?? null,
          revenuecat_event_id: event.id,
        },
      }, { onConflict: 'provider,external_subscription_id' });
      if (subResult.error) throw subResult.error;
    }

    if (touchesPremium) {
      const entitlementResult = await admin.from('koc_entitlements').upsert({
        user_id: userId,
        entitlement_key: 'premium',
        source: 'revenuecat',
        is_active: entitlementIsActive(event),
        external_customer_id: event.app_user_id ?? userId,
        expires_at: expiresAt,
        metadata: {
          product_id: event.product_id ?? null,
          store: event.store ?? null,
          revenuecat_entitlement_id: premiumEntitlement,
          revenuecat_event_id: event.id,
        },
      }, { onConflict: 'user_id,entitlement_key' });
      if (entitlementResult.error) throw entitlementResult.error;
    }

    await mark('processed');
    return json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown_processing_error';
    await mark('failed', message.slice(0, 500));
    return json({ error: 'processing_failed' }, 500);
  }
});
