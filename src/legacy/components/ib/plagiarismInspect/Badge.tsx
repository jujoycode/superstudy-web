import clsx from 'clsx'
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
          <Typography variant="body3" className="text-primary-gray-900 font-medium">
            표절률 <span className="text-primary-orange-800">{copyRatio}%</span>
          </Typography>
        </>
      )
    case 'N':
      return (
        <>
          <SVGIcon.More color="gray700" size={16} weight="bold" />
          <Typography variant="body3" className="text-primary-gray-900 font-medium">
            검사 진행중
          </Typography>
        </>
      )
    default:
      return (
        <>
          <Typography variant="body3" className="text-system-error-800 font-medium">
            검사 실패
          </Typography>
        </>
      )
  }
}

export default function Badge({ status, copyRatio }: BadgeProps) {
  return (
    <div
      className={clsx(
        'flex h-8 items-center gap-1 rounded-lg px-[10px] py-[6px]',
        status === 'Y' ? 'bg-primary-orange-50' : 'bg-primary-gray-100',
      )}
    >
      {badgeUI(status, copyRatio)}
    </div>
  )
}
