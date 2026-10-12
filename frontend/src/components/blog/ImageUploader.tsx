import { useRef, useState } from "react";
import {
  AlertCircle,
  Image as ImageIcon,
  LoaderCircle,
  Upload,
  X,
} from "lucide-react";
import { uploadBlogCover } from "../../api/uploadApi";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  folder?: "cover" | "content";
  label?: string;
  aspect?: "video" | "square";
}

const ImageUploader = ({
  value,
  onChange,
  label = "تصویر کاور",
  aspect = "video",
}: ImageUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  const aspectClass = aspect === "video" ? "aspect-video" : "aspect-square";

  // ==================== Upload ====================
  const handleUpload = async (file: File) => {
    setError("");

    // validation سمت کلاینت
    if (!file.type.startsWith("image/")) {
      setError("فایل باید تصویر باشد");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("حجم فایل بیشتر از ۵ مگابایت است");
      return;
    }

    setUploading(true);
    try {
      const result = await uploadBlogCover(file);
      onChange(result.url);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "آپلود تصویر انجام نشد";
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleUpload(file);
  };

  const handleRemove = () => {
    onChange("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
        <ImageIcon size={10} />
        {label}
      </label>

      {value ? (
        // ==================== Preview ====================
        <div className="relative group">
          <div
            className={`relative w-full ${aspectClass} rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5`}
          >
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <button
                type="button"
                onClick={handleRemove}
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500 px-3 py-2 text-xs font-black text-white shadow-lg hover:bg-rose-600 transition-colors"
              >
                <X size={13} />
                حذف
              </button>
            </div>
          </div>

          {/* URL نمایش */}
          <p
            dir="ltr"
            className="mt-2 text-[10px] font-english text-gray-400 dark:text-gray-500 truncate"
          >
            {value}
          </p>
        </div>
      ) : (
        // ==================== Dropzone ====================
        <>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`
              relative w-full ${aspectClass} rounded-xl
              border-2 border-dashed transition-all cursor-pointer
              flex flex-col items-center justify-center gap-2 p-4
              ${
                dragging
                  ? "border-[var(--griffin-gold)] bg-[var(--griffin-gold)]/10"
                  : "border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02] hover:border-[var(--griffin-gold)]/40 hover:bg-[var(--griffin-gold)]/5"
              }
            `}
          >
            {uploading ? (
              <>
                <LoaderCircle
                  size={24}
                  className="text-[var(--griffin-gold)] animate-spin"
                />
                <p className="text-xs font-black text-gray-500 dark:text-gray-400">
                  در حال آپلود...
                </p>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-[var(--griffin-gold)]/10 flex items-center justify-center">
                  <Upload size={18} className="text-[var(--griffin-gold)]" />
                </div>
                <p className="text-xs font-black text-gray-600 dark:text-gray-400 text-center">
                  تصویر رو اینجا بکش یا کلیک کن
                </p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500">
                  JPG, PNG, WebP, GIF — حداکثر ۵MB
                </p>
              </>
            )}

            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>
        </>
      )}

      {/* Manual URL input */}
      <div className="mt-2 flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="یا URL تصویر رو وارد کن..."
          dir="ltr"
          className="flex-1 rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-3 py-2 text-xs text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all font-english"
        />
      </div>

      {error && (
        <div className="mt-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 flex items-start gap-1.5">
          <AlertCircle size={11} className="text-rose-500 shrink-0 mt-0.5" />
          <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
            {error}
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;