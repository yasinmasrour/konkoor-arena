import { lazy, Suspense } from "react";
import HeroSection from "../components/sections/HeroSection";
import TrustBadges from "../components/sections/TrustBadges";
import FeaturesSection from "../components/sections/FeaturesSection";
import ArenaPreview from "../components/sections/ArenaPreview";
import FinalCTA from "../components/sections/FinalCTA";

// 🆕 Lazy loading برای بخش‌های پایین
const HowItWorks = lazy(
  () => import("../components/sections/HowItWorks"),
);
const StatsSection = lazy(
  () => import("../components/sections/StatsSection"),
);
const TrustSection = lazy(
  () => import("../components/sections/TrustSection"),
);
const TestimonialsSection = lazy(
  () => import("../components/sections/TestimonialsSection"),
);
const PricingPreview = lazy(
  () => import("../components/sections/PricingPreview"),
);
const FAQSection = lazy(() => import("../components/sections/FAQSection"));
const BlogPreview = lazy(() => import("../components/sections/BlogPreview"));

// ==================== Fallback (وقتی در حال لود) ====================
const SectionLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center space-y-4">
      <div className="relative inline-flex">
        <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-2xl opacity-50 animate-pulse" />
        <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center">
          <div className="w-6 h-6 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      </div>
      <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
        در حال بارگذاری...
      </p>
    </div>
  </div>
);

// ==================== Home ====================
const Home = () => {
  return (
    <>
      {/* 🚀 بخش‌های بالا (Eager - همیشه لود می‌شن) */}
      <HeroSection />

      <TrustBadges />

      <FeaturesSection />

      <ArenaPreview />

      {/* 🆕 بخش‌های پایین (Lazy - فقط وقتی لود می‌شن) */}
      <Suspense fallback={<SectionLoader />}>
        <HowItWorks />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <StatsSection />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <TrustSection />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <TestimonialsSection />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <PricingPreview />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <FAQSection />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <BlogPreview />
      </Suspense>

      {/* CTA نهایی - مهمه، eager بمونه */}
      <FinalCTA />
    </>
  );
};

export default Home;