import { GoogleGenAI } from '@google/genai';

// API anahtarı - kullanıcının verdiği geçerli anahtar
const apiKey = ";
// const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!apiKey || typeof apiKey !== 'string') {
  throw new Error('Gemini API key is not set correctly.');
}

const ai = new GoogleGenAI({ apiKey });

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface Explanation {
  title: string;
  points: string[];
}

// Gelen metni temizleyip JSON'a çeviren yardımcı fonksiyon
const parseGeminiResponse = <T>(text: string | undefined): T | null => {
  try {
    if (!text) {
      console.error('No text provided to parseGeminiResponse');
      return null;
    }
    // ```json ... ``` formatını temizle
    const cleanedText = text.replace(/^```json\s*|```$/g, '');
    // Sadece { ile } arasını almayı dene
    const startIndex = cleanedText.indexOf('{');
    const endIndex = cleanedText.lastIndexOf('}');
    if (startIndex === -1 || endIndex === -1) {
      console.error('No JSON object found in the response:', cleanedText);
      return null;
    }
    const jsonString = cleanedText.substring(startIndex, endIndex + 1);
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('Error parsing JSON from Gemini response:', error);
    console.error('Problematic text:', text);
    return null;
  }
};

// --- YENİ: Sohbet özelliği için fonksiyon (geçici çözüm) ---
export const startChatSession = async (level: string) => {
  // TODO: Yeni kütüphanenin chat API'sini öğren ve düzelt
  // Şimdilik basit bir mock döndürüyoruz
  return {
    sendMessage: async (parts: any[]) => {
      const text = parts.find(p => p.text)?.text || '';
      const prompt = `
        Sen bir eğitim asistanısın. Cevaplarını ${level} seviyesindeki bir öğrenciye göre ayarla.
        Kullanıcı mesajı: ${text}
      `;

      try {
        const result = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        return {
          response: {
            text: () => result.text
          }
        };
      } catch (error) {
        console.error('Chat error:', error);
        throw error;
      }
    }
  };
};


export const generateQuizQuestion = async (
  level: string,
  course: string
): Promise<QuizQuestion | null> => {
  const prompt = `
    Lütfen aşağıdaki formatı kullanarak bir JSON nesnesi oluştur:
    {
      "question": "soru metni",
      "options": ["şık A", "şık B", "şık C", "şık D"],
      "correctAnswer": "doğru şık metni"
    }

    Konu: ${level} seviyesi, ${course} dersi.
    Soru, bu seviyeye ve derse uygun olmalı. Sadece JSON nesnesini döndür, başka hiçbir metin ekleme.
  `;

  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    const text = result.text;

    return parseGeminiResponse<QuizQuestion>(text);
  } catch (error) {
    console.error('Error generating quiz question:', error);
    return null;
  }
};

export const generateExplanation = async (
  level: string,
  course: string
): Promise<Explanation | null> => {
  const prompt = `
    Lütfen aşağıdaki formatı kullanarak bir JSON nesnesi oluştur:
    {
      "title": "konu başlığı",
      "points": ["anahtar nokta 1", "anahtar nokta 2", "anahtar nokta 3"]
    }

    Konu: ${level} seviyesi, ${course} dersi hakkında kısa ve anlaşılır bir konu özeti.
    Başlık konuyu özetlemeli, noktalar ise konunun en önemli 3-5 maddesini içermelidir.
    Sadece JSON nesnesini döndür, başka hiçbir metin ekleme.
  `;

  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    const text = result.text;
    return parseGeminiResponse<Explanation>(text);
  } catch (error) {
    console.error('Error generating explanation:', error);
    return null;
  }
};
