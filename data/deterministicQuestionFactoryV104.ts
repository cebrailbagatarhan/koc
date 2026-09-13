import type { EmbeddedQuestionSeed, QuestionDifficulty } from '@/data/embeddedQuestionPackV10';

type NumericFactoryInput = {
  id: string;
  levelName: string;
  courseName: string;
  topicIndex: number;
  prompt: string;
  answer: number;
  explanation: string;
  difficulty?: QuestionDifficulty;
  distractors: number[];
};

function uniqueOptions(answer: number, distractors: number[]) {
  const values = [answer, ...distractors]
    .filter((value) => Number.isFinite(value))
    .map((value) => Number.isInteger(value) ? value : Number(value.toFixed(2)));

  const unique = [...new Set(values)];
  if (unique.length < 4) {
    const fallbacks = [answer + 1, answer - 1, answer + 2, answer - 2, answer + 5, answer - 5];
    for (const value of fallbacks) {
      if (value >= 0 && !unique.includes(value)) unique.push(value);
      if (unique.length >= 4) break;
    }
  }

  if (unique.length < 4) {
    throw new Error(`Question factory could not produce four unique options for answer ${answer}`);
  }

  return unique.slice(0, 4).map(String);
}

function numericQuestion(input: NumericFactoryInput): EmbeddedQuestionSeed {
  const correctAnswer = Number.isInteger(input.answer)
    ? String(input.answer)
    : String(Number(input.answer.toFixed(2)));

  const options = uniqueOptions(input.answer, input.distractors);
  if (!options.includes(correctAnswer)) {
    throw new Error(`Correct answer missing from options for ${input.id}`);
  }

  return {
    id: input.id,
    levelName: input.levelName,
    courseName: input.courseName,
    topicIndex: input.topicIndex,
    prompt: input.prompt,
    options,
    correctAnswer,
    explanation: input.explanation,
    difficulty: input.difficulty ?? 'standard',
    questionKind: 'multiple-choice',
  };
}

function validateQuestion(question: EmbeddedQuestionSeed) {
  if (!question.id || !question.prompt.trim() || !question.explanation.trim()) {
    throw new Error(`Incomplete generated question: ${question.id}`);
  }
  if (question.options.length !== 4 || new Set(question.options).size !== 4) {
    throw new Error(`Generated question must have four unique options: ${question.id}`);
  }
  if (!question.options.includes(question.correctAnswer)) {
    throw new Error(`Generated question answer/options mismatch: ${question.id}`);
  }
  return question;
}

function makePrimaryMathFactory(): EmbeddedQuestionSeed[] {
  const result: EmbeddedQuestionSeed[] = [];

  for (let i = 0; i < 20; i += 1) {
    const a = 24 + i * 3;
    const b = 7 + (i % 8);
    const answer = a + b;
    result.push(numericQuestion({
      id: `v104-im-add-${i + 1}`,
      levelName: 'İlkokul',
      courseName: 'Matematik',
      topicIndex: 0,
      prompt: `${a} + ${b} işleminin sonucu kaçtır?`,
      answer,
      distractors: [answer - 10, answer + 10, answer - 1],
      explanation: `${a} ile ${b} toplandığında ${answer} elde edilir.`,
      difficulty: i < 8 ? 'easy' : 'standard',
    }));
  }

  for (let i = 0; i < 20; i += 1) {
    const b = 5 + (i % 9);
    const answer = 18 + i * 2;
    const a = answer + b;
    result.push(numericQuestion({
      id: `v104-im-sub-${i + 1}`,
      levelName: 'İlkokul',
      courseName: 'Matematik',
      topicIndex: 0,
      prompt: `${a} - ${b} işleminin sonucu kaçtır?`,
      answer,
      distractors: [answer + b, answer - 1, answer + 2],
      explanation: `${a}'dan ${b} çıkarılırsa ${answer} kalır.`,
      difficulty: i < 8 ? 'easy' : 'standard',
    }));
  }

  for (let i = 0; i < 20; i += 1) {
    const a = 2 + (i % 8);
    const b = 3 + ((i * 3) % 7);
    const answer = a * b;
    result.push(numericQuestion({
      id: `v104-im-mul-${i + 1}`,
      levelName: 'İlkokul',
      courseName: 'Matematik',
      topicIndex: 2,
      prompt: `${a} grupta ${b} nesne varsa toplam kaç nesne vardır?`,
      answer,
      distractors: [a + b, answer - a, answer + b],
      explanation: `${a} × ${b} = ${answer}.`,
      difficulty: i < 8 ? 'easy' : 'standard',
    }));
  }

  for (let i = 0; i < 20; i += 1) {
    const divisor = 2 + (i % 7);
    const answer = 3 + (i % 10);
    const dividend = divisor * answer;
    result.push(numericQuestion({
      id: `v104-im-div-${i + 1}`,
      levelName: 'İlkokul',
      courseName: 'Matematik',
      topicIndex: 2,
      prompt: `${dividend} nesne ${divisor} eşit gruba ayrılırsa her grupta kaç nesne olur?`,
      answer,
      distractors: [divisor, answer + 1, Math.max(0, answer - 1)],
      explanation: `${dividend} ÷ ${divisor} = ${answer}.`,
      difficulty: i < 8 ? 'easy' : 'standard',
    }));
  }

  return result;
}

function makeMiddleMathFactory(): EmbeddedQuestionSeed[] {
  const result: EmbeddedQuestionSeed[] = [];

  for (let i = 0; i < 20; i += 1) {
    const x = 2 + i;
    const a = 2 + (i % 5);
    const b = 3 + (i % 9);
    const c = a * x + b;
    result.push(numericQuestion({
      id: `v104-om-eq-${i + 1}`,
      levelName: 'Ortaokul',
      courseName: 'Matematik',
      topicIndex: 0,
      prompt: `${a}x + ${b} = ${c} olduğuna göre x kaçtır?`,
      answer: x,
      distractors: [x - 1, x + 1, x + 2],
      explanation: `Her iki taraftan ${b} çıkarılır, sonra ${a}'e bölünür. x = ${x}.`,
      difficulty: i < 8 ? 'standard' : 'hard',
    }));
  }

  const percentages = [10, 20, 25, 30, 40, 50, 60, 75];
  for (let i = 0; i < 20; i += 1) {
    const p = percentages[i % percentages.length];
    const whole = 40 + (i + 2) * 20;
    const answer = (whole * p) / 100;
    if (!Number.isInteger(answer)) continue;
    result.push(numericQuestion({
      id: `v104-om-pct-${i + 1}`,
      levelName: 'Ortaokul',
      courseName: 'Matematik',
      topicIndex: 1,
      prompt: `${whole} sayısının %${p}'i kaçtır?`,
      answer,
      distractors: [answer + 10, Math.max(0, answer - 10), p],
      explanation: `${whole} × ${p}/100 = ${answer}.`,
      difficulty: 'standard',
    }));
  }

  for (let i = 0; i < 20; i += 1) {
    const first = 2 + (i % 6);
    const second = 3 + ((i + 2) % 7);
    const scale = 2 + (i % 5);
    const a = first * scale;
    const b = second * scale;
    result.push(numericQuestion({
      id: `v104-om-ratio-${i + 1}`,
      levelName: 'Ortaokul',
      courseName: 'Matematik',
      topicIndex: 1,
      prompt: `${a}:${b} oranının en sade hâlinde ilk terim kaçtır?`,
      answer: first,
      distractors: [second, scale, first + 1],
      explanation: `${a}:${b} oranı ${scale}'e bölünerek ${first}:${second} olur.`,
      difficulty: 'standard',
    }));
  }

  for (let i = 0; i < 20; i += 1) {
    const angleSum = 55 + i * 4;
    const answer = 180 - angleSum;
    result.push(numericQuestion({
      id: `v104-om-angle-${i + 1}`,
      levelName: 'Ortaokul',
      courseName: 'Matematik',
      topicIndex: 2,
      prompt: `Bir üçgende iki açının toplamı ${angleSum}° ise üçüncü açı kaç derecedir?`,
      answer,
      distractors: [angleSum, answer + 10, Math.max(0, answer - 10)],
      explanation: `Üçgenin iç açıları toplamı 180°'dir. 180 - ${angleSum} = ${answer}°.`,
      difficulty: i < 10 ? 'standard' : 'hard',
    }));
  }

  return result;
}

function makeHighSchoolMathFactory(): EmbeddedQuestionSeed[] {
  const result: EmbeddedQuestionSeed[] = [];

  for (let i = 0; i < 20; i += 1) {
    const m = 2 + (i % 6);
    const b = -5 + (i % 11);
    const x = 1 + (i % 9);
    const answer = m * x + b;
    result.push(numericQuestion({
      id: `v104-lm-fn-${i + 1}`,
      levelName: 'Lise',
      courseName: 'Matematik',
      topicIndex: 1,
      prompt: `f(x) = ${m}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)} ise f(${x}) kaçtır?`,
      answer,
      distractors: [answer + m, answer - m, m + b + x],
      explanation: `x yerine ${x} yazılır: f(${x}) = ${m}·${x} ${b >= 0 ? '+' : '-'} ${Math.abs(b)} = ${answer}.`,
      difficulty: 'standard',
    }));
  }

  for (let i = 0; i < 20; i += 1) {
    const r1 = 1 + (i % 7);
    const r2 = r1 + 2 + (i % 4);
    const sum = r1 + r2;
    const product = r1 * r2;
    result.push(numericQuestion({
      id: `v104-lm-quad-${i + 1}`,
      levelName: 'Lise',
      courseName: 'Matematik',
      topicIndex: 0,
      prompt: `x² - ${sum}x + ${product} = 0 denkleminin küçük kökü kaçtır?`,
      answer: r1,
      distractors: [r2, sum, product],
      explanation: `Denklem (x-${r1})(x-${r2}) = 0 biçiminde çarpanlara ayrılır. Küçük kök ${r1}'dir.`,
      difficulty: i < 8 ? 'standard' : 'hard',
    }));
  }

  for (let i = 0; i < 20; i += 1) {
    const base = [2, 3, 5, 10][i % 4];
    const exponent = 2 + (i % 4);
    const value = base ** exponent;
    result.push(numericQuestion({
      id: `v104-lm-log-${i + 1}`,
      levelName: 'Lise',
      courseName: 'Matematik',
      topicIndex: 2,
      prompt: `log_${base}(${value}) kaçtır?`,
      answer: exponent,
      distractors: [base, exponent + 1, Math.max(0, exponent - 1)],
      explanation: `${base}^${exponent} = ${value} olduğundan log_${base}(${value}) = ${exponent}.`,
      difficulty: 'standard',
    }));
  }

  return result;
}

function makeAlesQuantFactory(): EmbeddedQuestionSeed[] {
  const result: EmbeddedQuestionSeed[] = [];

  const percentages = [10, 20, 25, 40, 50];
  for (let i = 0; i < 20; i += 1) {
    const p = percentages[i % percentages.length];
    const whole = 80 + i * 20;
    const part = (whole * p) / 100;
    if (!Number.isInteger(part)) continue;
    result.push(numericQuestion({
      id: `v104-as-pct-${i + 1}`,
      levelName: 'ALES',
      courseName: 'Sayısal',
      topicIndex: 0,
      prompt: `Bir sayının %${p}'i ${part} ise sayının tamamı kaçtır?`,
      answer: whole,
      distractors: [whole + 20, Math.max(0, whole - 20), part],
      explanation: `${part} ÷ (${p}/100) = ${whole}.`,
      difficulty: i < 8 ? 'standard' : 'hard',
    }));
  }

  for (let i = 0; i < 20; i += 1) {
    const workers1 = 2 + (i % 5);
    const workers2 = workers1 + 1 + (i % 3);
    const days1 = workers2 * (2 + (i % 4));
    const totalWork = workers1 * days1;
    if (totalWork % workers2 !== 0) continue;
    const answer = totalWork / workers2;
    result.push(numericQuestion({
      id: `v104-as-work-${i + 1}`,
      levelName: 'ALES',
      courseName: 'Sayısal',
      topicIndex: 1,
      prompt: `${workers1} kişi bir işi ${days1} günde bitiriyor. Aynı hızla çalışan ${workers2} kişi bu işi kaç günde bitirir?`,
      answer,
      distractors: [days1, Math.max(1, answer - 1), answer + 1],
      explanation: `Toplam iş sabittir: ${workers1} × ${days1} = ${workers2} × gün. Gün = ${answer}.`,
      difficulty: 'hard',
    }));
  }

  for (let i = 0; i < 20; i += 1) {
    const start = 2 + (i % 7);
    const step = 2 + (i % 5);
    const fifth = start + 4 * step;
    const answer = start + 5 * step;
    result.push(numericQuestion({
      id: `v104-as-seq-${i + 1}`,
      levelName: 'ALES',
      courseName: 'Sayısal',
      topicIndex: 2,
      prompt: `${start}, ${start + step}, ${start + 2 * step}, ${start + 3 * step}, ${fifth}, ... dizisinin sonraki terimi kaçtır?`,
      answer,
      distractors: [answer + step, answer - step, fifth + 1],
      explanation: `Dizi her adımda ${step} artıyor. Bu yüzden sonraki terim ${answer}.`,
      difficulty: i < 8 ? 'standard' : 'hard',
    }));
  }

  return result;
}

export function getDeterministicQuestionPackV104(): EmbeddedQuestionSeed[] {
  const generated = [
    ...makePrimaryMathFactory(),
    ...makeMiddleMathFactory(),
    ...makeHighSchoolMathFactory(),
    ...makeAlesQuantFactory(),
  ].map(validateQuestion);

  const ids = new Set<string>();
  for (const question of generated) {
    if (ids.has(question.id)) throw new Error(`Duplicate generated question id: ${question.id}`);
    ids.add(question.id);
  }

  return generated;
}
