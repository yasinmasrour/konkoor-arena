import { useSiteInfo } from "../../hooks/useSiteInfo";

const EnamadBadge = () => {
  const { siteInfo } = useSiteInfo();

  if (!siteInfo.enamadEnabled || !siteInfo.enamadHtml) {
    return null;
  }

  return (
    <div
      className="flex items-center justify-center"
      dangerouslySetInnerHTML={{ __html: siteInfo.enamadHtml }}
    />
  );
};

export default EnamadBadge;