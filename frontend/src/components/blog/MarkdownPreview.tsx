import ReactMarkdown from "react-markdown";

interface MarkdownPreviewProps {
  content: string;
}

const MarkdownPreview = ({ content }: MarkdownPreviewProps) => {
  if (!content.trim()) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-center p-8">
        <div>
          <p className="text-sm font-black text-gray-400 dark:text-gray-600">
            پیش‌نمایش
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
            شروع به نوشتن کن تا پیش‌نمایش ببینی
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-content" dir="rtl">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};

export default MarkdownPreview;