import { getLearningDatabase } from '@/storage/database';

export type StudyGoal = {
  id: string;
  title: string;
  targetDate: string;
  levelName: string | null;
  courseName: string | null;
  dailyMinutes: number;
  createdAt: string;
  updatedAt: string;
};

type GoalRow = {
  id: string;
  title: string;
  target_date: string;
  level_name: string | null;
  course_name: string | null;
  daily_minutes: number;
  created_at: string;
  updated_at: string;
};

let goalSchemaPromise: Promise<void> | null = null;

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseLocalDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }
  return parsed;
}

async function ensureGoalSchema() {
  if (!goalSchemaPromise) {
    goalSchemaPromise = (async () => {
      const db = await getLearningDatabase();
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS study_goals (
          id TEXT PRIMARY KEY NOT NULL,
          title TEXT NOT NULL,
          target_date TEXT NOT NULL,
          level_name TEXT,
          course_name TEXT,
          daily_minutes INTEGER NOT NULL DEFAULT 20,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);
    })();
  }
  return goalSchemaPromise;
}

function rowToGoal(row: GoalRow): StudyGoal {
  return {
    id: row.id,
    title: row.title,
    targetDate: row.target_date,
    levelName: row.level_name,
    courseName: row.course_name,
    dailyMinutes: Number(row.daily_minutes ?? 20),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getDaysRemaining(targetDate: string) {
  const target = parseLocalDate(targetDate);
  if (!target) return 0;
  const today = parseLocalDate(localDateKey())!;
  const diff = target.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

export function getGoalPaceLabel(targetDate: string) {
  const days = getDaysRemaining(targetDate);
  if (days <= 3) return 'Son sprint';
  if (days <= 7) return 'Yoğun tempo';
  if (days <= 21) return 'Odaklı tempo';
  return 'Dengeli tempo';
}

export async function getActiveGoal(): Promise<StudyGoal | null> {
  await ensureGoalSchema();
  const db = await getLearningDatabase();
  const row = await db.getFirstAsync<GoalRow>(
    `SELECT id, title, target_date, level_name, course_name, daily_minutes, created_at, updated_at
     FROM study_goals
     ORDER BY updated_at DESC
     LIMIT 1`,
  );
  return row ? rowToGoal(row) : null;
}

export async function saveStudyGoal(input: {
  title: string;
  targetDate: string;
  levelName?: string | null;
  courseName?: string | null;
  dailyMinutes?: number;
}) {
  await ensureGoalSchema();
  if (!parseLocalDate(input.targetDate)) {
    throw new Error('Hedef tarihi YYYY-AA-GG biçiminde olmalı.');
  }

  const db = await getLearningDatabase();
  const existing = await getActiveGoal();
  const now = new Date().toISOString();
  const id = existing?.id ?? 'active-goal';
  const createdAt = existing?.createdAt ?? now;
  const dailyMinutes = Math.max(10, Math.min(180, Math.round(input.dailyMinutes ?? 30)));

  await db.runAsync(
    `INSERT INTO study_goals(
      id, title, target_date, level_name, course_name, daily_minutes, created_at, updated_at
    ) VALUES(?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      target_date = excluded.target_date,
      level_name = excluded.level_name,
      course_name = excluded.course_name,
      daily_minutes = excluded.daily_minutes,
      updated_at = excluded.updated_at`,
    id,
    input.title.trim() || 'Çalışma hedefim',
    input.targetDate,
    input.levelName ?? null,
    input.courseName ?? null,
    dailyMinutes,
    createdAt,
    now,
  );

  await db.runAsync('DELETE FROM daily_plan_tasks WHERE plan_date = ?', localDateKey());
  return getActiveGoal();
}

export async function clearStudyGoal() {
  await ensureGoalSchema();
  const db = await getLearningDatabase();
  await db.runAsync('DELETE FROM study_goals');
  await db.runAsync('DELETE FROM daily_plan_tasks WHERE plan_date = ?', localDateKey());
}
