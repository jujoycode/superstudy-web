import { useAnnouncementGetActiveAnnouncements } from '@/legacy/generated/endpoint'

export function useActiveAnnouncements() {
  const { data: activeAnnouncements, isLoading } = useAnnouncementGetActiveAnnouncements()
  return {
    activeAnnouncements,
    isLoading,
  }
}
