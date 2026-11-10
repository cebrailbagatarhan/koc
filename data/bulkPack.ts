import type { EmbeddedQuestionSeed } from '@/data/embeddedQuestionPackV10';

import * as bulkAles from '@/data/packs/bulkAles';
import * as bulkIlkokulDiger from '@/data/packs/bulkIlkokulDiger';
import * as bulkIlkokulMatematik from '@/data/packs/bulkIlkokulMatematik';
import * as bulkLiseDiger from '@/data/packs/bulkLiseDiger';
import * as bulkLiseFizikKimya from '@/data/packs/bulkLiseFizikKimya';
import * as bulkLiseMatematik from '@/data/packs/bulkLiseMatematik';
import * as bulkOrtaokulFenIngilizce from '@/data/packs/bulkOrtaokulFenIngilizce';
import * as bulkOrtaokulMatematik from '@/data/packs/bulkOrtaokulMatematik';
import * as bulkOrtaokulTurkceSosyal from '@/data/packs/bulkOrtaokulTurkceSosyal';
import * as bulkOsymAyt from '@/data/packs/bulkOsymAyt';
import * as bulkOsymTyt from '@/data/packs/bulkOsymTyt';

type BulkPack = {
  questions: EmbeddedQuestionSeed[];
  topicQuestionIds: Record<string, Record<string, string[]>>;
};

export const BULK_PACKS: BulkPack[] = [
  bulkIlkokulMatematik,
  bulkIlkokulDiger,
  bulkOrtaokulMatematik,
  bulkOrtaokulTurkceSosyal,
  bulkOrtaokulFenIngilizce,
  bulkLiseMatematik,
  bulkLiseFizikKimya,
  bulkLiseDiger,
  bulkAles,
  bulkOsymTyt,
  bulkOsymAyt,
];

/** Tüm toplu paketlerin konu eşlemelerini ders anahtarına göre birleştirir. */
export const BULK_TOPIC_QUESTION_IDS: Record<string, Record<string, string[]>> = {};
for (const pack of BULK_PACKS) {
  for (const [courseKey, topicMap] of Object.entries(pack.topicQuestionIds)) {
    const target = (BULK_TOPIC_QUESTION_IDS[courseKey] ??= {});
    for (const [topicName, ids] of Object.entries(topicMap)) {
      (target[topicName] ??= []).push(...ids);
    }
  }
}

export function getBulkQuestionPack(): EmbeddedQuestionSeed[] {
  const ids = new Set<string>();
  const result: EmbeddedQuestionSeed[] = [];
  for (const pack of BULK_PACKS) {
    for (const question of pack.questions) {
      if (ids.has(question.id)) {
        throw new Error(`Duplicate bulk question id: ${question.id}`);
      }
      ids.add(question.id);
      if (question.options.length !== 4 || new Set(question.options).size !== 4) {
        throw new Error(`Bulk question must have four unique options: ${question.id}`);
      }
      if (!question.options.includes(question.correctAnswer)) {
        throw new Error(`Bulk answer/options mismatch: ${question.id}`);
      }
      result.push(question);
    }
  }
  return result;
}

export function getBulkQuestionCount() {
  return BULK_PACKS.reduce((total, pack) => total + pack.questions.length, 0);
}
