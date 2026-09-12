import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'koc-learning.db';
const LEGACY_SOURCES_KEY = 'koc.sources.v1';
const LEGACY_PROGRESS_KEY = 'koc.progress.v1';
const LEGACY_ACTIVITY_KEY = 'koc.activity.v1';
const LEGACY_MIGRATION_KEY = 'legacy_asyncstorage_v1_migrated';

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;
let fullTextSearchAvailable = false;

export function isFullTextSearchAvailable() {
  return fullTextSearchAvailable;
}

export async function getLearningDatabase() {
  if (!databasePromise) {
    databasePromise = initializeDatabase();
  }
  return databasePromise;
}

async function initializeDatabase() {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sources (
      id TEXT PRIMARY KEY NOT NULL,
      level_name TEXT NOT NULL,
      course_name TEXT NOT NULL,
      topic_name TEXT,
      kind TEXT NOT NULL DEFAULT 'note',
      title TEXT NOT NULL,
      body TEXT NOT NULL DEFAULT '',
      file_uri TEXT,
      file_name TEXT,
      mime_type TEXT,
      file_size INTEGER,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_sources_course
      ON sources(level_name, course_name, created_at DESC);

    CREATE INDEX IF NOT EXISTS idx_sources_topic
      ON sources(level_name, course_name, topic_name);

    CREATE TABLE IF NOT EXISTS source_chunks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_id TEXT NOT NULL,
      chunk_index INTEGER NOT NULL,
      content TEXT NOT NULL,
      FOREIGN KEY(source_id) REFERENCES sources(id) ON DELETE CASCADE,
      UNIQUE(source_id, chunk_index)
    );

    CREATE INDEX IF NOT EXISTS idx_source_chunks_source
      ON source_chunks(source_id, chunk_index);

    CREATE TABLE IF NOT EXISTS course_progress (
      level_name TEXT NOT NULL,
      course_name TEXT NOT NULL,
      sessions INTEGER NOT NULL DEFAULT 0,
      questions_answered INTEGER NOT NULL DEFAULT 0,
      correct_answers INTEGER NOT NULL DEFAULT 0,
      last_studied_at TEXT,
      PRIMARY KEY(level_name, course_name)
    );

    CREATE TABLE IF NOT EXISTS activity_stats (
      id INTEGER PRIMARY KEY CHECK(id = 1),
      streak_days INTEGER NOT NULL DEFAULT 0,
      last_study_date TEXT,
      total_study_actions INTEGER NOT NULL DEFAULT 0
    );

    INSERT OR IGNORE INTO activity_stats(id, streak_days, last_study_date, total_study_actions)
      VALUES(1, 0, NULL, 0);
  `);

  try {
    await db.execAsync(`
      CREATE VIRTUAL TABLE IF NOT EXISTS source_chunks_fts USING fts5(
        source_id UNINDEXED,
        level_name UNINDEXED,
        course_name UNINDEXED,
        topic_name,
        title,
        content
      );
    `);
    fullTextSearchAvailable = true;
  } catch (error) {
    fullTextSearchAvailable = false;
    console.warn('FTS5 kullanılamıyor; kaynak araması LIKE sorgusuna düşecek.', error);
  }

  await migrateLegacyAsyncStorage(db);
  await db.runAsync(
    'INSERT OR REPLACE INTO app_meta(key, value) VALUES(?, ?)',
    'schema_version',
    '2',
  );

  return db;
}

async function migrateLegacyAsyncStorage(db: SQLite.SQLiteDatabase) {
  const migrated = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_meta WHERE key = ?',
    LEGACY_MIGRATION_KEY,
  );

  if (migrated?.value === '1') return;

  const [rawSources, rawProgress, rawActivity] = await Promise.all([
    AsyncStorage.getItem(LEGACY_SOURCES_KEY),
    AsyncStorage.getItem(LEGACY_PROGRESS_KEY),
    AsyncStorage.getItem(LEGACY_ACTIVITY_KEY),
  ]);

  if (rawSources) {
    try {
      const sources = JSON.parse(rawSources) as Array<Record<string, unknown>>;
      for (const item of sources) {
        const id = String(item.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
        const levelName = String(item.levelName ?? '');
        const courseName = String(item.courseName ?? '');
        const title = String(item.title ?? 'Kaynak');
        const body = String(item.body ?? '');
        const createdAt = String(item.createdAt ?? new Date().toISOString());
        if (!levelName || !courseName) continue;

        await db.runAsync(
          `INSERT OR IGNORE INTO sources(
            id, level_name, course_name, topic_name, kind, title, body,
            file_uri, file_name, mime_type, file_size, created_at, updated_at
          ) VALUES(?, ?, ?, NULL, 'note', ?, ?, NULL, NULL, NULL, NULL, ?, ?)`,
          id,
          levelName,
          courseName,
          title,
          body,
          createdAt,
          createdAt,
        );

        if (body.trim()) {
          await db.runAsync(
            'INSERT OR IGNORE INTO source_chunks(source_id, chunk_index, content) VALUES(?, 0, ?)',
            id,
            body,
          );
          if (fullTextSearchAvailable) {
            await db.runAsync(
              `INSERT INTO source_chunks_fts(
                source_id, level_name, course_name, topic_name, title, content
              ) VALUES(?, ?, ?, '', ?, ?)`,
              id,
              levelName,
              courseName,
              title,
              body,
            );
          }
        }
      }
    } catch (error) {
      console.warn('Eski kaynak verisi SQLite’a aktarılamadı.', error);
    }
  }

  if (rawProgress) {
    try {
      const progress = JSON.parse(rawProgress) as Array<Record<string, unknown>>;
      for (const item of progress) {
        const levelName = String(item.levelName ?? '');
        const courseName = String(item.courseName ?? '');
        if (!levelName || !courseName) continue;
        await db.runAsync(
          `INSERT OR REPLACE INTO course_progress(
            level_name, course_name, sessions, questions_answered, correct_answers, last_studied_at
          ) VALUES(?, ?, ?, ?, ?, ?)`,
          levelName,
          courseName,
          Number(item.sessions ?? 0),
          Number(item.questionsAnswered ?? 0),
          Number(item.correctAnswers ?? 0),
          item.lastStudiedAt ? String(item.lastStudiedAt) : null,
        );
      }
    } catch (error) {
      console.warn('Eski ilerleme verisi SQLite’a aktarılamadı.', error);
    }
  }

  if (rawActivity) {
    try {
      const activity = JSON.parse(rawActivity) as Record<string, unknown>;
      await db.runAsync(
        `UPDATE activity_stats
         SET streak_days = ?, last_study_date = ?, total_study_actions = ?
         WHERE id = 1`,
        Number(activity.streakDays ?? 0),
        activity.lastStudyDate ? String(activity.lastStudyDate) : null,
        Number(activity.totalStudyActions ?? 0),
      );
    } catch (error) {
      console.warn('Eski aktivite verisi SQLite’a aktarılamadı.', error);
    }
  }

  await db.runAsync(
    'INSERT OR REPLACE INTO app_meta(key, value) VALUES(?, ?)',
    LEGACY_MIGRATION_KEY,
    '1',
  );
}
