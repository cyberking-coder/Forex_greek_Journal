import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { extensionFor, type StorageAdapter, type UploadInput } from "./types";

/**
 * Local-disk fallback used when Supabase isn't configured. Writes to
 * public/uploads so files are served statically in development. Not suitable
 * for serverless/production (read-only filesystem) — configure Supabase there.
 */
export const localDiskStorage: StorageAdapter = {
  async upload({ buffer, filename, contentType, userId }: UploadInput) {
    const ext = path.extname(filename) || extensionFor(contentType);
    const name = `${randomUUID()}${ext}`;
    const dir = path.join(process.cwd(), "public", "uploads", userId);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, name), buffer);
    return { url: `/uploads/${userId}/${name}` };
  },
};
