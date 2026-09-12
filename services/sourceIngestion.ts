import * as DocumentPicker from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';

import {
  extractPdfText,
  isPdfTextExtractionAvailable,
} from '@/modules/koc-pdf-text-extract/src';

const SOURCE_DIRECTORY = 'learning-sources';
const MAX_FILE_SIZE = 25 * 1024 * 1024;
const MAX_TEXT_FILE_EXTRACT_SIZE = 2 * 1024 * 1024;
const MAX_PDF_EXTRACT_SIZE = 20 * 1024 * 1024;
const MAX_EXTRACTED_TEXT_CHARS = 250_000;

export type TextExtractionStatus =
  | 'extracted'
  | 'not-supported'
  | 'too-large'
  | 'image-only'
  | 'failed';

export type PickedLearningFile = {
  fileUri: string;
  fileName: string;
  mimeType: string | null;
  fileSize: number | null;
  extractedText: string;
  textExtractionStatus: TextExtractionStatus;
};

function sanitizeFileName(name: string) {
  const normalized = name
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return normalized || 'kaynak-dosyasi';
}

function extensionOf(name: string) {
  const index = name.lastIndexOf('.');
  return index >= 0 ? name.slice(index).toLowerCase() : '';
}

function isPdf(fileName: string, mimeType?: string | null) {
  return mimeType === 'application/pdf' || extensionOf(fileName) === '.pdf';
}

function canExtractAsText(fileName: string, mimeType?: string | null) {
  const extension = extensionOf(fileName);
  return Boolean(
    mimeType?.startsWith('text/') ||
      mimeType === 'application/json' ||
      mimeType === 'application/xml' ||
      ['.txt', '.md', '.markdown', '.csv', '.json', '.xml', '.html', '.htm', '.js', '.ts'].includes(extension),
  );
}

function cleanExtractedText(text: string) {
  return text
    .replace(/\u0000/g, ' ')
    .replace(/[\t ]+\n/g, '\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .slice(0, MAX_EXTRACTED_TEXT_CHARS)
    .trim();
}

async function extractSearchableText(input: {
  file: File;
  fileName: string;
  mimeType?: string | null;
  fileSize?: number | null;
}): Promise<{ text: string; status: TextExtractionStatus }> {
  if (isPdf(input.fileName, input.mimeType)) {
    if (input.fileSize && input.fileSize > MAX_PDF_EXTRACT_SIZE) {
      return { text: '', status: 'too-large' };
    }
    if (!isPdfTextExtractionAvailable()) {
      return { text: '', status: 'failed' };
    }
    try {
      const text = cleanExtractedText(await extractPdfText(input.file.uri));
      return text
        ? { text, status: 'extracted' }
        : { text: '', status: 'image-only' };
    } catch (error) {
      console.warn('PDF metni çıkarılamadı.', error);
      return { text: '', status: 'failed' };
    }
  }

  if (!canExtractAsText(input.fileName, input.mimeType)) {
    return { text: '', status: 'not-supported' };
  }
  if (input.fileSize && input.fileSize > MAX_TEXT_FILE_EXTRACT_SIZE) {
    return { text: '', status: 'too-large' };
  }

  try {
    const text = cleanExtractedText(await input.file.text());
    return text
      ? { text, status: 'extracted' }
      : { text: '', status: 'failed' };
  } catch {
    return { text: '', status: 'failed' };
  }
}

export async function pickAndPersistLearningFile(): Promise<PickedLearningFile | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: '*/*',
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled || !result.assets?.[0]) return null;

  const asset = result.assets[0];
  if (asset.size && asset.size > MAX_FILE_SIZE) {
    throw new Error('Dosya çok büyük. En fazla 25 MB kaynak ekleyebilirsin.');
  }

  const sourceFile = new File(asset.uri);
  const sourceDirectory = new Directory(Paths.document, SOURCE_DIRECTORY);
  sourceDirectory.create({ idempotent: true, intermediates: true });

  const persistedName = `${Date.now()}-${sanitizeFileName(asset.name)}`;
  const persistedFile = new File(sourceDirectory, persistedName);
  sourceFile.copy(persistedFile);

  const fileSize = asset.size ?? persistedFile.size ?? null;
  const extraction = await extractSearchableText({
    file: persistedFile,
    fileName: asset.name,
    mimeType: asset.mimeType,
    fileSize,
  });

  return {
    fileUri: persistedFile.uri,
    fileName: asset.name,
    mimeType: asset.mimeType ?? null,
    fileSize,
    extractedText: extraction.text,
    textExtractionStatus: extraction.status,
  };
}

export function deletePersistedLearningFile(fileUri?: string | null) {
  if (!fileUri) return;
  try {
    const file = new File(fileUri);
    if (file.exists) file.delete();
  } catch (error) {
    console.warn('Kaynak dosyası cihazdan silinemedi.', error);
  }
}

export function formatFileSize(bytes?: number | null) {
  if (!bytes || bytes <= 0) return 'Boyut bilinmiyor';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
