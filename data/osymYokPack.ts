import type { EmbeddedQuestionSeed } from '@/data/embeddedQuestionPackV10';
import type { TopicDefinition } from '@/data/topicCatalog';

import * as osymTytTurkce from '@/data/packs/osymTytTurkce';
import * as osymTytMatematik from '@/data/packs/osymTytMatematik';
import * as osymTytFen from '@/data/packs/osymTytFen';
import * as osymTytSosyal from '@/data/packs/osymTytSosyal';
import * as osymAytSayisal from '@/data/packs/osymAytSayisal';
import * as osymAytEa from '@/data/packs/osymAytEa';
import * as osymKpss from '@/data/packs/osymKpss';
import * as yokYokdil from '@/data/packs/yokYokdil';
import * as yokAkademik from '@/data/packs/yokAkademik';

type ContentPack = {
  LEVEL_NAME: string;
  COURSE_NAME: string;
  topics: TopicDefinition[];
  questions: EmbeddedQuestionSeed[];
};

export const OSMY_YOK_PACKS: ContentPack[] = [
  osymTytTurkce,
  osymTytMatematik,
  osymTytFen,
  osymTytSosyal,
  osymAytSayisal,
  osymAytEa,
  osymKpss,
  yokYokdil,
  yokAkademik,
];

function validatePacks(packs: ContentPack[]) {
  const ids = new Set<string>();
  for (const pack of packs) {
    for (const question of pack.questions) {
      if (ids.has(question.id)) {
        throw new Error(`Duplicate ÖSYM/YÖK question id: ${question.id}`);
      }
      ids.add(question.id);
      if (question.options.length !== 4 || new Set(question.options).size !== 4) {
        throw new Error(`ÖSYM/YÖK question must have four unique options: ${question.id}`);
      }
      if (!question.options.includes(question.correctAnswer)) {
        throw new Error(`ÖSYM/YÖK answer/options mismatch: ${question.id}`);
      }
    }
  }
}

export function getOsymYokQuestionPack(): EmbeddedQuestionSeed[] {
  validatePacks(OSMY_YOK_PACKS);
  return OSMY_YOK_PACKS.flatMap((pack) => pack.questions);
}

export function getOsymYokTopics(): Record<string, TopicDefinition[]> {
  const result: Record<string, TopicDefinition[]> = {};
  for (const pack of OSMY_YOK_PACKS) {
    const courseKey = `${pack.LEVEL_NAME}::${pack.COURSE_NAME}`;
    result[courseKey] = [...(result[courseKey] ?? []), ...pack.topics];
  }
  return result;
}

export function getOsymYokQuestionCounts(): Record<string, number> {
  return OSMY_YOK_PACKS.reduce<Record<string, number>>((accumulator, pack) => {
    const courseKey = `${pack.LEVEL_NAME}::${pack.COURSE_NAME}`;
    accumulator[courseKey] = (accumulator[courseKey] ?? 0) + pack.questions.length;
    return accumulator;
  }, {});
}
