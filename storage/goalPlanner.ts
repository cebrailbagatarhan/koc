import {
  getAllTopicMastery,
  getDailyPlan,
  type DailyPlan,
  type DailyPlanTask,
  type DailyPlanTaskKind,
  type TopicMastery,
} from '@/storage/coachStore';
import { getLearningDatabase } from '@/storage/database';
import { getActiveGoal, getDaysRemaining } from '@/storage/goalStore';
import { getReviewDashboard } from '@/storage/reviewStore';

type PlanRow = {
  task_id: string;
  kind: DailyPlanTaskKind;
  level_name: string | null;
  course_name: string | null;
  topic_name: string | null;
  title: string;
  description: string;
  route: string;
  estimated_minutes: number;
  completed_at: string | null;
};

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function topicQuizRoute(levelName: string, courseName: string, topicName: string) {
  return `/quiz/${levelName}/${courseName}?topicName=${encodeURIComponent(topicName)}`;
}

function topicRoute(levelName: string, courseName: string, topicName: string) {
  return `/topic/${levelName}/${courseName}/${topicName}`;
}

function rowToTask(row: PlanRow): DailyPlanTask {
  return {
    id: row.task_id,
    kind: row.kind,
    levelName: row.level_name,
    courseName: row.course_name,
    topicName: row.topic_name,
    title: row.title,
    description: row.description,
    route: row.route,
    estimatedMinutes: Number(row.estimated_minutes),
    completedAt: row.completed_at,
  };
}

function matchesGoal(
  item: TopicMastery,
  goal: { levelName: string | null; courseName: string | null },
) {
  if (goal.levelName && item.levelName !== goal.levelName) return false;
  if (goal.courseName && item.courseName !== goal.courseName) return false;
  return true;
}

function planLimit(daysRemaining: number, dailyMinutes: number) {
  if (daysRemaining <= 7) return Math.min(4, dailyMinutes >= 45 ? 4 : 3);
  if (daysRemaining <= 21) return dailyMinutes >= 45 ? 4 : 3;
  return dailyMinutes >= 30 ? 3 : 2;
}

function taskMinutes(dailyMinutes: number, taskLimit: number) {
  return Math.max(5, Math.round(dailyMinutes / Math.max(1, taskLimit)));
}

function dedupeTopics(items: TopicMastery[], used: Set<string>) {
  return items.filter((item) => !used.has(`${item.levelName}::${item.courseName}::${item.topicName}`));
}

function keyFor(item: TopicMastery) {
  return `${item.levelName}::${item.courseName}::${item.topicName}`;
}

async function buildGoalTasks(): Promise<DailyPlanTask[]> {
  const goal = await getActiveGoal();
  if (!goal) return [];

  const [dashboard, mastery] = await Promise.all([getReviewDashboard(), getAllTopicMastery()]);
  const scoped = mastery.filter((item) => item.questionCount > 0 && matchesGoal(item, goal));
  const candidates = scoped.length > 0 ? scoped : mastery.filter((item) => item.questionCount > 0);
  const daysRemaining = getDaysRemaining(goal.targetDate);
  const limit = planLimit(daysRemaining, goal.dailyMinutes);
  const minutes = taskMinutes(goal.dailyMinutes, limit);
  const tasks: DailyPlanTask[] = [];
  const used = new Set<string>();

  if (dashboard.dueCount > 0) {
    tasks.push({
      id: 'review',
      kind: 'review',
      levelName: null,
      courseName: null,
      topicName: null,
      title: `${dashboard.dueCount} tekrar sorusunu temizle`,
      description: `${goal.title} hedefinde unutmayı azaltmak için önce zamanı gelen tekrarları kapat.`,
      route: '/review',
      estimatedMinutes: Math.min(minutes, Math.max(5, dashboard.dueCount * 2)),
      completedAt: null,
    });
  }

  const weak = candidates
    .filter((item) => item.attempts > 0 && item.status !== 'mastered')
    .sort((a, b) => b.dueCount - a.dueCount || a.score - b.score || b.attempts - a.attempts);

  const addStrengthen = (item: TopicMastery) => {
    used.add(keyFor(item));
    tasks.push({
      id: `strengthen:${item.levelName}:${item.courseName}:${item.topicName}`,
      kind: 'strengthen',
      levelName: item.levelName,
      courseName: item.courseName,
      topicName: item.topicName,
      title: `${item.topicName} konusunu güçlendir`,
      description: `${goal.title} · ${daysRemaining} gün · ustalık ${item.score}/100${item.dueCount ? ` · ${item.dueCount} tekrar` : ''}`,
      route: topicQuizRoute(item.levelName, item.courseName, item.topicName),
      estimatedMinutes: minutes,
      completedAt: null,
    });
  };

  const addAdvance = (item: TopicMastery) => {
    used.add(keyFor(item));
    tasks.push({
      id: `advance:${item.levelName}:${item.courseName}:${item.topicName}`,
      kind: 'advance',
      levelName: item.levelName,
      courseName: item.courseName,
      topicName: item.topicName,
      title: `${item.topicName} ile ilerle`,
      description: `${goal.title} için yeni konu · ${item.courseName} · ${daysRemaining} gün kaldı`,
      route: topicRoute(item.levelName, item.courseName, item.topicName),
      estimatedMinutes: minutes,
      completedAt: null,
    });
  };

  if (weak[0] && tasks.length < limit) addStrengthen(weak[0]);

  const newTopics = candidates
    .filter((item) => item.status === 'not-started')
    .sort((a, b) => b.sourceCount - a.sourceCount || a.courseName.localeCompare(b.courseName));
  const firstNew = dedupeTopics(newTopics, used)[0];
  if (firstNew && tasks.length < limit) addAdvance(firstNew);

  while (tasks.length < limit) {
    const nextWeak = dedupeTopics(weak, used)[0];
    if (nextWeak) {
      addStrengthen(nextWeak);
      continue;
    }
    const nextNew = dedupeTopics(newTopics, used)[0];
    if (nextNew) {
      addAdvance(nextNew);
      continue;
    }
    const maintenance = dedupeTopics(
      [...candidates].sort((a, b) => a.score - b.score || a.attempts - b.attempts),
      used,
    )[0];
    if (!maintenance) break;
    addStrengthen(maintenance);
  }

  return tasks.slice(0, limit);
}

async function readStoredPlan(date: string) {
  const db = await getLearningDatabase();
  const rows = await db.getAllAsync<PlanRow>(
    `SELECT task_id, kind, level_name, course_name, topic_name, title, description,
            route, estimated_minutes, completed_at
     FROM daily_plan_tasks
     WHERE plan_date = ?
     ORDER BY rowid ASC`,
    date,
  );
  return rows.map(rowToTask);
}

export async function getGoalAwareDailyPlan(): Promise<DailyPlan> {
  const goal = await getActiveGoal();
  if (!goal) return getDailyPlan();

  // getAllTopicMastery also guarantees the coach tables exist before we read/write plan rows.
  await getAllTopicMastery();
  const date = localDateKey();
  let tasks = await readStoredPlan(date);

  if (tasks.length === 0) {
    const db = await getLearningDatabase();
    const generated = await buildGoalTasks();
    for (const task of generated) {
      await db.runAsync(
        `INSERT OR IGNORE INTO daily_plan_tasks(
          plan_date, task_id, kind, level_name, course_name, topic_name,
          title, description, route, estimated_minutes, completed_at
        ) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)`,
        date,
        task.id,
        task.kind,
        task.levelName,
        task.courseName,
        task.topicName,
        task.title,
        task.description,
        task.route,
        task.estimatedMinutes,
      );
    }
    tasks = await readStoredPlan(date);
  }

  return {
    date,
    tasks,
    completedCount: tasks.filter((task) => Boolean(task.completedAt)).length,
    totalMinutes: tasks.reduce((sum, task) => sum + task.estimatedMinutes, 0),
  };
}
