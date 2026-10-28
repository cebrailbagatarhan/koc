/** Percentage of correct answers in a completed review session. */
export function getReviewAccuracyPercentage(correct: number, total: number): number | null {
  if (!Number.isSafeInteger(correct) || !Number.isSafeInteger(total) ||
      total <= 0 || correct < 0 || correct > total) return null;
  return Math.round((correct / total) * 100);
}
