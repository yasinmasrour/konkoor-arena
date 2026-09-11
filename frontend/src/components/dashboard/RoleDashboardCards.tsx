import {
  BookOpen,
  ClipboardList,
  FileCheck2,
  FileQuestion,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const RoleDashboardCards = () => {
  const { user } = useAuth();
  const role = user?.role?.name;
  const cards =
    role === "ADMIN"
      ? [
          [
            "مدیریت سؤال‌ها",
            "بانک سؤال، طراحی، تحلیل و بررسی سؤال‌ها",
            "/question-bank",
            FileQuestion,
          ],
          [
            "مدیریت آزمون‌ها",
            "ساخت و مدیریت دفترچه و آزمون",
            "/exam-builder",
            ClipboardList,
          ],
          [
            "بررسی سؤال‌ها",
            "مدیریت فرایند بررسی و انتشار",
            "/question-review",
            FileCheck2,
          ],
          [
            "مدیریت سیستم",
            "دسترسی‌های مدیریتی و نظارت کلی",
            "/dashboard",
            ShieldCheck,
          ],
        ]
      : role === "QUESTION_DESIGNER"
        ? [
            [
              "بانک سؤال",
              "مشاهده و مدیریت سؤال‌های خود",
              "/question-bank",
              FileQuestion,
            ],
            [
              "طراحی سؤال",
              "ساخت سؤال جدید و ویرایش سؤال‌ها",
              "/question-designer",
              FileCheck2,
            ],
            [
              "تحلیل سؤال‌ها",
              "بررسی آمار و کیفیت سؤال‌ها",
              "/question-analytics",
              ClipboardList,
            ],
          ]
        : role === "COUNSELOR"
          ? [
              [
                "دفترچه‌ها",
                "ساخت و مدیریت دفترچه آزمون",
                "/booklets",
                BookOpen,
              ],
              [
                "آزمون‌ها",
                "ساخت و مدیریت آزمون‌ها",
                "/exam-builder",
                ClipboardList,
              ],
            ]
          : [];
  if (!cards.length) return null;
  return (
    <section>
      <h2 className="mb-4 text-xl font-bold">ابزارهای نقش شما</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map(([title, desc, path, Icon]) => (
          <Link
            key={String(path)}
            to={String(path)}
            className="rounded-2xl border border-slate-200/70 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-[#111722]"
          >
            <Icon size={22} className="mb-3 text-[var(--griffin-gold)]" />
            <h3 className="font-semibold">{String(title)}</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {String(desc)}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
};
export default RoleDashboardCards;
