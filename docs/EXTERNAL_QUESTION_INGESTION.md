# External Question Ingestion

Koç treats third-party APIs, datasets and repositories as suppliers, never as the runtime source of truth.

## Pipeline

1. Source must exist in koc_question_sources.
2. Source remains disabled until its current license and terms are manually verified.
3. Import worker fetches a bounded batch.
4. Raw record is normalized into koc_question_candidates.
5. source_id, external_id, source_url, license, attribution and original_hash travel with the candidate.
6. Duplicate/fingerprint, curriculum mapping, answer validation, quality and novelty gates run.
7. Only admitted candidates enter the shared published pool.
8. Mobile clients read Koç's published pool; they do not call third-party question APIs directly.

## Hard rules

- No scraping or ingestion from a source whose redistribution/commercial rights are unclear.
- No source can be enabled without license metadata and verified_at.
- No import run may exceed the source daily_import_limit.
- API/dataset failure cannot break quizzes because external providers are never on the serving path.
- Every imported question remains traceable to its supplier and import run.
- If a supplier changes terms, disable the source immediately and bulk-retire affected published questions after review.
- Exact upstream revision/version should be pinned whenever possible.

## Initial adapters

OpenTDB: useful mainly for general knowledge. Treat as candidate-only until current terms are verified.

Hugging Face datasets: adapter should accept an exact repo id and revision. Dataset-card license is necessary but not sufficient; inspect provenance and redistribution rights before enabling.

Wikimedia: best used as attributed grounding corpus from which the model creates original curriculum-aligned questions. Store source page/revision metadata with generated candidates.

## Runtime shape

External ingestion belongs in a server worker/Edge Function:

fetch -> normalize -> hash -> candidate insert -> validate -> admission

The mobile app must never contain provider API keys or service-role credentials.

## Capacity

The bounded-pool policy remains authoritative. External imports do not bypass max_published, quality, novelty or replacement rules. A large dataset therefore cannot flood the active question bank.

## Next implementation when Koç Supabase is connected

Create three server workers:

- source-import: fetch bounded pages and create candidates.
- candidate-validator: curriculum mapping, answer checks, duplicate/novelty checks.
- pool-admission: call the service-only admission function.

Queue each stage separately so retries are idempotent and observable.
