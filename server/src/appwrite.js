import { Client, Storage, ID } from 'node-appwrite';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const APPWRITE_ENABLED = !!(process.env.APPWRITE_ENDPOINT && process.env.APPWRITE_PROJECT_ID && process.env.APPWRITE_API_KEY);

const client = APPWRITE_ENABLED
  ? new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY)
  : null;

const storage = APPWRITE_ENABLED ? new Storage(client) : null;
const BUCKET_ID = process.env.APPWRITE_BUCKET_ID || 'medshield-documents';

// Local-disk fallback so the demo works fully without an Appwrite account.
const LOCAL_STORAGE_DIR = path.join(process.cwd(), 'server', 'storage');

async function ensureLocalDir() {
  await fs.mkdir(LOCAL_STORAGE_DIR, { recursive: true });
}

/**
 * Ensure the storage bucket exists. Call once on server startup.
 */
export async function ensureBucket() {
  if (!APPWRITE_ENABLED) {
    await ensureLocalDir();
    console.log(`ℹ Appwrite not configured — using local disk storage at ${LOCAL_STORAGE_DIR}`);
    return;
  }
  const bucket = await storage.getBucket(BUCKET_ID);
  console.log(`✓ Appwrite bucket "${BUCKET_ID}" ready (extensions: ${bucket.allowedFileExtensions?.join(', ') || 'all'})`);
}

/**
 * Upload an encrypted buffer to Appwrite Storage (or local disk in demo mode).
 * @param {Buffer} buffer  The encrypted file content
 * @param {string} filename  Display name for the stored file
 * @returns {Promise<string>} The file ID
 */
export async function uploadToAppwrite(buffer, filename) {
  if (!APPWRITE_ENABLED) {
    await ensureLocalDir();
    const fileId = crypto.randomUUID();
    await fs.writeFile(path.join(LOCAL_STORAGE_DIR, fileId), buffer);
    return fileId;
  }
  const safeName = filename.replace(/\.[^.]+$/, '') + '.pdf';
  const file = new File([buffer], safeName, { type: 'application/octet-stream' });
  const result = await storage.createFile(BUCKET_ID, ID.unique(), file);
  return result.$id;
}

export async function downloadFromAppwrite(fileId) {
  if (!APPWRITE_ENABLED) {
    return fs.readFile(path.join(LOCAL_STORAGE_DIR, fileId));
  }
  const result = await storage.getFileDownload(BUCKET_ID, fileId);
  if (Buffer.isBuffer(result)) return result;
  if (result instanceof ArrayBuffer) return Buffer.from(new Uint8Array(result));
  if (result instanceof Uint8Array) return Buffer.from(result);
  return Buffer.from(result);
}

export async function deleteFromAppwrite(fileId) {
  if (!APPWRITE_ENABLED) {
    await fs.rm(path.join(LOCAL_STORAGE_DIR, fileId), { force: true });
    return;
  }
  await storage.deleteFile(BUCKET_ID, fileId);
}
