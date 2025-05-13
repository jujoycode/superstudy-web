import { useParams } from 'react-router'

import { BackButton, Blank, TopNavbar } from '@/legacy/components/common'
import { FeedsDetail } from '@/legacy/components/common/FeedsDetail'
import { ErrorBlank } from '@/legacy/components/ErrorBlank'
import { useStudentNoticeDetail } from '@/legacy/container/student-notice-detail'
import { DateFormat, DateUtil } from '@/legacy/util/date'

export function NoticeDetailPage() {
  let { id } = useParams<{ id: string }>()
  id = id?.split('/')[0]
  const { notice, isNoticeLoading, errorMessage } = useStudentNoticeDetail(Number(id))

  return (
    <div>
      {isNoticeLoading && <Blank />}
      {errorMessage && <ErrorBlank text={errorMessage} />}
      <TopNavbar
        title="공지사항"
        left={
          <div className="h-15">
            <BackButton className="h-15" />
          </div>
        }
      />
      {notice && (
        <FeedsDetail
          category1={notice?.category}
          category1Color="peach_orange"
          sendTo={
            (notice?.toStudent ? '학생' : '') +
            (notice?.toStudent && notice?.toParent ? '/' : '') +
            (notice?.toParent ? '보호자' : '')
          }
          sendToColor="gray-100"
          title={notice?.title}
          contentText={notice?.content}
          contentImages={notice?.images}
          contentFiles={notice?.files}
          writer={notice?.user?.name}
          createAt={DateUtil.formatDate(notice?.createdAt || '', DateFormat['YYYY.MM.DD HH:mm'])}
        />
      )}
    </div>
  )
}
