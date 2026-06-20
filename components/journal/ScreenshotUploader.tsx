"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ImagePlus, Loader2, X } from "lucide-react";

export function ScreenshotUploader({
  urls,
  onChange,
}: {
  urls: string[];
  onChange: (urls: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    const added: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(body.error ?? "Upload failed");
          break;
        }
        added.push(body.url);
      }
      if (added.length) onChange([...urls, ...added]);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function remove(index: number) {
    onChange(urls.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {urls.map((url, i) => (
          <div
            key={url}
            className="group relative aspect-video overflow-hidden rounded-lg border border-border bg-surface"
          >
            <button
              type="button"
              onClick={() => setLightbox(i)}
              className="h-full w-full"
              aria-label="View screenshot"
            >
              <img
                src={url}
                alt={`Screenshot ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label="Remove screenshot"
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-md bg-black/60 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="hover:border-accent/50 flex aspect-video flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border text-muted transition-colors hover:text-foreground disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          ) : (
            <ImagePlus className="h-5 w-5" aria-hidden />
          )}
          <span className="text-xs">{uploading ? "Uploading…" : "Add"}</span>
        </button>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {lightbox !== null && (
        <Lightbox
          urls={urls}
          index={lightbox}
          onClose={() => setLightbox(null)}
          onIndexChange={setLightbox}
        />
      )}
    </div>
  );
}

function Lightbox({
  urls,
  index,
  onClose,
  onIndexChange,
}: {
  urls: string[];
  index: number;
  onClose: () => void;
  onIndexChange: (i: number) => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndexChange((index + 1) % urls.length);
      if (e.key === "ArrowLeft")
        onIndexChange((index - 1 + urls.length) % urls.length);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, urls.length, onClose, onIndexChange]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Screenshot viewer"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/10 hover:text-white"
      >
        <X className="h-6 w-6" aria-hidden />
      </button>

      {urls.length > 1 && (
        <button
          type="button"
          onClick={() => onIndexChange((index - 1 + urls.length) % urls.length)}
          aria-label="Previous"
          className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        >
          <ChevronLeft className="h-6 w-6" aria-hidden />
        </button>
      )}

      <img
        src={urls[index]}
        alt={`Screenshot ${index + 1}`}
        className="max-h-[85vh] max-w-full rounded-lg object-contain"
      />

      {urls.length > 1 && (
        <button
          type="button"
          onClick={() => onIndexChange((index + 1) % urls.length)}
          aria-label="Next"
          className="absolute right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        >
          <ChevronRight className="h-6 w-6" aria-hidden />
        </button>
      )}
    </div>
  );
}
