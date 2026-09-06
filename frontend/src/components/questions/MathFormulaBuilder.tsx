import { useMemo, useState } from "react";
import { Calculator, Check, X } from "lucide-react";
import MathText from "./MathText";

type BuilderProps = { onClose: () => void; onInsert: (formula: string) => void };
type BuilderType = "fraction" | "sqrt" | "power" | "subscript" | "log" | "integral" | "sum" | "matrix";

const templates: Array<{ id: BuilderType; label: string; preview: string }> = [
  { id: "fraction", label: "کسر", preview: "\\frac{a}{b}" },
  { id: "sqrt", label: "رادیکال", preview: "\\sqrt{x}" },
  { id: "power", label: "توان", preview: "x^{n}" },
  { id: "subscript", label: "اندیس", preview: "x_{n}" },
  { id: "log", label: "لگاریتم", preview: "\\log_{b}(x)" },
  { id: "integral", label: "انتگرال", preview: "\\int_{a}^{b} f(x)\\,dx" },
  { id: "sum", label: "سیگما", preview: "\\sum_{i=1}^{n} a_i" },
  { id: "matrix", label: "ماتریس ۲×۲", preview: "\\begin{pmatrix}a & b\\\\c & d\\end{pmatrix}" },
];

const field = "w-full rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--griffin-gold)] dark:border-white/10 dark:bg-white/[0.03]";

export default function MathFormulaBuilder({ onClose, onInsert }: BuilderProps) {
  const [type, setType] = useState<BuilderType>("fraction");
  const [a, setA] = useState("a");
  const [b, setB] = useState("b");
  const [base, setBase] = useState("b");
  const [argument, setArgument] = useState("x");
  const [lower, setLower] = useState("a");
  const [upper, setUpper] = useState("b");
  const [variable, setVariable] = useState("x");
  const [fn, setFn] = useState("f(x)");
  const [matrix, setMatrix] = useState(["a", "b", "c", "d"]);

  const formula = useMemo(() => {
    switch (type) {
      case "fraction": return `\\frac{${a}}{${b}}`;
      case "sqrt": return `\\sqrt{${a}}`;
      case "power": return `${a}^{${b}}`;
      case "subscript": return `${a}_{${b}}`;
      case "log": return `\\log_{${base}}(${argument})`;
      case "integral": return `\\int_{${lower}}^{${upper}} ${fn}\\,d${variable}`;
      case "sum": return `\\sum_{${lower}}^{${upper}} ${a}`;
      case "matrix": return `\\begin{pmatrix}${matrix[0]} & ${matrix[1]}\\\\${matrix[2]} & ${matrix[3]}\\end{pmatrix}`;
    }
  }, [type, a, b, base, argument, lower, upper, variable, fn, matrix]);

  const updateMatrix = (index: number, value: string) => setMatrix((current) => current.map((item, i) => i === index ? value : item));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200/70 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-[#111722]" onClick={(event) => event.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2"><Calculator size={19} /><div><h3 className="font-bold">ساخت فرمول</h3><p className="text-xs text-gray-500">مقادیر را وارد کنید؛ LaTeX به‌صورت خودکار ساخته می‌شود.</p></div></div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-white/10"><X size={18} /></button>
        </div>

        <div className="grid gap-2 sm:grid-cols-4">
          {templates.map((item) => (
            <button key={item.id} type="button" onClick={() => setType(item.id)} className={`rounded-xl border p-2 text-right transition ${type === item.id ? "border-[var(--griffin-gold)] bg-amber-50 dark:bg-amber-900/10" : "border-slate-200/70 hover:border-[var(--griffin-gold)]/50 dark:border-white/10"}`}>
              <div className="mb-1 text-xs font-semibold">{item.label}</div>
              <div dir="ltr" className="overflow-hidden text-center text-sm"><MathText content={`$${item.preview}$`} /></div>
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {type === "fraction" && <><label className="text-sm">صورت<input className={field} value={a} onChange={(e) => setA(e.target.value)} /></label><label className="text-sm">مخرج<input className={field} value={b} onChange={(e) => setB(e.target.value)} /></label></>}
          {type === "sqrt" && <label className="text-sm sm:col-span-2">عبارت داخل رادیکال<input className={field} value={a} onChange={(e) => setA(e.target.value)} /></label>}
          {(type === "power" || type === "subscript") && <><label className="text-sm">پایه<input className={field} value={a} onChange={(e) => setA(e.target.value)} /></label><label className="text-sm">{type === "power" ? "توان" : "اندیس"}<input className={field} value={b} onChange={(e) => setB(e.target.value)} /></label></>}
          {type === "log" && <><label className="text-sm">پایه<input className={field} value={base} onChange={(e) => setBase(e.target.value)} /></label><label className="text-sm">عبارت<input className={field} value={argument} onChange={(e) => setArgument(e.target.value)} /></label></>}
          {(type === "integral" || type === "sum") && <><label className="text-sm">کران پایین<input className={field} value={lower} onChange={(e) => setLower(e.target.value)} /></label><label className="text-sm">کران بالا<input className={field} value={upper} onChange={(e) => setUpper(e.target.value)} /></label>{type === "integral" ? <><label className="text-sm">تابع<input className={field} value={fn} onChange={(e) => setFn(e.target.value)} /></label><label className="text-sm">متغیر<input className={field} value={variable} onChange={(e) => setVariable(e.target.value)} /></label></> : <label className="text-sm sm:col-span-2">جمله مورد جمع<input className={field} value={a} onChange={(e) => setA(e.target.value)} /></label>}</>}
          {type === "matrix" && <div className="grid grid-cols-2 gap-2 sm:col-span-2">{matrix.map((item, index) => <input key={index} aria-label={`درایه ${index + 1}`} className={field} value={item} onChange={(e) => updateMatrix(index, e.target.value)} />)}</div>}
        </div>

        <div className="mt-5 rounded-xl border border-slate-200/70 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
          <p className="mb-2 text-xs text-gray-500">پیش‌نمایش</p>
          <div className="min-h-14 overflow-x-auto rounded-lg bg-white px-3 py-4 text-center dark:bg-white/[0.02]"><MathText content={`$$${formula}$$`} /></div>
          <p className="mt-2 text-left text-xs text-gray-400" dir="ltr">{formula}</p>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200/70 px-4 py-2.5 text-sm font-semibold dark:border-white/10">انصراف</button>
          <button type="button" onClick={() => onInsert(formula)} className="flex items-center gap-2 rounded-xl bg-[var(--griffin-gold)] px-4 py-2.5 text-sm font-semibold text-white"><Check size={17} /> درج در متن</button>
        </div>
      </div>
    </div>
  );
}
