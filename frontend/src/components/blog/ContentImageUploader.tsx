import { useRef, useState } from "react";
import {
  AlertCircle,
  Image as ImageIcon,
  LoaderCircle,
  X,
} from "lucide-react";
import { uploadBlogContent } from "../../api/uploadApi";

interface ContentImageUploaderProps {
  open: boolean;
  onClose: () => void;
  onInsert: (url: string, alt: string) => void;
}

const ContentImageUploader = ({
  open,
  onClose,
  onInsert,
}: ContentImageUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [alt, setAlt] = useState("");

  if (!open) return null;

  const handleUpload = async (file: File) => {
    setError("");
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
      const result = await uploadBlogContent(file);
      setPreviewUrl(result.url);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "آپلود تصویر انجام نشد";
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  const handleInsert = () => {
    if (!previewUrl) return;
    onInsert(previewUrl, alt.trim() || "تصویر");
    setPreviewUrl("");
    setAlt("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0d14] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10">
          <div className="flex items-center gap-2">
            <ImageIcon size={16} className="text-[var(--griffin-gold)]" />
            <h3 className="font-heading text-sm font-black text-gray-900 dark:text-white">
              افزودن تصویر
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {previewUrl ? (
            <>
              <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                  متن جایگزین (Alt)
                </label>
                <input
                  type="text"
                  value={alt}
                  onChange={(e) => setAlt(e.target.value)}
                  placeholder="توضیح تصویر..."
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleInsert}
                  className="flex-1 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-4 py-2.5 text-xs font-black text-white shadow-lg disabled:opacity-40 transition-all"
                >
                  درج در متن
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewUrl("");
                    setAlt("");
                  }}
                  className="rounded-xl border border-gray-200 dark:border-white/10 px-4 py-2.5 text-xs font-black text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                >
                  تصویر دیگه
                </button>
              </div>
            </>
          ) : (
            <>
              <div
                onClick={() => inputRef.current?.click()}
                className="relative w-full aspect-video rounded-xl border-2 border-dashed border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02] hover:border-[var(--griffin-gold)]/40 hover:bg-[var(--griffin-gold)]/5 cursor-pointer transition-all flex flex-col items-center justify-center gap-2 p-4"
              >
                {uploading ? (
                  <>
                    <LoaderCircle
                      size={24}
                      className="text-[var(--griffin-gold)] animate-spin"
                    />
                    <p className="text-xs font-black text-gray-500">
                      در حال آپلود...
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-xl bg-[var(--griffin-gold)]/10 flex items-center justify-center">
                      <ImageIcon
                        size={22}
                        className="text-[var(--griffin-gold)]"
                      />
                    </div>
                    <p className="text-xs font-black text-gray-600 dark:text-gray-400 text-center">
                      تصویر رو انتخاب کن
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">
                      JPG, PNG, WebP — حداکثر ۵MB
                    </p>
                  </>
                )}
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleUpload(file);
                  }}
                  className="hidden"
                />
              </div>

              <div className="text-center text-[10px] text-gray-400 dark:text-gray-500">
                یا
              </div>

              <div>
                <input
                  type="text"
                  placeholder="URL تصویر رو وارد کن..."
                  dir="ltr"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const value = (e.target as HTMLInputElement).value;
                      if (value.trim()) {
                        setPreviewUrl(value.trim());
                      }
                    }
                  }}
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-3 py-2 text-xs text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all font-english"
                />
              </div>
            </>
          )}

          {error && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 flex items-start gap-1.5">
              <AlertCircle
                size={11}
                className="text-rose-500 shrink-0 mt-0.5"
              />
              <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                {error}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentImageUploader;