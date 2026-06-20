import path from "path";
import { randomUUID } from "crypto";
import { extensionFor, type StorageAdapter, type UploadInput } from "./types";

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "screenshots";

/**
 * Supabase Storage adapter. Uploads to a public bucket and returns the public
 * URL. The service-role key is used server-side only.
 */
export const supabaseStorage: StorageAdapter = {
  async upload({ buffer, filename, contentType, userId }: UploadInput) {
    const { createClient } = await import("@supabase/supabase-js");
    const client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } },
    );

    const ext = path.extname(filename) || extensionFor(contentType);
    const key = `${userId}/${randomUUID()}${ext}`;

    const { error } = await client.storage
      .from(BUCKET)
      .upload(key, buffer, { contentType, upsert: false });
    if (error) throw new Error(`Supabase upload failed: ${error.message}`);

    const { data } = client.storage.from(BUCKET).getPublicUrl(key);
    return { url: data.publicUrl };
  },
};
