import { Fragment, useMemo, memo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

type MathTextProps = {
  content: string;
  className?: string;
};

type Token =
  | { type: "text"; value: string }
  | { type: "math"; value: string; display: boolean; html: string };

// ==================== 🆕 Global Cache ====================
// کلید: `${display}:${value}` → مقدار: HTML رندرشده
// این کش تا آخر عمر صفحه میمونه، پس هر فرمول فقط یک بار KaTeX میخوره
const KATEX_CACHE = new Map<string, string>();
const MAX_CACHE_SIZE = 500;

const renderMath = (value: string, display: boolean): string => {
  const cacheKey = `${display ? "D" : "I"}:${value}`;

  // چک کش
  const cached = KATEX_CACHE.get(cacheKey);
  if (cached !== undefined) return cached;

  let html: string;
  try {
    html = katex.renderToString(value, {
      displayMode: display,
      throwOnError: false,
      strict: "warn",
      output: "html",
      trust: false,
      macros: {
        "\\RR": "\\mathbb{R}",
        "\\NN": "\\mathbb{N}",
        "\\ZZ": "\\mathbb{Z}",
        "\\QQ": "\\mathbb{Q}",
        "\\CC": "\\mathbb{C}",
      },
    });
  } catch {
    html = `<span class="text-rose-500 font-english">${value}</span>`;
  }

  // محدودیت کش (اگه خیلی بزرگ شد، قدیمی‌ترین رو پاک کن)
  if (KATEX_CACHE.size >= MAX_CACHE_SIZE) {
    const firstKey = KATEX_CACHE.keys().next().value;
    if (firstKey !== undefined) KATEX_CACHE.delete(firstKey);
  }
  KATEX_CACHE.set(cacheKey, html);

  return html;
};

// ==================== Tokenizer ====================
const tokenizeMathText = (content: string): Token[] => {
  const tokens: Token[] = [];
  let cursor = 0;

  const pushText = (value: string) => {
    if (value) tokens.push({ type: "text", value });
  };

  while (cursor < content.length) {
    const displayStart = content.indexOf("$$", cursor);
    const inlineStart = content.indexOf("$", cursor);

    if (displayStart === -1 && inlineStart === -1) {
      pushText(content.slice(cursor));
      break;
    }

    let start = inlineStart;
    let display = false;

    if (
      displayStart !== -1 &&
      (inlineStart === -1 || displayStart <= inlineStart)
    ) {
      start = displayStart;
      display = true;
    }

    pushText(content.slice(cursor, start));

    const delimiterLength = display ? 2 : 1;
    const end = content.indexOf(display ? "$$" : "$", start + delimiterLength);

    if (end === -1) {
      pushText(content.slice(start));
      break;
    }

    const value = content.slice(start + delimiterLength, end).trim();
    if (!value) {
      pushText(content.slice(start, end + delimiterLength));
    } else {
      tokens.push({
        type: "math",
        value,
        display,
        html: renderMath(value, display),
      });
    }

    cursor = end + delimiterLength;
  }

  return tokens;
};

// ==================== Component ====================
const MathText = ({ content, className = "" }: MathTextProps) => {
  const tokens = useMemo(() => tokenizeMathText(content), [content]);

  return (
    <span
      className={`math-text whitespace-pre-wrap break-words ${className}`}
      dir="auto"
    >
      {tokens.map((token, index) => {
        if (token.type === "text") {
          return <Fragment key={index}>{token.value}</Fragment>;
        }

        if (!token.display) {
          return (
            <span
              key={index}
              className="
                math-inline
                inline-block align-middle
                mx-1
                px-1.5 py-0.5
                rounded-md
                bg-[var(--griffin-gold)]/5
                border border-[var(--griffin-gold)]/15
              "
              dir="ltr"
              dangerouslySetInnerHTML={{ __html: token.html }}
            />
          );
        }

        return (
          <span
            key={index}
            className="
              math-block
              my-4
              flex items-center justify-center
              overflow-x-auto
              rounded-2xl
              bg-gradient-to-br from-[var(--griffin-gold)]/5 via-transparent to-purple-600/5
              border border-[var(--griffin-gold)]/15
              px-5 py-5
              relative
            "
            dir="ltr"
          >
            <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/40 to-transparent" />
            <span
              className="relative"
              dangerouslySetInnerHTML={{ __html: token.html }}
            />
            <span className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/40 to-transparent" />
          </span>
        );
      })}
    </span>
  );
};

export default memo(MathText, (prev, next) => {
  return prev.content === next.content && prev.className === next.className;
});