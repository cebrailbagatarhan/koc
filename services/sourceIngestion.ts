import * as DocumentPicker from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';

const SOURCE_DIRECTORY = 'learning-sources';
const MAX_FILE_SIZE = 25 * 1024 * 1024;
const MAX_EXTRACTED_TEXT_CHARS = 250_000;

export type PickedLearningFile = {
  fileUri: string;
  fileName: string;
  mimeType: string | null;
  fileSize: number | null;
  extractedText: string;
  textExtractionStatus: 'extracted' | 'not-supported' | 'too-large' | 'failed';
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

function canExtractAsText(fileName: string, mimeType?: string | null) {
  const extension = extensionOf(fileName);
  return Boolean(
    mimeType?.startsWith('text/') ||
      mimeType === 'application/json' ||
      mimeType === 'application/xml' ||
      ['.txt', '.md', '.markdown', '.csv', '.json', '.xml', '.html', '.htm', '.js', '.ts'].includes(extension),
  );
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

  const sourceFile = new File(asset);
  const sourceDirectory = new Directory(Paths.document, SOURCE_DIRECTORY);
  sourceDirectory.create({ idempotent: true, intermediates: true });

  const persistedName = `${Date.now()}-${sanitizeFileName(asset.name)}`;
  const persistedFile = new File(sourceDirectory, persistedName);
  sourceFile.copy(persistedFile);

  let extractedText = '';
  let textExtractionStatus: PickedLearningFile['textExtractionStatus'] = 'not-supported';

  if (canExtractAsText(asset.name, asset.mimeType)) {
    if (asset.size && asset.size > 2 * 1024 * 1024) {
      textExtractionStatus = 'too-large';
    } else {
      try {
        const rawText = await persistedFile.text();
        extractedText = rawText.slice(0, MAX_EXTRACTED_TEXT_CHARS).trim();
        textExtractionStatus = extractedText ? 'extracted' : 'failed';
      } catch {
        textExtractionStatus = 'failed';
      }
    }
  }

  return {
    fileUri: persistedFile.uri,
    fileName: asset.name,
    mimeType: asset.mimeType ?? null,
    fileSize: asset.size ?? persistedFile.size ?? null,
    extractedText,
    textExtractionStatus,
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
