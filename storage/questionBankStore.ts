import { getAllCourseKeys } from '@/data/courseCatalog';
import { getQuizQuestions, type QuizQuestion } from '@/data/offlineContent';
import { getTopicsForCatalogCourse } from '@/data/topicCatalog';
import { getLearningDatabase } from '@/storage/database';

const EMBEDDED_PACKAGE_ID = 'embedded-core';
const EMBEDDED_PACKAGE_VERSION = 1;
const SEED_META_KEY = 'embedded_question_bank_version';

export type QuestionBankStats = {
  questionCount: number;
  courseCount: number;
  packageVersion: number;
};

type QuestionRow = {
  id: string;
  prompt: string;
  explanation: string;
};

type OptionRow = {
  option_index: number;
  text: string;
  is_correct: number;
};

async function ensureSchema() {
  const db = await getLearningDatabase();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS question_packages (
      id TEXT PRIMARY KEY NOT NULL,
      version INTEGER NOT NULL,
      label TEXT NOT NULL,
      origin TEXT NOT NULL,
      installed_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS question_bank (
      id TEXT PRIMARY KEY NOT NULL,
      package_id TEXT NOT NULL,
      origin TEXT NOT NULL,
      level_name TEXT NOT NULL,
      course_name TEXT NOT NULL,
      topic_name TEXT,
      prompt TEXT NOT NULL,
      explanation TEXT NOT NULL DEFAULT '',
      difficulty TEXT NOT NULL DEFAULT 'standard',
      status TEXT NOT NULL DEFAULT 'verified',
      version INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(package_id) REFERENCES question_packages(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_question_bank_course
      ON question_bank(level_name, course_name, status);

    CREATE INDEX IF NOT EXISTS idx_question_bank_topic
      ON question_bank(level_name, course_name, topic_name, status);

    CREATE TABLE IF NOT EXISTS question_options (
      question_id TEXT NOT NULL,
      option_index INTEGER NOT NULL,
      text TEXT NOT NULL,
      is_correct INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY(question_id, option_index),
      FOREIGN KEY(question_id) REFERENCES question_bank(id) ON DELETE CASCADE
    );
  `);
  return db;
}

export async function ensureEmbeddedQuestionBankSeeded() {
  const db = await ensureSchema();
  const current = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_meta WHERE key = ?',
    SEED_META_KEY,
  );

  if (Number(current?.value ?? 0) === EMBEDDED_PACKAGE_VERSION) return;

  const installedAt = new Date().toISOString();
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT OR REPLACE INTO question_packages(id, version, label, origin, installed_at)
       VALUES(?, ?, ?, 'embedded', ?)`,
      EMBEDDED_PACKAGE_ID,
      EMBEDDED_PACKAGE_VERSION,
      'Koç Gömülü Soru Bankası',
      installedAt,
    );

    const oldQuestionIds = await db.getAllAsync<{ id: string }>(
      `SELECT id FROM question_bank WHERE package_id = ?`,
      EMBEDDED_PACKAGE_ID,
    );
    for (const row of oldQuestionIds) {
      await db.runAsync('DELETE FROM question_options WHERE question_id = ?', row.id);
    }
    await db.runAsync('DELETE FROM question_bank WHERE package_id = ?', EMBEDDED_PACKAGE_ID);

    for (const { levelName, courseName } of getAllCourseKeys()) {
      const topics = getTopicsForCatalogCourse(levelName, courseName);
      const questions = getQuizQuestions(levelName, courseName);

      for (const question of questions) {
        const topicName = topics.find((topic) => topic.questionIds.includes(question.id))?.name ?? null;
        await db.runAsync(
          `INSERT INTO question_bank(
            id, package_id, origin, level_name, course_name, topic_name,
            prompt, explanation, difficulty, status, version, updated_at
          ) VALUES(?, ?, 'embedded', ?, ?, ?, ?, ?, 'standard', 'verified', 1, ?)`,
          question.id,
          EMBEDDED_PACKAGE_ID,
          levelName,
          courseName,
          topicName,
          question.question,
          question.explanation,
          installedAt,
        );

        for (let optionIndex = 0; optionIndex < question.options.length; optionIndex += 1) {
          const option = question.options[optionIndex];
          await db.runAsync(
            `INSERT INTO question_options(question_id, option_index, text, is_correct)
             VALUES(?, ?, ?, ?)`,
            question.id,
            optionIndex,
            option,
            option === question.correctAnswer ? 1 : 0,
          );
        }
      }
    }

    await db.runAsync(
      'INSERT OR REPLACE INTO app_meta(key, value) VALUES(?, ?)',
      SEED_META_KEY,
      String(EMBEDDED_PACKAGE_VERSION),
    );
  });
}

async function hydrateQuestion(row: QuestionRow): Promise<QuizQuestion | null> {
  const db = await ensureSchema();
  const options = await db.getAllAsync<OptionRow>(
    `SELECT option_index, text, is_correct
     FROM question_options
     WHERE question_id = ?
     ORDER BY option_index ASC`,
    row.id,
  );
  const correct = options.find((option) => option.is_correct === 1)?.text;
  if (!correct || options.length < 2) return null;
  return {
    id: row.id,
    question: row.prompt,
    options: options.map((option) => option.text),
    correctAnswer: correct,
    explanation: row.explanation,
  };
}

export async function getQuestionsFromDatabase(
  levelName?: string,
  courseName?: string,
  topicName?: string | null,
): Promise<QuizQuestion[]> {
  if (!levelName || !courseName) return [];
  await ensureEmbeddedQuestionBankSeeded();
  const db = await ensureSchema();
  const topic = topicName?.trim() || null;
  const rows = topic
    ? await db.getAllAsync<QuestionRow>(
        `SELECT id, prompt, explanation
         FROM question_bank
         WHERE level_name = ? AND course_name = ? AND topic_name = ? AND status = 'verified'
         ORDER BY id ASC`,
        levelName,
        courseName,
        topic,
      )
    : await db.getAllAsync<QuestionRow>(
        `SELECT id, prompt, explanation
         FROM question_bank
         WHERE level_name = ? AND course_name = ? AND status = 'verified'
         ORDER BY id ASC`,
        levelName,
        courseName,
      );

  const hydrated = await Promise.all(rows.map(hydrateQuestion));
  return hydrated.filter((question): question is QuizQuestion => Boolean(question));
}

export async function getQuestionFromDatabase(questionId: string): Promise<QuizQuestion | null> {
  if (!questionId) return null;
  await ensureEmbeddedQuestionBankSeeded();
  const db = await ensureSchema();
  const row = await db.getFirstAsync<QuestionRow>(
    `SELECT id, prompt, explanation
     FROM question_bank
     WHERE id = ? AND status = 'verified'`,
    questionId,
  );
  return row ? hydrateQuestion(row) : null;
}

export async function getQuestionBankStats(): Promise<QuestionBankStats> {
  await ensureEmbeddedQuestionBankSeeded();
  const db = await ensureSchema();
  const row = await db.getFirstAsync<{ question_count: number; course_count: number }>(
    `SELECT COUNT(*) AS question_count,
            COUNT(DISTINCT level_name || '::' || course_name) AS course_count
     FROM question_bank
     WHERE status = 'verified'`,
  );
  return {
    questionCount: row?.question_count ?? 0,
    courseCount: row?.course_count ?? 0,
    packageVersion: EMBEDDED_PACKAGE_VERSION,
  };
}
