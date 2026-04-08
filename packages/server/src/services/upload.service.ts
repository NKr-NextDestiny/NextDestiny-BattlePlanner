import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';
import { nanoid } from 'nanoid';
import type { MultipartFile } from '@fastify/multipart';

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(import.meta.dirname, '..', '..', 'uploads');
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880');

type UploadCategory = 'games' | 'maps' | 'operators' | 'gadgets';

export async function processUpload(
  file: MultipartFile,
  category: UploadCategory,
  options: { width?: number; height?: number } = {},
): Promise<string | null> {
  const buffer = await file.toBuffer();

  if (!buffer.length) {
    return null; // No file data provided
  }

  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds maximum of ${MAX_FILE_SIZE} bytes`);
  }

  const ext = 'webp';
  const filename = `${nanoid()}.${ext}`;
  const dir = path.join(UPLOAD_DIR, category);
  const filePath = path.join(dir, filename);

  await fs.mkdir(dir, { recursive: true });

  let sharpInstance = sharp(buffer);

  if (options.width || options.height) {
    sharpInstance = sharpInstance.resize(options.width, options.height, { fit: 'inside' });
  }

  await sharpInstance.webp({ quality: 85 }).toFile(filePath);

  return `/${category}/${filename}`;
}

export async function deleteUpload(filePath: string): Promise<void> {
  const fullPath = path.join(UPLOAD_DIR, filePath);
  try {
    await fs.unlink(fullPath);
  } catch {
    // File may not exist, ignore
  }
}
