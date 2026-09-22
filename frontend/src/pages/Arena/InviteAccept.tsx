import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  Swords,
  Target,
  UserPlus,
} from "lucide-react";
import {
  acceptArenaInvite,
  getArenaInvite,
  type ArenaInviteFull,
} from "../../api/arenaApi";

const InviteAccept = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [invite, setInvite] = useState<ArenaInviteFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!code) return;
    let cancelled = false;

    const load = async () => {
      try {
        const result = await getArenaInvite(code);
        if (!cancelled) setInvite(result.invite);
      } catch (err) {
        if (cancelled) return;
        const message =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "کد دعوت معتبر نیست";
        setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [code]);

  const handleAccept = async () => {
    if (!code || accepting) return;
    setAccepting(true);
    setError("");
    try {
      const result = await acceptArenaInvite(code);
      navigate(`/arena/match/${result.match.id}`);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "پذیرش دعوت انجام نشد";
      setError(message);
      setAccepting(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <div className="relative inline-flex">
            <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-2xl opacity-50 animate-pulse" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center">
              <LoaderCircle size={28} className="text-white animate-spin" />
            </div>
          </div>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
            در حال دریافت اطلاعات دعوت...
          </p>
        </div>
      </main>
    );
  }

  // Error / No invite
  if (error || !invite) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6 text-center">
          <AlertCircle size={32} className="mx-auto text-rose-500 mb-3" />
          <p className="text-sm font-bold text-rose-600 dark:text-rose-400 mb-4">
            {error || "کد دعوت معتبر نیست"}
          </p>
          <button
            onClick={() => navigate("/arena")}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-4 py-2.5 text-xs font-black text-white shadow-lg"
          >
            <ArrowLeft size={13} />
            بازگشت به آرنا
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8 flex items-center justify-center">
      <div className="w-full max-w-md space-y-5">
        {/* HERO */}
        <section className="relative rounded-3xl overflow-hidden border border-[var(--griffin-gold)]/30 bg-[#080B12] p-6 sm:p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--griffin-gold)]/20 via-transparent to-purple-600/15 pointer-events-none" />
          <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-[var(--griffin-gold)]/25 blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-purple-600/20 blur-[100px] pointer-events-none" />

          <div className="relative text-center space-y-4">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-3xl opacity-70 animate-pulse" />
              <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-2xl rotate-3 border-2 border-white/20">
                <UserPlus size={36} strokeWidth={2.3} />
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)] mb-2">
                Friendly Match Invite
              </p>
              <h1 className="font-heading text-xl sm:text-2xl font-black text-white">
                {invite.inviter.firstName} {invite.inviter.lastName} تو رو دعوت
                کرده!
              </h1>
            </div>
          </div>
        </section>

        {/* اطلاعات لیگ */}
        <section className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--griffin-gold)]/10 flex items-center justify-center text-[var(--griffin-gold)]">
              <Swords size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                لیگ
              </p>
              <p className="font-heading text-sm font-black text-gray-900 dark:text-white truncate">
                {invite.league.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Target size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                درس
              </p>
              <p className="font-heading text-sm font-black text-gray-900 dark:text-white truncate">
                {invite.league.lesson}
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-[var(--griffin-gold)]/5 border border-[var(--griffin-gold)]/20 p-3">
            <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-6">
              💡 نبرد دوستانه‌ست — Rating حساب نمی‌شه، فقط برای تفریح و تمرینه!
            </p>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 flex items-start gap-2.5">
            <AlertCircle size={15} className="text-rose-500 shrink-0 mt-0.5" />
            <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400 leading-5">
              {error}
            </p>
          </div>
        )}

        {/* دکمه‌ها */}
        <section className="space-y-2.5">
          <button
            type="button"
            onClick={handleAccept}
            disabled={accepting}
            className="group relative w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-6 py-4 text-sm font-black text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl hover:shadow-[var(--griffin-gold)]/60 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 transition-all overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              {accepting ? (
                <>
                  <LoaderCircle size={17} className="animate-spin" />
                  در حال شروع نبرد...
                </>
              ) : (
                <>
                  <CheckCircle2 size={17} />
                  قبول دعوت و شروع نبرد
                </>
              )}
            </span>
            {!accepting && (
              <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate("/arena")}
            disabled={accepting}
            className="w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm px-6 py-3.5 text-sm font-black text-gray-700 dark:text-gray-200 hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)] disabled:opacity-50 transition-all"
          >
            بازگشت
          </button>
        </section>
      </div>
    </main>
  );
};

export default InviteAccept;
