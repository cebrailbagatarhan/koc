const rawProxyUrl = process.env.EXPO_PUBLIC_AI_PROXY_URL?.trim();

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface Explanation {
  title: string;
  points: string[];
}

export interface ChatPart {
  text?: string;
  inlineData?: {
    data: string;
    mimeType: string;
  };
}

export interface ChatSession {
  sendMessage(parts: ChatPart[]): Promise<{
    response: {
      text(): string;
    };
  }>;
}

const getProxyUrl = (): string => {
  if (!rawProxyUrl) {
    throw new Error(
      'AI proxy is not configured. Set EXPO_PUBLIC_AI_PROXY_URL to a trusted backend URL.'
    );
  }

  const normalized = rawProxyUrl.replace(/\/+$/, '');
  const parsed = new URL(normalized);
  const isLocal = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';

  if (parsed.protocol !== 'https:' && !isLocal) {
    throw new Error('AI proxy must use HTTPS outside local development.');
  }

  return normalized;
};

const callProxy = async <T>(operation: string, payload: unknown): Promise<T> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const response = await fetch(`${getProxyUrl()}/v1/${operation}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`AI proxy request failed with status ${response.status}.`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
};

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(item => typeof item === 'string');

const isQuizQuestion = (value: unknown): value is QuizQuestion => {
  if (!value || typeof value !== 'object') return false;
  const question = value as Partial<QuizQuestion>;
  return (
    typeof question.question === 'string' &&
    isStringArray(question.options) &&
    question.options.length >= 2 &&
    typeof question.correctAnswer === 'string' &&
    question.options.includes(question.correctAnswer)
  );
};

const isExplanation = (value: unknown): value is Explanation => {
  if (!value || typeof value !== 'object') return false;
  const explanation = value as Partial<Explanation>;
  return typeof explanation.title === 'string' && isStringArray(explanation.points);
};

export const startChatSession = (level: string): ChatSession => ({
  sendMessage: async (parts: ChatPart[]) => {
    const result = await callProxy<{ text?: unknown }>('chat', { level, parts });
    const text = result.text;
    if (typeof text !== 'string') {
      throw new Error('AI proxy returned an invalid chat response.');
    }

    return {
      response: {
        text: () => text,
      },
    };
  },
});

export const generateQuizQuestion = async (
  level: string,
  course: string
): Promise<QuizQuestion | null> => {
  try {
    const result = await callProxy<unknown>('quiz-question', { level, course });
    return isQuizQuestion(result) ? result : null;
  } catch (error) {
    console.error('Error generating quiz question:', error);
    return null;
  }
};

export const generateExplanation = async (
  level: string,
  course: string
): Promise<Explanation | null> => {
  try {
    const result = await callProxy<unknown>('explanation', { level, course });
    return isExplanation(result) ? result : null;
  } catch (error) {
    console.error('Error generating explanation:', error);
    return null;
  }
};
