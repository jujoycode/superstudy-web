import { Button } from './common/Button'
import { useRecoilValue } from 'recoil'
import { meState } from '@/stores'
import { PermissionUtil } from '@/legacy/util/permission'

interface ErrorBlankProps {
  text?: string
}

export function ErrorBlank({
  text = '삭제된 컨텐츠이거나 일시적 오류입니다. 잠시후 다시 시도해주세요.',
}: ErrorBlankProps) {
  const { push } = useHistory()
  const me = useRecoilValue(meState)

  const path = PermissionUtil.isNotStudentNotParent(me?.role) ? '/teacher' : '/student/canteen'

  return (
    <div
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
      className={
        'fixed inset-0 z-100 m-0 flex h-screen w-full flex-col items-center justify-center bg-[#000000] opacity-40'
      }
    >
      <div className="bg-transblack mb-8 text-center text-white">{text}</div>
      <div className="flex w-full items-center justify-center space-x-4">
        <Button.lg children="새로고침하기" onClick={() => window.location.reload()} className="filled-gray-dark" />
        <Button.lg children="홈으로 돌아가기" onClick={() => push(path)} className="filled-gray-dark" />
      </div>
    </div>
  )
}
