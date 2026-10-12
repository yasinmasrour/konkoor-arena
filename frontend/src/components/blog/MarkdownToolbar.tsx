/* eslint-disable react-hooks/refs */
import {
  Bold,
  Code,
  Code2,
  Heading1,
  Heading2,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Quote,
  Table,
} from "lucide-react";

interface MarkdownToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (value: string) => void;
  onImageClick: () => void; // 🆕
}

const MarkdownToolbar = ({
  textareaRef,
  value,
  onChange,
  onImageClick,
}: MarkdownToolbarProps) => {
  const applyFormat = (before: string, after: string, placeholder = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end);
    const text = selected || placeholder;

    const newValue =
      value.slice(0, start) + before + text + after + value.slice(end);

    onChange(newValue);

    requestAnimationFrame(() => {
      textarea.focus();
      const newCursor = start + before.length + text.length;
      textarea.setSelectionRange(newCursor, newCursor);
    });
  };

  const insertBlock = (block: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const prefix = start > 0 && value[start - 1] !== "\n" ? "\n\n" : "";
    const suffix = start < value.length && value[start] !== "\n" ? "\n\n" : "";

    const newValue =
      value.slice(0, start) +
      prefix +
      block +
      suffix +
      value.slice(start);

    onChange(newValue);

    requestAnimationFrame(() => {
      textarea.focus();
      const newCursor = start + prefix.length + block.length;
      textarea.setSelectionRange(newCursor, newCursor);
    });
  };

  const buttons = [
    { icon: Bold, title: "بولد", action: () => applyFormat("**", "**", "متن بولد") },
    { icon: Italic, title: "ایتالیک", action: () => applyFormat("*", "*", "متن ایتالیک") },
    { icon: Heading1, title: "هدینگ ۱", action: () => applyFormat("# ", "", "هدینگ") },
    { icon: Heading2, title: "هدینگ ۲", action: () => applyFormat("## ", "", "هدینگ") },
    { icon: Quote, title: "نقل قول", action: () => applyFormat("> ", "", "نقل قول") },
    { icon: List, title: "لیست", action: () => applyFormat("- ", "", "آیتم") },
    { icon: ListOrdered, title: "لیست شماره‌دار", action: () => applyFormat("1. ", "", "آیتم") },
    { icon: LinkIcon, title: "لینک", action: () => applyFormat("[", "](https://)", "متن لینک") },
    { icon: Code, title: "کد", action: () => applyFormat("`", "`", "کد") },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02] rounded-t-xl">
      {buttons.map((btn, i) => {
        const Icon = btn.icon;
        return (
          <button
            key={i}
            type="button"
            onClick={btn.action}
            title={btn.title}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-[var(--griffin-gold)]/10 hover:text-[var(--griffin-gold)] transition-all"
          >
            <Icon size={14} />
          </button>
        );
      })}

      {/* 🆕 Image button (uploader) */}
      <button
        type="button"
        onClick={onImageClick}
        title="افزودن تصویر"
        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-[var(--griffin-gold)]/10 hover:text-[var(--griffin-gold)] transition-all"
      >
        <ImageIcon size={14} />
      </button>

      <div className="w-px h-5 bg-gray-300 dark:bg-white/10 mx-1" />

      <button
        type="button"
        onClick={() => insertBlock("```\nکد اینجا\n```")}
        title="بلوک کد"
        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-[var(--griffin-gold)]/10 hover:text-[var(--griffin-gold)] transition-all"
      >
        <Code2 size={14} strokeWidth={2.5} />
      </button>

      <button
        type="button"
        onClick={() =>
          insertBlock("| ستون ۱ | ستون ۲ |\n|---------|---------|\n| مقدار ۱ | مقدار ۲ |")
        }
        title="جدول"
        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-[var(--griffin-gold)]/10 hover:text-[var(--griffin-gold)] transition-all"
      >
        <Table size={14} />
      </button>

      <button
        type="button"
        onClick={() => insertBlock("---")}
        title="خط جداکننده"
        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-[var(--griffin-gold)]/10 hover:text-[var(--griffin-gold)] transition-all"
      >
        <Minus size={14} />
      </button>
    </div>
  );
};

export default MarkdownToolbar;