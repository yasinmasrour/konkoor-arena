import { useEffect, useState } from "react";
import { BookOpen, FileQuestion, ClipboardList, RefreshCw, ShieldCheck, Plus, List } from "lucide-react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

type CountState = { exams: number; booklets: number; questions: number };

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [counts, setCounts] = useState<CountState>({ exams: 0, booklets: 0, questions: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const [exams, booklets, questions] = await Promise.all([
        api.get("/exams", { params: { page: 1, limit: 1 } }),
        api.get("/booklets", { params: { page: 1, limit: 1 } }),
        api.get("/questions", { params: { page: 1, limit: 1 } }),
      ]);
      setCounts({ exams: exams.data.pagination?.total ?? 0, booklets: booklets.data.pagination?.total ?? 0, questions: questions.data.pagination?.total ?? 0 });
    } catch {
      setError("دریافت اطلاعات پنل مدیریت انجام نشد.");
    } finally { setLoading(false); }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, []);

  const cards = [
    { label: "آزمون‌ها", value: counts.exams, icon: ClipboardList },
    { label: "دفترچه‌ها", value: counts.booklets, icon: BookOpen },
    { label: "سؤال‌ها", value: counts.questions, icon: FileQuestion },
  ];

  return <main className="min-h-screen px-6 py-10">
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><p className="text-sm text-gray-500 dark:text-gray-400">Griffin Academy</p><h1 className="text-3xl font-bold">پنل مدیریت</h1></div>
        <button onClick={() => void load()} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200/70 bg-white dark:bg-[#111722] hover:opacity-80"><RefreshCw size={17} /> بروزرسانی</button>
      </div>
      {error && <div className="rounded-xl border border-red-300 bg-red-50 dark:bg-red-950/20 p-4 text-red-700 dark:text-red-300">{error}</div>}
      <div className="grid md:grid-cols-3 gap-5">
        {cards.map(({ label, value, icon: Icon }) => <div key={label} className="rounded-2xl border border-slate-200/70 bg-white dark:bg-[#111722] p-6"><Icon className="mb-4" size={24} /><p className="text-sm text-gray-500">{label}</p><p className="text-3xl font-bold mt-1">{loading ? "—" : value}</p></div>)}
      </div>
      <div className="rounded-2xl border border-slate-200/70 bg-white dark:bg-[#111722] p-6 flex flex-col gap-5"><div className="flex gap-4 items-start"><ShieldCheck size={24} /><div><h2 className="font-semibold">دسترسی مدیریت</h2><p className="text-sm text-gray-500 mt-1">این بخش فقط برای نقش‌های مجاز در نظر گرفته شده و عملیات حساس همچنان توسط مجوزهای Backend کنترل می‌شود.</p></div></div><div className="flex flex-wrap gap-3"><button onClick={() => navigate("/question-bank")} className="inline-flex items-center gap-2 rounded-xl border border-slate-200/70 px-4 py-2.5 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5"><List size={17}/> بانک سؤال</button><button onClick={() => navigate("/question-designer")} className="inline-flex items-center gap-2 rounded-xl bg-[var(--griffin-gold)] px-4 py-2.5 font-semibold text-white hover:opacity-90"><Plus size={17}/> طراحی سؤال</button></div></div>
    </div>
  </main>;
};
export default AdminDashboard;
