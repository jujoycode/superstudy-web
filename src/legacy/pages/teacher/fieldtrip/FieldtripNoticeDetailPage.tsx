import { useRef, useState } from 'react'
import { useHistory, useParams } from 'react-router'
import { SuperModal } from '@/legacy/components'
import { Blank } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { FieldtripPaper } from '@/legacy/components/fieldtrip/FieldtripPaper'
import { useTeacherFieldtripNoticeDetail } from '@/legacy/container/teacher-fieldtrip-notice-detail'
import { FieldtripStatus, School } from '@/legacy/generated/model'
import { useQueryParams } from '@/legacy/hooks/useQueryParams'
import { extractReactData, getDoc } from '@/legacy/util/pdf'
import { makeStartEndToString } from '@/legacy/util/time'

interface FieldtripNoticeDetailPageProps {
  school?: School
}

export function FieldtripNoticeDetailPage({ school }: FieldtripNoticeDetailPageProps) {
  const { id } = useParams<{ id: string }>()
  const { push } = useHistory()
  const { pushWithQueryParams } = useQueryParams()
  const ref = useRef(null)
  const [clicked, setClicked] = useState(false)

  const { isLoading, fieldtrip } = useTeacherFieldtripNoticeDetail(id)

  const [download, setDownload] = useState(false)

  if (!fieldtrip) {
    return null
  }

  if (fieldtrip?.fieldtripStatus !== FieldtripStatus.PROCESSED) {
    return (
      <div className="h-screen-7 relative flex items-center justify-center rounded-lg border bg-white py-5 text-center">
        <div className="absolute top-5 left-0">
          <div className="flex w-full items-center justify-start space-x-2 px-5">
            <div
              className="text-brand-1 cursor-pointer underline"
              onClick={() => pushWithQueryParams(`/teacher/fieldtrip/${fieldtrip.id}`)}
            >
              신청서
            </div>
            <div className="text-brand-1 cursor-pointer underline">통보서</div>
            <div
              className="text-brand-1 cursor-pointer underline"
              onClick={() => pushWithQueryParams(`/teacher/fieldtrip/result/${fieldtrip.id}`)}
            >
              결과보고서
            </div>
          </div>
        </div>
        <div>
          신청서가 아직 승인되지 않았습니다. <br />
          승인절차가 완료되면 통보서가 보호자 연락처로 발송됩니다.
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen-6 md:h-screen-7 bg-white py-5 md:rounded-lg md:border">
      {isLoading && <Blank reversed />}
      <div className="relative h-full w-auto overflow-scroll">
        <div className="flex w-full items-center justify-start space-x-2 px-5">
          <div
            className="text-brand-1 cursor-pointer underline"
            onClick={() => pushWithQueryParams(`/teacher/fieldtrip/${fieldtrip.id}`)}
          >
            신청서
          </div>
          <div className="text-brand-1 cursor-pointer underline">통보서</div>
          <div
            className="text-brand-1 cursor-pointer underline"
            onClick={() => pushWithQueryParams(`/teacher/fieldtrip/result/${fieldtrip.id}`)}
          >
            결과보고서
          </div>
        </div>
        <div ref={ref} className={`h-[1100px] ${download ? 'w-[778px] p-5' : 'w-full'} bg-white`}>
          <FieldtripPaper school={school} fieldtrip={fieldtrip} type="통보서" />
        </div>
      </div>

      <div className="hidden w-full items-center space-x-2 overflow-x-auto pt-8 md:flex">
        <Button.xl
          children="다운로드"
          disabled={clicked}
          onClick={() => {
            if (ref?.current) {
              setDownload(true)
            }
          }}
          className="filled-green w-full"
        />
      </div>
      <SuperModal modalOpen={download} setModalClose={() => setDownload(false)} className="w-max">
        <div className="px-12 py-6">
          <div className="mb-6 w-full text-center text-lg font-bold text-gray-900">
            체험학습 통보서를 다운로드 하시겠습니까?
          </div>
          <div className="flex space-x-2">
            <Button.lg
              children="다운로드"
              disabled={clicked}
              onClick={async () => {
                setClicked(true)
                if (ref?.current) {
                  const { addPage, download } = getDoc()

                  const fieldtripNoticeData = await extractReactData(ref.current)
                  await addPage(fieldtripNoticeData)

                  const fileName = `체험학습 통보서_${
                    fieldtrip?.startAt && fieldtrip?.endAt && makeStartEndToString(fieldtrip.startAt, fieldtrip.endAt)
                  }_${fieldtrip?.student?.name}.pdf`
                  await download(fileName)
                }
                setClicked(false)
                setDownload(false)
              }}
              className="filled-green w-full"
            />
            <Button.lg
              children="취소"
              onClick={async () => {
                setClicked(false)
                setDownload(false)
              }}
              className="filled-gray w-full"
            />
          </div>
        </div>
      </SuperModal>
    </div>
  )
}
