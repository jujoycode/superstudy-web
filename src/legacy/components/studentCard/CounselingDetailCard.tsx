import { useState } from 'react'

import { Button } from '@/legacy/components/common/Button'
import { Time } from '@/legacy/components/common/Time'
import { Constants } from '@/legacy/constants'
import { UserContainer } from '@/legacy/container/user'
import { ResponseCounselingDetailDto } from '@/legacy/generated/model'
import { AccessLevels } from '@/legacy/types'

import WAVPlayer from '../rec/wavPlayer'
import { SuperModal } from '../SuperModal'

interface StudentCounselingProps {
  data: ResponseCounselingDetailDto
  deleteCounseling: (id: number) => void
  editCounseling: (id: number) => void
}

export default function CounselingDetailCard({ data, deleteCounseling, editCounseling }: StudentCounselingProps) {
  const { me } = UserContainer.useContext()
  const [alertDelete, setAlertDelete] = useState(false)

  let categoryColorClass = ''
  switch (data.category) {
    case '진로':
      categoryColorClass = 'bg-counselingCategory-0'
      break
    case '교우관계':
      categoryColorClass = 'bg-counselingCategory-1'
      break
    case '기타':
      categoryColorClass = 'bg-counselingCategory-2'
      break
    case '학교폭력':
      categoryColorClass = 'bg-counselingCategory-3'
      break
    default:
      categoryColorClass = 'bg-green-300'
  }
  return (
    <div className={`p-4 ${categoryColorClass} relative flex h-[308px] flex-col rounded-md md:h-64`}>
      <div className="flex justify-between text-sm">
        <div className="flex items-center gap-1">
          <h6 className="font-bold">{data.category}</h6>
          <p>| 상담자 : {data.counselorName}</p>
          <p>| {AccessLevels.find((item) => item.id === data.accessLevel)?.name}</p>
        </div>
        <div>
          <Time format="yyyy.MM.dd" date={data.counselingAt} />
        </div>
      </div>
      <h5 className="font-bold">상담내용</h5>
      <div className="h-[200px] overflow-y-auto text-sm break-all whitespace-pre-line">
        {data.content}
        <br />
        {data.transcript}
      </div>
      {data.writerId === me?.id && (
        <div className="flex justify-between">
          <div>
            {data.voiceFiles && data.voiceFiles.length > 0 && (
              <WAVPlayer initialUrl={`${Constants.imageUrl}${data.voiceFiles[0]}`} />
            )}
          </div>
          <div className="space-x-2">
            <button
              onClick={() => editCounseling(data.id)}
              className="w-15 rounded-xl border-2 border-blue-500 bg-white px-3 py-0.5 text-sm font-bold text-blue-500 hover:bg-blue-500 hover:text-white"
            >
              수정
            </button>
            <button
              onClick={() => setAlertDelete(true)}
              className="w-15 rounded-xl border-2 border-red-500 bg-white px-3 py-0.5 text-sm font-bold text-red-500 hover:bg-red-500 hover:text-white"
            >
              삭제
            </button>
          </div>
        </div>
      )}
      <SuperModal modalOpen={alertDelete} setModalClose={() => setAlertDelete(false)} className="w-max">
        <div className="px-12 py-6">
          <div className="mb-6 w-full text-center text-lg font-bold text-gray-900">상담 기록을 삭제하시겠습니까?</div>
          <Button.lg
            children="삭제하기"
            onClick={() => {
              deleteCounseling(data.id)
              setAlertDelete(false)
            }}
            className="filled-primary w-full"
          />
        </div>
      </SuperModal>
    </div>
  )
}
