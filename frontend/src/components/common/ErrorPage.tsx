import { Link, useRouteError, isRouteErrorResponse } from "react-router-dom";

const ErrorPage = () => {
  const error = useRouteError();
  const status = isRouteErrorResponse(error) ? error.status : 500;
  const title = status === 404 ? "صفحه پیدا نشد" : "خطایی رخ داد";
  const message = status === 404
    ? "صفحه‌ای که دنبال آن هستید وجود ندارد یا جابه‌جا شده است."
    : "در پردازش این صفحه مشکلی پیش آمد. لطفاً دوباره تلاش کنید.";

  return (
    <main className="min-h-[70vh] grid place-items-center px-6 py-16">
      <section className="w-full max-w-lg rounded-3xl border border-slate-200/70 bg-white/80 p-8 text-center shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
        <p className="mb-3 text-sm font-semibold tracking-widest text-[var(--griffin-gold)]">{status}</p>
        <h1 className="mb-3 text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
        <p className="mb-7 text-sm leading-7 text-slate-500 dark:text-slate-400">{message}</p>
        <div className="flex justify-center gap-3">
          <Link to="/" className="rounded-xl bg-[var(--griffin-gold)] px-5 py-2.5 text-sm font-semibold text-white">خانه</Link>
          <button type="button" onClick={() => window.location.reload()} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:border-white/10 dark:text-slate-200">تلاش مجدد</button>
        </div>
      </section>
    </main>
  );
};

export default ErrorPage;
