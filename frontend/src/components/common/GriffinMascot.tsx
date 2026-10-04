import { MASCOT_IMAGES, type MascotVariant } from "../../assets/mascot";

type Size = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
type Animation = "none" | "float" | "wiggle" | "pulse" | "bounce";
type GlowColor = "none" | "gold" | "purple" | "emerald" | "amber" | "rose";

interface GriffinMascotProps {
  variant: MascotVariant;
  size?: Size;
  animation?: Animation;
  glowColor?: GlowColor;
  className?: string;
  /** اگه true، هاله‌ی چرخان دور mascot نشون داده میشه */
  halo?: boolean;
  /** اگه true، ذرات نورانی دور mascot قرار می‌گیرن */
  particles?: boolean;
  alt?: string;
}

const SIZE_CLASSES: Record<Size, string> = {
  xs: "w-20 h-20 sm:w-24 sm:h-24",
  sm: "w-28 h-28 sm:w-32 sm:h-32",
  md: "w-40 h-40 sm:w-48 sm:h-48",
  lg: "w-56 h-56 sm:w-64 sm:h-64",
  xl: "w-72 h-72 sm:w-80 sm:h-80",
  "2xl": "w-80 h-80 sm:w-96 sm:h-96",
};

const ANIMATION_CLASSES: Record<Animation, string> = {
  none: "",
  float: "animate-[float_4s_ease-in-out_infinite]",
  wiggle: "animate-[wiggle_3s_ease-in-out_infinite]",
  pulse: "animate-[pulse-slow_3s_ease-in-out_infinite]",
  bounce: "animate-[bounce-soft_2.5s_ease-in-out_infinite]",
};

const GLOW_CLASSES: Record<GlowColor, string> = {
  none: "",
  gold: "bg-[var(--griffin-gold)]/25",
  purple: "bg-purple-500/25",
  emerald: "bg-emerald-500/25",
  amber: "bg-amber-500/25",
  rose: "bg-rose-500/25",
};

// 🆕 ذرات ثابت (نه محاسبه‌ی runtime)
const PARTICLE_POSITIONS = [
  { top: 5, left: 50, delay: 0 },
  { top: 25, left: 92, delay: 0.5 },
  { top: 50, left: 98, delay: 1 },
  { top: 75, left: 92, delay: 1.5 },
  { top: 95, left: 50, delay: 2 },
  { top: 75, left: 8, delay: 2.5 },
  { top: 50, left: 2, delay: 3 },
  { top: 25, left: 8, delay: 3.5 },
];

const GriffinMascot = ({
  variant,
  size = "md",
  animation = "float",
  glowColor = "gold",
  className = "",
  halo = false,
  particles = false,
  alt = "گریفین",
}: GriffinMascotProps) => {
  const imageSrc = MASCOT_IMAGES[variant];
  const sizeClass = SIZE_CLASSES[size];
  const animationClass = ANIMATION_CLASSES[animation];
  const glowClass = GLOW_CLASSES[glowColor];

  return (
    <div
      className={`relative flex items-center justify-center ${sizeClass} ${className}`}
    >
      {/* 🆕 هاله درخشان پشت (بدون animate-pulse، blur سبک‌تر) */}
      {glowColor !== "none" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className={`w-[65%] h-[65%] rounded-full ${glowClass} blur-[40px]`}
          />
        </div>
      )}

      {/* 🆕 حلقه‌ی چرخان (فقط یکی، به جای دو تا) */}
      {halo && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[90%] h-[90%] rounded-full border border-dashed border-[var(--griffin-gold)]/20 animate-[spin_40s_linear_infinite]" />
        </div>
      )}

      {/* 🆕 ذرات نورانی (ثابت، بدون shadow) */}
      {particles &&
        PARTICLE_POSITIONS.map((p, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-[var(--griffin-gold)] pointer-events-none"
            style={{
              top: `${p.top}%`,
              left: `${p.left}%`,
              transform: "translate(-50%, -50%)",
              animation: `float ${3 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
              opacity: 0.6,
            }}
          />
        ))}

      {/* 🆕 تصویر اصلی (بدون drop-shadow سنگین) */}
      <img
        src={imageSrc}
        alt={alt}
        className={`relative w-full h-auto object-contain ${animationClass}`}
        draggable={false}
        loading="lazy"
      />
    </div>
  );
};

export default GriffinMascot;