import { requireNativeModule } from 'expo-modules-core';

type PdfExtractorNativeModule = {
  isAvailable(): boolean;
  extractText(filePath: string): Promise<string>;
};

let nativeModule: PdfExtractorNativeModule | null = null;

try {
  nativeModule = requireNativeModule<PdfExtractorNativeModule>('PdfExtractor');
} catch {
  nativeModule = null;
}

export function isPdfTextExtractionAvailable() {
  try {
    return nativeModule?.isAvailable() ?? false;
  } catch {
    return false;
  }
}

export async function extractPdfText(filePath: string) {
  if (!nativeModule) {
    throw new Error('PDF metin çıkarma modülü bu build içinde bulunamadı.');
  }
  return nativeModule.extractText(filePath);
}
