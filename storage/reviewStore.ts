import { getLearningDatabase } from '@/storage/database';
import { recordQuizAnswer } from '@/storage/learningStore';

export type ReviewItem = {
  levelName: string;
  courseName: string;
  questionId: string;
  dueAt: string;
  intervalDays: number;
  correctStreak: number;
  wrongCount: number;
  lastAnswerCorrect: boolean;
  updatedAt: string;
};

export type WeakCourse = {
  levelName: string;
  courseName: string;
  accuracy: number;
  questionsAnswered: number;
  dueCount: number;
  trackedQuestions: number;
};

export type ReviewDashboard = {
  dueCount: number;
  trackedCount: number;
  nextDueAt: string | null;
  weakCourses: WeakCourse[];
};

type ReviewRow = {
  level_name: string;
  course_name: string;
  question_id: string;
  due_at: string;
  interval_days: number;
  correct_streak: number;
  wrong_count: number;
  last_answer_correct: number;
  updated_at: string;
};

type WeakCourseRow = {
  level_name: string;
  course_name: string;
  questions_answered: number;
  correct_answers: number;
  due_count: number | null;
  tracked_questions: number;
};

let schemaPromise: Promise<void> | null = null;

async function ensureReviewSchema() {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      const db = await getLearningDatabase();
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS quiz_attempts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          level_name TEXT NOT NULL,
          course_name TEXT NOT NULL,
          question_id TEXT NOT NULL,
          correct INTEGER NOT NULL,
          selected_answer TEXT,
          answered_at TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_quiz_attempts_course_date
          ON quiz_attempts(level_name, course_name, answered_at DESC);

        CREATE INDEX IF NOT EXISTS idx_quiz_attempts_question
          ON quiz_attempts(level_name, course_name, question_id, answered_at DESC);

        CREATE TABLE IF NOT EXISTS review_items (
          level_name TEXT NOT NULL,
          course_name TEXT NOT NULL,
          question_id TEXT NOT NULL,
          due_at TEXT NOT NULL,
          interval_days INTEGER NOT NULL DEFAULT 0,
          correct_streak INTEGER NOT NULL DEFAULT 0,
          wrong_count INTEGER NOT NULL DEFAULT 0,
          last_answer_correct INTEGER NOT NULL DEFAULT 0,
          updated_at TEXT NOT NULL,
          PRIMARY KEY(level_name, course_name, question_id)
        );

        CREATE INDEX IF NOT EXISTS idx_review_items_due
          ON review_items(due_at ASC);
      `);
    })();
  }
  return schemaPromise;
}

function toReviewItem(row: ReviewRow): ReviewItem {
  return {
    levelName: row.level_name,
    courseName: row.course_name,
    questionId: row.question_id,
    dueAt: row.due_at,
    intervalDays: row.interval_days,
    correctStreak: row.correct_streak,
    wrongCount: row.wrong_count,
    lastAnswerCorrect: row.last_answer_correct === 1,
    updatedAt: row.updated_at,
  };
}

function addHours(base: Date, hours: number) {
  return new Date(base.getTime() + hours * 60 * 60 * 1000).toISOString();
}

function addDays(base: Date, days: number) {
  return new Date(base.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
}

function nextIntervalDays(currentInterval: number) {
  if (currentInterval <= 0) return 1;
  if (currentInterval < 3) return 3;
  if (currentInterval < 7) return 7;
  return Math.min(30, Math.max(14, Math.round(currentInterval * 1.8)));
}

export async function recordQuizOutcome(input: {
  levelName: string;
  courseName: string;
  questionId: string;
  correct: boolean;
  selectedAnswer?: string | null;
}) {
  await ensureReviewSchema();
  const db = await getLearningDatabase();
  const now = new Date();
  const nowIso = now.toISOString();

  await db.runAsync(
    `INSERT INTO quiz_attempts(
      level_name, course_name, question_id, correct, selected_answer, answered_at
    ) VALUES(?, ?, ?, ?, ?, ?)`,
    input.levelName,
    input.courseName,
    input.questionId,
    input.correct ? 1 : 0,
    input.selectedAnswer ?? null,
    nowIso,
  );

  const current = await db.getFirstAsync<ReviewRow>(
    `SELECT * FROM review_items
     WHERE level_name = ? AND course_name = ? AND question_id = ?`,
    input.levelName,
    input.courseName,
    input.questionId,
  );

  if (!input.correct) {
    await db.runAsync(
      `INSERT INTO review_items(
        level_name, course_name, question_id, due_at, interval_days,
        correct_streak, wrong_count, last_answer_correct, updated_at
      ) VALUES(?, ?, ?, ?, 0, 0, 1, 0, ?)
      ON CONFLICT(level_name, course_name, question_id) DO UPDATE SET
        due_at = excluded.due_at,
        interval_days = 0,
        correct_streak = 0,
        wrong_count = review_items.wrong_count + 1,
        last_answer_correct = 0,
        updated_at = excluded.updated_at`,
      input.levelName,
      input.courseName,
      input.questionId,
      addHours(now, 6),
      nowIso,
    );
  } else if (current) {
    const intervalDays = nextIntervalDays(current.interval_days);
    await db.runAsync(
      `UPDATE review_items
       SET due_at = ?, interval_days = ?, correct_streak = correct_streak + 1,
           last_answer_correct = 1, updated_at = ?
       WHERE level_name = ? AND course_name = ? AND question_id = ?`,
      addDays(now, intervalDays),
      intervalDays,
      nowIso,
      input.levelName,
      input.courseName,
      input.questionId,
    );
  }

  await recordQuizAnswer(input.levelName, input.courseName, input.correct);
}

export async function getDueReviewItems(limit = 30): Promise<ReviewItem[]> {
  await ensureReviewSchema();
  const db = await getLearningDatabase();
  const rows = await db.getAllAsync<ReviewRow>(
    `SELECT * FROM review_items
     WHERE due_at <= ?
     ORDER BY due_at ASC, wrong_count DESC
     LIMIT ?`,
    new Date().toISOString(),
    limit,
  );
  return rows.map(toReviewItem);
}

export async function getReviewDashboard(): Promise<ReviewDashboard> {
  await ensureReviewSchema();
  const db = await getLearningDatabase();
  const nowIso = new Date().toISOString();

  const [dueRow, trackedRow, nextRow, weakRows] = await Promise.all([
    db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) AS count FROM review_items WHERE due_at <= ?',
      nowIso,
    ),
    db.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM review_items'),
    db.getFirstAsync<{ due_at: string | null }>(
      'SELECT MIN(due_at) AS due_at FROM review_items WHERE due_at > ?',
      nowIso,
    ),
    db.getAllAsync<WeakCourseRow>(
      `SELECT
         p.level_name,
         p.course_name,
         p.questions_answered,
         p.correct_answers,
         COUNT(r.question_id) AS tracked_questions,
         SUM(CASE WHEN r.due_at <= ? THEN 1 ELSE 0 END) AS due_count
       FROM course_progress p
       LEFT JOIN review_items r
         ON r.level_name = p.level_name AND r.course_name = p.course_name
       WHERE p.questions_answered > 0
       GROUP BY p.level_name, p.course_name, p.questions_answered, p.correct_answers
       ORDER BY
         (CAST(p.correct_answers AS REAL) / p.questions_answered) ASC,
         p.questions_answered DESC
       LIMIT 4`,
      nowIso,
    ),
  ]);

  return {
    dueCount: dueRow?.count ?? 0,
    trackedCount: trackedRow?.count ?? 0,
    nextDueAt: nextRow?.due_at ?? null,
    weakCourses: weakRows.map((row) => ({
      levelName: row.level_name,
      courseName: row.course_name,
      accuracy: row.questions_answered
        ? Math.round((row.correct_answers / row.questions_answered) * 100)
        : 0,
      questionsAnswered: row.questions_answered,
      dueCount: Number(row.due_count ?? 0),
      trackedQuestions: row.tracked_questions,
    })),
  };
}
