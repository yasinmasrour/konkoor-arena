import { useAnnouncements } from "../../hooks/useAnnouncements";
import AnnouncementCard from "./AnnouncementCard";

/**
 * Provider کارت اعلان پایین چپ
 * بنر توی Navbar مدیریت میشه، این فقط کارت رو نشون میده
 */
const AnnouncementCardProvider = () => {
  const { card, loading, dismissCard } = useAnnouncements();

  if (loading || !card) return null;

  return <AnnouncementCard announcement={card} onDismiss={dismissCard} />;
};

export default AnnouncementCardProvider;