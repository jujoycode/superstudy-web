import clsx from 'clsx'
import _ from 'lodash'
import { PropsWithChildren, useState } from 'react'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import SearchSelect from '@/legacy/components/common/SearchSelect'
import { useUserGetAllTeachers } from '@/legacy/generated/endpoint'
import { Typography } from '@/legacy/components/common/Typography'
import ColorSVGIcon from '../../icon/ColorSVGIcon'

interface IbCASMentorSelectProps {
  modalOpen: boolean
  setModalClose: () => void
  onSuccess: (selectedId: number) => void
  ablePropragation?: boolean
}

export function IbCASMentorSelect({
  modalOpen,
  setModalClose,
  onSuccess,
  ablePropragation = false,
}: PropsWithChildren<IbCASMentorSelectProps>) {
  const [selectedId, setSelectedId] = useState<number>()
  const { data: teachersData } = useUserGetAllTeachers()

  const teachers = _(teachersData)
    .map((teacher) => ({
      id: teacher.id,
      value: teacher.id,
      text: teacher.name || '이름 없음',
    }))
    .sortBy('text')
    .value()

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
      <div className={`relative flex w-[632px] flex-col gap-8 rounded-xl bg-white p-8`}>
        <div className="flex items-center justify-between">
          <Typography variant="title1">희망 감독교사 선택 및 승인요청</Typography>
          <ColorSVGIcon.Close color="gray700" size={32} onClick={setModalClose} className="cursor-pointer" />
        </div>

        <div className="flex flex-col gap-4">
          <Typography variant="body1">{`희망 감독교사를 선택하여 계획서 승인을 요청할 수 있습니다.\n계획서가 승인되면 활동을 진행하게 됩니다.`}</Typography>
          <SearchSelect
            options={teachers}
            value={selectedId}
            onChange={(value: number) => setSelectedId(value)}
            placeholder="희망 감독교사를 선택해주세요"
          />
        </div>
        <div className={clsx('flex items-center justify-end')}>
          <ButtonV2
            variant="solid"
            color="orange800"
            size={48}
            onClick={() => selectedId && onSuccess(selectedId)}
            disabled={selectedId === undefined}
          >
            계획서 승인요청
          </ButtonV2>
        </div>
      </div>
    </div>
  )
}
