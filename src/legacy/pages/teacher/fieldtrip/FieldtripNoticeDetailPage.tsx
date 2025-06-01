import { useRef, useState } from 'react'
import { useOutletContext, useParams } from 'react-router'
import { Button } from '@/atoms/Button'
import { Flex } from '@/atoms/Flex'
import { Tabs, TabsList, TabsTrigger } from '@/atoms/Tabs'
import { Text } from '@/atoms/Text'
import { IconButton } from '@/molecules/IconButton'
import { SuperModal } from '@/legacy/components'
import { Blank } from '@/legacy/components/common'
import { FieldtripPaper } from '@/legacy/components/fieldtrip/FieldtripPaper'
import { useTeacherFieldtripNoticeDetail } from '@/legacy/container/teacher-fieldtrip-notice-detail'
import { FieldtripStatus, School } from '@/legacy/generated/model'
import { useQueryParams } from '@/legacy/hooks/useQueryParams'
import { extractReactData, getDoc } from '@/legacy/util/pdf'
import { makeStartEndToString } from '@/legacy/util/time'

interface FieldtripNoticeDetailPageProps {
  school?: School
}

export function FieldtripNoticeDetailPage() {
  const { school } = useOutletContext<FieldtripNoticeDetailPageProps>()
  const { id = '' } = useParams<{ id: string }>()
  const { pushWithQueryParams } = useQueryParams()
  const ref = useRef(null)
  const [clicked, setClicked] = useState(false)
  const [download, setDownload] = useState(false)

  const { isLoading, fieldtrip } = useTeacherFieldtripNoticeDetail(id)

  if (!fieldtrip) {
    return null
  }

  if (fieldtrip?.fieldtripStatus !== FieldtripStatus.PROCESSED) {
    return (
      <div className="h-screen-7 relative m-6 flex flex-col items-center rounded-lg border bg-white py-5 text-center">
        <Tabs defaultValue="tab2" className="w-full px-3 pb-2">
          <TabsList className="w-full">
            <TabsTrigger
              value="tab1"
              onClick={() => fieldtrip && pushWithQueryParams(`/teacher/fieldtrip/${fieldtrip.id}`)}
            >
              신청서
            </TabsTrigger>
            <TabsTrigger
              value="tab2"
              onClick={() => fieldtrip && pushWithQueryParams(`/teacher/fieldtrip/notice/${fieldtrip.id}`)}
            >
              통보서
            </TabsTrigger>
            <TabsTrigger
              value="tab3"
              onClick={() => fieldtrip && pushWithQueryParams(`/teacher/fieldtrip/result/${fieldtrip.id}`)}
            >
              결과보고서
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Flex direction="row" items="center" justify="center" className="h-full gap-2">
          신청서가 아직 승인되지 않았습니다. <br />
          승인절차가 완료되면 통보서가 보호자 연락처로 발송됩니다.
        </Flex>
      </div>
    )
  }

  return (
    <div className="h-screen-6 md:h-screen-3 m-6 bg-white py-5 md:rounded-lg md:border">
      {isLoading && <Blank reversed />}
      <div className="h-screen-8 relative w-full overflow-y-scroll">
        <Tabs defaultValue="tab2" className="w-full px-3 pb-2">
          <TabsList className="w-full">
            <TabsTrigger
              value="tab1"
              onClick={() => fieldtrip && pushWithQueryParams(`/teacher/fieldtrip/${fieldtrip.id}`)}
            >
              신청서
            </TabsTrigger>
            <TabsTrigger
              value="tab2"
              onClick={() => fieldtrip && pushWithQueryParams(`/teacher/fieldtrip/notice/${fieldtrip.id}`)}
            >
              통보서
            </TabsTrigger>
            <TabsTrigger
              value="tab3"
              onClick={() => fieldtrip && pushWithQueryParams(`/teacher/fieldtrip/result/${fieldtrip.id}`)}
            >
              결과보고서
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div ref={ref} className={`h-[1100px] ${download ? 'w-[778px] p-5' : 'w-full'} bg-white`}>
          <FieldtripPaper school={school} fieldtrip={fieldtrip} type="통보서" />
        </div>
      </div>
      <Flex direction="row" items="center" justify="start" className="px-3 pt-3">
        <IconButton
          position="front"
          iconName="Download"
          color="tertiary"
          variant="solid"
          stroke
          strokeWidth={2}
          disabled={clicked}
          onClick={async () => {
            if (ref?.current) {
              setDownload(true)
            }
          }}
        >
          <Text variant="default" size="sm" weight="sm">
            다운로드
          </Text>
        </IconButton>
      </Flex>
      <SuperModal modalOpen={download} setModalClose={() => setDownload(false)} className="w-max">
        <div className="px-12 py-6">
          <div className="mb-6 w-full text-center text-lg font-bold text-gray-900">
            체험학습 통보서를 다운로드 하시겠습니까?
          </div>
          <div className="flex space-x-2">
            <Button
              children="취소"
              onClick={async () => {
                setClicked(false)
                setDownload(false)
              }}
              color="tertiary"
              variant="solid"
              className="flex-1"
            />
            <Button
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
              color="primary"
              variant="solid"
              className="flex-1"
            />
          </div>
        </div>
      </SuperModal>
    </div>
  )
}
