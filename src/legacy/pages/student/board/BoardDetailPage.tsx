import { useParams } from 'react-router'

import { ErrorBlank } from '@/legacy/components'
import { BackButton, Blank, TopNavbar } from '@/legacy/components/common'
import { FeedsDetail } from '@/legacy/components/common/FeedsDetail'
import { useStudentBoardDetail } from '@/legacy/container/student-board-detail'
import { DateFormat, DateUtil } from '@/legacy/util/date'

export function BoardDetailPage() {
  const { id } = useParams<{ id: string }>()

  const { board, isBoardLoading, errorMessage } = useStudentBoardDetail(Number(id))

  return (
    <div>
      {isBoardLoading && <Blank />}
      {errorMessage && <ErrorBlank text={errorMessage} />}
      <TopNavbar
        title="학급 게시판"
        left={
          <div className="h-15">
            <BackButton className="h-15" />
          </div>
        }
      />
      {board && (
        <FeedsDetail
          category1={board?.category}
          category1Color="mint_green"
          sendTo={
            (board?.toStudent ? '학생' : '') +
            (board?.toStudent && board?.toParent ? '/' : '') +
            (board?.toParent ? '보호자' : '')
          }
          sendToColor="gray-100"
          title={board?.title}
          contentText={board?.content}
          contentImages={board?.images}
          contentFiles={board?.files}
          writer={board?.writer?.name}
          createAt={DateUtil.formatDate(board?.createdAt || '', DateFormat['YYYY.MM.DD HH:mm'])}
        />
      )}
    </div>
  )
}
