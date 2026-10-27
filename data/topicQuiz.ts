import { getQuizQuestions, type QuizQuestion } from '@/data/offlineContent';
import { getQuestionIdsForTopic } from '@/data/topicCatalog';

export function getQuizQuestionsForTopic(
  levelName?: string,
  courseName?: string,
  topicName?: string,
): QuizQuestion[] {
  const courseQuestions = getQuizQuestions(levelName, courseName);
  if (!topicName) return courseQuestions;

  const questionIds = new Set(getQuestionIdsForTopic(levelName, courseName, topicName));
  if (!questionIds.size) return [];
  return courseQuestions.filter((question) => questionIds.has(question.id));
}
