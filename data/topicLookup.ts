import { getTopicsForCatalogCourse } from '@/data/topicCatalog';

export function getTopicForQuestion(
  levelName?: string,
  courseName?: string,
  questionId?: string,
) {
  if (!questionId) return undefined;
  return getTopicsForCatalogCourse(levelName, courseName).find((topic) =>
    topic.questionIds.includes(questionId),
  );
}
