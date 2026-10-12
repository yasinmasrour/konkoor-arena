import { Helmet } from "react-helmet-async";

interface SeoProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  publishedAt?: string | null;
  modifiedAt?: string | null;
  author?: string;
  tags?: string[];
  noindex?: boolean;
  jsonLd?: object | object[];
}

const SITE_NAME = "آکادمی گریفین";
const SITE_TAGLINE = "آزمون، آرنا، موفقیت";
const SITE_URL = "https://griffinedu.ir";
const DEFAULT_TITLE = `${SITE_TAGLINE} | ${SITE_NAME}`;
const DEFAULT_DESCRIPTION =
  "پلتفرم هوشمند یادگیری، آزمون و رقابت برای دانش‌آموزان کنکوری. با آرنا، آزمون‌های هوشمند و تحلیل دقیق، به بهترین نسخه خودت تبدیل شو.";
const DEFAULT_IMAGE =
  "https://griffineducdn.s3.ir-central1.arvanstorage.ir/og-default.jpg";

const Seo = ({
  title,
  description,
  image,
  url,
  type = "website",
  publishedAt,
  modifiedAt,
  author,
  tags,
  noindex = false,
  jsonLd,
}: SeoProps) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;

  const metaDescription = description || DEFAULT_DESCRIPTION;
  const metaImage = image || DEFAULT_IMAGE;
  const metaUrl =
    url ||
    (typeof window !== "undefined"
      ? `${SITE_URL}${window.location.pathname}`
      : SITE_URL);

  return (
    <Helmet prioritizeSeoTags>
      {/* ==================== Basic ==================== */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={metaUrl} />

      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* ==================== Open Graph ==================== */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:url" content={metaUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="fa_IR" />

      {type === "article" && publishedAt && (
        <meta property="article:published_time" content={publishedAt} />
      )}
      {type === "article" && modifiedAt && (
        <meta property="article:modified_time" content={modifiedAt} />
      )}
      {type === "article" && author && (
        <meta property="article:author" content={author} />
      )}
      {type === "article" &&
        tags?.map((tag) => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}

      {/* ==================== Twitter Card ==================== */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />

      {/* ==================== JSON-LD ==================== */}
      {jsonLd &&
        (Array.isArray(jsonLd) ? jsonLd : [jsonLd]).map((schema, i) => (
          <script key={i} type="application/ld+json">
            {JSON.stringify(schema)}
          </script>
        ))}
    </Helmet>
  );
};

export default Seo;
