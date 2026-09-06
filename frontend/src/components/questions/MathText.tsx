import { Fragment } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

type MathTextProps = {
  content: string;
  className?: string;
};

type Token =
  | { type: "text"; value: string }
  | { type: "math"; value: string; display: boolean };

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

    if (displayStart !== -1 && (inlineStart === -1 || displayStart <= inlineStart)) {
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
      tokens.push({ type: "math", value, display });
    }

    cursor = end + delimiterLength;
  }

  return tokens;
};

const renderMath = (value: string, display: boolean) => {
  try {
    return katex.renderToString(value, {
      displayMode: display,
      throwOnError: false,
      strict: "warn",
    });
  } catch {
    return `<span class="text-red-500">${value}</span>`;
  }
};

const MathText = ({ content, className = "" }: MathTextProps) => {
  const tokens = tokenizeMathText(content);

  return (
    <span className={className} dir="auto">
      {tokens.map((token, index) => {
        if (token.type === "text") {
          return <Fragment key={index}>{token.value}</Fragment>;
        }

        return (
          <span
            key={index}
            className={token.display ? "my-3 block overflow-x-auto text-center" : "mx-0.5 inline-block align-middle"}
            dir="ltr"
            dangerouslySetInnerHTML={{ __html: renderMath(token.value, token.display) }}
          />
        );
      })}
    </span>
  );
};

export default MathText;
