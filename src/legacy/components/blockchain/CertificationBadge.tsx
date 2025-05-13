import { Icon } from '@/legacy/components/common/icons'
import { ResponseBlockChainStatusDtoStatus } from '@/legacy/generated/model'

interface CertificationBadgeProps {
  status: ResponseBlockChainStatusDtoStatus
}

export default function CertificationBadge({ status }: CertificationBadgeProps) {
  const renderIcon = () => {
    switch (status) {
      case 'PENDING':
        return (
          <>
            <Icon.Pending /> <p className="text-[#ffba25]">대기</p>
          </>
        )
      case 'COMPLETE':
        return (
          <>
            <Icon.Success /> <p className="text-[#00a775]">완료</p>
          </>
        )
      case 'FAILED':
        return (
          <>
            <Icon.Fail /> <p className="text-[#ff2525]">실패</p>
          </>
        )
      default:
        return null
    }
  }
  return (
    <span className="flex flex-row items-center justify-between gap-3 rounded-lg bg-[#f8f8f8] px-2 py-1 text-sm">
      <h6 className="text-[#777777]">인증상태</h6>
      <p className="flex flex-row items-center gap-1 font-semibold">{renderIcon()}</p>
    </span>
  )
}
