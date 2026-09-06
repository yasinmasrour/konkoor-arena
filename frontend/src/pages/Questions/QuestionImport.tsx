import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Import,
  RefreshCw,
  Upload,
  XCircle,
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

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-[#080B12] sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              onClick={() => navigate("/question-bank")}
              className="mb-2 text-sm text-gray-500 hover:text-[var(--griffin-gold)]"
            >
              ← بازگشت به بانک سؤال
            </button>
            <h1 className="text-3xl font-bold">ورود گروهی سؤال‌ها</h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Excel یا CSV را ابتدا بررسی کنید؛ تا قبل از تأیید شما هیچ داده‌ای
              در پایگاه‌داده ثبت نمی‌شود.
            </p>
          </div>
          <button
            onClick={downloadQuestionImportTemplate}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200/70 bg-white px-4 py-2.5 hover:bg-gray-50 dark:border-white/10 dark:bg-[#111722] dark:hover:bg-white/5"
          >
            <Download size={17} /> دانلود قالب CSV
          </button>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            ["۱", "آپلود", "CSV، XLSX یا XLS"],
            ["۲", "بررسی", "خطاها و هشدارها"],
            ["۳", "ثبت", "همه سؤال‌ها به‌صورت Draft"],
          ].map(([number, title, text]) => (
            <div
              key={number}
              className="rounded-2xl border border-slate-200/70 bg-white p-5 dark:border-white/10 dark:bg-[#111722]"
            >
              <div className="mb-3 grid h-9 w-9 place-items-center rounded-full bg-[var(--griffin-gold)] font-bold text-white">
                {number}
              </div>
              <div className="font-semibold">{title}</div>
              <div className="mt-1 text-sm text-gray-500">{text}</div>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111722]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <label className="flex min-h-28 flex-1 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 px-5 text-center hover:border-[var(--griffin-gold)] dark:border-white/10">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              />
              <div>
                <FileSpreadsheet className="mx-auto mb-2" size={28} />
                <div className="font-medium">
                  {file ? file.name : "فایل سؤال‌ها را انتخاب کنید"}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  حداکثر ۵ مگابایت · حداکثر ۵۰۰ سؤال
                </div>
              </div>
            </label>
            <button
              disabled={!file || loading}
              onClick={() => void handlePreview()}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[var(--griffin-gold)] px-6 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="animate-spin" size={17} />
              ) : (
                <Upload size={17} />
              )}
              {loading ? "در حال بررسی..." : "پیش‌نمایش و اعتبارسنجی"}
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-300">
              {success}
            </div>
          )}
        </section>

        {preview && (
          <section className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-slate-200/70 bg-white p-4 dark:border-white/10 dark:bg-[#111722]">
                <div className="text-xs text-gray-500">کل ردیف‌ها</div>
                <div className="mt-1 text-2xl font-bold">
                  {preview.totalRows}
                </div>
              </div>
              <div className="rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-500/20 dark:bg-green-500/10">
                <div className="text-xs text-green-700 dark:text-green-300">
                  معتبر
                </div>
                <div className="mt-1 text-2xl font-bold">
                  {preview.validRows}
                </div>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
                <div className="text-xs text-amber-700 dark:text-amber-300">
                  هشدار
                </div>
                <div className="mt-1 text-2xl font-bold">
                  {preview.warningRows}
                </div>
              </div>
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-500/10">
                <div className="text-xs text-red-700 dark:text-red-300">
                  خطا
                </div>
                <div className="mt-1 text-2xl font-bold">
                  {preview.invalidRows}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-white shadow-sm dark:border-white/10 dark:bg-[#111722]">
              <div className="flex flex-col gap-3 border-b border-slate-200/70 p-5 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold">پیش‌نمایش ردیف‌ها</h2>
                  <p className="mt-1 text-xs text-gray-500">
                    در صورت وجود حتی یک خطای قرمز، ثبت گروهی مسدود است.
                  </p>
                </div>
                <button
                  disabled={preview.invalidRows > 0 || importing}
                  onClick={() => void handleImport()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--griffin-gold)] px-5 py-2.5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Import size={17} />{" "}
                  {importing ? "در حال ثبت..." : "ثبت سؤال‌های معتبر"}
                </button>
              </div>
              <div className="max-h-[620px] overflow-auto">
                {preview.rows.map((row) => (
                  <div
                    key={row.rowNumber}
                    className="border-b border-slate-200/70 p-5 last:border-0 dark:border-white/10"
                  >
                    <div className="flex items-start gap-3">
                      {row.valid ? (
                        <CheckCircle2
                          className="mt-0.5 shrink-0 text-green-600"
                          size={19}
                        />
                      ) : (
                        <XCircle
                          className="mt-0.5 shrink-0 text-red-600"
                          size={19}
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs text-gray-500">
                            ردیف {row.rowNumber}
                          </span>
                          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs dark:bg-white/10">
                            {row.data.code || "بدون کد"}
                          </span>
                          <span className="text-sm font-medium">
                            {row.data.lesson || "درس نامشخص"} ·{" "}
                            {row.data.chapter || "فصل نامشخص"}
                          </span>
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm text-gray-700 dark:text-gray-200">
                          {row.data.questionText || "متن سؤال خالی است."}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                          <span>پایه: {row.data.grade || "—"}</span>
                          <span>رشته: {row.data.major || "—"}</span>
                          <span>
                            گزینه صحیح:{" "}
                            {row.data.correctAnswer === null
                              ? "—"
                              : row.data.correctAnswer + 1}
                          </span>
                          <span>سطح: {row.data.difficulty}</span>
                        </div>
                        {row.errors.map((message) => (
                          <div
                            key={message}
                            className="mt-2 flex gap-2 rounded-lg bg-red-50 p-2 text-xs text-red-700 dark:bg-red-500/10 dark:text-red-300"
                          >
                            <XCircle size={14} className="mt-0.5 shrink-0" />
                            {message}
                          </div>
                        ))}
                        {row.warnings.map((message) => (
                          <div
                            key={message}
                            className="mt-2 flex gap-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
                          >
                            <AlertTriangle
                              size={14}
                              className="mt-0.5 shrink-0"
                            />
                            {message}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default QuestionImport;
