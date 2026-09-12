import { getLearningDatabase } from '@/storage/database';

export type StudyCitation = {
  sourceId: string;
  sourceTitle: string;
  topicName: string | null;
  excerpt: string;
};

export type StudyFlashcard = {
  id: string;
  front: string;
  back: string;
  citation: StudyCitation;
};

export type StudyQuestionMode = 'graded' | 'self-check';

export type StudyQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number | null;
  explanation: string;
  citation: StudyCitation;
  mode: StudyQuestionMode;
  sourceQuestionNumber: number | null;
};

export type SourceStudyQuality = {
  kind: 'question-bank' | 'notes' | 'mixed' | 'unknown';
  label: string;
  score: number;
  nativeQuestionCount: number;
  gradedQuestionCount: number;
  note: string;
};

export type SourceStudy = {
  sourceCount: number;
  chunkCount: number;
  keyPoints: Array<{ text: string; citation: StudyCitation }>;
  flashcards: StudyFlashcard[];
  questions: StudyQuestion[];
  quality: SourceStudyQuality;
};

type ChunkRow = {
  source_id: string;
  title: string;
  topic_name: string | null;
  chunk_index: number;
  content: string;
};

type SourceDocument = {
  row: ChunkRow;
  text: string;
};

type ParsedNativeQuestion = {
  number: number | null;
  prompt: string;
  options: Array<{ letter: string; text: string }>;
  raw: string;
};

const STOP_WORDS = new Set([
  'acaba', 'ama', 'ancak', 'artık', 'aslında', 'bana', 'bazı', 'belki', 'ben', 'bile', 'bir', 'biraz',
  'biz', 'bu', 'böyle', 'çok', 'daha', 'de', 'da', 'değil', 'diye', 'en', 'gibi', 'hem', 'hep', 'her',
  'için', 'ile', 'ise', 'ki', 'mi', 'mu', 'mı', 'mü', 'nasıl', 'ne', 'neden', 'nerede', 'olan', 'olarak',
  'oldu', 'olur', 'olan', 'onun', 'orada', 'sonra', 'şey', 'şimdi', 've', 'veya', 'ya', 'yani', 'yerine',
  'the', 'and', 'that', 'this', 'with', 'from', 'have', 'has', 'had', 'for', 'are', 'was', 'were', 'will',
  'would', 'could', 'should', 'into', 'about', 'than', 'then', 'them', 'they', 'their', 'there', 'which',
  'what', 'when', 'where', 'while', 'your', 'you', 'our', 'not', 'but', 'can', 'may', 'also', 'using', 'used',
]);

const NOISE_WORDS = new Set([
  'anlam', 'cevap', 'cevaplar', 'çözüm', 'çözümler', 'cozum', 'cozumler', 'pegem', 'yayın', 'yayınları',
  'yayin', 'yayinlari', 'sayfa', 'test', 'deneme', 'soru', 'sorular', 'bölüm', 'bolum', 'ünite', 'unite',
]);

const LETTER = 'A-Za-zÇĞİÖŞÜçğıöşü';

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeSpace(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function cleanStudyText(value: string) {
  return value
    .normalize('NFKC')
    .replace(/\u0000|\u200B|\u200C|\u200D|\uFEFF/g, ' ')
    .replace(/\u00AD/g, '')
    .replace(/\r/g, '')
    .replace(new RegExp(`([${LETTER}])-\\n([${LETTER}])`, 'g'), '$1$2')
    .replace(/[\t ]+\n/g, '\n')
    .replace(/^[ \t]*\d{1,4}[ \t]*$/gm, '')
    .replace(/\n[ \t]*(?:sayfa|page)[ \t]+\d{1,4}[ \t]*\n/gi, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function tokens(text: string) {
  return (text.match(/[A-Za-zÇĞİÖŞÜçğıöşü0-9'-]+/g) ?? [])
    .map((token) => token.replace(/^[-']+|[-']+$/g, ''))
    .filter(Boolean);
}

function normalizedToken(token: string) {
  return token.toLocaleLowerCase('tr-TR');
}

function meaningfulTokens(text: string) {
  return tokens(text).filter((token) => {
    const normalized = normalizedToken(token);
    return token.length >= 4 && !STOP_WORDS.has(normalized) && !NOISE_WORDS.has(normalized) && !/^\d+$/.test(token);
  });
}

function uniqueBy<T>(items: T[], key: (item: T) => string) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const value = key(item);
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

function looksLikeNoiseLine(value: string) {
  const line = normalizeSpace(value);
  if (!line) return true;
  if (/^\d{1,4}$/.test(line)) return true;
  if (/^(?:çözümler?|cozumler?)(?:[-–— ]?\d+)?$/i.test(line)) return true;
  if (/^(?:pegem|pegem akademi|cevap anahtarı|cevaplar|test \d+|deneme \d+)$/i.test(line)) return true;
  if (/^(?:www\.|https?:\/\/)/i.test(line)) return true;
  return false;
}

function isUsefulSentence(value: string) {
  const text = normalizeSpace(value);
  if (text.length < 55 || text.length > 360) return false;
  if (text.includes('?') || text.includes('_____')) return false;
  if (/\b[A-E]\s*[).:-]\s*/.test(text)) return false;
  if (/^(?:soru|çözüm|çözümler|cevap|test|deneme)\b/i.test(text)) return false;
  const wordCount = tokens(text).length;
  const meaningfulCount = meaningfulTokens(text).length;
  if (wordCount < 8 || meaningfulCount < 3) return false;
  const weird = (text.match(/[^\p{L}\p{N}\s.,;:!?%()'"+\-×÷=<>/]/gu) ?? []).length;
  return weird <= Math.max(3, Math.floor(text.length * 0.04));
}

function sentenceParts(text: string) {
  const compact = normalizeSpace(cleanStudyText(text));
  const matches = compact.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [];
  return matches.map(normalizeSpace).filter(isUsefulSentence);
}

function citationFor(row: ChunkRow, excerpt: string): StudyCitation {
  return {
    sourceId: row.source_id,
    sourceTitle: row.title,
    topicName: row.topic_name,
    excerpt: normalizeSpace(excerpt).slice(0, 420),
  };
}

function hash(value: string) {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function mergeOverlap(previous: string, next: string) {
  const left = previous.trimEnd();
  const right = next.trimStart();
  const max = Math.min(260, left.length, right.length);
  for (let size = max; size >= 40; size -= 1) {
    if (left.slice(-size) === right.slice(0, size)) {
      return `${left}${right.slice(size)}`;
    }
  }
  return `${left}\n${right}`;
}

function reconstructDocuments(chunks: ChunkRow[]): SourceDocument[] {
  const groups = new Map<string, ChunkRow[]>();
  for (const chunk of chunks) {
    const group = groups.get(chunk.source_id) ?? [];
    group.push(chunk);
    groups.set(chunk.source_id, group);
  }

  return [...groups.values()].map((rows) => {
    rows.sort((a, b) => a.chunk_index - b.chunk_index);
    let text = '';
    for (const row of rows) {
      const cleaned = cleanStudyText(row.content);
      text = text ? mergeOverlap(text, cleaned) : cleaned;
    }
    return { row: rows[0], text: cleanStudyText(text) };
  });
}

function parseAnswerKey(text: string) {
  const answers = new Map<number, string>();
  const normalized = text.normalize('NFKC');
  const lower = normalized.toLocaleLowerCase('tr-TR');
  const markers = ['cevap anahtarı', 'cevap anahtari', 'cevaplar'];
  let markerIndex = -1;
  for (const marker of markers) markerIndex = Math.max(markerIndex, lower.lastIndexOf(marker));
  if (markerIndex < 0) return answers;

  const section = normalized.slice(markerIndex, markerIndex + 12000);
  const regex = /(?:^|\s)(\d{1,3})\s*[-.:)]?\s*([A-E])(?=\s|$|[,;])/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(section))) {
    const number = Number(match[1]);
    if (Number.isFinite(number) && number > 0) answers.set(number, match[2]);
  }
  return answers;
}

function parseOptions(block: string) {
  const marker = /(?:^|\s)([A-E])\s*[).:-]\s*/g;
  const matches: Array<{ letter: string; markerStart: number; contentStart: number }> = [];
  let match: RegExpExecArray | null;
  while ((match = marker.exec(block))) {
    matches.push({ letter: match[1], markerStart: match.index, contentStart: marker.lastIndex });
  }
  if (matches.length < 3) return { prompt: normalizeSpace(block), options: [] as Array<{ letter: string; text: string }> };

  const options = matches
    .map((entry, index) => ({
      letter: entry.letter,
      text: normalizeSpace(block.slice(entry.contentStart, matches[index + 1]?.markerStart ?? block.length)),
    }))
    .filter((option) => option.text.length >= 1 && option.text.length <= 260);

  return {
    prompt: normalizeSpace(block.slice(0, matches[0].markerStart)),
    options: uniqueBy(options, (option) => `${option.letter}:${option.text}`),
  };
}

function cleanQuestionPrompt(prompt: string) {
  return normalizeSpace(
    prompt
      .replace(/^(?:soru\s*)?\d{1,3}\s*[).:-]\s*/i, '')
      .replace(/^(?:test|deneme)\s*\d+\s*/i, ''),
  );
}

function parseNumberedQuestions(text: string): ParsedNativeQuestion[] {
  const normalized = cleanStudyText(text);
  const questionStart = /(?:^|\n)\s*(\d{1,3})\s*[).:-]\s+/g;
  const starts: Array<{ number: number; start: number; contentStart: number }> = [];
  let match: RegExpExecArray | null;
  while ((match = questionStart.exec(normalized))) {
    starts.push({ number: Number(match[1]), start: match.index, contentStart: questionStart.lastIndex });
  }

  const parsed: ParsedNativeQuestion[] = [];
  for (let index = 0; index < starts.length; index += 1) {
    const current = starts[index];
    const end = starts[index + 1]?.start ?? normalized.length;
    const raw = normalizeSpace(normalized.slice(current.contentStart, end));
    if (raw.length < 25 || raw.length > 2200) continue;
    const optionData = parseOptions(raw);
    const prompt = cleanQuestionPrompt(optionData.prompt);
    if (prompt.length < 18) continue;
    if (!prompt.includes('?') && optionData.options.length < 3) continue;
    parsed.push({ number: current.number, prompt, options: optionData.options, raw });
  }
  return parsed;
}

function parseQuestionMarkFallback(text: string): ParsedNativeQuestion[] {
  const compact = cleanStudyText(text);
  const candidates = compact.match(/[^?\n]{25,700}\?(?:\s+[A-E]\s*[).:-]\s*[^?\n]{1,260}){0,5}/g) ?? [];
  return candidates
    .map((raw) => {
      const optionData = parseOptions(raw);
      return {
        number: null,
        prompt: cleanQuestionPrompt(optionData.prompt),
        options: optionData.options,
        raw: normalizeSpace(raw),
      };
    })
    .filter((item) => item.prompt.length >= 18);
}

function parseNativeQuestions(document: SourceDocument) {
  const numbered = parseNumberedQuestions(document.text);
  const fallback = numbered.length >= 3 ? [] : parseQuestionMarkFallback(document.text);
  const answers = parseAnswerKey(document.text);
  return uniqueBy([...numbered, ...fallback], (question) => question.prompt.toLocaleLowerCase('tr-TR')).map((question) => ({
    ...question,
    answerLetter: question.number ? answers.get(question.number) ?? null : null,
  }));
}

function questionBankSignals(text: string) {
  const optionMarkers = (text.match(/(?:^|\s)[A-E]\s*[).:-]\s*/g) ?? []).length;
  const questionMarks = (text.match(/\?/g) ?? []).length;
  const numbered = (text.match(/(?:^|\n)\s*\d{1,3}\s*[).:-]\s+/g) ?? []).length;
  const solutionMarkers = (text.match(/(?:çözümler?|cozumler?|cevap anahtarı|cevap anahtari)/gi) ?? []).length;
  return { optionMarkers, questionMarks, numbered, solutionMarkers };
}

function buildQuality(documents: SourceDocument[], nativeCount: number, gradedCount: number, proseSentenceCount: number): SourceStudyQuality {
  const combined = documents.map((document) => document.text).join('\n');
  const signals = questionBankSignals(combined);
  const questionScore = nativeCount * 8 + Math.min(signals.optionMarkers, 30) + Math.min(signals.questionMarks, 20) * 2 + Math.min(signals.solutionMarkers, 5) * 4;
  const proseScore = Math.min(proseSentenceCount, 20) * 4;

  let kind: SourceStudyQuality['kind'] = 'unknown';
  if (questionScore >= 35 && proseScore >= 24) kind = 'mixed';
  else if (questionScore >= 28) kind = 'question-bank';
  else if (proseScore >= 16) kind = 'notes';

  const score = clamp(Math.round(Math.max(questionScore, proseScore) * 1.6), 0, 100);
  const label = kind === 'question-bank'
    ? 'Soru bankası'
    : kind === 'mixed'
      ? 'Karma kaynak'
      : kind === 'notes'
        ? 'Anlatım / not'
        : 'Ham kaynak';

  let note = 'Kaynak metni indekslendi; yalnız güvenilir yapılar çalışma materyaline dönüştürülür.';
  if (kind === 'question-bank') {
    note = gradedCount > 0
      ? `PDF içindeki gerçek sorular kullanılıyor. ${gradedCount} soruda cevap anahtarı güvenle eşleşti.`
      : 'PDF soru bankası olarak algılandı. Cevap anahtarı güvenle bulunamazsa uygulama doğru şık veya sahte seçenek uydurmaz.';
  } else if (kind === 'mixed') {
    note = 'Kaynakta hem anlatım hem soru yapısı var; gerçek sorular korunur, kartlar yalnız temiz açıklama cümlelerinden çıkarılır.';
  } else if (kind === 'notes') {
    note = 'Kartlar yalnız açıklayıcı cümlelerden üretilir; rastgele kelime silerek çoktan seçmeli soru üretilmez.';
  }

  return { kind, label, score, nativeQuestionCount: nativeCount, gradedQuestionCount: gradedCount, note };
}

function conceptFromSentence(sentence: string) {
  const separators = [sentence.indexOf(':'), sentence.indexOf(','), sentence.indexOf(' – '), sentence.indexOf(' - ')].filter((index) => index > 0);
  const cut = separators.length ? Math.min(...separators) : -1;
  if (cut < 0 || cut > 90) return null;
  const concept = normalizeSpace(sentence.slice(0, cut)).replace(/^[-–—•]+\s*/, '');
  const words = tokens(concept);
  if (words.length < 1 || words.length > 7 || concept.length < 4 || concept.length > 80) return null;
  if (words.every((word) => STOP_WORDS.has(normalizedToken(word)) || NOISE_WORDS.has(normalizedToken(word)))) return null;
  return concept;
}

async function loadChunks(levelName: string, courseName: string, topicName?: string | null) {
  const db = await getLearningDatabase();
  const topic = topicName?.trim() || null;
  const rows = topic
    ? await db.getAllAsync<ChunkRow>(
        `SELECT c.source_id, s.title, s.topic_name, c.chunk_index, c.content
         FROM source_chunks c
         JOIN sources s ON s.id = c.source_id
         WHERE s.level_name = ? AND s.course_name = ? AND s.topic_name = ?
         ORDER BY s.created_at DESC, c.chunk_index ASC
         LIMIT 220`,
        levelName,
        courseName,
        topic,
      )
    : await db.getAllAsync<ChunkRow>(
        `SELECT c.source_id, s.title, s.topic_name, c.chunk_index, c.content
         FROM source_chunks c
         JOIN sources s ON s.id = c.source_id
         WHERE s.level_name = ? AND s.course_name = ?
         ORDER BY s.created_at DESC, c.chunk_index ASC
         LIMIT 220`,
        levelName,
        courseName,
      );
  return rows.filter((row) => row.content.trim().length > 0);
}

export async function buildSourceStudy(
  levelName: string,
  courseName: string,
  topicName?: string | null,
): Promise<SourceStudy> {
  const chunks = await loadChunks(levelName, courseName, topicName);
  const documents = reconstructDocuments(chunks);

  const sentenceRows = uniqueBy(
    chunks.flatMap((row) => sentenceParts(row.content).map((text) => ({ row, text }))),
    (item) => item.text.toLocaleLowerCase('tr-TR'),
  );

  const frequency = new Map<string, number>();
  for (const item of sentenceRows) {
    for (const token of meaningfulTokens(item.text)) {
      const key = normalizedToken(token);
      frequency.set(key, (frequency.get(key) ?? 0) + 1);
    }
  }

  const scoredSentences = sentenceRows
    .map((item) => {
      const terms = meaningfulTokens(item.text);
      const score = terms.reduce((sum, token) => sum + Math.min(frequency.get(normalizedToken(token)) ?? 0, 5), 0) + Math.min(terms.length, 12);
      return { ...item, score };
    })
    .sort((a, b) => b.score - a.score || a.text.length - b.text.length);

  const keyPoints = scoredSentences.slice(0, 6).map((item) => ({
    text: item.text,
    citation: citationFor(item.row, item.text),
  }));

  const flashcards: StudyFlashcard[] = [];
  const usedConcepts = new Set<string>();
  for (const item of scoredSentences) {
    const concept = conceptFromSentence(item.text);
    if (!concept) continue;
    const key = normalizedToken(concept);
    if (usedConcepts.has(key)) continue;
    usedConcepts.add(key);
    flashcards.push({
      id: `card-${flashcards.length}-${hash(item.text)}`,
      front: `${concept} kavramını kaynağa göre açıkla.`,
      back: item.text,
      citation: citationFor(item.row, item.text),
    });
    if (flashcards.length >= 10) break;
  }

  const parsedByDocument = documents.flatMap((document) =>
    parseNativeQuestions(document).map((question) => ({ document, question })),
  );

  const questions: StudyQuestion[] = parsedByDocument.slice(0, 20).map(({ document, question }, index) => {
    const optionTexts = question.options.map((option) => option.text);
    const correctIndex = question.answerLetter
      ? question.options.findIndex((option) => option.letter === question.answerLetter)
      : -1;
    const graded = optionTexts.length >= 3 && correctIndex >= 0;
    const citation = citationFor(document.row, question.raw);
    return {
      id: `source-question-${index}-${hash(`${document.row.source_id}:${question.prompt}`)}`,
      prompt: question.prompt,
      options: optionTexts,
      correctIndex: graded ? correctIndex : null,
      explanation: graded
        ? `Kaynağın cevap anahtarında ${question.answerLetter} seçeneği işaretli. ${citation.excerpt}`
        : 'Bu soru PDF içinden aynen alındı. Güvenilir cevap anahtarı eşleşmediği için Koç doğru cevap uydurmuyor; çözümünü kaynak üzerinden kontrol et.',
      citation,
      mode: graded ? 'graded' : 'self-check',
      sourceQuestionNumber: question.number,
    };
  });

  if (questions.length === 0) {
    for (const card of flashcards.slice(0, 8)) {
      questions.push({
        id: `self-check-${hash(card.id)}`,
        prompt: card.front,
        options: [],
        correctIndex: null,
        explanation: card.back,
        citation: card.citation,
        mode: 'self-check',
        sourceQuestionNumber: null,
      });
    }
  }

  const gradedQuestionCount = questions.filter((question) => question.mode === 'graded').length;
  const nativeQuestionCount = parsedByDocument.length;
  const quality = buildQuality(documents, nativeQuestionCount, gradedQuestionCount, sentenceRows.length);

  return {
    sourceCount: new Set(chunks.map((chunk) => chunk.source_id)).size,
    chunkCount: chunks.length,
    keyPoints,
    flashcards,
    questions,
    quality,
  };
}

export async function searchSourcePassages(
  levelName: string,
  courseName: string,
  query: string,
  topicName?: string | null,
  limit = 8,
): Promise<StudyCitation[]> {
  const terms = uniqueBy(meaningfulTokens(query).map(normalizedToken), (term) => term);
  if (!terms.length) return [];
  const chunks = await loadChunks(levelName, courseName, topicName);
  return chunks
    .map((row) => {
      const cleaned = cleanStudyText(row.content);
      const normalized = cleaned.toLocaleLowerCase('tr-TR');
      const score = terms.reduce((sum, term) => {
        const occurrences = normalized.split(term).length - 1;
        return sum + Math.min(occurrences, 4) * 3;
      }, 0);
      return { row, cleaned, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.row.chunk_index - b.row.chunk_index)
    .slice(0, limit)
    .map(({ row, cleaned }) => citationFor(row, cleaned));
}
