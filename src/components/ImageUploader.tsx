import { useCallback, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ImageIcon, UploadCloud, X, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ImageUploaderProps {
  /** The current image URL (from DB). Pass empty string if none. */
  value: string;
  /** Called with the new public URL once the upload succeeds, or "" when removed. */
  onChange: (url: string) => void;
}

const ACCEPTED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const BUCKET = "product-images";

/**
 * Drag-and-drop image uploader backed by Supabase Storage.
 * Shows a preview, validates type + size, uploads on form save trigger via onChange.
 * The parent form reads `value` (a public URL) and persists it to the DB.
 */
export function ImageUploader({ value, onChange }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  // ── validation ─────────────────────────────────────────────────────────────
  function validate(file: File): string | null {
    if (!ACCEPTED.includes(file.type)) return "Only JPG, PNG or WEBP images are allowed.";
    if (file.size > MAX_BYTES)
      return `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 5 MB.`;
    return null;
  }

  // ── upload to Supabase Storage ─────────────────────────────────────────────
  async function uploadFile(file: File) {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    setUploading(true);
    try {
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(uniqueName, file, { cacheControl: "3600", upsert: false });

      if (upErr) throw upErr;

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(uniqueName);
      onChange(data.publicUrl);
      toast.success("Image uploaded successfully.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
      // Revert preview to last saved URL
      setPreview(value || null);
      onChange(value);
    } finally {
      setUploading(false);
      setPendingFile(null);
    }
  }

  // ── handle a selected file ─────────────────────────────────────────────────
  function handleFile(file: File) {
    const err = validate(file);
    if (err) {
      toast.error(err);
      return;
    }

    // Show a local preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    setPendingFile(file);
    uploadFile(file);
  }

  // ── drag events ────────────────────────────────────────────────────────────
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);
  const onDragLeave = useCallback(() => setDragging(false), []);
  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [value],
  );

  // ── remove image ───────────────────────────────────────────────────────────
  function handleRemove() {
    setPreview(null);
    setPendingFile(null);
    onChange("");
    if (inputRef.current) inputRef.current.value = "";
  }

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-2">
      {/* Drop zone / preview */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all cursor-pointer select-none
          ${dragging ? "border-primary bg-primary/10 scale-[1.01]" : "border-border hover:border-primary/60 hover:bg-muted/40"}
          ${preview ? "h-56" : "h-44"}
        `}
      >
        {/* Hidden native file input */}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(",")}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />

        {uploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 rounded-xl z-10">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="mt-2 text-sm text-muted-foreground">Uploading…</p>
          </div>
        )}

        {preview ? (
          <img
            src={preview}
            alt="Product preview"
            className="h-full w-full object-contain rounded-xl p-1"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 px-4 text-center pointer-events-none">
            <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
              <UploadCloud className="h-7 w-7 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">PNG, JPG, WEBP — up to 5 MB</p>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons shown when an image is present */}
      {preview && !uploading && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Replace image
          </button>
          <span className="text-muted-foreground/40">|</span>
          <button
            type="button"
            onClick={handleRemove}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            Remove image
          </button>
        </div>
      )}

      {/* Fallback icon hint when no image */}
      {!preview && !uploading && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ImageIcon className="h-3.5 w-3.5" />
          No image selected — product will show a placeholder.
        </div>
      )}
    </div>
  );
}
