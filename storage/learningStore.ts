import type { SQLiteDatabase } from 'expo-sqlite';

import { getLearningDatabase, isFullTextSearchAvailable } from '@/storage/database';

export type SourceKind = 'note' | 'file';

export type LocalSource = {
  id: string;
  levelName: string;
  courseName: string;
  topicName: string | null;
  kind: SourceKind;
  title: string;
  body: string;
  fileUri: string | null;
  fileName: string | null;
  mimeType: string | null;
  fileSize: number | null;
  createdAt: string;
  updatedAt: string;
};

export type AddSourceInput = {
  levelName: string;
  courseName: string;
  topicName?: string | null;
  kind?: SourceKind;
  title: string;
  body?: string;
  fileUri?: string | null;
  fileName?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
  searchContent?: string;
};

export type SourceSearchChunk = {
  sourceId: string;
  sourceTitle: string;
  topicName: string | null;
  content: string;
};

export type CourseProgress = {
  levelName: string;
  courseName: string;
  sessions: number;
  questionsAnswered: number;
  correctAnswers: number;
  lastStudiedAt: string | null;
};

export type ActivityStats = {
  streakDays: number;
  lastStudyDate: string | null;
  totalStudyActions: number;
};

type SourceRow = {
  id: string;
  level_name: string;
  course_name: string;
  topic_name: string | null;
  kind: SourceKind;
  title: string;
  body: string;
  file_uri: string | null;
  file_name: string | null;
  mime_type: string | null;
  file_size: number | null;
  created_at: string;
  updated_at: string;
};

type ProgressRow = {
  level_name: string;
  course_name: string;
  sessions: number;
  questions_answered: number;
  correct_answers: number;
  last_studied_at: string | null;
};

type ActivityRow = {
  streak_days: number;
  last_study_date: string | null;
  total_study_actions: number;
};

const emptyActivity: ActivityStats = {
  streakDays: 0,
  lastStudyDate: null,
  totalStudyActions: 0,
};

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function yesterdayDateKey() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return localDateKey(date);
}

function toSource(row: SourceRow): LocalSource {
  return {
    id: row.id,
    levelName: row.level_name,
    courseName: row.course_name,
    topicName: row.topic_name,
    kind: row.kind,
    title: row.title,
    body: row.body,
    fileUri: row.file_uri,
    fileName: row.file_name,
    mimeType: row.mime_type,
    fileSize: row.file_size,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toProgress(row: ProgressRow): CourseProgress {
  return {
    levelName: row.level_name,
    courseName: row.course_name,
    sessions: row.sessions,
    questionsAnswered: row.questions_answered,
    correctAnswers: row.correct_answers,
    lastStudiedAt: row.last_studied_at,
  };
}

function chunkText(text: string, maxChars = 1200, overlap = 160) {
  const normalized = text.replace(/\r/g, '').trim();
  if (!normalized) return [];

  const chunks: string[] = [];
  let start = 0;

  while (start < normalized.length) {
    let end = Math.min(start + maxChars, normalized.length);
    if (end < normalized.length) {
      const breakAt = Math.max(
        normalized.lastIndexOf('\n', end),
        normalized.lastIndexOf('. ', end),
        normalized.lastIndexOf(' ', end),
      );
      if (breakAt > start + Math.floor(maxChars * 0.55)) end = breakAt + 1;
    }

    const chunk = normalized.slice(start, end).trim();
    if (chunk) chunks.push(chunk);
    if (end >= normalized.length) break;
    start = Math.max(end - overlap, start + 1);
  }

  return chunks;
}

async function replaceSourceChunks(
  db: SQLiteDatabase,
  source: LocalSource,
  searchContent: string,
) {
  await db.runAsync('DELETE FROM source_chunks WHERE source_id = ?', source.id);
  if (isFullTextSearchAvailable()) {
    try {
      await db.runAsync('DELETE FROM source_chunks_fts WHERE source_id = ?', source.id);
    } catch {
      // FTS tablosu cihazda kullanılamıyorsa LIKE araması devreye girer.
    }
  }

  const chunks = chunkText(searchContent);
  for (let index = 0; index < chunks.length; index += 1) {
    const content = chunks[index];
    await db.runAsync(
      'INSERT INTO source_chunks(source_id, chunk_index, content) VALUES(?, ?, ?)',
      source.id,
      index,
      content,
    );

    if (isFullTextSearchAvailable()) {
      try {
        await db.runAsync(
          `INSERT INTO source_chunks_fts(
            source_id, level_name, course_name, topic_name, title, content
          ) VALUES(?, ?, ?, ?, ?, ?)`,
          source.id,
          source.levelName,
          source.courseName,
          source.topicName ?? '',
          source.title,
          content,
        );
      } catch {
        // Arama yine source_chunks üzerinden çalışabilir.
      }
    }
  }
}

function normalizeSearchTerms(query: string) {
  return query
    .normalize('NFKC')
    .split(/\s+/)
    .map((part) => part.replace(/[^\p{L}\p{N}_-]+/gu, ''))
    .filter(Boolean)
    .slice(0, 8);
}

export async function getSources(): Promise<LocalSource[]> {
  const db = await getLearningDatabase();
  const rows = await db.getAllAsync<SourceRow>('SELECT * FROM sources ORDER BY created_at DESC');
  return rows.map(toSource);
}

export async function getSourcesForCourse(levelName: string, courseName: string) {
  const db = await getLearningDatabase();
  const rows = await db.getAllAsync<SourceRow>(
    `SELECT * FROM sources
     WHERE level_name = ? AND course_name = ?
     ORDER BY created_at DESC`,
    levelName,
    courseName,
  );
  return rows.map(toSource);
}

export async function getTopicsForCourse(levelName: string, courseName: string) {
  const db = await getLearningDatabase();
  const rows = await db.getAllAsync<{ topic_name: string }>(
    `SELECT DISTINCT topic_name FROM sources
     WHERE level_name = ? AND course_name = ? AND topic_name IS NOT NULL AND TRIM(topic_name) <> ''
     ORDER BY topic_name COLLATE NOCASE ASC`,
    levelName,
    courseName,
  );
  return rows.map((row) => row.topic_name);
}

export async function addSource(input: AddSourceInput) {
  const db = await getLearningDatabase();
  const createdAt = new Date().toISOString();
  const source: LocalSource = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    levelName: input.levelName,
    courseName: input.courseName,
    topicName: input.topicName?.trim() || null,
    kind: input.kind ?? 'note',
    title: input.title.trim(),
    body: input.body?.trim() ?? '',
    fileUri: input.fileUri ?? null,
    fileName: input.fileName ?? null,
    mimeType: input.mimeType ?? null,
    fileSize: input.fileSize ?? null,
    createdAt,
    updatedAt: createdAt,
  };

  await db.runAsync(
    `INSERT INTO sources(
      id, level_name, course_name, topic_name, kind, title, body,
      file_uri, file_name, mime_type, file_size, created_at, updated_at
    ) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    source.id,
    source.levelName,
    source.courseName,
    source.topicName,
    source.kind,
    source.title,
    source.body,
    source.fileUri,
    source.fileName,
    source.mimeType,
    source.fileSize,
    source.createdAt,
    source.updatedAt,
  );

  const searchableText = input.searchContent?.trim() || source.body;
  await replaceSourceChunks(db, source, searchableText);
  await recordStudyActivity();
  return source;
}

export async function removeSource(id: string) {
  const db = await getLearningDatabase();
  const row = await db.getFirstAsync<SourceRow>('SELECT * FROM sources WHERE id = ?', id);

  if (isFullTextSearchAvailable()) {
    try {
      await db.runAsync('DELETE FROM source_chunks_fts WHERE source_id = ?', id);
    } catch {
      // Kaynak ana tablodan yine de silinir.
    }
  }
  await db.runAsync('DELETE FROM sources WHERE id = ?', id);
  return row ? toSource(row) : null;
}

export async function searchSourcesForCourse(
  levelName: string,
  courseName: string,
  query: string,
  topicName?: string | null,
) {
  const db = await getLearningDatabase();
  const trimmedQuery = query.trim();
  const topic = topicName?.trim() || null;

  if (!trimmedQuery) {
    const rows = topic
      ? await db.getAllAsync<SourceRow>(
          `SELECT * FROM sources
           WHERE level_name = ? AND course_name = ? AND topic_name = ?
           ORDER BY created_at DESC`,
          levelName,
          courseName,
          topic,
        )
      : await db.getAllAsync<SourceRow>(
          `SELECT * FROM sources
           WHERE level_name = ? AND course_name = ?
           ORDER BY created_at DESC`,
          levelName,
          courseName,
        );
    return rows.map(toSource);
  }

  const terms = normalizeSearchTerms(trimmedQuery);
  if (terms.length && isFullTextSearchAvailable()) {
    try {
      const ftsQuery = terms.map((term) => `${term}*`).join(' AND ');
      const rows = topic
        ? await db.getAllAsync<SourceRow>(
            `SELECT DISTINCT s.* FROM sources s
             JOIN source_chunks_fts ON source_chunks_fts.source_id = s.id
             WHERE s.level_name = ? AND s.course_name = ? AND s.topic_name = ?
               AND source_chunks_fts MATCH ?
             ORDER BY s.created_at DESC`,
            levelName,
            courseName,
            topic,
            ftsQuery,
          )
        : await db.getAllAsync<SourceRow>(
            `SELECT DISTINCT s.* FROM sources s
             JOIN source_chunks_fts ON source_chunks_fts.source_id = s.id
             WHERE s.level_name = ? AND s.course_name = ?
               AND source_chunks_fts MATCH ?
             ORDER BY s.created_at DESC`,
            levelName,
            courseName,
            ftsQuery,
          );
      return rows.map(toSource);
    } catch (error) {
      console.warn('FTS araması başarısız, LIKE aramasına geçiliyor.', error);
    }
  }

  const like = `%${trimmedQuery}%`;
  const rows = topic
    ? await db.getAllAsync<SourceRow>(
        `SELECT DISTINCT s.* FROM sources s
         LEFT JOIN source_chunks c ON c.source_id = s.id
         WHERE s.level_name = ? AND s.course_name = ? AND s.topic_name = ?
           AND (s.title LIKE ? OR s.body LIKE ? OR COALESCE(s.topic_name, '') LIKE ? OR c.content LIKE ?)
         ORDER BY s.created_at DESC`,
        levelName,
        courseName,
        topic,
        like,
        like,
        like,
        like,
      )
    : await db.getAllAsync<SourceRow>(
        `SELECT DISTINCT s.* FROM sources s
         LEFT JOIN source_chunks c ON c.source_id = s.id
         WHERE s.level_name = ? AND s.course_name = ?
           AND (s.title LIKE ? OR s.body LIKE ? OR COALESCE(s.topic_name, '') LIKE ? OR c.content LIKE ?)
         ORDER BY s.created_at DESC`,
        levelName,
        courseName,
        like,
        like,
        like,
        like,
      );
  return rows.map(toSource);
}

export async function getRelevantSourceChunks(
  levelName: string,
  courseName: string,
  query: string,
  limit = 8,
): Promise<SourceSearchChunk[]> {
  const db = await getLearningDatabase();
  const terms = normalizeSearchTerms(query);
  if (!terms.length) return [];

  if (isFullTextSearchAvailable()) {
    try {
      const ftsQuery = terms.map((term) => `${term}*`).join(' AND ');
      const rows = await db.getAllAsync<{
        source_id: string;
        title: string;
        topic_name: string | null;
        content: string;
      }>(
        `SELECT source_id, title, topic_name, content
         FROM source_chunks_fts
         WHERE level_name = ? AND course_name = ? AND source_chunks_fts MATCH ?
         LIMIT ?`,
        levelName,
        courseName,
        ftsQuery,
        limit,
      );
      return rows.map((row) => ({
        sourceId: row.source_id,
        sourceTitle: row.title,
        topicName: row.topic_name || null,
        content: row.content,
      }));
    } catch {
      // Aşağıdaki LIKE araması güvenli fallback'tir.
    }
  }

  const like = `%${query.trim()}%`;
  const rows = await db.getAllAsync<{
    source_id: string;
    title: string;
    topic_name: string | null;
    content: string;
  }>(
    `SELECT c.source_id, s.title, s.topic_name, c.content
     FROM source_chunks c
     JOIN sources s ON s.id = c.source_id
     WHERE s.level_name = ? AND s.course_name = ? AND c.content LIKE ?
     ORDER BY s.created_at DESC, c.chunk_index ASC
     LIMIT ?`,
    levelName,
    courseName,
    like,
    limit,
  );
  return rows.map((row) => ({
    sourceId: row.source_id,
    sourceTitle: row.title,
    topicName: row.topic_name,
    content: row.content,
  }));
}

export async function getProgress(): Promise<CourseProgress[]> {
  const db = await getLearningDatabase();
  const rows = await db.getAllAsync<ProgressRow>(
    'SELECT * FROM course_progress ORDER BY last_studied_at DESC',
  );
  return rows.map(toProgress);
}

export async function recordCourseSession(levelName: string, courseName: string) {
  const db = await getLearningDatabase();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO course_progress(
      level_name, course_name, sessions, questions_answered, correct_answers, last_studied_at
    ) VALUES(?, ?, 1, 0, 0, ?)
    ON CONFLICT(level_name, course_name) DO UPDATE SET
      sessions = sessions + 1,
      last_studied_at = excluded.last_studied_at`,
    levelName,
    courseName,
    now,
  );
  return recordStudyActivity();
}

export async function recordQuizAnswer(levelName: string, courseName: string, correct: boolean) {
  const db = await getLearningDatabase();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO course_progress(
      level_name, course_name, sessions, questions_answered, correct_answers, last_studied_at
    ) VALUES(?, ?, 0, 1, ?, ?)
    ON CONFLICT(level_name, course_name) DO UPDATE SET
      questions_answered = questions_answered + 1,
      correct_answers = correct_answers + excluded.correct_answers,
      last_studied_at = excluded.last_studied_at`,
    levelName,
    courseName,
    correct ? 1 : 0,
    now,
  );
  return recordStudyActivity();
}

export async function getActivityStats(): Promise<ActivityStats> {
  const db = await getLearningDatabase();
  const row = await db.getFirstAsync<ActivityRow>(
    'SELECT streak_days, last_study_date, total_study_actions FROM activity_stats WHERE id = 1',
  );
  if (!row) return emptyActivity;
  return {
    streakDays: row.streak_days,
    lastStudyDate: row.last_study_date,
    totalStudyActions: row.total_study_actions,
  };
}

export async function recordStudyActivity(): Promise<ActivityStats> {
  const db = await getLearningDatabase();
  const current = await getActivityStats();
  const today = localDateKey();

  const next: ActivityStats = current.lastStudyDate === today
    ? { ...current, totalStudyActions: current.totalStudyActions + 1 }
    : {
        streakDays: current.lastStudyDate === yesterdayDateKey() ? current.streakDays + 1 : 1,
        lastStudyDate: today,
        totalStudyActions: current.totalStudyActions + 1,
      };

  await db.runAsync(
    `UPDATE activity_stats
     SET streak_days = ?, last_study_date = ?, total_study_actions = ?
     WHERE id = 1`,
    next.streakDays,
    next.lastStudyDate,
    next.totalStudyActions,
  );
  return next;
}
