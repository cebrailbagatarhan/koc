import AsyncStorage from '@react-native-async-storage/async-storage';

export type LocalSource = {
  id: string;
  levelName: string;
  courseName: string;
  title: string;
  body: string;
  createdAt: string;
};

export type CourseProgress = {
  levelName: string;
  courseName: string;
  sessions: number;
  questionsAnswered: number;
  correctAnswers: number;
  lastStudiedAt: string | null;
};

export type ActivityStats = {
  streakDays: number;
  lastStudyDate: string | null;
  totalStudyActions: number;
};

const SOURCES_KEY = 'koc.sources.v1';
const PROGRESS_KEY = 'koc.progress.v1';
const ACTIVITY_KEY = 'koc.activity.v1';

const emptyActivity: ActivityStats = {
  streakDays: 0,
  lastStudyDate: null,
  totalStudyActions: 0,
};

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function yesterdayDateKey() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return localDateKey(date);
}

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(key: string, value: T) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function getSources(): Promise<LocalSource[]> {
  return readJson<LocalSource[]>(SOURCES_KEY, []);
}

export async function getSourcesForCourse(levelName: string, courseName: string) {
  const sources = await getSources();
  return sources
    .filter((item) => item.levelName === levelName && item.courseName === courseName)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function addSource(input: Omit<LocalSource, 'id' | 'createdAt'>) {
  const sources = await getSources();
  const source: LocalSource = {
    ...input,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  await writeJson(SOURCES_KEY, [source, ...sources]);
  await recordStudyActivity();
  return source;
}

export async function removeSource(id: string) {
  const sources = await getSources();
  await writeJson(
    SOURCES_KEY,
    sources.filter((item) => item.id !== id),
  );
}

export async function getProgress(): Promise<CourseProgress[]> {
  return readJson<CourseProgress[]>(PROGRESS_KEY, []);
}

async function upsertProgress(levelName: string, courseName: string, updater: (current: CourseProgress) => CourseProgress) {
  const all = await getProgress();
  const index = all.findIndex((item) => item.levelName === levelName && item.courseName === courseName);
  const current: CourseProgress = index >= 0
    ? all[index]
    : { levelName, courseName, sessions: 0, questionsAnswered: 0, correctAnswers: 0, lastStudiedAt: null };
  const next = updater(current);
  const result = index >= 0 ? all.map((item, i) => (i === index ? next : item)) : [...all, next];
  await writeJson(PROGRESS_KEY, result);
  return next;
}

export async function recordCourseSession(levelName: string, courseName: string) {
  await upsertProgress(levelName, courseName, (current) => ({
    ...current,
    sessions: current.sessions + 1,
    lastStudiedAt: new Date().toISOString(),
  }));
  return recordStudyActivity();
}

export async function recordQuizAnswer(levelName: string, courseName: string, correct: boolean) {
  await upsertProgress(levelName, courseName, (current) => ({
    ...current,
    questionsAnswered: current.questionsAnswered + 1,
    correctAnswers: current.correctAnswers + (correct ? 1 : 0),
    lastStudiedAt: new Date().toISOString(),
  }));
  return recordStudyActivity();
}

export async function getActivityStats(): Promise<ActivityStats> {
  return readJson<ActivityStats>(ACTIVITY_KEY, emptyActivity);
}

export async function recordStudyActivity(): Promise<ActivityStats> {
  const current = await getActivityStats();
  const today = localDateKey();

  if (current.lastStudyDate === today) {
    const next = { ...current, totalStudyActions: current.totalStudyActions + 1 };
    await writeJson(ACTIVITY_KEY, next);
    return next;
  }

  const next: ActivityStats = {
    streakDays: current.lastStudyDate === yesterdayDateKey() ? current.streakDays + 1 : 1,
    lastStudyDate: today,
    totalStudyActions: current.totalStudyActions + 1,
  };
  await writeJson(ACTIVITY_KEY, next);
  return next;
}
