import { LEVELS } from '@/data/courseCatalog';
import { getTopicsForCatalogCourse } from '@/data/topicCatalog';
import { getLearningDatabase } from '@/storage/database';
import { getReviewDashboard } from '@/storage/reviewStore';

export type TopicMasteryStatus =
  | 'not-started'
  | 'needs-work'
  | 'familiar'
  | 'proficient'
  | 'mastered';

export type TopicMastery = {
  levelName: string;
  courseName: string;
  topicName: string;
  icon: string;
  status: TopicMasteryStatus;
  score: number;
  accuracy: number;
  attempts: number;
  correctAnswers: number;
  questionCount: number;
  practicedQuestions: number;
  dueCount: number;
  sourceCount: number;
  lastPracticedAt: string | null;
  lastVisitedAt: string | null;
};

export type DailyPlanTaskKind = 'review' | 'strengthen' | 'advance';

export type DailyPlanTask = {
  id: string;
  kind: DailyPlanTaskKind;
  levelName: string | null;
  courseName: string | null;
  topicName: string | null;
  title: string;
  description: string;
  route: string;
  estimatedMinutes: number;
  completedAt: string | null;
};

export type DailyPlan = {
  date: string;
  tasks: DailyPlanTask[];
  completedCount: number;
  totalMinutes: number;
};

export type LastTopicVisit = {
  levelName: string;
  courseName: string;
  topicName: string;
  lastVisitedAt: string;
};

type AttemptRow = {
  level_name: string;
  course_name: string;
  question_id: string;
  attempts: number;
  correct_answers: number;
  last_practiced_at: string | null;
};

type ReviewRow = {
  level_name: string;
  course_name: string;
  question_id: string;
  due_at: string;
};

type SourceRow = {
  level_name: string;
  course_name: string;
  topic_name: string;
  source_count: number;
};

type VisitRow = {
  level_name: string;
  course_name: string;
  topic_name: string;
  last_visited_at: string;
};

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

let schemaPromise: Promise<void> | null = null;

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function ensureCoachSchema() {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      const db = await getLearningDatabase();
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS topic_visits (
          level_name TEXT NOT NULL,
          course_name TEXT NOT NULL,
          topic_name TEXT NOT NULL,
          visit_count INTEGER NOT NULL DEFAULT 0,
          last_visited_at TEXT NOT NULL,
          PRIMARY KEY(level_name, course_name, topic_name)
        );

        CREATE INDEX IF NOT EXISTS idx_topic_visits_recent
          ON topic_visits(last_visited_at DESC);

        CREATE TABLE IF NOT EXISTS daily_plan_tasks (
          plan_date TEXT NOT NULL,
          task_id TEXT NOT NULL,
          kind TEXT NOT NULL,
          level_name TEXT,
          course_name TEXT,
          topic_name TEXT,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          route TEXT NOT NULL,
          estimated_minutes INTEGER NOT NULL DEFAULT 5,
          completed_at TEXT,
          PRIMARY KEY(plan_date, task_id)
        );

        CREATE INDEX IF NOT EXISTS idx_daily_plan_date
          ON daily_plan_tasks(plan_date, completed_at);
      `);
    })();
  }
  return schemaPromise;
}

function statusFor(input: {
  attempts: number;
  correctAnswers: number;
  questionCount: number;
  practicedQuestions: number;
  dueCount: number;
}): TopicMasteryStatus {
  if (input.attempts === 0) return 'not-started';
  const accuracy = Math.round((input.correctAnswers / input.attempts) * 100);
  if (input.dueCount > 0 || accuracy < 70) return 'needs-work';
  if (input.attempts < Math.max(2, input.questionCount) || accuracy < 85) return 'familiar';
  if (accuracy < 100 || input.practicedQuestions < input.questionCount) return 'proficient';
  return 'mastered';
}

function scoreFor(status: TopicMasteryStatus, accuracy: number, coverage: number) {
  if (status === 'not-started') return 0;
  if (status === 'needs-work') return Math.min(49, Math.round(accuracy * 0.45 + coverage * 20));
  if (status === 'familiar') return Math.max(50, Math.min(79, Math.round(accuracy * 0.65 + coverage * 25)));
  if (status === 'proficient') return Math.max(80, Math.min(99, Math.round(accuracy * 0.8 + coverage * 20)));
  return 100;
}

export function getMasteryLabel(status: TopicMasteryStatus) {
  switch (status) {
    case 'needs-work':
      return 'Tekrar et';
    case 'familiar':
      return 'Tanıdık';
    case 'proficient':
      return 'İyi';
    case 'mastered':
      return 'Ustalaştın';
    default:
      return 'Başlanmadı';
  }
}

export async function getAllTopicMastery(): Promise<TopicMastery[]> {
  await ensureCoachSchema();
  await getReviewDashboard();
  const db = await getLearningDatabase();
  const [attemptRows, reviewRows, sourceRows, visitRows] = await Promise.all([
    db.getAllAsync<AttemptRow>(
      `SELECT level_name, course_name, question_id,
              COUNT(*) AS attempts,
              SUM(correct) AS correct_answers,
              MAX(answered_at) AS last_practiced_at
       FROM quiz_attempts
       GROUP BY level_name, course_name, question_id`,
    ),
    db.getAllAsync<ReviewRow>(
      `SELECT level_name, course_name, question_id, due_at
       FROM review_items`,
    ),
    db.getAllAsync<SourceRow>(
      `SELECT level_name, course_name, topic_name, COUNT(*) AS source_count
       FROM sources
       WHERE topic_name IS NOT NULL AND TRIM(topic_name) <> ''
       GROUP BY level_name, course_name, topic_name`,
    ),
    db.getAllAsync<VisitRow>(
      `SELECT level_name, course_name, topic_name, last_visited_at
       FROM topic_visits`,
    ),
  ]);

  const nowIso = new Date().toISOString();
  const mastery: TopicMastery[] = [];

  for (const level of LEVELS) {
    for (const course of level.courses) {
      for (const topic of getTopicsForCatalogCourse(level.name, course.name)) {
        const ids = new Set(topic.questionIds);
        const attempts = attemptRows.filter(
          (row) => row.level_name === level.name && row.course_name === course.name && ids.has(row.question_id),
        );
        const reviews = reviewRows.filter(
          (row) => row.level_name === level.name && row.course_name === course.name && ids.has(row.question_id),
        );
        const totalAttempts = attempts.reduce((sum, row) => sum + Number(row.attempts ?? 0), 0);
        const correctAnswers = attempts.reduce((sum, row) => sum + Number(row.correct_answers ?? 0), 0);
        const practicedQuestions = attempts.filter((row) => Number(row.attempts ?? 0) > 0).length;
        const dueCount = reviews.filter((row) => row.due_at <= nowIso).length;
        const accuracy = totalAttempts ? Math.round((correctAnswers / totalAttempts) * 100) : 0;
        const coverage = topic.questionIds.length
          ? Math.round((practicedQuestions / topic.questionIds.length) * 100)
          : 0;
        const status = statusFor({
          attempts: totalAttempts,
          correctAnswers,
          questionCount: topic.questionIds.length,
          practicedQuestions,
          dueCount,
        });
        const source = sourceRows.find(
          (row) => row.level_name === level.name && row.course_name === course.name && row.topic_name === topic.name,
        );
        const visit = visitRows.find(
          (row) => row.level_name === level.name && row.course_name === course.name && row.topic_name === topic.name,
        );
        const lastPracticedAt = attempts
          .map((row) => row.last_practiced_at)
          .filter((value): value is string => Boolean(value))
          .sort()
          .at(-1) ?? null;

        mastery.push({
          levelName: level.name,
          courseName: course.name,
          topicName: topic.name,
          icon: topic.icon,
          status,
          score: scoreFor(status, accuracy, coverage),
          accuracy,
          attempts: totalAttempts,
          correctAnswers,
          questionCount: topic.questionIds.length,
          practicedQuestions,
          dueCount,
          sourceCount: Number(source?.source_count ?? 0),
          lastPracticedAt,
          lastVisitedAt: visit?.last_visited_at ?? null,
        });
      }
    }
  }

  return mastery;
}

export async function getCourseTopicMastery(levelName: string, courseName: string) {
  const all = await getAllTopicMastery();
  return all.filter((item) => item.levelName === levelName && item.courseName === courseName);
}

export async function recordTopicVisit(levelName: string, courseName: string, topicName: string) {
  await ensureCoachSchema();
  const db = await getLearningDatabase();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO topic_visits(level_name, course_name, topic_name, visit_count, last_visited_at)
     VALUES(?, ?, ?, 1, ?)
     ON CONFLICT(level_name, course_name, topic_name) DO UPDATE SET
       visit_count = topic_visits.visit_count + 1,
       last_visited_at = excluded.last_visited_at`,
    levelName,
    courseName,
    topicName,
    now,
  );
}

export async function getLastTopicVisit(): Promise<LastTopicVisit | null> {
  await ensureCoachSchema();
  const db = await getLearningDatabase();
  const row = await db.getFirstAsync<VisitRow>(
    `SELECT level_name, course_name, topic_name, last_visited_at
     FROM topic_visits
     ORDER BY last_visited_at DESC
     LIMIT 1`,
  );
  return row
    ? {
        levelName: row.level_name,
        courseName: row.course_name,
        topicName: row.topic_name,
        lastVisitedAt: row.last_visited_at,
      }
    : null;
}

function topicQuizRoute(levelName: string, courseName: string, topicName: string) {
  return `/quiz/${levelName}/${courseName}?topicName=${encodeURIComponent(topicName)}`;
}

async function buildDailyPlanTasks(): Promise<DailyPlanTask[]> {
  const [dashboard, mastery] = await Promise.all([getReviewDashboard(), getAllTopicMastery()]);
  const db = await getLearningDatabase();
  const recent = await db.getFirstAsync<{ level_name: string; course_name: string }>(
    `SELECT level_name, course_name
     FROM course_progress
     WHERE last_studied_at IS NOT NULL
     ORDER BY last_studied_at DESC
     LIMIT 1`,
  );

  const tasks: DailyPlanTask[] = [];

  if (dashboard.dueCount > 0) {
    tasks.push({
      id: 'review',
      kind: 'review',
      levelName: null,
      courseName: null,
      topicName: null,
      title: `${dashboard.dueCount} tekrar sorusunu temizle`,
      description: 'Önce unutmaya yaklaşan ve daha önce zorlandığın soruları güçlendir.',
      route: '/review',
      estimatedMinutes: Math.min(12, Math.max(4, dashboard.dueCount * 2)),
      completedAt: null,
    });
  }

  const weak = mastery
    .filter((item) => item.questionCount > 0 && item.attempts > 0 && item.status !== 'mastered')
    .sort((a, b) => b.dueCount - a.dueCount || a.score - b.score || b.attempts - a.attempts)[0];

  if (weak) {
    tasks.push({
      id: `strengthen:${weak.levelName}:${weak.courseName}:${weak.topicName}`,
      kind: 'strengthen',
      levelName: weak.levelName,
      courseName: weak.courseName,
      topicName: weak.topicName,
      title: `${weak.topicName} konusunu güçlendir`,
      description: `${weak.courseName} · ustalık ${weak.score}/100${weak.sourceCount ? ` · ${weak.sourceCount} kişisel kaynak` : ''}`,
      route: topicQuizRoute(weak.levelName, weak.courseName, weak.topicName),
      estimatedMinutes: 7,
      completedAt: null,
    });
  }

  if (recent) {
    const advance = mastery.find(
      (item) =>
        item.levelName === recent.level_name &&
        item.courseName === recent.course_name &&
        item.questionCount > 0 &&
        item.status === 'not-started' &&
        item.topicName !== weak?.topicName,
    );

    if (advance) {
      tasks.push({
        id: `advance:${advance.levelName}:${advance.courseName}:${advance.topicName}`,
        kind: 'advance',
        levelName: advance.levelName,
        courseName: advance.courseName,
        topicName: advance.topicName,
        title: `${advance.topicName} ile ilerle`,
        description: `${advance.courseName} içindeki sıradaki yeni konuya geç ve kısa konu quizini tamamla.`,
        route: `/topic/${advance.levelName}/${advance.courseName}/${advance.topicName}`,
        estimatedMinutes: 8,
        completedAt: null,
      });
    }
  }

  if (tasks.length === 0 && recent) {
    const maintenance = mastery
      .filter(
        (item) =>
          item.levelName === recent.level_name &&
          item.courseName === recent.course_name &&
          item.questionCount > 0,
      )
      .sort((a, b) => a.score - b.score)[0];
    if (maintenance) {
      tasks.push({
        id: `strengthen:${maintenance.levelName}:${maintenance.courseName}:${maintenance.topicName}`,
        kind: 'strengthen',
        levelName: maintenance.levelName,
        courseName: maintenance.courseName,
        topicName: maintenance.topicName,
        title: `${maintenance.topicName} için bakım turu`,
        description: 'Bugünkü planın hafif: kısa bir quiz ile bilgiyi canlı tut.',
        route: topicQuizRoute(maintenance.levelName, maintenance.courseName, maintenance.topicName),
        estimatedMinutes: 5,
        completedAt: null,
      });
    }
  }

  return tasks.slice(0, 3);
}

function rowToPlanTask(row: PlanRow): DailyPlanTask {
  return {
    id: row.task_id,
    kind: row.kind,
    levelName: row.level_name,
    courseName: row.course_name,
    topicName: row.topic_name,
    title: row.title,
    description: row.description,
    route: row.route,
    estimatedMinutes: row.estimated_minutes,
    completedAt: row.completed_at,
  };
}

export async function getDailyPlan(): Promise<DailyPlan> {
  await ensureCoachSchema();
  const db = await getLearningDatabase();
  const date = localDateKey();
  let rows = await db.getAllAsync<PlanRow>(
    `SELECT task_id, kind, level_name, course_name, topic_name, title, description,
            route, estimated_minutes, completed_at
     FROM daily_plan_tasks
     WHERE plan_date = ?
     ORDER BY rowid ASC`,
    date,
  );

  if (rows.length === 0) {
    const tasks = await buildDailyPlanTasks();
    for (const task of tasks) {
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
    rows = await db.getAllAsync<PlanRow>(
      `SELECT task_id, kind, level_name, course_name, topic_name, title, description,
              route, estimated_minutes, completed_at
       FROM daily_plan_tasks
       WHERE plan_date = ?
       ORDER BY rowid ASC`,
      date,
    );
  }

  const tasks = rows.map(rowToPlanTask);
  return {
    date,
    tasks,
    completedCount: tasks.filter((task) => Boolean(task.completedAt)).length,
    totalMinutes: tasks.reduce((sum, task) => sum + task.estimatedMinutes, 0),
  };
}

export async function completeDailyPlanTopic(levelName: string, courseName: string, topicName: string) {
  await ensureCoachSchema();
  const db = await getLearningDatabase();
  await db.runAsync(
    `UPDATE daily_plan_tasks
     SET completed_at = COALESCE(completed_at, ?)
     WHERE plan_date = ? AND level_name = ? AND course_name = ? AND topic_name = ?`,
    new Date().toISOString(),
    localDateKey(),
    levelName,
    courseName,
    topicName,
  );
}

export async function completeDailyPlanReview() {
  await ensureCoachSchema();
  const db = await getLearningDatabase();
  await db.runAsync(
    `UPDATE daily_plan_tasks
     SET completed_at = COALESCE(completed_at, ?)
     WHERE plan_date = ? AND kind = 'review'`,
    new Date().toISOString(),
    localDateKey(),
  );
}
