import { format } from 'date-fns'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router'
import { useRecoilValue } from 'recoil'

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
import { useIBInterviewDelete, useIBInterviewUpdate, useInterviewQNA } from '@/legacy/container/ib-student-interview'
import { RequestCreateQnaDto } from '@/legacy/generated/model'
import { meState } from '@/stores'

export default function CASInterviewDetailPage() {
  const history = useHistory()

  const me = useRecoilValue(meState)
  const { qnaId: qnaIdParam } = useParams<{ id: string; qnaId: string }>()

  const qnaId = Number(qnaIdParam)
  const { data: interview, isLoading, refetch } = useInterviewQNA(qnaId)

  const [confirmOpen, setConfirmOpen] = useState<boolean>(false)
  const [alertMessage, setAlertMessage] = useState<string | null>(null)

  const { updateIBInterview } = useIBInterviewUpdate({
    onSuccess: () => {
      setAlertMessage(`인터뷰가\n저장되었습니다`)
      refetch()
    },
    onError: (error) => {
      console.error('인터뷰 수정 중 오류 발생:', error)
    },
  })

  const { deleteIBInterview } = useIBInterviewDelete({
    onSuccess: () => {
      setConfirmOpen(!confirmOpen)
      history.push('/ib/student/portfolio', {
        alertMessage: `인터뷰가\n삭제되었습니다`,
      })
    },
    onError: (error) => {
      console.error('인터뷰 삭제 중 오류 발생:', error)
    },
  })

  const [editMode, setEditMode] = useState<boolean>(false)

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<RequestCreateQnaDto>({
    defaultValues: {
      content: interview?.qna.content.map((item) => ({
        question: item.question,
        answer: item.answer || '',
      })),
    },
  })

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
      {isLoading && <IBBlank />}
      <IBLayout
        topContent={
          <div>
            <div className="w-full pt-16 pb-6">
              <div className="flex flex-col items-start gap-3">
                <div className="flex w-full flex-row items-center justify-between">
                  <div className="flex flex-row gap-1">
                    <BadgeV2 color="navy" size={24} type="solid_strong">
                      CAS
                    </BadgeV2>
                  </div>
                  <Breadcrumb
                    data={{
                      'CAS Portfolio': '/ib/student/portfolio',
                      '인터뷰 · 성찰 일지': `/ib/student/portfolio`,
                    }}
                  />
                </div>
                <Typography variant="heading" className="w-[692px] overflow-hidden text-ellipsis whitespace-nowrap">
                  인터뷰 · 성찰 일지
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
                      {interview.qna.content.map((item, index) => {
                        if (!item.added) {
                          return (
                            <div key={index} className="flex flex-col gap-3">
                              <div className="flex flex-row items-start">
                                <Typography variant="title3" className="text-primary-orange-800">
                                  Q{interview.qna.content.filter((i, idx) => !i.added && idx < index).length + 1}.&nbsp;
                                </Typography>
                                <input type="hidden" value={item.question} {...register(`content.${index}.question`)} />
                                <Typography variant="title3">{item.question}</Typography>
                              </div>
                              <TextareaV2
                                placeholder={item.hint}
                                className="h-24"
                                value={item.answer}
                                {...register(`content.${index}.answer`)}
                              />
                            </div>
                          )
                        }
                        return null
                      })}

                      {/* 추가 질문 */}
                      {interview.qna.content.map((item, index) => {
                        if (item.added) {
                          return (
                            <div
                              key={index}
                              className="border-t-primary-gray-200 flex flex-col gap-3 border-t pt-6 pb-10"
                            >
                              <Typography variant="title2">개별 질문</Typography>
                              <div className="flex flex-row items-start">
                                <Typography variant="title3" className="text-primary-orange-800">
                                  Q{interview.qna.content.filter((i, idx) => i.added && idx < index).length + 1}.&nbsp;
                                </Typography>
                                <input type="hidden" value={item.question} {...register(`content.${index}.question`)} />
                                <Typography variant="title3">{item.question}</Typography>
                              </div>
                              <TextareaV2
                                placeholder={item.hint}
                                className="h-24"
                                value={item.answer}
                                {...register(`content.${index}.answer`)}
                              />
                            </div>
                          )
                        }
                        return null
                      })}
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
                      {/* 기본 질문 */}
                      {interview.qna.content
                        .filter((item) => !item.added)
                        .map((item, index) => (
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

                      {/* 추가 질문이 있는 경우에만 표시 */}
                    </div>
                    {interview.qna.content.some((item) => item.added) && (
                      <div className="border-t-primary-gray-200 flex flex-col gap-3 border-t pt-6 pb-10">
                        <Typography variant="title2">개별 질문</Typography>
                        {interview.qna.content
                          .filter((item) => item.added)
                          .map((item, index) => (
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
                    )}
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
                        <ButtonV2
                          size={40}
                          variant="outline"
                          color="gray400"
                          onClick={() => {
                            setEditMode(!editMode)
                            reset(interview.qna)
                          }}
                        >
                          수정
                        </ButtonV2>
                        <ButtonV2
                          size={40}
                          variant="outline"
                          color="gray400"
                          onClick={() => setConfirmOpen(!confirmOpen)}
                        >
                          삭제
                        </ButtonV2>
                      </div>
                      <ButtonV2
                        size={40}
                        variant="solid"
                        color="gray100"
                        onClick={() => history.push(`/ib/student/portfolio`)}
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
                  <Feedback referenceId={qnaId} referenceTable="INTERVIEW" user={me} />
                </div>
              </div>
            </div>
          </div>
        }
        bottomBgColor="bg-primary-gray-50"
      />
      {alertMessage && (
        <AlertV2
          message={alertMessage}
          confirmText="확인"
          onConfirm={() => {
            setAlertMessage(null)
          }}
        />
      )}
      {confirmOpen && (
        <AlertV2
          message={`인터뷰를 삭제하시겠습니까?`}
          confirmText="확인"
          cancelText="취소"
          description={`삭제 후 다시 되돌릴 수 없습니다.`}
          onCancel={() => setConfirmOpen(!confirmOpen)}
          onConfirm={() => deleteIBInterview(qnaId)}
        />
      )}
    </div>
  )
}
