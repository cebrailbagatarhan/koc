import { getLearningDatabase } from '@/storage/database';
import { getQuestionsFromDatabase, type BankQuestion } from '@/storage/questionBankStore';

type AttemptSummaryRow = {
  question_id: string;
  attempts: number;
  correct_count: number;
  last_answered_at: string | null;
};

function difficultyWeight(question: BankQuestion) {
  if (question.difficulty === 'hard') return 2;
  if (question.difficulty === 'standard') return 1;
  return 0;
}

export async function getAdaptiveQuestionSession(
  levelName?: string,
  courseName?: string,
  topicName?: string | null,
  limit = 10,
): Promise<BankQuestion[]> {
  const questions = await getQuestionsFromDatabase(levelName, courseName, topicName);
  if (!questions.length || !levelName || !courseName) return [];

  const db = await getLearningDatabase();
  const rows = await db.getAllAsync<AttemptSummaryRow>(
    `SELECT question_id,
            COUNT(*) AS attempts,
            SUM(correct) AS correct_count,
            MAX(answered_at) AS last_answered_at
     FROM quiz_attempts
     WHERE level_name = ? AND course_name = ?
     GROUP BY question_id`,
    levelName,
    courseName,
  );

  const allowedIds = new Set(questions.map((question) => question.id));
  const performance = new Map(
    rows.filter((row) => allowedIds.has(row.question_id)).map((row) => [row.question_id, row]),
  );
  const now = Date.now();

  const sorted = [...questions].sort((a, b) => {
    const score = (question: BankQuestion) => {
      const summary = performance.get(question.id);
      if (!summary) return 100 + difficultyWeight(question);

      const accuracy = summary.attempts ? summary.correct_count / summary.attempts : 0;
      const daysSince = summary.last_answered_at
        ? Math.max(0, (now - new Date(summary.last_answered_at).getTime()) / 86400000)
        : 30;

      return 40
        + (1 - accuracy) * 70
        + Math.min(20, daysSince * 2)
        + difficultyWeight(question)
        - Math.min(20, summary.attempts * 4);
    };

    return score(b) - score(a) || a.id.localeCompare(b.id);
  });

  const unseen = sorted.filter((question) => !performance.has(question.id));
  const seen = sorted.filter((question) => performance.has(question.id));
  const unseenTarget = Math.min(Math.ceil(limit * 0.5), unseen.length);
  const selected = [...unseen.slice(0, unseenTarget), ...seen.slice(0, limit - unseenTarget)];

  if (selected.length < limit) {
    const selectedIds = new Set(selected.map((question) => question.id));
    selected.push(...sorted.filter((question) => !selectedIds.has(question.id)).slice(0, limit - selected.length));
  }

  return selected.slice(0, limit);
}
