import { Typography } from '@/legacy/components/common/Typography'
import { cn } from '@/legacy/lib/tailwind-merge'
import Badge from './Badge'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { ResponseCopykillerResponseDto, ResponseCopykillerWithContentDto } from '@/legacy/generated/model'
import { format } from 'date-fns'
import { useGetPlagiarismInspectDetail, useGetPlagiarismInspectResult } from '@/legacy/container/plagiarism-inspector'
import { useState } from 'react'
import LoadingPopup from './LoadingPopup'
import { Constants } from '@/legacy/constants'
import { PopupModal } from '@/legacy/components/PopupModal'
import { Blank } from '@/legacy/components/common'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { getFileNameFromUrl } from '@/legacy/util/file'
import { downloadFile } from '@/legacy/util/download-image'

export default function ResultCard({ data }: { data: ResponseCopykillerResponseDto }) {
  const [isCausePopupOpen, setIsCausePopupOpen] = useState(false)
  const [isTextPreviewOpen, setIsTextPreviewOpen] = useState(false)
  const [textPreviewData, setTextPreviewData] = useState<{ title: string; content: string } | null>(null)
  const [isAlertOpen, setIsAlertOpen] = useState(false)

  const { refetch } = useGetPlagiarismInspectDetail(data.id, {
    query: {
      enabled: false,
    },
  })

  const { refetch: refetchStatus, isLoading: isRefetchStatusLoading } = useGetPlagiarismInspectResult(data.id, {
    query: {
      enabled: false, // 자동 호출 비활성화, 성공한 카드 타이틀 클릭 시 실행
      onSuccess: (data: ResponseCopykillerWithContentDto) => {
        if (data.content) {
          setTextPreviewData({
            title: data.title,
            content: data.content,
          })
          setIsTextPreviewOpen(true)
        } else {
          setIsAlertOpen(true)
        }
      },
    },
  })

  const handleClick = () => {
    if (data.completeStatus === 'Y') {
      openDetailPopup(data.id)
    } else if (data.completeStatus === 'F') {
      openCausePopup()
    }
  }

  const handleTitleClick = () => {
    if (data.files.length > 0) {
      downloadFile(Constants.imageUrl + data.files[0], getFileNameFromUrl(data.files[0]))
    } else {
      refetchStatus()
    }
  }

  const openDetailPopup = (id: number) => {
    window.open(`/plagiarism-inspect/detail/${id}`, '_blank', 'width=1200,height=800')
  }

  const openCausePopup = () => {
    setIsCausePopupOpen(true)
  }

  return (
    <div className="border-primary-gray-200 flex h-[210px] w-[392px] flex-col justify-between rounded-xl border bg-white p-6 shadow-[0px_4px_8px_0px_#F4F6F8]">
      <div className="flex flex-col gap-2">
        <Typography
          variant="title2"
          className={cn(
            'text-18 text-primary-gray-900 line-clamp-3',
            data.completeStatus === 'Y' && 'cursor-pointer hover:underline',
          )}
          onClick={data.completeStatus === 'Y' ? handleTitleClick : undefined}
        >
          {data.title}
        </Typography>
        <Typography variant="body3" className={cn('text-14 text-primary-gray-600')}>
          {format(new Date(data.createdAt), 'yyyy.MM.dd')}
        </Typography>
      </div>
      <div className="flex justify-between">
        <Badge status={data.completeStatus} copyRatio={data.copyRatio} />
        {(data.completeStatus === 'Y' || data.completeStatus === 'F') && (
          <ButtonV2
            variant="outline"
            color="gray400"
            size={32}
            className="flex flex-row items-center gap-1"
            onClick={handleClick}
          >
            {/* TODO: 추후 api 추가되면 구현 필요 */}
            {/* <ColorSVGIcon.New color="orange800" /> */}
            {data.completeStatus === 'Y' && '결과보기'}
            {data.completeStatus === 'F' && '원인보기'}
          </ButtonV2>
        )}
      </div>

      {isCausePopupOpen && (
        <LoadingPopup
          modalOpen={isCausePopupOpen}
          setModalClose={() => setIsCausePopupOpen(false)}
          status={data.completeStatus}
          cause={data.errorMessage}
          type="cause"
        />
      )}

      {isTextPreviewOpen && (
        <PopupModal
          modalOpen={isTextPreviewOpen}
          setModalClose={() => setIsTextPreviewOpen(false)}
          title="원문 보기"
          headerClassName="px-8"
          containerClassName="w-[848px] h-[600px] px-0"
          contentsClassName="w-full h-full px-8 py-4"
          footerClassName="px-8"
        >
          <div className="flex flex-col gap-4">
            <div className="border-primary-gray-200 flex flex-col gap-4 rounded-lg border p-4">
              <Typography variant="body2">{textPreviewData?.title}</Typography>
            </div>
            <div className="scroll-box border-primary-gray-200 flex h-[400px] w-full flex-col gap-4 overflow-y-auto rounded-lg border p-4">
              <Typography variant="body2">{textPreviewData?.content}</Typography>
            </div>
          </div>
        </PopupModal>
      )}

      {isAlertOpen && (
        <AlertV2
          confirmText="확인"
          message="원문 확인 불가"
          description={`[2025.03.23] 이전에 검사된 문서의 원문은 시스템에 저장되지 않아 확인할 수 없습니다.\n앞으로 진행하는 표절 검사에서는 원문 확인 기능을 이용해 주세요.`}
          onConfirm={() => {
            setIsAlertOpen(false)
          }}
        />
      )}

      {isRefetchStatusLoading && <Blank />}
    </div>
  )
}
