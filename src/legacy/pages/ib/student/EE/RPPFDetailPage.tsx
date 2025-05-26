import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useParams } from 'react-router'

import { useHistory } from '@/hooks/useHistory'
import { cn } from '@/utils/commonUtil'
import { useUserStore } from '@/stores/user'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { BadgeV2 } from '@/legacy/components/common/BadgeV2'
import Breadcrumb from '@/legacy/components/common/Breadcrumb'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { IBBlank } from '@/legacy/components/common/IBBlank'
import { TextareaV2 } from '@/legacy/components/common/TextareaV2'
import { Typography } from '@/legacy/components/common/Typography'
import { IbEeRPPF } from '@/legacy/components/ib/ee/IbEeRPPF'
import { Feedback } from '@/legacy/components/ib/Feedback'
import IBLayout from '@/legacy/components/ib/IBLayout'
import { useIBDeadline } from '@/legacy/container/ib-deadline'
import { useIBRPPFCreate } from '@/legacy/container/ib-rppf-create'
import { useRPPFGetById } from '@/legacy/container/ib-rppf-findId'
import { RequestCreateRPPFDto, ResponseIBDto } from '@/legacy/generated/model'

interface LocationState {
  title: string
  data: ResponseIBDto
}

export default function RPPFDetailPage() {
  const history = useHistory()
  const location = useLocation()
  const title = location.state?.title as LocationState['title']
  const data = location.state?.data as LocationState['data']

  const { me } = useUserStore()
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const { id, rppfId } = useParams<{ id: string; rppfId: string }>()

  const { data: rppf, isLoading, refetch } = useRPPFGetById(Number(id), Number(rppfId))
  const { deadline } = useIBDeadline({ type: 'IB_EE', model: 'RPPF' })

  const { createIBRPPF, isLoading: isCreateLoading } = useIBRPPFCreate({
    onSuccess: () => {
      setAlertMessage(`RPPF가\n수정되었습니다`)
    },
    onError: (error) => {
      console.error('RPPF 생성 중 오류 발생:', error)
    },
  })

  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const [editMode, setEditMode] = useState<boolean>(false)
  const [wordCounts, setWordCounts] = useState<number[]>([])

  const handleSuccess = () => {
    setAlertMessage(`RPPF가\n저장되었습니다`)
    setModalOpen(!modalOpen)
    refetch()
  }

  useEffect(() => {
    if (rppf?.contents) {
      const initialWordCounts = rppf.contents.map((content) => Number(content.wordCount) || 0)
      setWordCounts(initialWordCounts)
    }
  }, [rppf])

  const handleWordCountChange = (index: number, count: number) => {
    setWordCounts((prev) => {
      const updatedCounts = [...prev]
      updatedCounts[index] = count
      return updatedCounts
    })
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: {},
  } = useForm<RequestCreateRPPFDto>({
    defaultValues: {
      contents:
        rppf?.contents.map((data) => ({
          id: data.id,
          sequence: data.sequence,
          text: data.text || '',
          wordCount: Number(data.wordCount) || 0,
        })) || [],
    },
  })

  // 수정 버튼 클릭
  const onEdit = () => {
    setEditMode(true)
    reset(rppf)
  }

  const onSubmit = (data: RequestCreateRPPFDto) => {
    if (isCreateLoading) return
    const filteredContents = data.contents
      .map((content, index) => ({
        ...content,
        id: content.id,
        sequence: index + 1,
        wordCount: wordCounts[index],
      }))
      .filter((content) => content.text && content.text.trim() !== '')

    const updatedData = {
      ...data,
      contents: filteredContents,
    }

    if (id !== undefined) {
      createIBRPPF({ ibId: Number(id), data: updatedData })
    }
    setEditMode(!editMode)
  }

  if (me === undefined) {
    return <IBBlank />
  }
  return (
    <div className="col-span-6">
      {(isLoading || isCreateLoading) && <IBBlank />}
      <IBLayout
        topContent={
          <div>
            <div className="w-full pt-16 pb-6">
              <div className="flex flex-col items-start gap-3">
                <div className="flex w-full flex-row items-center justify-between">
                  <div className="flex flex-row gap-1">
                    <BadgeV2 color="dark_green" size={24} type="solid_strong" className="self-start px-[12.5px]">
                      EE
                    </BadgeV2>
                    <BadgeV2 color="gray" size={24} type="solid_regular" className="self-start">
                      RPPF
                    </BadgeV2>
                  </div>
                  <Breadcrumb
                    data={{
                      진행상태: '/ib/student',
                      EE: `/ib/student/ee/${id}`,
                      'RPPF 상세': `/ib/student/ee/${id}/rppf/${rppfId}`,
                    }}
                  />
                </div>
                <Typography variant="heading" className="w-[692px] overflow-hidden text-ellipsis whitespace-nowrap">
                  {title}
                </Typography>
              </div>
            </div>
          </div>
        }
        bottomContent={
          <div className="flex grow flex-col">
            <div className="flex h-full flex-row gap-4 py-6">
              <div className="flex w-[848px] flex-col justify-between rounded-xl bg-white p-6">
                {editMode ? (
                  <>
                    <form>
                      <div className="scroll-box flex h-full flex-col gap-6 overflow-auto pt-4">
                        <div className="flex flex-row items-center justify-between">
                          <Typography variant="title1">공식 RPPF</Typography>
                          <div className="text-12 flex flex-row items-center">
                            <p className="text-gray-500">총 단어 수</p>&nbsp;
                            <p className="text-primary-800 font-medium">
                              {wordCounts.reduce((sum, count) => sum + count, 0)}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col">
                          {rppf?.contents.map((content, index) => (
                            <div
                              className={cn('flex flex-col gap-4', {
                                'pt-6': index === 0,
                                'py-10': index === 1,
                                'pb-10': index === 2,
                              })}
                              key={content.id}
                            >
                              <div className="flex items-center justify-between">
                                <Typography variant="title2">RPPF {content.sequence}차</Typography>
                                <Typography variant="caption" className="text-gray-500">
                                  최초 저장일 : {format(new Date(content.createdAt), 'yyyy.MM.dd')}
                                </Typography>
                              </div>
                              <input
                                type="hidden"
                                value={Number(content.id)} // Ensure id is an integer
                                {...register(`contents.${index}.id`, { valueAsNumber: true })}
                              />

                              <TextareaV2
                                showWordCount={true}
                                onWordCountChange={(count) => handleWordCountChange(index, count)}
                                value={content.text}
                                placeholder="내용을 입력해주세요."
                                className="h-[308px]"
                                {...register(`contents.${index}.text` as const)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="flex flex-col">
                    <div className="flex flex-row items-center justify-between">
                      <Typography variant="title1">공식 RPPF</Typography>
                      <div className="text-12 flex flex-row items-center">
                        <p className="text-gray-500">총 단어 수</p>&nbsp;
                        <p className="text-primary-800 font-medium">
                          {wordCounts.reduce((sum, count) => sum + count, 0)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      {rppf?.contents.map((content, index) => (
                        <div
                          className={cn('flex flex-col gap-4', {
                            'pt-6': index === 0,
                            'py-10': index === 1,
                            'pb-10': index === 2,
                          })}
                          key={content.id}
                        >
                          <div className="flex items-center justify-between">
                            <Typography variant="title2">RPPF {content.sequence}차</Typography>
                            <Typography variant="caption" className="text-gray-500">
                              최초 저장일 : {format(new Date(content.createdAt), 'yyyy.MM.dd')}
                            </Typography>
                          </div>
                          <div className="flex flex-col gap-4 rounded-lg border border-gray-200 p-4">
                            <Typography variant="body2">{content.text}</Typography>
                            <div className="text-12 flex flex-row items-center">
                              <p className="text-gray-500">단어 수</p>&nbsp;
                              <p className="text-primary-800 font-medium">{content.wordCount}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <footer className={`flex flex-row items-center justify-between`}>
                  {editMode ? (
                    <>
                      <ButtonV2 size={40} variant="solid" color="gray100" onClick={() => setEditMode(!editMode)}>
                        취소
                      </ButtonV2>
                      <ButtonV2 size={40} variant="solid" color="orange100" onClick={handleSubmit(onSubmit)}>
                        저장하기
                      </ButtonV2>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-row items-center gap-2">
                        {data?.status !== 'COMPLETE' && (
                          <ButtonV2
                            size={40}
                            variant="outline"
                            color="gray400"
                            onClick={onEdit}
                            disabled={data?.status === 'WAIT_COMPLETE'}
                          >
                            수정
                          </ButtonV2>
                        )}
                      </div>
                      {/* 목록 돌아가기 버튼 */}
                      <ButtonV2
                        size={40}
                        variant="solid"
                        color="gray100"
                        onClick={() => history.push(`/ib/student/ee/${id}`, { type: 'RPPF' })}
                      >
                        목록 돌아가기
                      </ButtonV2>
                    </>
                  )}
                </footer>
              </div>
              <div className="flex h-[720px] w-[416px] flex-col gap-6 rounded-xl bg-white p-6">
                <Typography variant="title1">진행기록</Typography>
                <div className="h-full w-full">
                  <Feedback
                    referenceId={Number(rppfId)}
                    referenceTable="RPPF"
                    user={me}
                    useTextarea={data?.status !== 'COMPLETE'}
                  />
                </div>
              </div>
            </div>
          </div>
        }
        bottomBgColor="bg-gray-50"
        floatingButton={
          !editMode &&
          (() => {
            if (data?.status === 'COMPLETE') {
              return null
            }

            const currentDate = new Date()

            // 작성 가능 여부 확인 함수
            const isRPPFWritable = (type: string) => {
              const deadlineItem = deadline?.find((item) => item.type === type)
              if (!deadlineItem) return false

              // 이전 단계의 RPPF 마감기한 확인
              const previousDeadlineItem = deadline?.find(
                (item) => item.type === `EE_RPPF_${Number(type.split('_')[2]) - 1}`,
              )

              // 현재 단계의 작성 가능 여부
              const isWithinCurrentDeadline = currentDate <= new Date(deadlineItem.deadlineTime)

              // 이전 단계의 마감기한을 넘었는지 확인
              const isAfterPreviousDeadline = previousDeadlineItem
                ? currentDate > new Date(previousDeadlineItem.deadlineTime)
                : true // 이전 단계가 없으면 true

              // 해당 RPPF 데이터가 없는지 확인
              const hasNoData = !rppf?.contents.some((content) => content.sequence === Number(type.split('_')[2]))

              return isWithinCurrentDeadline && isAfterPreviousDeadline && hasNoData
            }

            // 작성 버튼 출력 여부
            const showWriteRPPF2 = isRPPFWritable('EE_RPPF_2')
            const showWriteRPPF3 = isRPPFWritable('EE_RPPF_3')

            if (showWriteRPPF2 || showWriteRPPF3) {
              return (
                <ButtonV2
                  variant="solid"
                  color="orange800"
                  size={48}
                  className="w-[416px]"
                  onClick={() => setModalOpen(!modalOpen)}
                >
                  작성하기
                </ButtonV2>
              )
            }

            return null
          })()
        }
      />

      {modalOpen && (
        <IbEeRPPF
          modalOpen={modalOpen}
          setModalClose={() => setModalOpen(!modalOpen)}
          projectId={Number(id)}
          RPPFData={rppf}
          onSuccess={() => handleSuccess()}
        />
      )}

      {alertMessage && <AlertV2 message={alertMessage} confirmText="확인" onConfirm={() => setAlertMessage(null)} />}
    </div>
  )
}
