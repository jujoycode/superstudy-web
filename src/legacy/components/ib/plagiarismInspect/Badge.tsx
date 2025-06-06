import { cn } from '@/utils/commonUtil'

import { Typography } from '@/legacy/components/common/Typography'
import SVGIcon from '@/legacy/components/icon/SVGIcon'
import { ResponseCopykillerResponseDtoCompleteStatus } from '@/legacy/generated/model'

interface BadgeProps {
  status: ResponseCopykillerResponseDtoCompleteStatus
  copyRatio: string
}

const badgeUI = (status: ResponseCopykillerResponseDtoCompleteStatus, copyRatio: string) => {
  switch (status) {
    case 'Y':
      return (
        <>
          <SVGIcon.Check color="orange800" size={16} weight="bold" />
          <Typography variant="body3" className="font-medium text-gray-900">
            표절률 <span className="text-primary-800">{copyRatio}%</span>
          </Typography>
        </>
      )
    case 'N':
      return (
        <>
          <SVGIcon.More color="gray700" size={16} weight="bold" />
          <Typography variant="body3" className="font-medium text-gray-900">
            검사 진행중
          </Typography>
        </>
      )
    default:
      return (
        <>
          <Typography variant="body3" className="text-- font-medium">
            검사 실패
          </Typography>
        </>
      )
  }
}

export default function Badge({ status, copyRatio }: BadgeProps) {
  return (
    <div
      className={cn(
        'flex h-8 items-center gap-1 rounded-lg px-[10px] py-[6px]',
        status === 'Y' ? 'bg-primary-50' : 'bg-gray-100',
      )}
    >
      {badgeUI(status, copyRatio)}
    </div>
  )
}
