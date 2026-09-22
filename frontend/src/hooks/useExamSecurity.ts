import { useEffect } from "react";

interface UseExamSecurityOptions {
  enabled?: boolean;
}

/**
 * هوک امنیتی برای جلوگیری از کپی متن سوالات
 * - غیرفعال کردن Ctrl+C / Ctrl+A / Ctrl+X / Ctrl+U / Ctrl+S / Ctrl+P
 * - غیرفعال کردن Ctrl+Shift+I / J / C (DevTools)
 * - غیرفعال کردن F12
 * - غیرفعال کردن راست‌کلیک
 * - جلوگیری از Drag
 *
 * نکته: توی input/textarea اجازه میده (تا کاربر بتونه تایپ کنه)
 */
export const useExamSecurity = ({
  enabled = true,
}: UseExamSecurityOptions = {}) => {
  useEffect(() => {
    if (!enabled) return;

    // 🔹 جلوگیری از کیبورد شورتکات‌ها
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;

      // توی input/textarea اجازه بده
      const isEditable =
        target &&
        (["INPUT", "TEXTAREA"].includes(target.tagName) ||
          target.isContentEditable);
      if (isEditable) return;

      const isCtrl = e.ctrlKey || e.metaKey;

      // 🔹 Ctrl+C / Ctrl+A / Ctrl+X / Ctrl+U / Ctrl+S / Ctrl+P
      if (isCtrl && !e.shiftKey && !e.altKey) {
        const key = e.key.toLowerCase();
        if (["c", "a", "x", "u", "s", "p"].includes(key)) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }

      // 🔹 Ctrl+Shift+I / J / C (DevTools)
      if (isCtrl && e.shiftKey) {
        const key = e.key.toLowerCase();
        if (["i", "j", "c"].includes(key)) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }

      // 🔹 F12
      if (e.key === "F12") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // 🔹 جلوگیری از راست‌کلیک
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // 🔹 جلوگیری از کپی
    const handleCopy = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      const isEditable =
        target &&
        (["INPUT", "TEXTAREA"].includes(target.tagName) ||
          target.isContentEditable);
      if (isEditable) return;
      e.preventDefault();
      return false;
    };

    // 🔹 جلوگیری از کات
    const handleCut = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      const isEditable =
        target &&
        (["INPUT", "TEXTAREA"].includes(target.tagName) ||
          target.isContentEditable);
      if (isEditable) return;
      e.preventDefault();
      return false;
    };

    // 🔹 جلوگیری از Drag
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      const isEditable =
        target &&
        (["INPUT", "TEXTAREA"].includes(target.tagName) ||
          target.isContentEditable);
      if (isEditable) return;
      e.preventDefault();
      return false;
    };

    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("contextmenu", handleContextMenu, true);
    document.addEventListener("copy", handleCopy, true);
    document.addEventListener("cut", handleCut, true);
    document.addEventListener("dragstart", handleDragStart, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("contextmenu", handleContextMenu, true);
      document.removeEventListener("copy", handleCopy, true);
      document.removeEventListener("cut", handleCut, true);
      document.removeEventListener("dragstart", handleDragStart, true);
    };
  }, [enabled]);
};