import { useAnnouncements } from "../../hooks/useAnnouncements";
import AnnouncementCard from "./AnnouncementCard";

/**
 * فقط کارت پایین چپ رو مدیریت میکنه (بنر توی Navbar هست)
 */
const AnnouncementProvider = () => {
  const { card, loading, dismissCard } = useAnnouncements();

  if (loading || !card) return null;

  return <AnnouncementCard announcement={card} onDismiss={dismissCard} />;
};

export default AnnouncementProvider;