import { PropsWithChildren, useState } from 'react'
import { useForm } from 'react-hook-form'

import AlertV2 from '@/legacy/components/common/AlertV2'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { Check } from '@/legacy/components/common/Check'
import { IBBlank } from '@/legacy/components/common/IBBlank'
import { Input } from '@/legacy/components/common/Input'
import { Typography } from '@/legacy/components/common/Typography'
import { useCheckListGetByStudent } from '@/legacy/container/ib-checklist-find'
import { RequestRRSDto } from '@/legacy/generated/model'

import ColorSVGIcon from '../../icon/ColorSVGIcon'

interface IbEeCheckListProps {
  modalOpen: boolean
  setModalClose: () => void
  onSuccess: () => void
  studentId: number
  type: 'create' | 'update'
  ablePropragation?: boolean
}

export function IbEeCheckList({
  modalOpen,
  setModalClose,
  studentId,
  ablePropragation = false,
}: PropsWithChildren<IbEeCheckListProps>) {
  const [isOpen, setIsOpen] = useState(false)
  const { CheckList, isLoading } = useCheckListGetByStudent(studentId, 'ESSAY')
  const [selectedOptions, setSelectedOptions] = useState<boolean[]>([])
  const handleGroupChange = (selectedValue: boolean[]) => {
    setSelectedOptions(selectedValue)
  }
  const [checked, setChecked] = useState<boolean>(false)
  const {
    handleSubmit,
    watch,
    formState: {},
  } = useForm<RequestRRSDto>({})
  const title = watch('title')

  const onSubmit = () => {
    // 체크리스트 상태 변경 로직
  }

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
      <div className={`relative w-[632px] overflow-hidden rounded-xl bg-white px-8`}>
        {isLoading && <IBBlank type="section-opacity" />}
        <div className=".backdrop-blur-20 sticky top-0 z-10 flex h-[88px] items-center justify-between bg-white/70 pt-8 pb-6">
          <Typography variant="title1">체크리스트 작성</Typography>
          <ColorSVGIcon.Close color="gray700" size={32} onClick={setModalClose} />
        </div>

        <form>
          <section className="flex flex-col gap-4 border-b border-b-gray-100 pb-8">
            <Check.Group selectedValues={selectedOptions} onChange={handleGroupChange} className="flex flex-col gap-3">
              {CheckList?.map((item) => <Check.Box label={item.content} size={20} key={item.id} />)}
            </Check.Group>
            <div className="flex flex-row items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
              <Typography variant="body3">에세이에 사용한 단어 수를 입력해주세요</Typography>
              <Input.Basic size={32} placeholder="예) 3600" />
            </div>
          </section>
          <section className="flex flex-col gap-4 py-8">
            <Typography variant="title3">학문적 진실성 동의</Typography>
            <Typography variant="body2" className="rounded-lg bg-gray-50 px-4 py-[13px]">
              소논문은 전적으로 학생 본인에 의해 쓰였으며, 인용하였다고 출처 표시를 한 부분을 제외하고 어떠한 부분도
              다른 저자(인공지능)의 자료를 사용하지 않았음을 약속합니다. 추후 학업적 진실성에 어긋난다고 확인되는 경우
              IB 졸업장이 취소될 수 있음을 인지하고 있습니다.
            </Typography>
            <span className="flex flex-row items-center justify-start gap-2">
              <Check.Basic checked={checked} onChange={() => setChecked(!checked)} />
              <Typography variant="title3" className="cursor-pointer" onClick={() => setChecked(!checked)}>
                위 내용을 확인 하였으며, 동의합니다.
              </Typography>
            </span>
          </section>

          <div className=".backdrop-blur-20 sticky bottom-0 flex h-[104px] justify-end gap-4 border-t border-t-gray-100 bg-white/70 pt-6 pb-8">
            <ButtonV2
              type="submit"
              variant="solid"
              color="orange800"
              size={48}
              onClick={handleSubmit(onSubmit)}
              disabled={!title}
            >
              다음
            </ButtonV2>
          </div>
        </form>
      </div>
      {isOpen && (
        <AlertV2 confirmText="확인" message={`제안서가 \n저장되었습니다`} onConfirm={() => setIsOpen(!isOpen)} />
      )}
    </div>
  )
}
