import { createClient } from 'jsr:@supabase/supabase-js@2';

type RequestBody = {
  questionId: string;
  selectedOptionId?: string | null;
  answerText?: string | null;
  durationMs?: number | null;
  mode?: 'practice' | 'review' | 'exam' | 'diagnostic' | 'source_studio';
};

const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
  'access-control-allow-methods': 'POST, OPTIONS',
};

function respond(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'content-type': 'application/json; charset=utf-8' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return respond({ error: 'method_not_allowed' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const authHeader = req.headers.get('authorization');
  if (!supabaseUrl || !anonKey || !serviceRoleKey || !authHeader) return respond({ error: 'unauthorized' }, 401);

  const authClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: authData, error: authError } = await authClient.auth.getUser();
  if (authError || !authData.user) return respond({ error: 'unauthorized' }, 401);
  const user = authData.user;

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return respond({ error: 'invalid_json' }, 400);
  }
  if (!body.questionId) return respond({ error: 'question_required' }, 400);

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const questionResult = await admin
    .from('koc_questions')
    .select('id,question_type,status,access_tier')
    .eq('id', body.questionId)
    .maybeSingle();
  if (questionResult.error || !questionResult.data || questionResult.data.status !== 'published') {
    return respond({ error: 'question_not_available' }, 404);
  }

  if (questionResult.data.access_tier === 'premium') {
    const entitlement = await admin
      .from('koc_entitlements')
      .select('is_active,expires_at')
      .eq('user_id', user.id)
      .eq('entitlement_key', 'premium')
      .maybeSingle();
    const active = entitlement.data?.is_active === true && (!entitlement.data.expires_at || new Date(entitlement.data.expires_at).getTime() > Date.now());
    if (!active) return respond({ error: 'premium_required' }, 402);
  }

  const answerResult = await admin
    .from('koc_question_answers')
    .select('correct_option_id,accepted_answers,explanation')
    .eq('question_id', body.questionId)
    .maybeSingle();
  if (answerResult.error || !answerResult.data) return respond({ error: 'answer_key_missing' }, 500);

  let selectedOptionId = body.selectedOptionId ?? null;
  let isCorrect = false;

  if (questionResult.data.question_type === 'multiple_choice' || questionResult.data.question_type === 'true_false') {
    if (!selectedOptionId) return respond({ error: 'selected_option_required' }, 400);
    const optionResult = await admin
      .from('koc_question_options')
      .select('id')
      .eq('id', selectedOptionId)
      .eq('question_id', body.questionId)
      .maybeSingle();
    if (!optionResult.data) return respond({ error: 'invalid_option' }, 400);
    isCorrect = selectedOptionId === answerResult.data.correct_option_id;
  } else {
    selectedOptionId = null;
    const normalized = (body.answerText ?? '').trim().toLocaleLowerCase('tr-TR');
    const accepted = Array.isArray(answerResult.data.accepted_answers)
      ? answerResult.data.accepted_answers.filter((value: unknown) => typeof value === 'string').map((value: string) => value.trim().toLocaleLowerCase('tr-TR'))
      : [];
    isCorrect = Boolean(normalized && accepted.includes(normalized));
  }

  const durationMs = typeof body.durationMs === 'number' && body.durationMs >= 0 ? Math.round(body.durationMs) : null;
  const mode = body.mode ?? 'practice';
  const attempt = await admin.from('koc_user_question_attempts').insert({
    user_id: user.id,
    question_id: body.questionId,
    selected_option_id: selectedOptionId,
    is_correct: isCorrect,
    duration_ms: durationMs,
    mode,
    verified: true,
  }).select('id').single();
  if (attempt.error) return respond({ error: 'attempt_write_failed' }, 500);

  await admin.rpc('koc_record_verified_attempt', {
    p_question_id: body.questionId,
    p_is_correct: isCorrect,
    p_duration_ms: durationMs,
  });

  const citations = await admin
    .from('koc_question_citations')
    .select('source_label,citation_text,source_chunk_id')
    .eq('question_id', body.questionId)
    .order('sort_order');

  return respond({
    ok: true,
    attemptId: attempt.data.id,
    correct: isCorrect,
    correctOptionId: answerResult.data.correct_option_id,
    explanation: answerResult.data.explanation,
    citations: citations.data ?? [],
  });
});
