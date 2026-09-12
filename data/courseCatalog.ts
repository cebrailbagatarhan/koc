export type CourseDefinition = {
  name: string;
  icon: string;
  description: string;
};

export type LevelDefinition = {
  name: string;
  icon: string;
  description: string;
  courses: CourseDefinition[];
};

export const LEVELS: LevelDefinition[] = [
  {
    name: 'İlkokul',
    icon: '🌱',
    description: 'Temel kazanımlar ve günlük tekrar',
    courses: [
      { name: 'Matematik', icon: '🔢', description: 'Sayılar, işlemler ve problem çözme' },
      { name: 'Türkçe', icon: '🇹🇷', description: 'Okuma, anlama ve dil bilgisi' },
      { name: 'Hayat Bilgisi', icon: '🌍', description: 'Günlük yaşam ve çevre bilinci' },
      { name: 'İngilizce', icon: '🇬🇧', description: 'Temel kelime ve konuşma pratiği' },
    ],
  },
  {
    name: 'Ortaokul',
    icon: '📘',
    description: 'Konu pekiştirme ve sınav hazırlığı',
    courses: [
      { name: 'Matematik', icon: '📊', description: 'Cebir, geometri ve problemler' },
      { name: 'Türkçe', icon: '📖', description: 'Paragraf, anlam ve dil bilgisi' },
      { name: 'Fen Bilimleri', icon: '🔬', description: 'Fizik, kimya ve biyoloji temelleri' },
      { name: 'Sosyal Bilgiler', icon: '🏛️', description: 'Tarih, coğrafya ve vatandaşlık' },
      { name: 'İngilizce', icon: '🇬🇧', description: 'Kelime, günlük iletişim ve pratik' },
    ],
  },
  {
    name: 'Lise',
    icon: '🎓',
    description: 'Ders bazlı çalışma ve soru çözümü',
    courses: [
      { name: 'Matematik', icon: '📐', description: 'Fonksiyonlar, cebir ve analitik düşünme' },
      { name: 'Fizik', icon: '⚛️', description: 'Kuvvet, hareket, enerji ve elektrik' },
      { name: 'Kimya', icon: '🧪', description: 'Atom, bağlar, tepkimeler ve çözeltiler' },
      { name: 'Biyoloji', icon: '🧬', description: 'Hücre, kalıtım ve canlı sistemleri' },
      { name: 'Edebiyat', icon: '📚', description: 'Metin türleri, dönemler ve yorumlama' },
      { name: 'Tarih', icon: '📜', description: 'Kronoloji, neden-sonuç ve tarihsel yorum' },
      { name: 'İngilizce', icon: '🇬🇧', description: 'Okuma, kelime ve konuşma pratiği' },
    ],
  },
  {
    name: 'ALES',
    icon: '🧠',
    description: 'Sayısal ve sözel akıl yürütme',
    courses: [
      { name: 'Sayısal', icon: '📈', description: 'Problem çözme ve nicel mantık' },
      { name: 'Sözel', icon: '🗣️', description: 'Paragraf ve sözel akıl yürütme' },
    ],
  },
];

export const COURSES_BY_LEVEL: Record<string, CourseDefinition[]> = Object.fromEntries(
  LEVELS.map((level) => [level.name, level.courses]),
);

export function getCourse(levelName?: string, courseName?: string) {
  if (!levelName || !courseName) return undefined;
  return COURSES_BY_LEVEL[levelName]?.find((course) => course.name === courseName);
}

export function getAllCourseKeys() {
  return LEVELS.flatMap((level) =>
    level.courses.map((course) => ({ levelName: level.name, courseName: course.name })),
  );
}
