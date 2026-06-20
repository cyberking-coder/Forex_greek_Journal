import { localDiskStorage } from "./local";
import { supabaseStorage } from "./supabase";
import type { StorageAdapter } from "./types";

export type { UploadResult } from "./types";

/** Whether cloud storage (Supabase) is configured. */
export function isCloudStorageConfigured(): boolean {
  return Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

/** Returns Supabase storage when configured, otherwise the local-disk fallback. */
export function getStorage(): StorageAdapter {
  return isCloudStorageConfigured() ? supabaseStorage : localDiskStorage;
}
