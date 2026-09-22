import {
  ArrowUpRight,
  Calendar,
  CreditCard,
  Eye,
  Landmark,
  User,
} from "lucide-react";
import { formatPrice, type WithdrawRequest } from "../../api/walletApi";

interface WithdrawRequestCardProps {
  request: WithdrawRequest & {
    user?: {
      id: string;
      firstName: string;
      lastName: string;
      phoneNumber: string | null;
    };
  };
  onView: (request: WithdrawRequest) => void;
}

const statusConfig: Record<
  string,
  { bg: string; text: string; label: string; dot: string }
> = {
  PENDING: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    label: "در انتظار بررسی",
    dot: "bg-amber-500",
  },
  APPROVED: {
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    label: "تایید شده",
    dot: "bg-blue-500",
  },
  COMPLETED: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    label: "واریز شده",
    dot: "bg-emerald-500",
  },
  REJECTED: {
    bg: "bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-400",
    label: "رد شده",
    dot: "bg-rose-500",
  },
  CANCELLED: {
    bg: "bg-gray-500/10",
    text: "text-gray-600 dark:text-gray-400",
    label: "لغو شده",
    dot: "bg-gray-400",
  },
};

const formatDate = (value: string) =>
  new Date(value).toLocaleString("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  });

const WithdrawRequestCard = ({ request, onView }: WithdrawRequestCardProps) => {
  const status = statusConfig[request.status] ?? statusConfig.PENDING;

  return (
    <button
      type="button"
      onClick={() => onView(request)}
      className="
        group relative w-full text-right
        rounded-2xl overflow-hidden
        border border-gray-200 dark:border-white/5
        bg-white/50 dark:bg-white/[0.02]
        hover:bg-[var(--griffin-gold)]/5 dark:hover:bg-white/[0.04]
        hover:border-[var(--griffin-gold)]/40
        p-4
        transition-all duration-300 hover:-translate-y-0.5
      "
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* آیکون */}
        <div
          className={`
            w-12 h-12 rounded-xl shrink-0 self-start sm:self-auto
            flex items-center justify-center
            ${status.bg} ${status.text}
          `}
        >
          <ArrowUpRight size={22} strokeWidth={2.4} />
        </div>

        {/* اطلاعات */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black ${status.bg} ${status.text}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${status.dot} ${
                  request.status === "PENDING" ? "animate-pulse" : ""
                }`}
              />
              {status.label}
            </span>

            {request.user && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-500/10 dark:bg-white/5 text-gray-600 dark:text-gray-300 text-[10px] font-bold">
                <User size={10} />
                {request.user.firstName} {request.user.lastName}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-500 dark:text-gray-400">
            <span className="inline-flex items-center gap-1">
              <CreditCard size={9} />
              <span dir="ltr" className="font-english tabular-nums">
                {request.cardNumber.slice(0, 4)}****
                {request.cardNumber.slice(-4)}
              </span>
            </span>

            {request.bankName && (
              <span className="inline-flex items-center gap-1">
                <Landmark size={9} />
                {request.bankName}
              </span>
            )}

            <span className="inline-flex items-center gap-1">
              <Calendar size={9} />
              {formatDate(request.createdAt)}
            </span>
          </div>
        </div>

        {/* مبلغ */}
        <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:gap-1">
          <div className="text-left sm:text-right">
            <p className="font-heading text-lg font-black text-[var(--griffin-gold)] tabular-nums">
              {formatPrice(request.amount)}
            </p>
            <p className="text-[9px] text-gray-500 dark:text-gray-600">تومان</p>
          </div>

          <span className="inline-flex items-center gap-1 text-[10px] font-black text-[var(--griffin-gold)] opacity-0 group-hover:opacity-100 transition-opacity">
            <Eye size={10} />
            بررسی
          </span>
        </div>
      </div>
    </button>
  );
};

export default WithdrawRequestCard;
