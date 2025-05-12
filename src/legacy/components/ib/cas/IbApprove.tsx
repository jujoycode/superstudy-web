import clsx from 'clsx'
import { PropsWithChildren, useState } from 'react'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { Check } from '@/legacy/components/common/Check'
import { Typography } from '@/legacy/components/common/Typography'
import ColorSVGIcon from '../../icon/ColorSVGIcon'

interface IbApproveProps {
  modalOpen: boolean
  setModalClose: () => void
  onSuccess: () => void
  ablePropragation?: boolean
}

export function IbApprove({
  modalOpen,
  setModalClose,
  onSuccess,
  ablePropragation = false,
}: PropsWithChildren<IbApproveProps>) {
  const [check, setChecked] = useState<boolean>(false)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  return (
    <div
      className={`bg-opacity-50 fixed inset-0 z-60 flex h-screen w-full items-center justify-center bg-black ${
        !modalOpen && 'hidden'
      }`}
      onClick={(e) => {
        if (!ablePropragation) {
          e.preventDefault()
          e.stopPropagation()
        }
      }}
    >
      <div className={`relative flex w-[632px] flex-col gap-6 rounded-xl bg-white p-8`}>
        <div className="flex items-center justify-between">
          <Typography variant="title1">활동종료 승인요청</Typography>
          <ColorSVGIcon.Close color="gray700" size={32} onClick={setModalClose} className="cursor-pointer" />
        </div>

        <div className="flex flex-col gap-4">
          <Typography variant="body1">{`활동종료 승인요청 전 '학문적 진실성' 항목에 대한 동의가 필요합니다.`}</Typography>
          <Typography
            variant="body2"
            className="bg-primary-gray-50 text-primary-gray-700 rounded-lg px-4 py-[13px]"
          >{`소논문은 전적으로 학생 본인에 의해 쓰였으며, 인용하였다고 출처 표시를 한 부분을 제외하고 어떠한 부분도 다른 저자(인공지능)의 자료를 사용하지 않았음을 약속합니다. 추후 학업적 진실성에 어긋난다고 확인되는 경우 IB 졸업장이 취소될 수 있음을 인지하고 있습니다.`}</Typography>
          <div className="flex items-center gap-2">
            <Check.Basic checked={check} onChange={() => setChecked(!check)} />
            <Typography
              variant="title3"
              className="text-primary-gray-900 cursor-pointer font-medium"
              onClick={() => setChecked(!check)}
            >
              위 내용을 확인 하였으며, 동의합니다.
            </Typography>
          </div>
        </div>
        <div className={clsx('flex items-center justify-end')}>
          <ButtonV2 variant="solid" color="orange800" size={48} onClick={() => setIsOpen(!isOpen)} disabled={!check}>
            활동종료 승인요청
          </ButtonV2>
        </div>
      </div>
      {isOpen && (
        <AlertV2
          message={`활동종료 승인을 요청하시겠습니까?`}
          confirmText="확인"
          cancelText="취소"
          onConfirm={onSuccess}
          description={`승인요청을 하면 제출물에 대한 수정이 불가능합니다.\n수정할 내용이 없는지 확인해주세요.`}
          onCancel={() => setIsOpen(!isOpen)}
        />
      )}
    </div>
  )
}
