import { useEffect, useMemo, useState } from "react";
import { Pencil, UserRound } from "lucide-react";
import { getMyProfile, updateMyProfile } from "../../api/userApi";
import { useAuth } from "../../context/AuthContext";

const ProfileCompletionCard = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ birthDate: "", major: "", grade: "", email: "", nationalId: "", address: "", city: "", province: "" });

  useEffect(() => {
    void getMyProfile().then((profile) => {
      updateUser(profile);
      setForm({ birthDate: profile.birthDate?.slice(0,10) || "", major: profile.major || "", grade: profile.grade || "", email: profile.email || "", nationalId: profile.nationalId || "", address: profile.address || "", city: profile.city || "", province: profile.province || "" });
    }).catch(() => undefined);
  }, []);

  const complete = useMemo(() => Boolean(user?.birthDate && user?.major && user?.grade), [user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setMessage("");
    try { const profile = await updateMyProfile(form); updateUser(profile); setEditing(false); setMessage("اطلاعات پروفایل با موفقیت ذخیره شد."); }
    catch (error: any) { setMessage(error?.response?.data?.message || error?.message || "ذخیره اطلاعات انجام نشد."); }
    finally { setLoading(false); }
  };

  const input = (name: keyof typeof form, label: string, required=false, type="text") => <label className="space-y-1 text-sm"><span>{label}{required && <span className="text-red-500"> *</span>}</span><input required={required} type={type} value={form[name]} onChange={(e)=>setForm(v=>({...v,[name]:e.target.value}))} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-[var(--griffin-gold)] dark:border-white/10 dark:bg-white/5" /></label>;

  return <section className="rounded-3xl border border-white/20 bg-white/60 p-6 shadow-lg backdrop-blur-xl dark:bg-white/10">
    <div className="flex items-start justify-between gap-4"><div className="flex items-start gap-3"><div className="rounded-2xl bg-[var(--griffin-gold)]/15 p-3 text-[var(--griffin-gold)]"><UserRound size={22}/></div><div><h2 className="text-xl font-bold">{complete ? "ویرایش اطلاعات" : "تکمیل پروفایل"}</h2><p className="mt-1 text-sm text-gray-500 dark:text-gray-300">{complete ? "اطلاعات شخصی و تحصیلی خود را مدیریت کنید." : "برای استفاده بهتر از امکانات گریفین، اطلاعات اصلی خود را تکمیل کنید."}</p></div></div><button onClick={()=>setEditing(!editing)} className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm"><Pencil size={16}/> {editing ? "بستن" : "ویرایش"}</button></div>
    {message && <div className="mt-4 rounded-xl bg-[var(--griffin-gold)]/10 p-3 text-sm">{message}</div>}
    {editing && <form onSubmit={save} className="mt-6 grid gap-4 md:grid-cols-2">{input("birthDate","تاریخ تولد",true,"date")}{input("major","رشته",true)}{input("grade","پایه",true)}{input("email","ایمیل")}{input("nationalId","کد ملی")}{input("city","شهر")}{input("province","استان")}<div className="md:col-span-2">{input("address","آدرس")}</div><button disabled={loading} className="md:col-span-2 rounded-xl bg-[var(--griffin-gold)] py-3 font-semibold text-white disabled:opacity-50">{loading ? "در حال ذخیره..." : "ذخیره اطلاعات"}</button></form>}
  </section>;
};
export default ProfileCompletionCard;
