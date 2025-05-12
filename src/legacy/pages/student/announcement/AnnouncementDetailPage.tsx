import { useParams } from 'react-router-dom'
import { ErrorBlank } from '@/legacy/components'
import AnnouncementDetailCard from '@/legacy/components/announcement/AnnouncementDetailCard'
import { BackButton, Blank, TopNavbar } from '@/legacy/components/common'
import { useAnnouncementDetail } from '@/legacy/container/announcement-detail'

export default function AnnouncementDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { errorMessage, isLoading, announcement } = useAnnouncementDetail(+id)

  return (
    <>
      {/* Mobile V */}
      <div>
        {isLoading && <Blank />}
        {errorMessage && <ErrorBlank text={errorMessage} />}
        <TopNavbar left={<BackButton />} title="슈퍼스쿨 공지사항" />
        {announcement && <AnnouncementDetailCard announcement={announcement} />}
      </div>
    </>
  )
}
