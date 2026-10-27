import { createClient } from 'jsr:@supabase/supabase-js@2';

type GenerationKind = 'answer' | 'summary' | 'study_guide' | 'flashcards' | 'quiz' | 'questions';
type RequestBody = {
  notebookId: string;
  kind: GenerationKind;
  instruction?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  count?: number;
};

type Chunk = {
  id: string;
  source_id: string;
  chunk_index: number;
  page_from: number | null;
  page_to: number | null;
  content: string;
  koc_source_documents?: { title?: string } | null;
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

function stripJsonFence(value: string) {
  return value.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
}

function collectCitationIds(value: unknown, output: string[] = []): string[] {
  if (Array.isArray(value)) {
    for (const item of value) collectCitationIds(item, output);
    return output;
  }
  if (!value || typeof value !== 'object') return output;
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    if ((key === 'citations' || key === 'citationIds') && Array.isArray(item)) {
      for (const citation of item) if (typeof citation === 'string') output.push(citation);
    } else if (key === 'citationId' && typeof item === 'string') {
      output.push(item);
    } else {
      collectCitationIds(item, output);
    }
  }
  return output;
}

function artifactType(kind: GenerationKind) {
  if (kind === 'questions') return 'questions';
  return kind;
}

function buildSystemPrompt(kind: GenerationKind, allowedIds: string[]) {
  return `You are the grounded learning engine for Koç.\n\nRULES:\n- Use ONLY the supplied source chunks.\n- Never invent a citation id.\n- Any factual claim, answer explanation, flashcard or quiz item must include one or more citations chosen from this exact allow-list: ${allowedIds.join(', ')}.\n- If the sources do not support a requested point, say it is not supported instead of guessing.\n- Output valid JSON only. No markdown fences.\n- Language should follow the source/user instruction; default to Turkish.\n- For quiz/questions, each item must have a single unambiguous correct answer and plausible distractors.\n- AI-generated questions are DRAFTS, not verified content.\n\nOUTPUT FOR ${kind.toUpperCase()}:\nReturn an object with {"title": string, "summary": string, "keyPoints": [{"text": string, "citations": [chunkId]}], "flashcards": [{"front": string, "back": string, "citations": [chunkId]}], "quiz": [{"stem": string, "options": [string,string,string,string], "correctIndex": number, "explanation": string, "difficulty": 1|2|3|4|5, "citations": [chunkId]}]}. Keep irrelevant arrays empty for the requested kind.`;
}

function buildContext(chunks: Chunk[]) {
  return chunks.map((chunk) => {
    const sourceTitle = chunk.koc_source_documents?.title ?? `Kaynak ${chunk.source_id}`;
    const pages = chunk.page_from ? ` sayfa ${chunk.page_from}${chunk.page_to && chunk.page_to !== chunk.page_from ? `-${chunk.page_to}` : ''}` : '';
    return `[CHUNK ${chunk.id}] ${sourceTitle}${pages}\n${chunk.content}`;
  }).join('\n\n---\n\n');
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

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return respond({ error: 'invalid_json' }, 400);
  }

  const allowedKinds: GenerationKind[] = ['answer', 'summary', 'study_guide', 'flashcards', 'quiz', 'questions'];
  if (!body.notebookId || !allowedKinds.includes(body.kind)) return respond({ error: 'invalid_request' }, 400);

  const notebook = await admin
    .from('koc_notebooks')
    .select('id,title,owner_id')
    .eq('id', body.notebookId)
    .eq('owner_id', user.id)
    .maybeSingle();
  if (notebook.error || !notebook.data) return respond({ error: 'notebook_not_found' }, 404);

  const quotaResult = await admin.rpc('koc_reserve_ai_generation', { p_user_id: user.id });
  if (quotaResult.error) return respond({ error: 'quota_check_failed' }, 500);
  const quota = quotaResult.data as { allowed?: boolean; plan?: string; limit?: number; used?: number } | null;
  if (!quota?.allowed) return respond({ error: 'quota_exceeded', quota }, 429);

  const sourcesResult = await admin
    .from('koc_notebook_sources')
    .select('source_id')
    .eq('notebook_id', body.notebookId)
    .eq('is_enabled', true);
  if (sourcesResult.error) return respond({ error: 'source_lookup_failed' }, 500);
  const sourceIds = (sourcesResult.data ?? []).map((row) => row.source_id as string);
  if (!sourceIds.length) return respond({ error: 'no_enabled_sources' }, 409);

  const chunksResult = await admin
    .from('koc_source_chunks')
    .select('id,source_id,chunk_index,page_from,page_to,content,koc_source_documents(title)')
    .in('source_id', sourceIds)
    .order('source_id')
    .order('chunk_index')
    .limit(60);
  if (chunksResult.error) return respond({ error: 'chunk_lookup_failed' }, 500);

  const chunks: Chunk[] = [];
  let characterBudget = 0;
  for (const rawChunk of (chunksResult.data ?? []) as unknown as Chunk[]) {
    if (!rawChunk.content.trim()) continue;
    const next = rawChunk.content.slice(0, 5000);
    if (characterBudget + next.length > 48_000) break;
    characterBudget += next.length;
    chunks.push({ ...rawChunk, content: next });
  }
  if (!chunks.length) return respond({ error: 'no_extractable_text' }, 409);

  const jobInsert = await admin.from('koc_generation_jobs').insert({
    user_id: user.id,
    notebook_id: body.notebookId,
    kind: body.kind,
    status: 'running',
    provider: 'openai-compatible',
    model: Deno.env.get('AI_MODEL') ?? null,
    prompt_version: 'grounded-study-v1',
    request: {
      instruction: body.instruction ?? null,
      difficulty: body.difficulty ?? null,
      count: body.count ?? null,
      source_count: sourceIds.length,
      chunk_count: chunks.length,
    },
    started_at: new Date().toISOString(),
  }).select('id').single();
  if (jobInsert.error) return respond({ error: 'job_create_failed' }, 500);
  const jobId = jobInsert.data.id as string;

  const failJob = async (code: string, message: string) => {
    await admin.from('koc_generation_jobs').update({
      status: 'failed',
      error_code: code,
      error_message: message.slice(0, 1000),
      completed_at: new Date().toISOString(),
    }).eq('id', jobId);
  };

  const endpoint = Deno.env.get('AI_CHAT_COMPLETIONS_URL');
  const apiKey = Deno.env.get('AI_API_KEY');
  const model = Deno.env.get('AI_MODEL');
  if (!endpoint || !apiKey || !model) {
    await failJob('ai_not_configured', 'AI endpoint/model/secret is not configured.');
    return respond({ error: 'ai_not_configured', jobId }, 503);
  }

  const allowedChunkIds = new Set(chunks.map((chunk) => chunk.id));
  const count = Math.max(1, Math.min(body.count ?? 8, 20));
  const userPrompt = `Notebook: ${notebook.data.title}\nRequested kind: ${body.kind}\nDifficulty: ${body.difficulty ?? 'adaptive'}\nRequested item count: ${count}\nUser instruction: ${body.instruction?.trim() || 'Create a concise, exam-useful study artifact.'}\n\nSOURCES:\n${buildContext(chunks)}`;

  try {
    const aiResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: buildSystemPrompt(body.kind, [...allowedChunkIds]) },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const detail = (await aiResponse.text()).slice(0, 800);
      await failJob('provider_error', `${aiResponse.status}: ${detail}`);
      return respond({ error: 'provider_error', jobId }, 502);
    }

    const raw = await aiResponse.json() as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number; input_tokens?: number; output_tokens?: number };
    };
    const content = raw.choices?.[0]?.message?.content;
    if (!content) {
      await failJob('empty_model_output', 'Model returned no content.');
      return respond({ error: 'empty_model_output', jobId }, 502);
    }

    let payload: unknown;
    try {
      payload = JSON.parse(stripJsonFence(content));
    } catch {
      await failJob('invalid_json_output', 'Model output was not valid JSON.');
      return respond({ error: 'invalid_json_output', jobId }, 502);
    }

    const citations = collectCitationIds(payload);
    const invalidCitations = [...new Set(citations.filter((id) => !allowedChunkIds.has(id)))];
    if (invalidCitations.length) {
      await failJob('invalid_citation', `Model invented or referenced unavailable citations: ${invalidCitations.join(', ')}`);
      return respond({ error: 'invalid_citation', invalidCitations, jobId }, 422);
    }

    if (citations.length === 0) {
      await failJob('missing_citation', 'Grounded output did not contain any source citations.');
      return respond({ error: 'missing_citation', jobId }, 422);
    }

    const inputTokens = raw.usage?.prompt_tokens ?? raw.usage?.input_tokens ?? 0;
    const outputTokens = raw.usage?.completion_tokens ?? raw.usage?.output_tokens ?? 0;
    const inputPrice = Number(Deno.env.get('AI_INPUT_USD_PER_MILLION') ?? '0');
    const outputPrice = Number(Deno.env.get('AI_OUTPUT_USD_PER_MILLION') ?? '0');
    const costMicrounits = Math.max(0, Math.round(inputTokens * inputPrice + outputTokens * outputPrice));

    const artifact = await admin.from('koc_generated_artifacts').insert({
      user_id: user.id,
      notebook_id: body.notebookId,
      generation_job_id: jobId,
      artifact_type: artifactType(body.kind),
      title: typeof (payload as Record<string, unknown>)?.title === 'string' ? (payload as Record<string, string>).title : `${notebook.data.title} · ${body.kind}`,
      payload,
    }).select('id').single();
    if (artifact.error) throw artifact.error;

    await Promise.all([
      admin.from('koc_generation_jobs').update({
        status: 'succeeded',
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        cost_microunits: costMicrounits,
        completed_at: new Date().toISOString(),
      }).eq('id', jobId),
      admin.rpc('koc_record_ai_usage', {
        p_user_id: user.id,
        p_input_tokens: inputTokens,
        p_output_tokens: outputTokens,
      }),
    ]);

    return respond({
      ok: true,
      jobId,
      artifactId: artifact.data.id,
      payload,
      quota,
      usage: { inputTokens, outputTokens, costMicrounits },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown_generation_error';
    await failJob('generation_failed', message);
    return respond({ error: 'generation_failed', jobId }, 500);
  }
});
