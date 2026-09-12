/**
 * AI entegrasyonu bilinçli olarak kapalıdır.
 * Eğitim, quiz, kaynak ve ilerleme akışları API anahtarı olmadan çalışır.
 * İleride bir sağlayıcı eklendiğinde ekranlara değil yalnızca bu adaptöre bağlanmalıdır.
 */

export const AI_FEATURES_ENABLED = false;

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface Explanation {
  title: string;
  points: string[];
}

export async function generateQuizQuestion(
  _level: string,
  _course: string,
): Promise<QuizQuestion | null> {
  return null;
}

export async function generateExplanation(
  _level: string,
  _course: string,
): Promise<Explanation | null> {
  return null;
}

export async function startChatSession(_level: string) {
  return null;
}
