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

export type StudyQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  citation: StudyCitation;
};

export type SourceStudy = {
  sourceCount: number;
  chunkCount: number;
  keyPoints: Array<{ text: string; citation: StudyCitation }>;
  flashcards: StudyFlashcard[];
  questions: StudyQuestion[];
};

type ChunkRow = {
  source_id: string;
  title: string;
  topic_name: string | null;
  chunk_index: number;
  content: string;
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

function normalizeSpace(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function sentenceParts(text: string) {
  const compact = normalizeSpace(text.replace(/\u0000/g, ' '));
  const matches = compact.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [];
  return matches
    .map((part) => normalizeSpace(part))
    .filter((part) => part.length >= 45 && part.length <= 360);
}

function tokens(text: string) {
  return (
    text.match(/[A-Za-zÇĞİÖŞÜçğıöşü0-9'-]+/g) ?? []
  )
    .map((token) => token.replace(/^[-']+|[-']+$/g, ''))
    .filter(Boolean);
}

function normalizedToken(token: string) {
  return token.toLocaleLowerCase('tr-TR');
}

function meaningfulTokens(text: string) {
  return tokens(text).filter((token) => {
    const normalized = normalizedToken(token);
    return token.length >= 4 && !STOP_WORDS.has(normalized) && !/^\d+$/.test(token);
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

function citationFor(row: ChunkRow, excerpt: string): StudyCitation {
  return {
    sourceId: row.source_id,
    sourceTitle: row.title,
    topicName: row.topic_name,
    excerpt: excerpt.slice(0, 360),
  };
}

function replaceFirstCaseInsensitive(sentence: string, term: string) {
  const index = sentence.toLocaleLowerCase('tr-TR').indexOf(term.toLocaleLowerCase('tr-TR'));
  if (index < 0) return sentence;
  return `${sentence.slice(0, index)}_____ ${sentence.slice(index + term.length)}`.replace(/_____\s+([.,;:!?])/g, '_____$1');
}

function hash(value: string) {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function rotate<T>(items: T[], offset: number) {
  if (!items.length) return items;
  const start = offset % items.length;
  return [...items.slice(start), ...items.slice(0, start)];
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
         LIMIT 160`,
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
         LIMIT 160`,
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
  const sentenceRows = uniqueBy(
    chunks.flatMap((row) => sentenceParts(row.content).map((text) => ({ row, text }))),
    (item) => item.text.toLocaleLowerCase('tr-TR'),
  );

  const frequency = new Map<string, { label: string; count: number }>();
  for (const item of sentenceRows) {
    for (const token of meaningfulTokens(item.text)) {
      const key = normalizedToken(token);
      const current = frequency.get(key);
      frequency.set(key, { label: current?.label ?? token, count: (current?.count ?? 0) + 1 });
    }
  }

  const rankedTerms = [...frequency.entries()]
    .sort((a, b) => b[1].count - a[1].count || b[1].label.length - a[1].label.length)
    .map(([key, value]) => ({ key, ...value }))
    .slice(0, 80);
  const termRank = new Map(rankedTerms.map((term, index) => [term.key, rankedTerms.length - index]));

  const scoredSentences = sentenceRows
    .map((item) => {
      const score = meaningfulTokens(item.text).reduce(
        (sum, token) => sum + (termRank.get(normalizedToken(token)) ?? 0),
        0,
      );
      return { ...item, score };
    })
    .sort((a, b) => b.score - a.score || a.text.length - b.text.length);

  const keyPoints = scoredSentences.slice(0, 6).map((item) => ({
    text: item.text,
    citation: citationFor(item.row, item.text),
  }));

  const flashcards: StudyFlashcard[] = [];
  const usedTerms = new Set<string>();
  for (const item of scoredSentences) {
    const candidates = meaningfulTokens(item.text)
      .map((token) => ({ token, rank: termRank.get(normalizedToken(token)) ?? 0 }))
      .sort((a, b) => b.rank - a.rank || b.token.length - a.token.length);
    const candidate = candidates.find((entry) => !usedTerms.has(normalizedToken(entry.token)));
    if (!candidate) continue;
    usedTerms.add(normalizedToken(candidate.token));
    flashcards.push({
      id: `card-${flashcards.length}-${hash(item.text)}`,
      front: replaceFirstCaseInsensitive(item.text, candidate.token),
      back: candidate.token,
      citation: citationFor(item.row, item.text),
    });
    if (flashcards.length >= 10) break;
  }

  const questions: StudyQuestion[] = [];
  const allDistractors = rankedTerms.map((term) => term.label);
  for (const card of flashcards) {
    const distractors = allDistractors.filter(
      (term) => normalizedToken(term) !== normalizedToken(card.back) && !card.citation.excerpt.toLocaleLowerCase('tr-TR').includes(term.toLocaleLowerCase('tr-TR')),
    );
    if (distractors.length < 3) continue;
    const rotated = rotate(distractors, hash(card.id));
    const rawOptions = [card.back, ...rotated.slice(0, 3)];
    const options = rotate(rawOptions, hash(card.front) % rawOptions.length);
    questions.push({
      id: `question-${questions.length}-${hash(card.id)}`,
      prompt: `Kaynağa göre boşluğu tamamla:\n${card.front}`,
      options,
      correctIndex: options.findIndex((option) => option === card.back),
      explanation: card.citation.excerpt,
      citation: card.citation,
    });
    if (questions.length >= 8) break;
  }

  return {
    sourceCount: new Set(chunks.map((chunk) => chunk.source_id)).size,
    chunkCount: chunks.length,
    keyPoints,
    flashcards,
    questions,
  };
}

export async function searchSourcePassages(
  levelName: string,
  courseName: string,
  query: string,
  topicName?: string | null,
  limit = 8,
): Promise<StudyCitation[]> {
  const terms = meaningfulTokens(query).map(normalizedToken);
  if (!terms.length) return [];
  const chunks = await loadChunks(levelName, courseName, topicName);
  return chunks
    .map((row) => {
      const normalized = row.content.toLocaleLowerCase('tr-TR');
      const score = terms.reduce((sum, term) => sum + (normalized.includes(term) ? 1 : 0), 0);
      return { row, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.row.chunk_index - b.row.chunk_index)
    .slice(0, limit)
    .map(({ row }) => citationFor(row, normalizeSpace(row.content)));
}
