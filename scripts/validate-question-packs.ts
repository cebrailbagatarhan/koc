/**
 * Soru paketi doğrulayıcı.
 *
 * Kullanım:
 *   node scripts/validate-question-packs.ts                     # bilinen tüm paketler
 *   node scripts/validate-question-packs.ts data/packs/x.ts     # tek dosya
 *
 * Not: Node 22.18+ TypeScript tip sıyırmayı destekler. Paket dosyaları yalnızca
 * `import type` kullanmalıdır; çalışma zamanı importu doğrulayıcıyı kırar.
 */
import { pathToFileURL } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';

type Question = {
  id: string;
  levelName: string;
  courseName: string;
  topicIndex?: number;
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: string;
  questionKind: string;
};

type Topic = {
  name: string;
  icon: string;
  summary: string;
  goals: string[];
  practicePrompt: string;
  questionIds: string[];
};

const KNOWN_PACKS = [
  'data/packs/osymTytTurkce.ts',
  'data/packs/osymTytMatematik.ts',
  'data/packs/osymTytFen.ts',
  'data/packs/osymTytSosyal.ts',
  'data/packs/osymAytSayisal.ts',
  'data/packs/osymAytEa.ts',
  'data/packs/osymKpss.ts',
  'data/packs/yokYokdil.ts',
  'data/packs/yokAkademik.ts',
  'data/packs/legacyIlkokulOrtaokul.ts',
  'data/packs/legacyLiseAles.ts',
  'data/packs/bulkIlkokulMatematik.ts',
  'data/packs/bulkIlkokulDiger.ts',
  'data/packs/bulkOrtaokulMatematik.ts',
  'data/packs/bulkOrtaokulTurkceSosyal.ts',
  'data/packs/bulkOrtaokulFenIngilizce.ts',
  'data/packs/bulkLiseMatematik.ts',
  'data/packs/bulkLiseFizikKimya.ts',
  'data/packs/bulkLiseDiger.ts',
  'data/packs/bulkAles.ts',
  'data/packs/bulkOsymTyt.ts',
  'data/packs/bulkOsymAyt.ts',
];

type LegacyQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

const ALLOWED_DIFFICULTY = new Set(['easy', 'standard', 'hard']);
const ALLOWED_KIND = new Set(['multiple-choice', 'visual-choice', 'reading', 'sequence']);
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u;

const root = process.cwd();
const args = process.argv.slice(2);
const targets = args.length ? args : KNOWN_PACKS;

const globalIds = new Map<string, string>();
const templateCounts = new Map<string, number>();
let errorCount = 0;
let warnCount = 0;
let totalQuestions = 0;
const answerPositions = [0, 0, 0, 0];

/** Sayıları ve noktalama işaretlerini atarak aynı kalıbı yakalar. */
function templateKey(prompt: string) {
  return prompt
    .toLocaleLowerCase('tr-TR')
    .replace(/\d+(?:[.,]\d+)?/g, '#')
    .replace(/[^\p{L}#\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 90);
}

function fail(file: string, message: string) {
  errorCount += 1;
  console.error(`  ✖ ${file}: ${message}`);
}

function warn(file: string, message: string) {
  warnCount += 1;
  console.warn(`  ! ${file}: ${message}`);
}

function checkQuestion(file: string, q: Question, topics: Topic[], index: number) {
  const where = q.id || `#${index}`;

  if (!q.id || typeof q.id !== 'string') return fail(file, `${where}: id yok`);
  if (!/^[a-z0-9][a-z0-9-]*$/.test(q.id)) fail(file, `${where}: id kebab-case değil`);

  const previous = globalIds.get(q.id);
  if (previous) fail(file, `${where}: id tekrarı (${previous} dosyasında da var)`);
  else globalIds.set(q.id, file);

  if (!q.prompt?.trim()) fail(file, `${where}: prompt boş`);
  if (q.prompt && q.prompt.trim().length < 12) warn(file, `${where}: prompt çok kısa`);
  if (q.prompt?.trim()) {
    const key = templateKey(q.prompt);
    templateCounts.set(key, (templateCounts.get(key) ?? 0) + 1);
  }
  if (!q.explanation?.trim()) fail(file, `${where}: explanation boş`);
  if (q.explanation && q.explanation.trim().length < 25) warn(file, `${where}: explanation çok kısa`);
  if (q.explanation && /^(doğru cevap|cevap)\s*[:：]?\s*\S+\.?$/i.test(q.explanation.trim())) {
    warn(file, `${where}: explanation sadece cevabı tekrar ediyor`);
  }

  if (!Array.isArray(q.options) || q.options.length !== 4) {
    fail(file, `${where}: seçenek sayısı ${q.options?.length ?? 0} (4 olmalı)`);
  } else {
    if (new Set(q.options.map((o) => o.trim())).size !== 4) fail(file, `${where}: seçenekler tekrarlı`);
    if (q.options.some((o) => !o?.trim())) fail(file, `${where}: boş seçenek var`);
    if (q.options.some((o) => /^[A-Ea-e]\s*[).]/.test(o))) fail(file, `${where}: seçenekte A)/B) öneki var`);
    const correctIndex = q.options.indexOf(q.correctAnswer);
    if (correctIndex < 0) fail(file, `${where}: correctAnswer seçeneklerde birebir yok`);
    else answerPositions[correctIndex] += 1;
  }

  if (!ALLOWED_DIFFICULTY.has(q.difficulty)) fail(file, `${where}: difficulty "${q.difficulty}" geçersiz`);
  if (!ALLOWED_KIND.has(q.questionKind)) fail(file, `${where}: questionKind "${q.questionKind}" geçersiz`);
  if (q.questionKind === 'visual-choice') warn(file, `${where}: visual-choice kullanılmış, görsel alanı doğrulanmalı`);

  if (!q.levelName?.trim()) fail(file, `${where}: levelName boş`);
  if (!q.courseName?.trim()) fail(file, `${where}: courseName boş`);

  const ti = q.topicIndex ?? 0;
  if (!Number.isInteger(ti) || ti < 0) fail(file, `${where}: topicIndex ${ti} geçersiz`);
  else if (topics.length && ti >= topics.length) {
    fail(file, `${where}: topicIndex ${ti} ama dosyada ${topics.length} konu var`);
  }

  if (EMOJI.test(q.prompt) || EMOJI.test(q.explanation)) {
    warn(file, `${where}: soru metninde emoji var (ÖSYM/YÖK formatında istenmez)`);
  }
  if (/\$|\\frac|\\sqrt/.test(q.prompt)) fail(file, `${where}: LaTeX kullanılmış`);
}

const LEGACY_IDS: Record<string, string[]> = {
  'İlkokul::Matematik': ['im1', 'im2', 'im3'],
  'İlkokul::Türkçe': ['it1', 'it2', 'it3'],
  'İlkokul::Hayat Bilgisi': ['ih1', 'ih2', 'ih3'],
  'İlkokul::İngilizce': ['ii1', 'ii2', 'ii3'],
  'Ortaokul::Matematik': ['om1', 'om2', 'om3'],
  'Ortaokul::Türkçe': ['ot1', 'ot2', 'ot3'],
  'Ortaokul::Fen Bilimleri': ['of1', 'of2', 'of3'],
  'Ortaokul::Sosyal Bilgiler': ['os1', 'os2', 'os3'],
  'Ortaokul::İngilizce': ['oi1', 'oi2', 'oi3'],
  'Lise::Matematik': ['lm1', 'lm2', 'lm3'],
  'Lise::Fizik': ['lf1', 'lf2', 'lf3'],
  'Lise::Kimya': ['lk1', 'lk2', 'lk3'],
  'Lise::Biyoloji': ['lb1', 'lb2', 'lb3'],
  'Lise::Edebiyat': ['le1', 'le2', 'le3'],
  'Lise::Tarih': ['lt1', 'lt2', 'lt3'],
  'Lise::İngilizce': ['li1', 'li2', 'li3'],
  'ALES::Sayısal': ['as1', 'as2', 'as3'],
  'ALES::Sözel': ['av1', 'av2', 'av3'],
};

function validateLegacyFile(
  file: string,
  bank: Record<string, LegacyQuestion[]>,
  topicQuestionIds: Record<string, Record<string, string[]>>,
) {
  const courseKeys = Object.keys(bank);
  if (!courseKeys.length) fail(file, 'bank boş');

  let count = 0;
  for (const courseKey of courseKeys) {
    const questions = bank[courseKey] ?? [];
    if (!/^[^:]+::[^:]+$/.test(courseKey)) fail(file, `"${courseKey}" level::course biçiminde değil`);
    if (questions.length < 5) warn(file, `${courseKey}: yalnızca ${questions.length} soru`);

    for (const legacyId of LEGACY_IDS[courseKey] ?? []) {
      if (!questions.some((q) => q.id === legacyId)) {
        fail(file, `${courseKey}: mevcut id korunmamış (${legacyId})`);
      }
    }

    for (const q of questions) {
      const where = q.id || `${courseKey}/?`;
      if (!q.id || !/^[a-z]{2,3}\d+$/.test(q.id)) warn(file, `${where}: id şeması "im4" gibi olmalı`);
      const previous = globalIds.get(q.id);
      if (previous) fail(file, `${where}: id tekrarı (${previous})`);
      else globalIds.set(q.id, file);

      if (!q.question?.trim()) fail(file, `${where}: soru metni boş`);
      if (!q.explanation?.trim()) fail(file, `${where}: açıklama boş`);
      if (!Array.isArray(q.options) || q.options.length !== 4) {
        fail(file, `${where}: seçenek sayısı ${q.options?.length ?? 0} (4 olmalı)`);
      } else {
        if (new Set(q.options.map((o) => o.trim())).size !== 4) fail(file, `${where}: seçenekler tekrarlı`);
        if (q.options.some((o) => /^[A-Ea-e]\s*[).]/.test(o))) fail(file, `${where}: seçenekte önek var`);
        const correctIndex = q.options.indexOf(q.correctAnswer);
        if (correctIndex < 0) fail(file, `${where}: correctAnswer seçeneklerde birebir yok`);
        else answerPositions[correctIndex] += 1;
      }
      if (/\$|\\frac|\\sqrt/.test(q.question)) fail(file, `${where}: LaTeX kullanılmış`);
      count += 1;
    }
  }

  for (const [courseKey, topicMap] of Object.entries(topicQuestionIds)) {
    if (!bank[courseKey]) fail(file, `topicQuestionIds: "${courseKey}" bank içinde yok`);
    const allIds = new Set((bank[courseKey] ?? []).map((q) => q.id));
    for (const [topicName, ids] of Object.entries(topicMap)) {
      if (!ids.length) fail(file, `${courseKey} / ${topicName}: boş id listesi`);
      for (const id of ids) {
        if (!allIds.has(id)) fail(file, `${courseKey} / ${topicName}: "${id}" bank içinde yok`);
      }
    }
  }

  totalQuestions += count;
  const topics = Object.entries(topicQuestionIds)
    .map(([courseKey, map]) => `${courseKey.split('::')[1]}:${Object.keys(map).length} konu`)
    .join(', ');
  console.log(`  ✓ ${file} — ${count} soru · ${courseKeys.length} ders · ${topics || 'konu eşlemesi yok'}`);
}

async function validateFile(relative: string) {
  const absolute = path.resolve(root, relative);
  if (!existsSync(absolute)) {
    fail(relative, 'dosya bulunamadı');
    return;
  }

  let module: {
    topics?: Topic[];
    questions?: Question[];
    bank?: Record<string, LegacyQuestion[]>;
    topicQuestionIds?: Record<string, Record<string, string[]>>;
  };
  try {
    module = await import(pathToFileURL(absolute).href);
  } catch (error) {
    fail(relative, `import hatası: ${(error as Error).message}`);
    return;
  }

  if (module.bank) {
    validateLegacyFile(relative, module.bank, module.topicQuestionIds ?? {});
    return;
  }

  const topics = Array.isArray(module.topics) ? module.topics : [];
  const questions = Array.isArray(module.questions) ? module.questions : [];
  const topicQuestionIds = module.topicQuestionIds ?? {};
  const hasTopicMap = Object.keys(topicQuestionIds).length > 0;

  if (!topics.length && !hasTopicMap) fail(relative, 'ne topics ne topicQuestionIds var');
  if (!questions.length) fail(relative, 'questions dizisi yok/boş');

  const topicNames = new Set<string>();
  for (const topic of topics) {
    if (!topic.name?.trim()) fail(relative, 'konu adı boş');
    else if (topicNames.has(topic.name)) fail(relative, `konu adı tekrarı: ${topic.name}`);
    else topicNames.add(topic.name);

    if (!topic.icon?.trim()) warn(relative, `${topic.name}: ikon yok`);
    if (!topic.summary?.trim()) warn(relative, `${topic.name}: summary yok`);
    if (!Array.isArray(topic.goals) || topic.goals.length < 2) warn(relative, `${topic.name}: goals eksik`);
    if (!topic.practicePrompt?.trim()) warn(relative, `${topic.name}: practicePrompt yok`);
    if (!Array.isArray(topic.questionIds) || !topic.questionIds.length) {
      fail(relative, `${topic.name}: questionIds boş`);
    }
  }

  const seenInTopics = new Set<string>();
  for (const topic of topics) {
    for (const id of topic.questionIds ?? []) {
      if (seenInTopics.has(id)) fail(relative, `${id}: birden fazla konuya bağlanmış`);
      seenInTopics.add(id);
    }
  }

  questions.forEach((question, index) => checkQuestion(relative, question, topics, index));

  const questionIds = new Set(questions.map((q) => q.id));
  for (const topic of topics) {
    for (const id of topic.questionIds ?? []) {
      if (!questionIds.has(id)) fail(relative, `${topic.name}: questionIds içinde olmayan soru "${id}"`);
    }
  }

  const mappedIds = new Set<string>();
  for (const [courseKey, topicMap] of Object.entries(topicQuestionIds)) {
    if (!/^[^:]+::[^:]+$/.test(courseKey)) fail(relative, `topicQuestionIds: "${courseKey}" level::course değil`);
    for (const [topicName, ids] of Object.entries(topicMap)) {
      if (!ids.length) fail(relative, `${courseKey} / ${topicName}: boş id listesi`);
      for (const id of ids) {
        if (!questionIds.has(id)) fail(relative, `${courseKey} / ${topicName}: "${id}" bu dosyada yok`);
        if (mappedIds.has(id)) fail(relative, `${id}: birden fazla konuya bağlanmış`);
        mappedIds.add(id);
      }
    }
  }

  const assigned = new Set([...seenInTopics, ...mappedIds]);
  for (const question of questions) {
    if (!assigned.has(question.id)) fail(relative, `${question.id}: hiçbir konuya bağlı değil`);
  }

  const byTopic = topics.length
    ? topics.map((topic) => `${topic.name}=${topic.questionIds.length}`).join(', ')
    : Object.entries(topicQuestionIds)
        .map(([courseKey, map]) => `${courseKey.split('::')[1]}:${Object.values(map).reduce((sum, ids) => sum + ids.length, 0)}`)
        .join(', ');
  const levels = [...new Set(questions.map((q) => `${q.levelName}/${q.courseName}`))].join(' + ');
  totalQuestions += questions.length;
  console.log(`  ✓ ${relative} — ${questions.length} soru · ${levels} · ${byTopic}`);
}

console.log('Soru paketi doğrulaması\n');
for (const target of targets) {
  await validateFile(target);
}

const total = answerPositions.reduce((sum, value) => sum + value, 0);
if (total > 0) {
  const distribution = answerPositions
    .map((count, index) => `${'ABCD'[index]}:${Math.round((count / total) * 100)}%`)
    .join(' ');
  console.log(`\nDoğru cevap dağılımı: ${distribution}`);
  const worst = Math.max(...answerPositions) / total;
  if (worst > 0.4) warn('paketler', `doğru cevap dağılımı çarpık (${Math.round(worst * 100)}% tek şıkta)`);
}

const templates = [...templateCounts.entries()].sort((a, b) => b[1] - a[1]);
if (templates.length) {
  const biggest = templates[0];
  console.log(`Şablon çeşitliliği: ${templates.length} kalıp · en kalabalık ${biggest[1]} varyant`);
  if (biggest[1] > 40) {
    warn('paketler', `en kalabalık şablon ${biggest[1]} kez tekrar ediyor → "${biggest[0].slice(0, 60)}"`);
  }
}

console.log(`\nToplam: ${totalQuestions} soru · ${errorCount} hata · ${warnCount} uyarı`);
process.exit(errorCount > 0 ? 1 : 0);
