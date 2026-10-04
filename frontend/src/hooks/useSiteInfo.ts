import { useEffect, useState } from "react";
import {
  getSiteInfoCached,
  FALLBACK_SITE_INFO,
  type SiteInfo,
} from "../api/siteInfoApi";

interface UseSiteInfoResult {
  siteInfo: SiteInfo;
  loading: boolean;
}

export const useSiteInfo = (): UseSiteInfoResult => {
  const [siteInfo, setSiteInfo] = useState<SiteInfo>(FALLBACK_SITE_INFO);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    getSiteInfoCached()
      .then((data) => {
        if (!mounted) return;
        setSiteInfo(data);
      })
      .catch((err) => {
        console.error("Failed to load site info:", err);
        if (!mounted) return;
        setSiteInfo(FALLBACK_SITE_INFO);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { siteInfo, loading };
};
