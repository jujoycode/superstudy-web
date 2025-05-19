import { format } from 'date-fns'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useParams } from 'react-router'

import { useHistory } from '@/hooks/useHistory'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { BadgeV2 } from '@/legacy/components/common/BadgeV2'
import Breadcrumb from '@/legacy/components/common/Breadcrumb'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { IBBlank } from '@/legacy/components/common/IBBlank'
import { TextareaV2 } from '@/legacy/components/common/TextareaV2'
import { Typography } from '@/legacy/components/common/Typography'
import { Feedback } from '@/legacy/components/ib/Feedback'
import IBLayout from '@/legacy/components/ib/IBLayout'
import { IbTKPPF } from '@/legacy/components/ib/tok/IbTKPPF'
import { useIBDeadline } from '@/legacy/container/ib-deadline'
import { useIBTKPPFCreate, useTKPPFGetByIBId } from '@/legacy/container/ib-tok-essay'
import { RequestCreateTKPPFDto, ResponseIBDto } from '@/legacy/generated/model'
import { useUserStore } from '@/stores/user'

interface LocationState {
  title: string
  data: ResponseIBDto
}

export default function TKPPFDetailPage() {
  const history = useHistory()
  const location = useLocation()
  const title = location.state?.title as LocationState['title']
  const data = location.state?.data as LocationState['data']

  const { me } = useUserStore()
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const { id, tkppfId } = useParams<{ id: string; tkppfId: string }>()

  const { data: tkppf, isLoading, refetch } = useTKPPFGetByIBId(Number(id))
  const { deadline } = useIBDeadline({ type: 'IB_TOK', model: 'TKPPF' })

  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const [editMode, setEditMode] = useState<boolean>(false)

  const handleSuccess = () => {
    setAlertMessage(`TKPPF가\n저장되었습니다`)
    setModalOpen(!modalOpen)
    refetch()
  }

  const { createIBTKPPF, isLoading: isCreateLoading } = useIBTKPPFCreate({
    onSuccess: () => {
      setAlertMessage(`TKPPF가\n수정되었습니다`)
      setEditMode(false)
    },
    onError: (error) => {
      console.error('TKPPF 생성 중 오류 발생:', error)
    },
  })

  const { register, handleSubmit, reset } = useForm<RequestCreateTKPPFDto>()

  // 수정 버튼 클릭
  const onEdit = () => {
    setEditMode(true)
    reset(tkppf)
  }

  const onSubmit = (formData: RequestCreateTKPPFDto) => {
    if (isCreateLoading) return
    const filteredData = {
      ...(formData.sequence1?.text?.trim() ? { sequence1: formData.sequence1 } : {}),
      ...(formData.sequence2?.text?.trim() ? { sequence2: formData.sequence2 } : {}),
      ...(formData.sequence3?.text?.trim() ? { sequence3: formData.sequence3 } : {}),
    }

    if (data.id !== undefined) {
      createIBTKPPF({ ibId: data.id, data: filteredData })
    }
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
                    <BadgeV2 color="brown" size={24} type="solid_strong">
                      TOK
                    </BadgeV2>
                    <BadgeV2 color="gray" size={24} type="solid_regular">
                      TKPPF
                    </BadgeV2>
                  </div>
                  <Breadcrumb
                    data={{
                      진행상태: '/ib/student',
                      'TOK 에세이': `/ib/student/tok/essay/${id}`,
                      'TKPPF 상세': `/ib/student/tok/essay/${id}/tkppf${tkppfId}`,
                    }}
                  />
                </div>
                <Typography variant="heading" className="w-[692px] overflow-hidden text-ellipsis whitespace-nowrap">
                  {title} - TKPPF
                </Typography>
              </div>
            </div>
          </div>
        }
        bottomContent={
          <div className="flex flex-grow flex-col">
            <div className="flex h-full flex-row gap-4 py-6">
              <div className="flex w-[848px] flex-col justify-between gap-10 rounded-xl bg-white p-6">
                {editMode ? (
                  <>
                    <form>
                      <div className="scroll-box flex h-full flex-col gap-10 overflow-auto">
                        {tkppf?.sequence1 && (
                          <div className="flex flex-col gap-4">
                            <div className="flex flex-row items-center justify-between gap-2">
                              <Typography variant="title2" className="font-semibold">
                                TKPPF 1차
                              </Typography>
                            </div>
                            <TextareaV2
                              placeholder="내용을 입력해주세요."
                              className="h-[308px]"
                              readonlyBackground="bg-gray-100"
                              value={tkppf?.sequence1?.text}
                              {...register(`sequence1.text`)}
                            />
                          </div>
                        )}
                        {tkppf?.sequence2 && (
                          <div className="flex flex-col gap-4">
                            <div className="flex flex-row items-center justify-between gap-2">
                              <Typography variant="title2" className="font-semibold">
                                TKPPF 2차
                              </Typography>
                            </div>
                            <TextareaV2
                              placeholder="내용을 입력해주세요."
                              className="h-[308px]"
                              readonlyBackground="bg-gray-100"
                              value={tkppf?.sequence2?.text}
                              {...register(`sequence2.text`)}
                            />
                          </div>
                        )}
                        {tkppf?.sequence3 && (
                          <div className="flex flex-col gap-4">
                            <div className="flex flex-row items-center justify-between gap-2">
                              <Typography variant="title2" className="font-semibold">
                                TKPPF 3차
                              </Typography>
                            </div>
                            <TextareaV2
                              placeholder="내용을 입력해주세요."
                              className="h-[308px]"
                              readonlyBackground="bg-gray-100"
                              value={tkppf?.sequence3?.text}
                              {...register(`sequence3.text`)}
                            />
                          </div>
                        )}
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="flex flex-col">
                    <div className="flex flex-row items-center justify-between">
                      <Typography variant="title1">공식 TKPPF</Typography>
                    </div>
                    <div className="flex flex-col">
                      {tkppf?.sequence1 && (
                        <div className={'flex flex-col gap-4 pt-6'}>
                          <div className="flex items-center justify-between">
                            <Typography variant="title2">TKPPF 1차</Typography>
                            <Typography variant="caption" className="text-gray-500">
                              최초 제출일 : {format(new Date(tkppf?.sequence1.createdAt), 'yyyy.MM.dd')}
                            </Typography>
                          </div>
                          <div className="flex flex-col gap-4 rounded-lg border border-gray-200 p-4">
                            <Typography variant="body2">{tkppf?.sequence1.text}</Typography>
                          </div>
                        </div>
                      )}
                      {tkppf?.sequence2 && (
                        <div className={'flex flex-col gap-4 py-10'}>
                          <div className="flex items-center justify-between">
                            <Typography variant="title2">TKPPF 2차</Typography>
                            <Typography variant="caption" className="text-gray-500">
                              최초 제출일 : {format(new Date(tkppf?.sequence2.createdAt), 'yyyy.MM.dd')}
                            </Typography>
                          </div>
                          <div className="flex flex-col gap-4 rounded-lg border border-gray-200 p-4">
                            <Typography variant="body2">{tkppf?.sequence2.text}</Typography>
                          </div>
                        </div>
                      )}
                      {tkppf?.sequence3 && (
                        <div className={'flex flex-col gap-4'}>
                          <div className="flex items-center justify-between">
                            <Typography variant="title2">TKPPF 3차</Typography>
                            <Typography variant="caption" className="text-gray-500">
                              최초 제출일 : {format(new Date(tkppf?.sequence3.createdAt), 'yyyy.MM.dd')}
                            </Typography>
                          </div>
                          <div className="flex flex-col gap-4 rounded-lg border border-gray-200 p-4">
                            <Typography variant="body2">{tkppf?.sequence3.text}</Typography>
                          </div>
                        </div>
                      )}
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
                      <ButtonV2
                        size={40}
                        variant="solid"
                        color="gray100"
                        onClick={() => history.push(`/ib/student/tok/essay/${id}`, { type: 'TKPPF' })}
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
                    referenceId={Number(tkppfId)}
                    referenceTable="TKPPF"
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
            const isTKPPFWritable = (type: string) => {
              const deadlineItem = deadline?.find((item) => item.type === type)
              if (!deadlineItem) return false

              // 이전 단계의 TKPPF 마감기한 확인
              const previousDeadlineItem = deadline?.find(
                (item) => item.type === `TOK_TKPPF_${Number(type.split('_')[2]) - 1}`,
              )

              // 현재 단계의 작성 가능 여부
              const isWithinCurrentDeadline = currentDate <= new Date(deadlineItem.deadlineTime)

              // 이전 단계의 마감기한을 넘었는지 확인
              const isAfterPreviousDeadline = previousDeadlineItem
                ? currentDate > new Date(previousDeadlineItem.deadlineTime)
                : true // 이전 단계가 없으면 true

              // 해당 sequence 데이터가 없는지 확인
              const hasNoData =
                (type === 'TOK_TKPPF_2' && !tkppf?.sequence2?.text?.trim()) ||
                (type === 'TOK_TKPPF_3' && !tkppf?.sequence3?.text?.trim())

              return isWithinCurrentDeadline && isAfterPreviousDeadline && hasNoData
            }

            // 작성 버튼 출력 여부
            const showWriteRPPF2 = isTKPPFWritable('TOK_TKPPF_2')
            const showWriteRPPF3 = isTKPPFWritable('TOK_TKPPF_3')

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
        <IbTKPPF
          modalOpen={modalOpen}
          setModalClose={() => setModalOpen(!modalOpen)}
          projectId={Number(id)}
          TKPPFData={tkppf}
          onSuccess={() => handleSuccess()}
        />
      )}
      {alertMessage && <AlertV2 message={alertMessage} confirmText="확인" onConfirm={() => setAlertMessage(null)} />}
    </div>
  )
}
