export type UploadInput = {
  buffer: Buffer;
  filename: string;
  contentType: string;
  userId: string;
};

export type UploadResult = { url: string };

export interface StorageAdapter {
  upload(input: UploadInput): Promise<UploadResult>;
}

/** Best-effort file extension from a MIME type. */
export function extensionFor(contentType: string): string {
  const map: Record<string, string> = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/avif": ".avif",
  };
  return map[contentType] ?? "";
}
