import { Fragment, useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

type MathTextProps = {
  content: string;
  className?: string;
};

type Token =
  | { type: "text"; value: string }
  | { type: "math"; value: string; display: boolean; raw: string };

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
        raw: content.slice(start, end + delimiterLength),
      });
    }

    cursor = end + delimiterLength;
  }

  return tokens;
};

// ==================== Renderer ====================
const renderMath = (value: string, display: boolean): string => {
  try {
    return katex.renderToString(value, {
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
    return `<span class="text-rose-500 font-english">${value}</span>`;
  }
};

// ==================== Component ====================
const MathText = ({ content, className = "" }: MathTextProps) => {
  const tokens = useMemo(() => tokenizeMathText(content), [content]);

  return (
    <span className={`math-text ${className}`} dir="auto">
      {tokens.map((token, index) => {
        // متن عادی
        if (token.type === "text") {
          return <Fragment key={index}>{token.value}</Fragment>;
        }

        // فرمول درون‌خطی
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
                transition-colors duration-200
                hover:bg-[var(--griffin-gold)]/10
                hover:border-[var(--griffin-gold)]/30
              "
              dir="ltr"
              dangerouslySetInnerHTML={{
                __html: renderMath(token.value, false),
              }}
            />
          );
        }

        // فرمول بلوکی (display)
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
            {/* خط طلایی بالا */}
            <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/40 to-transparent" />

            {/* هاله تزئینی */}
            <span className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-[var(--griffin-gold)]/10 blur-3xl pointer-events-none" />

            <span
              className="relative"
              dangerouslySetInnerHTML={{
                __html: renderMath(token.value, true),
              }}
            />

            {/* خط طلایی پایین */}
            <span className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/40 to-transparent" />
          </span>
        );
      })}
    </span>
  );
};

export default MathText;
