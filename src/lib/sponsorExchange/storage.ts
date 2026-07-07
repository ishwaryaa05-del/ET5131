import { randomUUID } from "node:crypto";
import path from "node:path";
import { mkdir, writeFile, stat, readFile } from "node:fs/promises";

const UPLOAD_ROOT = path.join(process.cwd(), "uploads", "sponsor-exchange");

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100);
}

/**
 * Persists an uploaded File to local disk and returns a reference to store on
 * the TaskClaim. This is a local-filesystem MVP, not durable cloud storage —
 * fine for this prototype/single-instance deployment, but a production
 * deployment on ephemeral/multi-instance hosting would need to swap this for
 * S3-compatible object storage without changing the calling code's shape.
 */
export async function saveUploadedFile(file: File): Promise<{ path: string; filename: string; size: number }> {
  await mkdir(UPLOAD_ROOT, { recursive: true });
  const id = randomUUID();
  const safeName = sanitizeFilename(file.name || "upload");
  const storedName = `${id}-${safeName}`;
  const fullPath = path.join(UPLOAD_ROOT, storedName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(fullPath, buffer);

  return { path: storedName, filename: file.name || safeName, size: buffer.length };
}

export async function getUploadedFileSize(storedName: string): Promise<number | null> {
  try {
    const info = await stat(path.join(UPLOAD_ROOT, storedName));
    return info.size;
  } catch {
    return null;
  }
}

export async function readUploadedFile(storedName: string): Promise<Buffer> {
  // storedName is always a value we generated ourselves (never user-supplied
  // path segments), so this can't be used for directory traversal.
  return readFile(path.join(UPLOAD_ROOT, path.basename(storedName)));
}
