import { getAllCourseKeys } from '@/data/courseCatalog';
import { getTopicsForCatalogCourse } from '@/data/topicCatalog';
import { getLearningDatabase } from '@/storage/database';
import { getQuestionsFromDatabase, type BankQuestion } from '@/storage/questionBankStore';

export type QuestionCoverageItem = {
  levelName: string;
  courseName: string;
  skillLabel: string;
  questionCount: number;
  averageQuality: number;
  highQualityCount: number;
  easyCount: number;
  standardCount: number;
  hardCount: number;
  attempts: number;
  accuracy: number | null;
};

type AttemptRow = {
  question_id: string;
  correct: number;
};

function qualityScore(question: BankQuestion) {
  let score = 50;
  if (question.question.trim().length >= 12) score += 8;
  if (question.question.trim().length >= 28) score += 4;
  if (question.explanation.trim().length >= 20) score += 10;
  if (question.explanation.trim().length >= 45) score += 4;
  if (question.options.length === 4 && new Set(question.options).size === 4) score += 10;
  if (question.options.includes(question.correctAnswer)) score += 10;
  if (question.visual) score += 2;
  if (question.origin === 'embedded') score += 2;
  return Math.max(0, Math.min(100, score));
}

export async function getQuestionCoverage(): Promise<QuestionCoverageItem[]> {
  const db = await getLearningDatabase();
  const attempts = await db.getAllAsync<AttemptRow>(
    'SELECT question_id, correct FROM quiz_attempts',
  );
  const attemptMap = new Map<string, { attempts: number; correct: number }>();

  for (const attempt of attempts) {
    const current = attemptMap.get(attempt.question_id) ?? { attempts: 0, correct: 0 };
    current.attempts += 1;
    current.correct += attempt.correct ? 1 : 0;
    attemptMap.set(attempt.question_id, current);
  }

  const result: QuestionCoverageItem[] = [];

  for (const { levelName, courseName } of getAllCourseKeys()) {
    const topics = getTopicsForCatalogCourse(levelName, courseName);
    for (const topic of topics) {
      const questions = await getQuestionsFromDatabase(levelName, courseName, topic.name);
      if (!questions.length) {
        result.push({
          levelName,
          courseName,
          skillLabel: topic.name,
          questionCount: 0,
          averageQuality: 0,
          highQualityCount: 0,
          easyCount: 0,
          standardCount: 0,
          hardCount: 0,
          attempts: 0,
          accuracy: null,
        });
        continue;
      }

      const scores = questions.map(qualityScore);
      let totalAttempts = 0;
      let totalCorrect = 0;
      for (const question of questions) {
        const usage = attemptMap.get(question.id);
        totalAttempts += usage?.attempts ?? 0;
        totalCorrect += usage?.correct ?? 0;
      }

      result.push({
        levelName,
        courseName,
        skillLabel: topic.name,
        questionCount: questions.length,
        averageQuality: Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length),
        highQualityCount: scores.filter((value) => value >= 90).length,
        easyCount: questions.filter((question) => question.difficulty === 'easy').length,
        standardCount: questions.filter((question) => question.difficulty === 'standard').length,
        hardCount: questions.filter((question) => question.difficulty === 'hard').length,
        attempts: totalAttempts,
        accuracy: totalAttempts ? Math.round((totalCorrect / totalAttempts) * 100) : null,
      });
    }
  }

  return result.sort(
    (a, b) => a.questionCount - b.questionCount || a.averageQuality - b.averageQuality,
  );
}
