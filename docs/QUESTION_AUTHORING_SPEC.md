# Soru Yazım Sözleşmesi (Question Authoring Spec)

Bu dosya, Koç uygulamasına soru ekleyen herkesin (insan veya ajan) uyması gereken **tek doğru** sözleşmedir. Buradaki kurallar kodun kendisinden çıkarılmıştır; kural ihlali uygulamada sessiz veri kaybına veya çökme­ye yol açar.

## 1. Veri modeli

`data/embeddedQuestionPackV10.ts` içindeki `EmbeddedQuestionSeed` tipi tek geçerli şemadır:

```ts
export type QuestionDifficulty = 'easy' | 'standard' | 'hard';
export type QuestionKind = 'multiple-choice' | 'visual-choice' | 'reading' | 'sequence';

export type EmbeddedQuestionSeed = {
  id: string;
  levelName: string;
  courseName: string;
  topicIndex?: number;
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: QuestionDifficulty;
  questionKind: QuestionKind;
  visual?: QuestionVisualSpec;
};
```

### 1.1 Zorunlu kurallar

| Kural | Neden |
|---|---|
| `options.length === 4` ve dört seçenek de **birbirinden farklı** | `validateQuestion` ve `validatePack` aksi halde hata fırlatır, uygulama açılışta çöker |
| `correctAnswer`, `options` içinde **birebir** (string eşitliği) bulunmalı | Cevap anahtarı `option === correctAnswer` karşılaştırmasıyla işaretlenir |
| `id` tüm paketlerde **tekil** | `question_bank.id` PRIMARY KEY; çakışma tüm seed transaction'ını geri alır |
| `prompt` ve `explanation` boş olamaz | `validateQuestion` kontrolü |
| `levelName` + `courseName` katalogla **birebir** aynı yazılmalı | `courseCatalog.ts` ve `topicCatalog.ts` `level::course` anahtarıyla eşleşir; tek harf farkı soruyu görünmez yapar |
| `topicIndex`, dosyadaki `topics` dizisinin **0 tabanlı** indeksi olmalı | `questionBankStore` konuyu `topics[topicIndex % topics.length]` ile atar |
| Seçeneklerde `A)`, `B)` gibi önek **olmamalı** | UI öneki kendisi basıyor |
| Seçenekler kısa; tam cümle gerekiyorsa büyük harfle başlayıp noktayla bitmeli | Görsel tutarlılık |

### 1.2 İçerik kalitesi

- **Tek doğru cevap.** Yakın ama yanlış çeldiriciler üret; "hiçbiri", "hepsi", "A ve B" gibi kaçış seçenekleri kullanma (ÖSYM bunları nadiren ve bilinçli kullanır).
- **Çeldiriciler gerçek hata tiplerini temsil etmeli:** işlem sırası hatası, birim karıştırma, ters oran, kavram yanılgısı.
- **Açıklama çözümü göstermeli**, sadece "Doğru cevap X'tir." dememeli. 1–3 cümle; gerekirse ara işlem.
- **Zorluk dağılımı** paket başına yaklaşık: %25 `easy`, %50 `standard`, %25 `hard`.
- **Tekrar yok:** aynı pakette aynı kök gövde iki kez geçmez; sayılar değişse bile kurgu değişmeli.
- **Görsel gerektirmeyen soru:** tüm sorular metinle tek başına çözülebilmeli (uygulama görselleri opsiyonel basar).
- **Güncel/siyasi/tartışmalı içerik yok.** Tarih, coğrafya ve vatandaşlık sorularında yerleşik müfredat bilgisi kullan.
- **Türkçe imla:** `ı, İ, ş, ğ, ü, ö, ç` doğru; düz tırnak yerine `“ ”`; kesme işareti `’`.
- **Sayı ve sembol:** ondalık ayırıcı **virgül** (`2,5`), çarpı `×`, bölü `÷`, eksi `−` veya `-`, kare `²`, derece `°`, kök `√`, pi `π`. LaTeX (`$x^2$`) **yasak**.
- **Emoji yok** (ÖSYM/YÖK paketlerinde). Uygulamanın diğer bölümleri emoji kullanabilir.

### 1.3 `questionKind` seçimi

| Değer | Ne zaman |
|---|---|
| `multiple-choice` | Varsayılan; klasik 4 seçenekli soru |
| `reading` | Paragraf / metin anlama / dil bilgisi metne bağlı sorular |
| `sequence` | Sıralama, kronoloji, "I < II < III" tipi |
| `visual-choice` | **Sadece** `visual` alanı doluysa |

### 1.4 `visual` (opsiyonel, ÖSYM/YÖK paketlerinde kullanma)

```ts
| { kind: 'number-line'; min: number; max: number; points: number[]; highlight?: number }
| { kind: 'bars'; labels: string[]; values: number[] }      // labels.length === values.length
| { kind: 'icon-grid'; icon: string; count: number; groups?: number }
| { kind: 'timeline'; items: Array<{ label: string; year: number }> }
| { kind: 'chips'; items: string[] }
```

`number-line` için `points` artan sırada ve `[min, max]` aralığında olmalı; `highlight` da `points` içinde olmalı.

## 2. Dosya sözleşmesi

Her içerik dilimi **tek bir dosya** üretir: `data/packs/<slice>.ts`.

```ts
import type { EmbeddedQuestionSeed } from '@/data/embeddedQuestionPackV10';
import type { TopicDefinition } from '@/data/topicCatalog';

export const LEVEL_NAME = 'ÖSYM';
export const COURSE_NAME = 'TYT';

export const topics: TopicDefinition[] = [
  {
    name: 'Paragraf',
    icon: '📄',
    summary: 'Paragrafın ana düşüncesini, yardımcı düşüncelerini ve akışını çözümle.',
    goals: ['Ana düşünceyi ayır.', 'Yardımcı düşünceyi kanıtla.', 'Akış bozukluğunu bul.'],
    practicePrompt: 'Bir paragrafın ana düşüncesini 15 kelimeyle yaz.',
    questionIds: ['osym-tyt-tr-1', 'osym-tyt-tr-2'],
  },
];

export const questions: EmbeddedQuestionSeed[] = [
  {
    id: 'osym-tyt-tr-1',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt: '...',
    options: ['...', '...', '...', '...'],
    correctAnswer: '...',
    explanation: '...',
    difficulty: 'standard',
    questionKind: 'reading',
  },
];
```

### 2.1 Katı kurallar

1. **Çalışma zamanı importu yok.** Yalnızca `import type` kullanılabilir. `import { ... }` yazarsan doğrulayıcı dosyayı çalıştıramaz.
2. `export const topics` ve `export const questions` adları **birebir** bunlar olmalı.
3. Her `topics[i].questionIds` yalnızca kendi dilimindeki id'leri içerir; her soru **tam olarak bir** konuya bağlanır.
4. `topicIndex`, `topics` dizisindeki indekstir. 3 konu varsa geçerli değerler `0, 1, 2`.
5. id şeması: `<sınav>-<ders>-<konu-kısaltması>-<sıra>`; örn. `osym-tyt-mat-12`, `yok-yokdil-fen-3`.
6. Dosya `data/packs/` altında, adı `camelCase` ve `.ts` uzantılı.
7. Dosya sonunda `as const` kullanma; tip zaten dar.

## 3. Mevcut içeriği genişletme (yerleşik banka)

`data/offlineContent.ts` içindeki `QUESTION_BANK` 18 ders anahtarı için 3'er soru tutar. Genişletme `data/packs/legacyIlkokulOrtaokul.ts` ve `data/packs/legacyLiseAles.ts` dosyalarına yazılır; ikisi `data/legacyQuestionBankV11.ts` içinde birleşir ve `getQuizQuestions` önce bu genişletilmiş bankaya bakar (anahtar varsa eski 3'lü seti tamamen değiştirir).

```ts
import type { QuizQuestion } from '@/data/offlineContent';

export const bank: Record<string, QuizQuestion[]> = {
  'İlkokul::Matematik': [ { id: 'im1', question: '...', options: [...], correctAnswer: '...', explanation: '...' } ],
};

export const topicQuestionIds: Record<string, Record<string, string[]>> = {
  'İlkokul::Matematik': { 'Toplama ve Çıkarma': ['im1', 'im4'] },
};
```

- **Mevcut id'ler korunur** (`im1`, `om1`, `lf1` ...). Metin iyileştirilebilir; id değişmez çünkü `quiz_attempts` geçmişi id'ye bağlıdır.
- Yeni sorular mevcut numaralandırmayı sürdürür: `im4`, `im5` ... `im7` (ders başına 7 soru).
- `topicQuestionIds` anahtarları `level::course`, ikinci anahtar **mevcut konu adı** olmalı (`topicCatalog.ts` içindeki adlarla birebir). Her konu en az 2 soru almalı.
- `QuizQuestion` alanları: `id, question, options, correctAnswer, explanation` (zorluk/kind yok; varsayılan `standard` / `multiple-choice` atanır).
- Bu iki dosya `data/legacyQuestionBankV11.ts` içinde `LEGACY_BANK_V11` ve `LEGACY_TOPIC_QUESTION_IDS_V11` olarak birleşir; yeni bir dilim eklenirse o dosyaya da eklenmelidir.

## 4. Doğrulama

```bash
node scripts/validate-question-packs.ts
```

Doğrulayıcı şunları kontrol eder: tekil id, 4 benzersiz seçenek, cevabın seçeneklerde olması, boş metin, `topicIndex` sınırı, `questionIds` ↔ `questions` tutarlılığı, konu adı tekrarı, toplam sayılar.

## 5. Katalog eşleşmesi

`levelName` / `courseName` çiftleri `data/courseCatalog.ts` içinde tanımlı olmalıdır:

| Level | Courses |
|---|---|
| İlkokul | Matematik, Türkçe, Hayat Bilgisi, İngilizce |
| Ortaokul | Matematik, Türkçe, Fen Bilimleri, Sosyal Bilgiler, İngilizce |
| Lise | Matematik, Fizik, Kimya, Biyoloji, Edebiyat, Tarih, İngilizce |
| ALES | Sayısal, Sözel |
| **ÖSYM** | **TYT, AYT Sayısal, AYT Eşit Ağırlık, KPSS** |
| **YÖK** | **YÖKDİL, Akademik** |

Yeni level/course eklenirse `courseCatalog.ts` güncellenir; konular `data/packs/*.ts` içinden `getTopicsForCatalogCourse` ile birleşir.
