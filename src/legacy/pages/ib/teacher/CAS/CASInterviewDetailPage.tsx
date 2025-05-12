import { format } from 'date-fns'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useHistory, useParams } from 'react-router-dom'
import { useRecoilValue } from 'recoil'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { BadgeV2 } from '@/legacy/components/common/BadgeV2'
import Breadcrumb from '@/legacy/components/common/Breadcrumb'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { Icon } from '@/legacy/components/common/icons'
import { Input } from '@/legacy/components/common/Input'
import { TextareaV2 } from '@/legacy/components/common/TextareaV2'
import { Typography } from '@/legacy/components/common/Typography'
import { Feedback } from '@/legacy/components/ib/Feedback'
import IBLayout, { ScrollRef } from '@/legacy/components/ib/IBLayout'
import ColorSVGIcon from '@/legacy/components/icon/ColorSVGIcon'
import SVGIcon from '@/legacy/components/icon/SVGIcon'
import { useIBProfileGetById } from '@/legacy/container/ib-cas'
import { useIBInterviewUpdate, useInterviewQNA } from '@/legacy/container/ib-student-interview'
import { IBInterviewQnaContentDto, RequestUpdateQnaDto } from '@/legacy/generated/model'
import { usePermission } from '@/legacy/hooks/ib/usePermission'
import { meState } from 'src/store'

export default function CASInterviewDetailPage() {
  const history = useHistory()

  const me = useRecoilValue(meState)
  const {
    id: idParam,
    qnaId: qnaIdParam,
    studentId: studentIdParam,
  } = useParams<{
    id: string
    qnaId: string
    studentId: string
  }>()
  const id = Number(idParam)
  const qnaId = Number(qnaIdParam)
  const studentId = Number(studentIdParam)
  const { data: interview, isLoading } = useInterviewQNA(qnaId)
  const { data: profile } = useIBProfileGetById(studentId)
  const [questionList, setQuestionList] = useState<IBInterviewQnaContentDto[]>([])
  const [questionListAdded, setQuestionListAdded] = useState<IBInterviewQnaContentDto[]>([])
  const scrollRef = useRef<ScrollRef | null>(null)

  const handleSomeAction = () => {
    scrollRef.current?.scrollToTop()
  }

  const permission = usePermission(null, me?.id ?? 0)
  const hasPermission = permission[0] === 'mentor' || permission[1] === 'IB_CAS'

  const { updateIBInterview } = useIBInterviewUpdate({
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
    register,
    formState: { errors },
    reset,
  } = useForm<RequestUpdateQnaDto>({
    defaultValues: {
      content: interview?.qna.content.map((item) => ({
        question: item.question,
        answer: item.answer || '',
        hint: item.hint || '',
        added: item.added || false,
      })),
      hasNewQuestion: false,
    },
  })

  const onSubmit = (formData: RequestUpdateQnaDto) => {
    if (isLoading) return

    if (questionList.length > 0) {
      formData.content = [...formData.content, ...questionList]
      formData.hasNewQuestion = true
    }

    updateIBInterview({ id: qnaId, data: formData })
    handleSomeAction()
    setEditMode(!editMode)
  }

  const handleAddQuestion = () => {
    setQuestionList([...questionList, { question: '', hint: '', added: true }])
  }

  useEffect(() => {
    if (!editMode) {
      reset({
        content: interview?.qna.content.map((item) => ({
          question: item.question,
          answer: item.answer || '',
          hint: item.hint || '',
          added: item.added || false,
        })),
        hasNewQuestion: false,
      })
      setQuestionList([])
    }
  }, [interview, editMode])

  useEffect(() => {
    setQuestionListAdded(interview?.qna.content || [])
  }, [interview])

  if (interview === undefined) {
    return <div>접속 정보를 불러올 수 없습니다.</div>
  }

  if (me === undefined) {
    return <div>접속 정보를 불러올 수 없습니다.</div>
  }

  return (
    <div className="col-span-6">
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
                      {questionListAdded.map((item, index) => {
                        if (!item.added) {
                          return (
                            <div key={index} className="flex flex-col gap-3">
                              <div className="flex flex-row items-start justify-between">
                                <div className="flex flex-row items-start">
                                  <Typography variant="title3" className="text-primary-orange-800">
                                    Q{questionListAdded.filter((i, idx) => !i.added && idx < index).length + 1}.&nbsp;
                                  </Typography>
                                  <input
                                    type="hidden"
                                    value={item.question}
                                    {...register(`content.${index}.question`)}
                                  />
                                  <Typography variant="title3">{item.question}</Typography>
                                </div>
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

                      {questionListAdded.map((item, index) => {
                        if (item.added) {
                          return (
                            <div
                              key={index}
                              className="border-t-primary-gray-100 flex flex-col gap-3 border-t pt-6 pb-10"
                            >
                              <Typography variant="title2">개별 질문</Typography>
                              <div className="flex flex-row items-start justify-between">
                                <div className="flex flex-row items-start">
                                  <Typography variant="title3" className="text-primary-orange-800">
                                    Q{questionListAdded.filter((i, idx) => i.added && idx < index).length + 1}.&nbsp;
                                  </Typography>
                                  <input
                                    type="hidden"
                                    value={item.question}
                                    {...register(`content.${index}.question`)}
                                  />
                                  <Typography variant="title3">{item.question}</Typography>
                                </div>
                                <Icon.Close
                                  className="cursor-pointer rounded-full bg-zinc-100 p-1 text-zinc-400"
                                  onClick={() => setQuestionListAdded(questionListAdded.filter((_, i) => i !== index))}
                                />
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
                    {questionList && questionList.length > 0 && (
                      <div className="border-t-primary-gray-100 flex flex-col gap-10 border-t pt-6 pb-10">
                        {questionList.map((item, index) => (
                          <div className="flex flex-col gap-3" key={index}>
                            <div className="flex items-center justify-between">
                              <Typography variant="title3" className="font-semibold">
                                추가 개별 질문 <span className="text-primary-orange-800">Q{index + 1}</span>
                              </Typography>
                              <ColorSVGIcon.Close
                                color="gray700"
                                size={24}
                                onClick={() => setQuestionList(questionList.filter((_, i) => i !== index))}
                                className="cursor-pointer"
                              />
                            </div>

                            <Input.Basic
                              className="bg-white"
                              placeholder={'항목을 입력해주세요.'}
                              size={40}
                              value={item.question}
                              onChange={(e) =>
                                setQuestionList(
                                  questionList.map((q, i) => (i === index ? { ...q, question: e.target.value } : q)),
                                )
                              }
                            />
                            <TextareaV2
                              className="font-base text-14 h-24 w-full resize-none rounded-lg bg-white"
                              placeholder={'예시 답변을 입력해주세요.'}
                              value={item.hint}
                              onChange={(e) =>
                                setQuestionList(
                                  questionList.map((q, i) => (i === index ? { ...q, hint: e.target.value } : q)),
                                )
                              }
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {editMode && (
                      <div className="flex justify-center pb-10">
                        <ButtonV2
                          size={40}
                          variant="solid"
                          color="gray100"
                          onClick={handleAddQuestion}
                          className="flex items-center gap-2"
                        >
                          <SVGIcon.Plus size={16} weight="bold" color="gray700" />
                          개별 질문 추가하기
                        </ButtonV2>
                      </div>
                    )}
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
                  <></>
                  <ButtonV2
                    size={40}
                    variant="solid"
                    color="gray100"
                    onClick={() => history.push(`/teacher/ib/cas/portfolio/${studentId}`)}
                  >
                    목록 돌아가기
                  </ButtonV2>
                  {/* {(hasPermission || profile?.mentor?.id === me?.id) &&
                    (editMode ? (
                      <div className="flex flex-row gap-2">
                        <ButtonV2
                          size={40}
                          variant="solid"
                          color="gray100"
                          onClick={() => {
                            setEditMode(!editMode);
                            handleSomeAction();
                          }}
                        >
                          취소
                        </ButtonV2>
                        <ButtonV2 size={40} variant="solid" color="orange100" onClick={handleSubmit(onSubmit)}>
                          저장
                        </ButtonV2>
                      </div>
                    ) : (
                      <ButtonV2
                        size={40}
                        variant="outline"
                        color="gray400"
                        onClick={() => {
                          setEditMode(!editMode);
                          handleSomeAction();
                        }}
                      >
                        수정
                      </ButtonV2>
                    ))} */}
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
        scrollRef={scrollRef}
      />
      {alertMessage && <AlertV2 message={alertMessage} confirmText="확인" onConfirm={() => setAlertMessage(null)} />}
    </div>
  )
}
