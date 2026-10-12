import { useState } from "react";
import {
  Check,
  Copy,
  MessageCircle,
  Send,
  Share2,
} from "lucide-react";

interface ShareButtonsProps {
  title: string;
  url?: string;
}

const ShareButtons = ({ title, url }: ShareButtonsProps) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || window.location.href;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
      } catch {
        // user cancelled
      }
    } else {
      void handleCopy();
    }
  };

  const shareOptions = [
    {
      name: "تلگرام",
      icon: Send,
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      color: "hover:bg-sky-500/10 hover:text-sky-500 hover:border-sky-500/40",
    },
    {
      name: "واتساپ",
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      color:
        "hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/40",
    },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
        <Share2 size={11} />
        اشتراک‌گذاری:
      </span>

      {shareOptions.map((option) => {
        const Icon = option.icon;
        return (
          <a
            key={option.name}
            href={option.href}
            target="_blank"
            rel="noopener noreferrer"
            title={option.name}
            className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-gray-600 dark:text-gray-400 transition-all ${option.color}`}
          >
            <Icon size={13} />
          </a>
        );
      })}

      <button
        type="button"
        onClick={handleCopy}
        title={copied ? "کپی شد!" : "کپی لینک"}
        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-all ${
          copied
            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-500"
            : "border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-[var(--griffin-gold)]/10 hover:text-[var(--griffin-gold)] hover:border-[var(--griffin-gold)]/40"
        }`}
      >
        {copied ? <Check size={13} /> : <Copy size={13} />}
      </button>

      {typeof navigator !== "undefined" && "share" in navigator && (
        <button
          type="button"
          onClick={handleNativeShare}
          title="اشتراک‌گذاری"
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-[var(--griffin-gold)]/10 hover:text-[var(--griffin-gold)] hover:border-[var(--griffin-gold)]/40 transition-all sm:hidden"
        >
          <Share2 size={13} />
        </button>
      )}
    </div>
  );
};

export default ShareButtons;