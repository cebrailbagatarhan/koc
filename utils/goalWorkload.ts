/** Preview the remaining study time, counting both today and the target date. */
export function estimateGoalWorkload(
  targetDate: string,
  dailyMinutes: number,
  today: Date = new Date(),
): { days: number; totalMinutes: number } | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) return null;
  const [year, month, day] = targetDate.split('-').map(Number);
  if (year < 1000 || month < 1 || month > 12 || day < 1 || day > 31) return null;
  const targetUtc = Date.UTC(year, month - 1, day);
  const parsed = new Date(targetUtc);
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day ||
    !Number.isFinite(dailyMinutes) || dailyMinutes <= 0
  ) return null;
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const days = Math.max(0, Math.round((targetUtc - todayUtc) / 86_400_000) + 1);
  return { days, totalMinutes: days * Math.round(dailyMinutes) };
}
