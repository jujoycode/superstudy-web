import { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useActiveAnnouncements } from '@/legacy/container/active-announcement'
import { ResponseAnnouncementDto } from '@/legacy/generated/model'
import { jsonParseSafe } from '@/legacy/util/validator'
import AnnouncementCard from './AnnouncementCard'

interface AnnouncementProps {
  type: string
}

const getActiveAnnouncement = () => {
  const [announcements, setAnnouncements] = useState<ResponseAnnouncementDto[]>([])
  const { activeAnnouncements } = useActiveAnnouncements()
  useEffect(() => {
    if (!activeAnnouncements) return
    updateLocalStorage(activeAnnouncements)
    setAnnouncements(activeAnnouncements.sort((a: ResponseAnnouncementDto, b: ResponseAnnouncementDto) => b.id - a.id))
  }, [activeAnnouncements])

  const updateLocalStorage = (newAnnouncements: ResponseAnnouncementDto[]) => {
    const savedAnnouncements = jsonParseSafe(localStorage.getItem('serviceNoticeShow'), [])
    const now = new Date()

    const validAnnouncements = savedAnnouncements.filter((saved: any) =>
      newAnnouncements.some((ann) => ann.id === saved.id && new Date(ann.endTime) > now && new Date(saved.until) > now),
    )
    localStorage.setItem('serviceNoticeShow', JSON.stringify(validAnnouncements))
  }
  return announcements
}

const AnnouncementPopup = ({ type }: AnnouncementProps) => {
  const { push } = useHistory()
  const announcements = getActiveAnnouncement()
  const [visibleAnnouncement, setVisibleAnnouncement] = useState<ResponseAnnouncementDto[]>([])

  useEffect(() => {
    const dismissedAnnouncements = jsonParseSafe(localStorage.getItem('serviceNoticeShow'), [])
    const now = new Date()
    const visible = announcements.filter((ann) => {
      const isDismissed = dismissedAnnouncements.some(
        (dismissed: { id: number; until: Date }) => dismissed.id === ann.id && now < new Date(dismissed.until),
      )
      return new Date(ann.startTime) <= now && new Date(ann.endTime) > now && !isDismissed
    })
    setVisibleAnnouncement(visible)
  }, [announcements])

  if (visibleAnnouncement.length === 0) return null

  return (
    <>
      <div>
        {visibleAnnouncement.map((ann, index) => {
          const step = 20
          const leftPosition = `calc(50% + ${index * step}px)`
          const topPosition = `calc(50% + ${index * step}px)`
          return (
            <div key={ann.id}>
              <AnnouncementCard
                ann={ann}
                index={index}
                topPosition={topPosition}
                leftPosition={leftPosition}
                type={type}
              />
            </div>
          )
        })}
      </div>
    </>
  )
}

export default AnnouncementPopup
