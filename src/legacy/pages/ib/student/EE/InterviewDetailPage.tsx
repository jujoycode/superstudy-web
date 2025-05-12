import { format } from 'date-fns'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useHistory, useLocation, useParams } from 'react-router'
import { useRecoilValue } from 'recoil'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { BadgeV2 } from '@/legacy/components/common/BadgeV2'
import Breadcrumb from '@/legacy/components/common/Breadcrumb'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { IBBlank } from '@/legacy/components/common/IBBlank'
import { TextareaV2 } from '@/legacy/components/common/TextareaV2'
import { Typography } from '@/legacy/components/common/Typography'
import { Feedback } from '@/legacy/components/ib/Feedback'
import IBLayout from '@/legacy/components/ib/IBLayout'
import { useIBGetById } from '@/legacy/container/ib-project-get-student'
import { useIBInterviewUpdate, useInterviewQNA } from '@/legacy/container/ib-student-interview'
import { RequestCreateQnaDto } from '@/legacy/generated/model'
import { meState } from '@/stores'

interface LocationState {
  title: string
}

export default function InterviewDetailPage() {
  const history = useHistory()
  const location = useLocation<LocationState>()
  const title = location.state?.title

  const me = useRecoilValue(meState)
  const { id: idParam, qnaId: qnaIdParam } = useParams<{ id: string; qnaId: string }>()
  const { data: ibData } = useIBGetById(Number(idParam))
  const id = Number(idParam)
  const qnaId = Number(qnaIdParam)
  const { data: interview, isLoading } = useInterviewQNA(qnaId)

  const { updateIBInterview, isLoading: isUpdateLoading } = useIBInterviewUpdate({
    onSuccess: () => {
      setAlertMessage(`인터뷰가\n수정되었습니다`)
    },
    onError: (error) => {
      console.error('인터뷰 수정 중 오류 발생:', error)
    },
  })

  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const [editMode, setEditMode] = useState<boolean>(false)

  const {
    handleSubmit,
    reset,
    register,
    formState: { errors },
  } = useForm<RequestCreateQnaDto>({
    defaultValues: {
      content: interview?.qna.content.map((item) => ({
        question: item.question,
        answer: item.answer || '',
      })),
    },
  })

  // 수정 버튼 클릭
  const onEdit = () => {
    setEditMode(true)
    reset(interview?.qna)
  }

  const onSubmit = (formData: RequestCreateQnaDto) => {
    if (isLoading) return
    updateIBInterview({ id: qnaId, data: formData })
    setEditMode(!editMode)
  }

  if (interview === undefined) {
    return <IBBlank />
  }

  if (me === undefined) {
    return <IBBlank />
  }

  return (
    <div className="col-span-6">
      {(isLoading || isUpdateLoading) && <IBBlank />}
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
                      '인터뷰 상세': `/ib/student/ee/${id}/interview/${interview.id}`,
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
          <div className="flex flex-grow flex-col">
            <div className="flex h-full flex-row gap-4 py-6">
              <div className="flex w-[848px] flex-col justify-between rounded-xl bg-white p-6">
                {editMode ? (
                  <div className="flex flex-col gap-3 pt-4">
                    <div className="border-b-primary-gray-100 flex flex-col items-start gap-1 border-b pb-6">
                      <Typography variant="title1">{interview.title}</Typography>
                      <Typography variant="body3" className="text-primary-gray-500">
                        {format(new Date(interview.qna.createdAt), 'yyyy.MM.dd')}
                      </Typography>
                    </div>
                    <div className="flex flex-col gap-10 pt-6 pb-10">
                      {interview.qna.content.map((item, index) => (
                        <div key={index} className="flex flex-col gap-3">
                          <div className="flex flex-row items-start">
                            <Typography variant="title3" className="text-primary-orange-800">
                              Q{index + 1}.&nbsp;
                            </Typography>
                            <input type="hidden" value={item.question} {...register(`content.${index}.question`)} />
                            <Typography variant="title3">{item.question}</Typography>
                          </div>
                          <TextareaV2
                            placeholder="답변을 입력해주세요"
                            className="h-24"
                            value={item.answer}
                            {...register(`content.${index}.answer`)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <div className="border-b-primary-gray-100 flex flex-col items-start gap-1 border-b pb-6">
                      <Typography variant="title1">{interview.title}</Typography>
                      <Typography variant="body3" className="text-primary-gray-500">
                        {format(new Date(interview.qna.createdAt), 'yyyy.MM.dd')}
                      </Typography>
                    </div>
                    <div className="flex flex-col gap-10 pt-6 pb-10">
                      {interview.qna.content.map((item, index) => (
                        <div key={index} className="flex flex-col gap-3">
                          <div className="flex flex-row items-start">
                            <Typography variant="title3" className="text-primary-orange-800">
                              Q{index + 1}.&nbsp;
                            </Typography>
                            <Typography variant="title3">{item.question}</Typography>
                          </div>
                          <div className="border-primary-gray-200 rounded-lg border p-4">
                            <Typography variant="body2" className="font-medium">
                              {item.answer}
                            </Typography>
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
                        {ibData?.status !== 'COMPLETE' && (
                          <ButtonV2
                            size={40}
                            variant="outline"
                            color="gray400"
                            onClick={onEdit}
                            disabled={ibData?.status === 'WAIT_COMPLETE'}
                          >
                            수정
                          </ButtonV2>
                        )}
                      </div>
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
                    referenceId={qnaId}
                    referenceTable="INTERVIEW"
                    user={me}
                    useTextarea={ibData?.status !== 'COMPLETE'}
                  />
                </div>
              </div>
            </div>
          </div>
        }
        bottomBgColor="bg-primary-gray-50"
      />
      {alertMessage && <AlertV2 message={alertMessage} confirmText="확인" onConfirm={() => setAlertMessage(null)} />}
    </div>
  )
}
