import type { QuizQuestion } from '@/data/offlineContent';

import {
  bank as primaryMiddleBank,
  topicQuestionIds as primaryMiddleTopicIds,
} from '@/data/packs/legacyIlkokulOrtaokul';
import {
  bank as highSchoolAlesBank,
  topicQuestionIds as highSchoolAlesTopicIds,
} from '@/data/packs/legacyLiseAles';

/**
 * Yerleşik bankanın genişletilmiş sürümü.
 *
 * Bu dosya `data/offlineContent.ts` içindeki QUESTION_BANK'in yerini alır:
 * aynı id'ler korunur, her ders 3 sorudan 7 soruya çıkar. `getQuizQuestions`
 * önce buraya bakar; anahtar yoksa eski bankaya düşer.
 */
export const LEGACY_BANK_V11: Record<string, QuizQuestion[]> = {
  ...primaryMiddleBank,
  ...highSchoolAlesBank,
};

export const LEGACY_TOPIC_QUESTION_IDS_V11: Record<string, Record<string, string[]>> = {
  ...primaryMiddleTopicIds,
  ...highSchoolAlesTopicIds,
};
