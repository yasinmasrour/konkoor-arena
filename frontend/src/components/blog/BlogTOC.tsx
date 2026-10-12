import { useState } from "react";
import { ChevronDown, List } from "lucide-react";
import { useScrollSpy } from "../../hooks/useScrollSpy";
import type { TocHeading } from "../../api/blogApi";

interface BlogTOCProps {
  headings: TocHeading[];
}

const BlogTOC = ({ headings }: BlogTOCProps) => {
  const [expanded, setExpanded] = useState(true);
  const activeId = useScrollSpy(
    headings.map((h) => h.id),
    120,
  );

  if (headings.length === 0) return null;

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    const offset = 100;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <nav className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-200/70 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2">
          <List size={14} className="text-[var(--griffin-gold)]" />
          <span className="font-heading text-xs font-black text-gray-900 dark:text-white">
            فهرست مطالب
          </span>
        </div>
        <ChevronDown
          size={14}
          className={`text-gray-400 transition-transform ${
            expanded ? "" : "-rotate-90"
          }`}
        />
      </button>

      {expanded && (
        <div className="p-3 max-h-[60vh] overflow-y-auto dashboard-scroll">
          <ul className="space-y-0.5">
            {headings.map((heading) => {
              const isActive = activeId === heading.id;
              const paddingRight = (heading.level - 1) * 12;

              return (
                <li key={heading.id}>
                  <button
                    type="button"
                    onClick={() => handleClick(heading.id)}
                    style={{ paddingRight: `${paddingRight + 12}px` }}
                    className={`
                      relative w-full text-right py-1.5 pr-3 rounded-lg
                      text-[11px] font-bold transition-all
                      ${
                        isActive
                          ? "text-[var(--griffin-gold)] bg-[var(--griffin-gold)]/10"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                      }
                    `}
                  >
                    {isActive && (
                      <span className="absolute right-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-[var(--griffin-gold)] shadow-[0_0_8px_var(--griffin-gold)]" />
                    )}
                    <span className="line-clamp-1 leading-5">
                      {heading.text}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default BlogTOC;
