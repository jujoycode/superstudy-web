import { useParams } from 'react-router'

import { Blank } from '@/legacy/components/common'
import { Time } from '@/legacy/components/common/Time'
import { useTeacherNewsletterCheckDetail } from '@/legacy/container/teacher-newsletter-check-detail'

export function NewsletterCheckDetailPage() {
  const { id, snid } = useParams<{ id: string; snid: string }>()

  const { newsletter, isLoading } = useTeacherNewsletterCheckDetail(Number(id), Number(snid))

  return (
    <>
      {isLoading && <Blank reversed />}
      <div className="h-screen-4.5 relative overflow-x-hidden overflow-y-scroll border border-gray-100">
        <div className="bg-gray-50 p-4">
          <div className="space-y-0.5">
            <div className="mt-2 text-lg font-semibold">{newsletter?.title}</div>
            <Time date={newsletter?.createdAt} />
          </div>
        </div>
      </div>
    </>
  )
}
