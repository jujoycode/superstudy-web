import clsx from 'clsx'
import { useState } from 'react'
import { Typography } from '@/legacy/components/common/Typography'
import SVGIcon from '@/legacy/components/icon/SVGIcon'
import { useGetPlagiarismInspectDetail } from '@/legacy/container/plagiarism-inspector'
import { ResponseCopykillerResponseDto } from '@/legacy/generated/model'
import { useSchoolStore } from '@/stores/school'
import LoadingPopup from './LoadingPopup'

interface IBDetailPlagiarimInspectResultBadgeProps {
  id: number
  status: ResponseCopykillerResponseDto['completeStatus'] | null
  copyRatio: ResponseCopykillerResponseDto['copyRatio'] | null
  enabled?: boolean
  errorMessage?: string
}

const getPlagiarismInspectResultUI = (
  status: ResponseCopykillerResponseDto['completeStatus'] | null,
  copyRatio: ResponseCopykillerResponseDto['copyRatio'] | null,
) => {
  switch (status) {
    case 'Y':
      return (
        <>
          <SVGIcon.Check color="orange800" size={16} weight="bold" />
          <Typography variant="body3" className="text-primary-gray-900">
            표절률이 <span className="text-primary-800">{copyRatio}%</span>
            입니다
          </Typography>
        </>
      )
    case 'F':
      return (
        <>
          <SVGIcon.Check color="gray400" size={16} weight="bold" />
          <Typography variant="body3" className="text-primary-gray-900">
            표절 검사에 실패하였습니다.
          </Typography>
        </>
      )
    default:
      return (
        <>
          <SVGIcon.More color="gray700" size={16} weight="bold" />
          <Typography variant="body3" className="text-primary-gray-900">
            검사 진행중
          </Typography>
        </>
      )
  }
}

export const IBDetailPlagiarimInspectResultBadge: React.FC<IBDetailPlagiarimInspectResultBadgeProps> = ({
  id,
  status,
  copyRatio,
  enabled = true,
  errorMessage,
}) => {
  const { schoolProperties } = useSchoolStore()
  const [isCausePopupOpen, setIsCausePopupOpen] = useState(false)

  const hasLicenseKey = !!schoolProperties?.find((property) => property.key === 'COPYKILLER_LICENSE_KEY')?.value

  const shouldRender = enabled && hasLicenseKey

  const { refetch } = useGetPlagiarismInspectDetail(id, {
    query: {
      enabled: false,
    },
  })

  const handleClick = () => {
    if (status === 'Y') {
      openDetailPopup()
    } else if (status === 'F') {
      setIsCausePopupOpen(true)
    }
  }

  const openDetailPopup = async () => {
    const result = await refetch()
    const detailData = result.data
    if (detailData) {
      const popup = window.open('', '_blank', 'width=1200,height=800')
      popup?.document.write(detailData)
      popup?.document.close()
    }
  }

  if (!shouldRender) {
    return null
  }

  return (
    <div
      className={clsx(
        'flex h-8 items-center gap-1 rounded-lg px-[10px] py-[6px]',
        status === 'Y' ? 'bg-primary-50' : 'bg-primary-gray-100',
        (status === 'Y' || status === 'F') && 'cursor-pointer',
      )}
      onClick={handleClick}
    >
      {getPlagiarismInspectResultUI(status ?? null, copyRatio ?? null)}
      {isCausePopupOpen && (
        <LoadingPopup
          modalOpen={isCausePopupOpen}
          setModalClose={() => setIsCausePopupOpen(false)}
          status={status ?? 'F'}
          cause={errorMessage ?? ''}
          type="cause"
        />
      )}
    </div>
  )
}
