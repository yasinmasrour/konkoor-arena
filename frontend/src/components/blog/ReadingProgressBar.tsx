import { useReadingProgress } from "../../hooks/useReadingProgress";

const ReadingProgressBar = () => {
  const progress = useReadingProgress();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent pointer-events-none">
      <div
        className="h-full bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 shadow-[0_0_10px_var(--griffin-gold)] transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ReadingProgressBar;