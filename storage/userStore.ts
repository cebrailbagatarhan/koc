import { getLearningDatabase } from '@/storage/database';

export type LearnerProfile = {
  id: string;
  displayName: string;
  levelName: string | null;
  dailyMinutes: number;
  createdAt: string;
  updatedAt: string;
};

type LearnerRow = {
  id: string;
  display_name: string;
  level_name: string | null;
  daily_minutes: number;
  created_at: string;
  updated_at: string;
};

let schemaPromise: Promise<void> | null = null;

async function ensureUserSchema() {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      const db = await getLearningDatabase();
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS learner_profiles (
          id TEXT PRIMARY KEY NOT NULL,
          display_name TEXT NOT NULL,
          level_name TEXT,
          daily_minutes INTEGER NOT NULL DEFAULT 25,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS learner_preferences (
          learner_id TEXT NOT NULL,
          key TEXT NOT NULL,
          value TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          PRIMARY KEY(learner_id, key),
          FOREIGN KEY(learner_id) REFERENCES learner_profiles(id) ON DELETE CASCADE
        );
      `);
    })();
  }
  return schemaPromise;
}

function rowToProfile(row: LearnerRow): LearnerProfile {
  return {
    id: row.id,
    displayName: row.display_name,
    levelName: row.level_name,
    dailyMinutes: row.daily_minutes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function createLocalLearnerId() {
  return `learner-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function getActiveLearner(): Promise<LearnerProfile | null> {
  await ensureUserSchema();
  const db = await getLearningDatabase();
  const row = await db.getFirstAsync<LearnerRow>(
    'SELECT * FROM learner_profiles ORDER BY created_at ASC LIMIT 1',
  );
  return row ? rowToProfile(row) : null;
}

export async function ensureActiveLearner(): Promise<LearnerProfile> {
  const existing = await getActiveLearner();
  if (existing) return existing;

  const db = await getLearningDatabase();
  const now = new Date().toISOString();
  const id = createLocalLearnerId();
  await db.runAsync(
    `INSERT INTO learner_profiles(id, display_name, level_name, daily_minutes, created_at, updated_at)
     VALUES(?, ?, NULL, 25, ?, ?)`,
    id,
    'Öğrenci',
    now,
    now,
  );

  return {
    id,
    displayName: 'Öğrenci',
    levelName: null,
    dailyMinutes: 25,
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateLearnerProfile(input: {
  displayName: string;
  levelName?: string | null;
  dailyMinutes?: number;
}) {
  const learner = await ensureActiveLearner();
  const db = await getLearningDatabase();
  const displayName = input.displayName.trim() || 'Öğrenci';
  const dailyMinutes = Math.max(10, Math.min(180, Math.round(input.dailyMinutes ?? learner.dailyMinutes)));
  const updatedAt = new Date().toISOString();

  await db.runAsync(
    `UPDATE learner_profiles
     SET display_name = ?, level_name = ?, daily_minutes = ?, updated_at = ?
     WHERE id = ?`,
    displayName,
    input.levelName ?? learner.levelName,
    dailyMinutes,
    updatedAt,
    learner.id,
  );

  return {
    ...learner,
    displayName,
    levelName: input.levelName ?? learner.levelName,
    dailyMinutes,
    updatedAt,
  };
}

export async function setLearnerPreference(key: string, value: string) {
  const learner = await ensureActiveLearner();
  const db = await getLearningDatabase();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO learner_preferences(learner_id, key, value, updated_at)
     VALUES(?, ?, ?, ?)
     ON CONFLICT(learner_id, key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    learner.id,
    key,
    value,
    now,
  );
}

export async function getLearnerPreference(key: string) {
  const learner = await ensureActiveLearner();
  const db = await getLearningDatabase();
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM learner_preferences WHERE learner_id = ? AND key = ?',
    learner.id,
    key,
  );
  return row?.value ?? null;
}
