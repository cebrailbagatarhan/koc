# Toplu Paket Brief'i (10.000 soru hedefi)

Bu dosya, toplu soru üreten ajanların uyduğu sözleşmedir. Önce `docs/QUESTION_AUTHORING_SPEC.md` okunur; burada ondan **farklı olan** noktalar yazılıdır.

## 1. Fark: konu tanımlamak yok

Mevcut seviyelerde (İlkokul, Ortaokul, Lise, ALES, ÖSYM, YÖK) konular zaten tanımlı. Toplu paket **yeni konu açmaz**; soruları var olan konulara `topicQuestionIds` ile bağlar.

```ts
import type { EmbeddedQuestionSeed } from '@/data/embeddedQuestionPackV10';
import type { QuestionDifficulty } from '@/data/embeddedQuestionPackV10';

// ... yardımcılar ...

export const questions: EmbeddedQuestionSeed[] = [...];
export const topicQuestionIds: Record<string, Record<string, string[]>> = {
  'İlkokul::Matematik': {
    'Toplama ve Çıkarma': ['bulk-im-add-1', 'bulk-im-add-2'],
  },
};
```

Kurallar:
- `levelName` / `courseName` katalogla **birebir** aynı.
- `topicQuestionIds` ikinci anahtarı `data/topicCatalog.ts` içindeki **mevcut konu adı** olmalı (birebir, Türkçe karakterler dahil).
- Her soru **tam olarak bir** konuya bağlanır; her konu en az 40 soru almalı.
- `topicIndex: 0` yaz (kullanılmıyor, tip gereği duruyor).
- Dosyada `topics` exportu **olmayacak**.

## 2. Üretim deseni: düz metin değil, jeneratör

10.000 soruyu elle yazmak ne senin ne dosyanın taşıyacağı bir yük. Her paket **veri tablosu + döngü** ile üretilir; böylece paket dosyası küçük kalır, sorular çalışma anında üretilip SQLite'a yazılır.

Bu yardımcı bloğu dosyanın başına **aynen** koy (seed'i kendi paketine göre değiştir):

```ts
let seed = 20261110;
function rnd() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
}
function pick<T>(list: T[]): T {
  return list[Math.floor(rnd() * list.length)];
}
function shuffle<T>(list: T[]): T[] {
  const result = [...list];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(rnd() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}
function mc(input: {
  id: string;
  levelName: string;
  courseName: string;
  prompt: string;
  answer: string;
  distractors: string[];
  explanation: string;
  difficulty?: QuestionDifficulty;
}): EmbeddedQuestionSeed {
  const options = shuffle([input.answer, ...input.distractors]);
  if (options.length !== 4 || new Set(options).size !== 4) {
    throw new Error(`Seçenek hatası: ${input.id}`);
  }
  return {
    id: input.id,
    levelName: input.levelName,
    courseName: input.courseName,
    topicIndex: 0,
    prompt: input.prompt,
    options,
    correctAnswer: input.answer,
    explanation: input.explanation,
    difficulty: input.difficulty ?? 'standard',
    questionKind: 'multiple-choice',
  };
}
```

Seçenekleri `shuffle` ile karıştırdığın için doğru cevap otomatik olarak A/B/C/D arasında dağılır. **Ayrıca elle sıralama yapma.**

## 3. Kalite kuralları (ihlali paketi geçersiz sayar)

1. **En az 10 farklı soru arketipi** yaz (örn. toplama, çıkarma, çarpma, bölme, kesir, saat, para, ölçü birimi, sıralama, problem). Her arketipin farklı bir gövde kalıbı olmalı.
2. **Bir arketipten en fazla 40 varyant.** Doğrulayıcı bunu uyarı olarak basar; 40'ı geçme.
3. **Aynı gövde iki kez geçmez.** Sayı değişse bile cümle kalıbı aynıysa o bir varyanttır, yeni soru değildir.
4. **Cevap programatik olarak hesaplanır**, elle yazılmaz. Matematikte sonucu kod hesaplasın, çeldiricileri de kod üretsin (işlem hatası, birim karıştırma, ters oran gibi gerçek hata tipleri).
5. **Çeldiriciler benzersiz ve doğru cevaptan farklı** olmalı; `new Set(options).size === 4` her zaman.
6. **Açıklama veriden üretilir**, sabit cümle değil: "12 × 4 = 48" gibi hesabı göster.
7. **Zorluk dağılımı:** ~%30 `easy`, %50 `standard`, %20 `hard`.
8. Türkçe imla, ondalık virgül (`2,5`), `× ÷ − ² √ ° π`, LaTeX yok, emoji yok.
9. Sayılar temiz olsun: tam sayı ya da sonlu ondalık. `1/3` gibi sonuçlar seçeneklerde kesir olarak yazılacaksa tutarlı yaz.
10. Yaş/düzey uyumu: İlkokul 8-11, Ortaokul 11-14, Lise 14-18, ALES/ÖSYM yetişkin.

## 4. id şeması

`bulk-<ders kısaltması>-<arketip>-<sıra>` biçiminde, paket içinde tekil:

- `bulk-im-add-1`, `bulk-im-frac-7`
- `bulk-om-eq-12`, `bulk-lm-trig-4`
- `bulk-tyt-mat-33`

id yalnızca küçük harf, rakam ve tire içerir (`^[a-z0-9][a-z0-9-]*$`).

## 5. Doğrulama

```bash
cd "C:/Users/cebra/WorkBuddy AI/2026-11-09-17-35-58/repo" && node scripts/validate-question-packs.ts data/packs/<dosya>.ts
```

Çıktı **`0 hata`** ile bitmeli. Uyarı varsa (şablon 40'ı geçti, cevap dağılımı çarpık) düzelt.

Ek olarak kendi dosyanı çalıştırıp sayıları kontrol et:

```bash
cd "C:/Users/cebra/WorkBuddy AI/2026-11-09-17-35-58/repo" && node --experimental-strip-types -e "
import('./data/packs/<dosya>.ts').then(m => {
  console.log('soru:', m.questions.length);
  const t = {}; for (const q of m.questions) { const k = q.prompt.replace(/[0-9]+/g,'#'); t[k] = (t[k]||0)+1; }
  const top = Object.entries(t).sort((a,b)=>b[1]-a[1]).slice(0,5);
  console.log('en kalabalık kalıplar:', top);
});"
```

## 6. Yasaklar

- `topics` exportu yazma.
- Başka dosyaya dokunma.
- `import` içinde çalışma zamanı bağımlılığı kullanma (yalnızca `import type`).
- Aynı soruyu farklı id ile iki kez yazma.
- "Aşağıdakilerden hangisi yanlıştır?" tipi sorularda iki tartışmalı seçenek bırakma.
