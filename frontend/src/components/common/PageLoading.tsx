const PageLoading = () => (
  <main className="min-h-[50vh] grid place-items-center px-6" role="status" aria-live="polite">
    <div className="text-center">
      <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-[var(--griffin-gold)]" />
      <p className="text-sm text-slate-500 dark:text-slate-400">در حال بارگذاری...</p>
    </div>
  </main>
);

export default PageLoading;
