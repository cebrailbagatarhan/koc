import { getAllCourseKeys } from '@/data/courseCatalog';
import { getCrossSubjectQuestionPackV105 } from '@/data/crossSubjectQuestionFactoryV105';
import { getDeterministicQuestionPackV104 } from '@/data/deterministicQuestionFactoryV104';
import {
  getEmbeddedQuestionPackV10,
  type QuestionDifficulty,
  type QuestionKind,
  type QuestionVisualSpec,
} from '@/data/embeddedQuestionPackV10';
import { getQuizQuestions, type QuizQuestion } from '@/data/offlineContent';
import { getTopicsForCatalogCourse } from '@/data/topicCatalog';
import { getLearningDatabase } from '@/storage/database';

const EMBEDDED_PACKAGE_ID = 'embedded-core';
const EMBEDDED_PACKAGE_VERSION = 4;
const SEED_META_KEY = 'embedded_question_bank_version';

export type BankQuestion = QuizQuestion & {
  difficulty: QuestionDifficulty;
  questionKind: QuestionKind;
  visual?: QuestionVisualSpec;
  topicName: string | null;
  origin: string;
  qualityScore: number;
  confidence: 'high' | 'medium' | 'low';
};

export type QuestionBankStats = {
  questionCount: number;
  visualQuestionCount: number;
  courseCount: number;
  packageVersion: number;
};

export type QuestionCoverageItem = {
  levelName: string;
  courseName: string;
  topicName: string;
  questionCount: number;
  highQualityCount: number;
  averageQuality: number;
  easyCount: number;
  standardCount: number;
  hardCount: number;
};

type QuestionRow = {
  id: string;
  prompt: string;
  explanation: string;
  difficulty: QuestionDifficulty;
  question_kind: QuestionKind;
  visual_json: string | null;
  topic_name: string | null;
  origin: string;
  quality_score: number;
  confidence: 'high' | 'medium' | 'low';
};

type OptionRow = {
  option_index: number;
  text: string;
  is_correct: number;
};

async function ensureColumn(
  db: Awaited<ReturnType<typeof getLearningDatabase>>,
  tableName: string,
  columnName: string,
  sqlType: string,
) {
  const columns = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${tableName})`);
  if (columns.some((column) => column.name === columnName)) return;
  await db.execAsync(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${sqlType};`);
}

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
      question_kind TEXT NOT NULL DEFAULT 'multiple-choice',
      visual_json TEXT,
      quality_score INTEGER NOT NULL DEFAULT 70,
      confidence TEXT NOT NULL DEFAULT 'medium',
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

  await ensureColumn(db, 'question_bank', 'question_kind', "TEXT NOT NULL DEFAULT 'multiple-choice'");
  await ensureColumn(db, 'question_bank', 'visual_json', 'TEXT');
  await ensureColumn(db, 'question_bank', 'quality_score', 'INTEGER NOT NULL DEFAULT 70');
  await ensureColumn(db, 'question_bank', 'confidence', "TEXT NOT NULL DEFAULT 'medium'");
  return db;
}

function scoreQuestion(input: {
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  origin?: string;
  visual?: QuestionVisualSpec;
}) {
  let score = 55;
  if (input.prompt.trim().length >= 12) score += 8;
  if (input.explanation.trim().length >= 20) score += 10;
  if (input.options.length === 4 && new Set(input.options).size === 4) score += 10;
  if (input.options.includes(input.correctAnswer)) score += 10;
  if (input.visual) score += 3;
  if ((input.origin ?? 'embedded') === 'embedded') score += 4;
  return Math.max(0, Math.min(100, score));
}

function confidenceForScore(score: number): 'high' | 'medium' | 'low' {
  if (score >= 90) return 'high';
  if (score >= 75) return 'medium';
  return 'low';
}

async function insertQuestion(input: {
  id: string;
  levelName: string;
  courseName: string;
  topicName: string | null;
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: QuestionDifficulty;
  questionKind: QuestionKind;
  visual?: QuestionVisualSpec;
  installedAt: string;
}) {
  const db = await getLearningDatabase();
  const qualityScore = scoreQuestion({
    prompt: input.prompt,
    options: input.options,
    correctAnswer: input.correctAnswer,
    explanation: input.explanation,
    visual: input.visual,
  });
  const confidence = confidenceForScore(qualityScore);
  await db.runAsync(
    `INSERT INTO question_bank(
      id, package_id, origin, level_name, course_name, topic_name,
      prompt, explanation, difficulty, question_kind, visual_json,
      quality_score, confidence, status, version, updated_at
    ) VALUES(?, ?, 'embedded', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'verified', 1, ?)`,
    input.id,
    EMBEDDED_PACKAGE_ID,
    input.levelName,
    input.courseName,
    input.topicName,
    input.prompt,
    input.explanation,
    input.difficulty,
    input.questionKind,
    input.visual ? JSON.stringify(input.visual) : null,
    qualityScore,
    confidence,
    input.installedAt,
  );

  for (let optionIndex = 0; optionIndex < input.options.length; optionIndex += 1) {
    const option = input.options[optionIndex];
    await db.runAsync(
      `INSERT INTO question_options(question_id, option_index, text, is_correct)
       VALUES(?, ?, ?, ?)`,
      input.id,
      optionIndex,
      option,
      option === input.correctAnswer ? 1 : 0,
    );
  }
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

    await db.runAsync(
      `DELETE FROM question_options
       WHERE question_id IN (SELECT id FROM question_bank WHERE package_id = ?)`,
      EMBEDDED_PACKAGE_ID,
    );
    await db.runAsync('DELETE FROM question_bank WHERE package_id = ?', EMBEDDED_PACKAGE_ID);

    for (const { levelName, courseName } of getAllCourseKeys()) {
      const topics = getTopicsForCatalogCourse(levelName, courseName);
      const questions = getQuizQuestions(levelName, courseName);

      for (const question of questions) {
        const topicName = topics.find((topic) => topic.questionIds.includes(question.id))?.name ?? null;
        await insertQuestion({
          id: question.id,
          levelName,
          courseName,
          topicName,
          prompt: question.question,
          options: question.options,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          difficulty: 'standard',
          questionKind: 'multiple-choice',
          installedAt,
        });
      }
    }

    for (const question of [
      ...getEmbeddedQuestionPackV10(),
      ...getDeterministicQuestionPackV104(),
      ...getCrossSubjectQuestionPackV105(),
    ]) {
      const topics = getTopicsForCatalogCourse(question.levelName, question.courseName);
      const topicName = topics.length
        ? topics[(question.topicIndex ?? 0) % topics.length]?.name ?? null
        : null;
      await insertQuestion({
        id: question.id,
        levelName: question.levelName,
        courseName: question.courseName,
        topicName,
        prompt: question.prompt,
        options: question.options,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        difficulty: question.difficulty,
        questionKind: question.questionKind,
        visual: question.visual,
        installedAt,
      });
    }

    await db.runAsync(
      'INSERT OR REPLACE INTO app_meta(key, value) VALUES(?, ?)',
      SEED_META_KEY,
      String(EMBEDDED_PACKAGE_VERSION),
    );
  });
}

async function hydrateQuestion(row: QuestionRow): Promise<BankQuestion | null> {
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

  let visual: QuestionVisualSpec | undefined;
  if (row.visual_json) {
    try {
      visual = JSON.parse(row.visual_json) as QuestionVisualSpec;
    } catch {
      visual = undefined;
    }
  }

  return {
    id: row.id,
    question: row.prompt,
    options: options.map((option) => option.text),
    correctAnswer: correct,
    explanation: row.explanation,
    difficulty: row.difficulty,
    questionKind: row.question_kind,
    visual,
    topicName: row.topic_name,
    origin: row.origin,
    qualityScore: row.quality_score,
    confidence: row.confidence,
  };
}

const QUESTION_SELECT = `
  SELECT id, prompt, explanation, difficulty, question_kind, visual_json, topic_name, origin,
         quality_score, confidence
  FROM question_bank`;

export async function getQuestionsFromDatabase(
  levelName?: string,
  courseName?: string,
  topicName?: string | null,
): Promise<BankQuestion[]> {
  if (!levelName || !courseName) return [];
  await ensureEmbeddedQuestionBankSeeded();
  const db = await ensureSchema();
  const topic = topicName?.trim() || null;
  const rows = topic
    ? await db.getAllAsync<QuestionRow>(
        `${QUESTION_SELECT}
         WHERE level_name = ? AND course_name = ? AND topic_name = ? AND status = 'verified'
         ORDER BY difficulty ASC, id ASC`,
        levelName,
        courseName,
        topic,
      )
    : await db.getAllAsync<QuestionRow>(
        `${QUESTION_SELECT}
         WHERE level_name = ? AND course_name = ? AND status = 'verified'
         ORDER BY difficulty ASC, id ASC`,
        levelName,
        courseName,
      );

  const hydrated = await Promise.all(rows.map(hydrateQuestion));
  return hydrated.filter((question): question is BankQuestion => Boolean(question));
}

export async function getQuestionFromDatabase(questionId: string): Promise<BankQuestion | null> {
  if (!questionId) return null;
  await ensureEmbeddedQuestionBankSeeded();
  const db = await ensureSchema();
  const row = await db.getFirstAsync<QuestionRow>(
    `${QUESTION_SELECT} WHERE id = ? AND status = 'verified'`,
    questionId,
  );
  return row ? hydrateQuestion(row) : null;
}

export async function getQuestionBankStats(): Promise<QuestionBankStats> {
  await ensureEmbeddedQuestionBankSeeded();
  const db = await ensureSchema();
  const row = await db.getFirstAsync<{
    question_count: number;
    visual_question_count: number;
    course_count: number;
  }>(
    `SELECT COUNT(*) AS question_count,
            SUM(CASE WHEN visual_json IS NOT NULL THEN 1 ELSE 0 END) AS visual_question_count,
            COUNT(DISTINCT level_name || '::' || course_name) AS course_count
     FROM question_bank
     WHERE status = 'verified'`,
  );
  return {
    questionCount: row?.question_count ?? 0,
    visualQuestionCount: row?.visual_question_count ?? 0,
    courseCount: row?.course_count ?? 0,
    packageVersion: EMBEDDED_PACKAGE_VERSION,
  };
}


export async function getQuestionCoverage(): Promise<QuestionCoverageItem[]> {
  await ensureEmbeddedQuestionBankSeeded();
  const db = await ensureSchema();
  const rows = await db.getAllAsync<{
    level_name: string;
    course_name: string;
    topic_name: string | null;
    question_count: number;
    high_quality_count: number;
    average_quality: number;
    easy_count: number;
    standard_count: number;
    hard_count: number;
  }>(
    `SELECT
       level_name,
       course_name,
       topic_name,
       COUNT(*) AS question_count,
       SUM(CASE WHEN quality_score >= 90 THEN 1 ELSE 0 END) AS high_quality_count,
       ROUND(AVG(quality_score)) AS average_quality,
       SUM(CASE WHEN difficulty = 'easy' THEN 1 ELSE 0 END) AS easy_count,
       SUM(CASE WHEN difficulty = 'standard' THEN 1 ELSE 0 END) AS standard_count,
       SUM(CASE WHEN difficulty = 'hard' THEN 1 ELSE 0 END) AS hard_count
     FROM question_bank
     WHERE status = 'verified'
     GROUP BY level_name, course_name, topic_name
     ORDER BY question_count ASC, average_quality ASC`,
  );

  return rows
    .filter((row) => Boolean(row.topic_name))
    .map((row) => ({
      levelName: row.level_name,
      courseName: row.course_name,
      topicName: row.topic_name ?? 'Genel',
      questionCount: Number(row.question_count ?? 0),
      highQualityCount: Number(row.high_quality_count ?? 0),
      averageQuality: Number(row.average_quality ?? 0),
      easyCount: Number(row.easy_count ?? 0),
      standardCount: Number(row.standard_count ?? 0),
      hardCount: Number(row.hard_count ?? 0),
    }));
}
