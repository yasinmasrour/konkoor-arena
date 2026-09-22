import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Import,
  Layers,
  LoaderCircle,
  // RefreshCw,
  Sparkles,
  Upload,
  Wand2,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  downloadQuestionImportTemplate,
  importQuestions,
  previewQuestionImport,
  type ImportPreview,
} from "../../api/questionImportApi";

const QuestionImport = () => {
  const getErrorMessage = (err: unknown, fallback: string) => {
    if (typeof err === "object" && err !== null && "response" in err) {
      const response = (
        err as {
          response?: {
            data?: {
              message?: unknown;
            };
          };
        }
      ).response;

      if (typeof response?.data?.message === "string") {
        return response.data.message;
      }
    }

    if (err instanceof Error && err.message) {
      return err.message;
    }

    return fallback;
  };

  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (selected: File | null) => {
    setFile(selected);
    setPreview(null);
    setError("");
    setSuccess("");
  };

  const handlePreview = async () => {
    if (!file || loading) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      setPreview(await previewQuestionImport(file));
    } catch (err: unknown) {
      setError(getErrorMessage(err, "پیش‌نمایش فایل انجام نشد."));
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file || !preview || preview.invalidRows > 0 || importing) return;
    setImporting(true);
    setError("");
    setSuccess("");
    try {
      const result = await importQuestions(file);
      setSuccess(
        `${result.importedCount} سؤال با موفقیت و با وضعیت «پیش‌نویس» وارد شد.`,
      );
      setPreview(result.preview);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "وارد کردن سؤال‌ها انجام نشد."));
    } finally {
      setImporting(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) handleFile(droppedFile);
  };

  const steps = [
    { number: "۱", title: "آپلود", text: "CSV، XLSX یا XLS", icon: Upload },
    { number: "۲", title: "بررسی", text: "خطاها و هشدارها", icon: Layers },
    {
      number: "۳",
      title: "ثبت",
      text: "همه سؤال‌ها به‌صورت Draft",
      icon: Import,
    },
  ];

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* ==================== HEADER ==================== */}
        <header className="relative rounded-[2rem] overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-sm p-6 sm:p-8">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--griffin-gold)] to-transparent" />
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[var(--griffin-gold)]/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-xl opacity-60 animate-pulse" />
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg rotate-3">
                  <Upload size={24} strokeWidth={2.3} />
                </div>
              </div>

              <div>
                <button
                  onClick={() => navigate("/question-bank")}
                  className="group inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-[var(--griffin-gold)] transition-colors mb-1"
                >
                  <ArrowRight
                    size={13}
                    className="transition-transform group-hover:translate-x-1 rotate-180"
                  />
                  بازگشت به بانک سؤال
                </button>

                <div className="inline-flex items-center gap-2 mb-1.5">
                  <Sparkles size={11} className="text-[var(--griffin-gold)]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                    Bulk Import
                  </span>
                </div>

                <h1 className="font-heading text-3xl font-black text-gray-900 dark:text-white">
                  ورود گروهی سؤال‌ها
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-2xl">
                  Excel یا CSV را ابتدا بررسی کن؛ تا قبل از تأیید، هیچ داده‌ای
                  در پایگاه‌داده ثبت نمی‌شود.
                </p>
              </div>
            </div>

            <button
              onClick={downloadQuestionImportTemplate}
              className="group relative inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] px-5 py-3 text-sm font-black text-gray-700 dark:text-gray-200 backdrop-blur-sm hover:border-[var(--griffin-gold)]/40 hover:bg-[var(--griffin-gold)]/5 hover:text-[var(--griffin-gold)] transition-all"
            >
              <Download
                size={16}
                className="transition-transform group-hover:-translate-y-0.5"
              />
              دانلود قالب CSV
            </button>
          </div>
        </header>

        {/* ==================== STEPS ==================== */}
        <section className="grid gap-4 md:grid-cols-3">
          {steps.map((step) => {
            const StepIcon = step.icon;
            return (
              <div
                key={step.number}
                className="group relative rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-sm p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[var(--griffin-gold)]/5 hover:border-[var(--griffin-gold)]/40 overflow-hidden"
              >
                <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-[var(--griffin-gold)]/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative flex items-start justify-between gap-3 mb-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-lg opacity-60" />
                    <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white font-heading font-black text-lg shadow-lg rotate-3">
                      {step.number}
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/20 flex items-center justify-center text-[var(--griffin-gold)] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <StepIcon size={15} />
                  </div>
                </div>

                <p className="relative font-heading font-black text-gray-900 dark:text-white">
                  {step.title}
                </p>
                <p className="relative mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {step.text}
                </p>
              </div>
            );
          })}
        </section>

        {/* ==================== UPLOAD ==================== */}
        <section className="relative rounded-3xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-sm overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/50 to-transparent" />

          <div className="relative p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-stretch">
              {/* Dropzone */}
              <label
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  relative flex-1 min-h-[180px] cursor-pointer
                  flex flex-col items-center justify-center gap-3
                  rounded-2xl border-2 border-dashed px-5 py-6 text-center
                  transition-all duration-300
                  ${
                    isDragging
                      ? "border-[var(--griffin-gold)] bg-[var(--griffin-gold)]/10 scale-[1.02]"
                      : file
                        ? "border-emerald-500/40 bg-emerald-500/5"
                        : "border-gray-300 dark:border-white/10 hover:border-[var(--griffin-gold)]/60 hover:bg-[var(--griffin-gold)]/5"
                  }
                `}
              >
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                />

                <div className="relative">
                  <div
                    className={`
                      absolute inset-0 blur-xl opacity-60 animate-pulse
                      ${
                        file
                          ? "bg-emerald-500"
                          : isDragging
                            ? "bg-[var(--griffin-gold)]"
                            : "bg-[var(--griffin-gold)]/50"
                      }
                    `}
                  />
                  <div
                    className={`
                      relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg rotate-3
                      ${
                        file
                          ? "bg-gradient-to-br from-emerald-500 to-emerald-700"
                          : "bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700"
                      }
                    `}
                  >
                    {file ? (
                      <Check
                        size={26}
                        className="text-white"
                        strokeWidth={2.5}
                      />
                    ) : (
                      <FileSpreadsheet size={26} className="text-white" />
                    )}
                  </div>
                </div>

                <div>
                  <p className="font-heading font-black text-gray-900 dark:text-white">
                    {file ? file.name : "فایل رو بکش و اینجا رها کن"}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {file
                      ? "برای تغییر، فایل جدیدی انتخاب کن"
                      : "یا کلیک کن تا انتخاب کنی · CSV, XLSX, XLS"}
                  </p>
                  <p className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[var(--griffin-gold)]/10 text-[10px] font-black text-[var(--griffin-gold)]">
                    <Zap size={10} />
                    حداکثر ۵ مگابایت · ۵۰۰ سؤال
                  </p>
                </div>
              </label>

              {/* دکمه پیش‌نمایش */}
              <div className="md:w-64 flex flex-col gap-3">
                <button
                  disabled={!file || loading}
                  onClick={() => void handlePreview()}
                  className="group relative inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-6 py-4 font-black text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl hover:shadow-[var(--griffin-gold)]/60 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {loading ? (
                      <>
                        <LoaderCircle size={18} className="animate-spin" />
                        در حال بررسی...
                      </>
                    ) : (
                      <>
                        <Wand2 size={18} />
                        پیش‌نمایش و اعتبارسنجی
                      </>
                    )}
                  </span>
                  {!loading && (
                    <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  )}
                </button>

                {file && (
                  <button
                    onClick={() => handleFile(null)}
                    className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-5 py-3 text-xs font-bold text-gray-600 dark:text-gray-400 hover:border-rose-400/40 hover:text-rose-500 hover:bg-rose-500/5 transition-all"
                  >
                    <X
                      size={14}
                      className="transition-transform group-hover:rotate-90"
                    />
                    حذف فایل
                  </button>
                )}
              </div>
            </div>

            {/* Error/Success */}
            {error && (
              <div className="relative mt-4 rounded-2xl overflow-hidden border border-rose-500/30 bg-gradient-to-l from-rose-500/10 to-transparent backdrop-blur-sm p-4 animate-[fadeInUp_0.3s_ease-out]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/15 flex items-center justify-center shrink-0">
                    <XCircle
                      size={16}
                      className="text-rose-500"
                      strokeWidth={2.5}
                    />
                  </div>
                  <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {success && (
              <div className="relative mt-4 rounded-2xl overflow-hidden border border-emerald-500/30 bg-gradient-to-l from-emerald-500/10 to-transparent backdrop-blur-sm p-4 animate-[fadeInUp_0.3s_ease-out]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
                    <CheckCircle2
                      size={16}
                      className="text-emerald-500"
                      strokeWidth={2.5}
                    />
                  </div>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {success}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ==================== PREVIEW ==================== */}
        {preview && (
          <section className="space-y-4">
            {/* آمار */}
            <div className="grid gap-3 sm:grid-cols-4">
              {[
                {
                  label: "کل ردیف‌ها",
                  value: preview.totalRows,
                  color: "gray",
                  icon: Layers,
                },
                {
                  label: "معتبر",
                  value: preview.validRows,
                  color: "emerald",
                  icon: CheckCircle2,
                },
                {
                  label: "هشدار",
                  value: preview.warningRows,
                  color: "amber",
                  icon: AlertTriangle,
                },
                {
                  label: "خطا",
                  value: preview.invalidRows,
                  color: "rose",
                  icon: XCircle,
                },
              ].map((stat, i) => {
                const StatIcon = stat.icon;
                const palette = {
                  gray: {
                    bg: "bg-gray-500/10",
                    text: "text-gray-600 dark:text-gray-400",
                    border: "border-gray-200 dark:border-white/10",
                    icon: "text-gray-500",
                  },
                  emerald: {
                    bg: "bg-emerald-500/10",
                    text: "text-emerald-600 dark:text-emerald-400",
                    border: "border-emerald-500/30",
                    icon: "text-emerald-500",
                  },
                  amber: {
                    bg: "bg-amber-500/10",
                    text: "text-amber-600 dark:text-amber-400",
                    border: "border-amber-500/30",
                    icon: "text-amber-500",
                  },
                  rose: {
                    bg: "bg-rose-500/10",
                    text: "text-rose-600 dark:text-rose-400",
                    border: "border-rose-500/30",
                    icon: "text-rose-500",
                  },
                }[stat.color] ?? {
                  bg: "bg-gray-500/10",
                  text: "text-gray-600",
                  border: "border-gray-200",
                  icon: "text-gray-500",
                };

                return (
                  <div
                    key={i}
                    className={`
                      group relative rounded-2xl overflow-hidden border p-4
                      ${palette.border} ${palette.bg}
                      transition-all duration-300
                      hover:-translate-y-1 hover:shadow-lg
                    `}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={`
                          w-8 h-8 rounded-xl flex items-center justify-center
                          ${palette.bg} ${palette.icon}
                          transition-transform duration-300
                          group-hover:scale-110 group-hover:rotate-3
                        `}
                      >
                        <StatIcon size={15} />
                      </div>
                      {stat.color === "rose" && preview.invalidRows > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500 text-white text-[9px] font-black animate-pulse">
                          مسدود
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                      {stat.label}
                    </p>
                    <p
                      className={`font-heading text-3xl font-black mt-1 ${palette.text}`}
                    >
                      {stat.value.toLocaleString("fa-IR")}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* جدول ردیف‌ها */}
            <div className="relative rounded-3xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-sm overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/50 to-transparent" />

              <div className="relative flex flex-col gap-3 p-5 border-b border-gray-200/70 dark:border-white/5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/20 flex items-center justify-center text-[var(--griffin-gold)]">
                    <Layers size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                      Preview
                    </p>
                    <h2 className="font-heading text-sm font-black text-gray-900 dark:text-white -mt-0.5">
                      پیش‌نمایش ردیف‌ها
                    </h2>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                      {preview.invalidRows > 0
                        ? "⚠️ وجود خطای قرمز، ثبت گروهی را مسدود می‌کند"
                        : "✓ همه ردیف‌ها آماده ثبت هستند"}
                    </p>
                  </div>
                </div>

                <button
                  disabled={preview.invalidRows > 0 || importing}
                  onClick={() => void handleImport()}
                  className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl hover:shadow-[var(--griffin-gold)]/60 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {importing ? (
                      <>
                        <LoaderCircle size={16} className="animate-spin" />
                        در حال ثبت...
                      </>
                    ) : (
                      <>
                        <Import size={16} />
                        ثبت سؤال‌های معتبر
                      </>
                    )}
                  </span>
                  {!importing && preview.invalidRows === 0 && (
                    <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  )}
                </button>
              </div>

              <div className="max-h-[620px] overflow-y-auto divide-y divide-gray-100 dark:divide-white/5">
                {preview.rows.map((row) => {
                  const rowErrors = row.errors ?? [];
                  const rowWarnings = row.warnings ?? [];
                  const hasErrors = rowErrors.length > 0;
                  const hasWarnings = rowWarnings.length > 0;
                  const isInvalid = !row.valid;

                  return (
                    <div
                      key={row.rowNumber}
                      className={`
                        relative p-5 transition-colors
                        ${
                          isInvalid
                            ? "bg-rose-500/[0.03] hover:bg-rose-500/[0.06]"
                            : hasWarnings
                              ? "bg-amber-500/[0.03] hover:bg-amber-500/[0.06]"
                              : "hover:bg-gray-50/70 dark:hover:bg-white/[0.02]"
                        }
                      `}
                    >
                      {/* نوار رنگی سمت راست */}
                      <div
                        className={`
                          absolute top-0 right-0 bottom-0 w-1
                          ${
                            isInvalid
                              ? "bg-gradient-to-b from-transparent via-rose-500 to-transparent"
                              : hasWarnings
                                ? "bg-gradient-to-b from-transparent via-amber-500 to-transparent"
                                : "bg-gradient-to-b from-transparent via-emerald-500 to-transparent"
                          }
                        `}
                      />

                      <div className="flex items-start gap-4">
                        {/* آیکون وضعیت */}
                        <div className="relative shrink-0">
                          <div
                            className={`
                              absolute inset-0 rounded-2xl blur-md opacity-60
                              ${
                                isInvalid
                                  ? "bg-                                  rose-500"
                                  : hasWarnings
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                              }
                            `}
                          />
                          <div
                            className={`
                              relative w-11 h-11 rounded-2xl
                              flex items-center justify-center text-white shadow-lg
                              ${
                                isInvalid
                                  ? "bg-gradient-to-br from-rose-500 to-rose-700"
                                  : hasWarnings
                                    ? "bg-gradient-to-br from-amber-500 to-amber-700"
                                    : "bg-gradient-to-br from-emerald-500 to-emerald-700"
                              }
                            `}
                          >
                            {isInvalid ? (
                              <XCircle size={20} strokeWidth={2.3} />
                            ) : hasWarnings ? (
                              <AlertTriangle size={20} strokeWidth={2.3} />
                            ) : (
                              <CheckCircle2 size={20} strokeWidth={2.3} />
                            )}
                          </div>
                        </div>

                        {/* محتوا */}
                        <div className="min-w-0 flex-1">
                          {/* هدر */}
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span
                              className={`
                                inline-flex items-center gap-1 px-2.5 py-1 rounded-lg
                                text-[10px] font-black
                                ${
                                  isInvalid
                                    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                    : hasWarnings
                                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                }
                              `}
                            >
                              ردیف {row.rowNumber.toLocaleString("fa-IR")}
                            </span>

                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 dark:bg-white/5 font-english text-[10px] font-black text-gray-600 dark:text-gray-300">
                              {row.data.code || "بدون کد"}
                            </span>

                            <span className="text-xs font-black text-gray-700 dark:text-gray-300">
                              {row.data.lesson || "درس نامشخص"} ·{" "}
                              {row.data.chapter || "فصل نامشخص"}
                            </span>
                          </div>

                          {/* متن سؤال */}
                          <p className="line-clamp-2 text-sm font-bold text-gray-900 dark:text-white leading-6">
                            {row.data.questionText || "متن سؤال خالی است."}
                          </p>

                          {/* اطلاعات جزئی */}
                          <div className="mt-3 flex flex-wrap gap-2 text-[10px]">
                            {[
                              {
                                label: "پایه",
                                value: row.data.grade || "—",
                              },
                              {
                                label: "رشته",
                                value: row.data.major || "—",
                              },
                              {
                                label: "گزینه صحیح",
                                value:
                                  row.data.correctAnswer === null
                                    ? "—"
                                    : String.fromCharCode(
                                        65 + row.data.correctAnswer,
                                      ),
                              },
                              {
                                label: "سطح",
                                value: row.data.difficulty || "—",
                              },
                            ].map((info, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 font-bold"
                              >
                                <span className="text-gray-400 dark:text-gray-500">
                                  {info.label}:
                                </span>
                                <span className="font-black text-gray-900 dark:text-white">
                                  {info.value}
                                </span>
                              </span>
                            ))}
                          </div>

                          {/* خطاها */}
                          {hasErrors &&
                            rowErrors.map((message, i) => (
                              <div
                                key={i}
                                className="mt-2 flex gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-2.5 text-[11px] font-bold text-rose-600 dark:text-rose-400"
                              >
                                <XCircle
                                  size={13}
                                  className="mt-0.5 shrink-0"
                                  strokeWidth={2.5}
                                />
                                <span className="leading-5">{message}</span>
                              </div>
                            ))}

                          {/* هشدارها */}
                          {hasWarnings &&
                            rowWarnings.map((message, i) => (
                              <div
                                key={i}
                                className="mt-2 flex gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 p-2.5 text-[11px] font-bold text-amber-600 dark:text-amber-400"
                              >
                                <AlertTriangle
                                  size={13}
                                  className="mt-0.5 shrink-0"
                                  strokeWidth={2.5}
                                />
                                <span className="leading-5">{message}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default QuestionImport;
