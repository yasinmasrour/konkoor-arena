import { useEffect, useRef } from "react";

interface DraftData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  seoTitle: string;
  seoDescription: string;
  coverImageAlt: string;
  category: string;
  tags: string[];
  savedAt: string;
}

export const useAutoSave = (
  key: string | null,
  data: DraftData | null,
  enabled = true,
) => {
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || !key || !data) return;

    if (timerRef.current) window.clearTimeout(timerRef.current);

    timerRef.current = window.setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (err) {
        console.error("Failed to autosave:", err);
      }
    }, 2000);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [key, data, enabled]);
};

export const loadDraft = (key: string): DraftData | null => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as DraftData;
  } catch {
    return null;
  }
};

export const clearDraft = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
};
