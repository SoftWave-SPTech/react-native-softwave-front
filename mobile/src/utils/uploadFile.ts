import { Platform } from 'react-native';
import {
  cacheDirectory,
  copyAsync,
  getInfoAsync,
  readAsStringAsync,
  writeAsStringAsync,
  EncodingType,
} from 'expo-file-system/legacy';
import type { ImagePickerAsset } from 'expo-image-picker';
import * as ImagePicker from 'expo-image-picker';
import type { UploadableFile } from '../services/resources';

function isHeic(mime?: string | null, name?: string | null): boolean {
  const m = (mime ?? '').toLowerCase();
  const n = (name ?? '').toLowerCase();
  return m.includes('heic') || m.includes('heif') || n.endsWith('.heic') || n.endsWith('.heif');
}

function normalizeMime(mime?: string | null, name?: string | null): string {
  if (mime && mime !== 'application/octet-stream') {
    if (isHeic(mime, name)) return 'image/jpeg';
    return mime;
  }
  if (name?.toLowerCase().endsWith('.pdf')) return 'application/pdf';
  return 'image/jpeg';
}

function normalizeName(mime: string, original?: string | null): string {
  const stamp = Date.now();
  if (mime === 'application/pdf') {
    return original?.toLowerCase().endsWith('.pdf') ? original : `comprovante_${stamp}.pdf`;
  }
  return `comprovante_${stamp}.jpg`;
}

/**
 * Converte asset do ImagePicker em payload de upload (sem campo `file` nativo).
 */
export function uploadFileFromImageAsset(asset: ImagePickerAsset): UploadableFile {
  const type = normalizeMime(asset.mimeType, asset.fileName);
  const name = normalizeName(type, asset.fileName);
  return {
    uri: asset.uri,
    name,
    type,
  };
}

/** Opções recomendadas para câmera — força JPEG compatível no iOS. */
export function cameraPickerOptions(): ImagePicker.ImagePickerOptions {
  return {
    quality: 0.65,
    allowsEditing: false,
    mediaTypes: ['images'],
    exif: false,
    ...(Platform.OS === 'ios'
      ? {
          preferredAssetRepresentationMode:
            ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
        }
      : {}),
  };
}

/** Opções recomendadas para galeria. */
export function galleryPickerOptions(): ImagePicker.ImagePickerOptions {
  return {
    quality: 0.85,
    allowsEditing: false,
    mediaTypes: ['images'],
    exif: false,
    ...(Platform.OS === 'ios'
      ? {
          preferredAssetRepresentationMode:
            ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
        }
      : {}),
  };
}

/**
 * Copia/converte imagem para cache local legível pelo FormData (RN iOS/Android).
 */
export async function prepareUploadFile(file: UploadableFile): Promise<UploadableFile> {
  if (file.file) {
    return {
      ...file,
      type: file.type || 'application/octet-stream',
      name: file.name || `arquivo_${Date.now()}`,
    };
  }

  const sourceUri = file.uri;
  if (!sourceUri) {
    throw new Error('Arquivo sem URI.');
  }

  const type = normalizeMime(file.type, file.name);
  const name = normalizeName(type, file.name);

  if (type === 'application/pdf') {
    const pdfUri =
      sourceUri.startsWith('file://') || sourceUri.startsWith('content://')
        ? sourceUri
        : `file://${sourceUri}`;
    return { uri: pdfUri, name, type };
  }

  const cacheDir = cacheDirectory;
  if (!cacheDir) {
    const uri = sourceUri.startsWith('file://') ? sourceUri : `file://${sourceUri}`;
    return { uri, name, type: 'image/jpeg' };
  }

  const dest = `${cacheDir}${name}`;

  try {
    await copyAsync({ from: sourceUri, to: dest });
  } catch {
    const base64 = await readAsStringAsync(sourceUri, { encoding: EncodingType.Base64 });
    await writeAsStringAsync(dest, base64, { encoding: EncodingType.Base64 });
  }

  const info = await getInfoAsync(dest);
  if (!info.exists || (typeof info.size === 'number' && info.size <= 0)) {
    throw new Error('Não foi possível preparar a imagem capturada.');
  }

  const uri = dest.startsWith('file://') ? dest : `file://${dest}`;
  return { uri, name, type: 'image/jpeg' };
}
