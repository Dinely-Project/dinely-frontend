import { supabase } from './supabase';

const BUCKET_NAME = 'menu-images';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export interface ImageValidationError {
  message: string;
  code: 'INVALID_TYPE' | 'FILE_TOO_LARGE' | 'NO_FILE';
}

export const validateImageFile = (
  file: File | null
): ImageValidationError | null => {
  if (!file) {
    return { message: 'No file selected', code: 'NO_FILE' };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      message: 'Invalid file type. Only JPG, PNG, and WebP allowed.',
      code: 'INVALID_TYPE',
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      message: `File too large. Max 5MB allowed. Current size: ${(file.size / 1024 / 1024).toFixed(
        2
      )}MB`,
      code: 'FILE_TOO_LARGE',
    };
  }

  return null;
};

// 👉 safe filename generator
const generateFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = originalName.split('.').pop() || 'jpg';

  return `${timestamp}-${random}.${ext}`;
};

export interface UploadImageResult {
  publicUrl: string;
  fileName: string;
}

export const uploadMenuImage = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadImageResult> => {
  const validationError = validateImageFile(file);
  if (validationError) {
    throw new Error(validationError.message);
  }

  const fileName = generateFileName(file.name);

  // 👉 IMPORTANT: correct path inside bucket
  const filePath = `menu-items/${fileName}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Supabase upload error:', error.message);
    throw new Error(error.message);
  }

  if (onProgress) {
    onProgress(100);
  }

  // 👉 get public URL (works only if bucket is public)
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  if (!urlData?.publicUrl) {
    throw new Error('Failed to generate public URL');
  }

  return {
    publicUrl: urlData.publicUrl,
    fileName: filePath,
  };
};

// 👉 delete image
export const deleteMenuImage = async (filePath: string): Promise<void> => {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (error) {
    console.error('Delete error:', error.message);
    throw new Error(error.message);
  }
};

// 👉 extract file path from Supabase URL
export const extractFileNameFromUrl = (
  imageUrl: string
): string | null => {
  try {
    const url = new URL(imageUrl);
    const parts = url.pathname.split('/');

    const bucketIndex = parts.indexOf(BUCKET_NAME);
    if (bucketIndex === -1) return null;

    return parts.slice(bucketIndex + 1).join('/');
  } catch {
    return null;
  }
};