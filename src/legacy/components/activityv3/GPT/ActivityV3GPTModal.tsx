import _ from 'lodash'
import { FC, useEffect, useRef, useState } from 'react'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import { ReactComponent as SvgUser } from '@/assets/svg/user.svg'
import { useNotificationStore } from '@/stores/notification'
import { Avatar, Label, Radio, RadioGroup, Select, Textarea } from '@/legacy/components/common'
import { Checkbox } from '@/legacy/components/common/Checkbox'
import { Coachmark2 } from '@/legacy/components/common/CoachMark2'
import ConfirmDialog from '@/legacy/components/common/ConfirmDialog'
import { Icon } from '@/legacy/components/common/icons'
import { SearchInput } from '@/legacy/components/common/SearchInput'
import { TextInput } from '@/legacy/components/common/TextInput'
import { SuperModal } from '@/legacy/components/SuperModal'
import { Constants } from '@/legacy/constants'
import {
  useAchievementCriteriaGetByIds,
  useActivityV3GetGPTReport,
  useStudentRecordontrollerCreate,
} from '@/legacy/generated/endpoint'
import { ActivityV3, ResponseStudentCardStudentDto, SubjectType } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'

interface ActivityV3GPTModalProps {
  activityV3s?: ActivityV3[]
  checkedCardIds: number[]
  setCheckedCardIds: (cardIds: number[]) => void
  onClose: () => void
  studentInfo: ResponseStudentCardStudentDto
  refetch: () => void
}

export const ActivityV3GPTModal: FC<ActivityV3GPTModalProps> = ({
  activityV3s = [],
  setCheckedCardIds,
  checkedCardIds,
  onClose,
  studentInfo,
  refetch,
}) => {
  const { t, currentLang } = useLanguage()
  const { setToast: setToastMsg } = useNotificationStore()
  const [currentStep, setCurrentStep] = useState(1)
  const [modalStep, setModalStep] = useState(1)
  const [question, setQuestion] = useState('')
  const [subject, setSubject] = useState('')
  const [creativeType, setCreativeType] = useState('')
  const [conversationId, setConversationId] = useState('')

  const [title, setTitle] = useState('')
  const [reportContents, setReportContents] = useState<any[]>([])
  const [selectedContentIndex, setSelectedContentIndex] = useState<number | undefined>()
  const [content, setContent] = useState('')
  const [type, setType] = useState<string>('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isEvidenceOpen, setEvidenceOpen] = useState<boolean>(false)
  const [modalOpen, setModalOpen] = useState(false)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const [achievement, setAchievement] = useState<string>('상')
  const selectedActivityV3s = activityV3s?.filter((av3) => checkedCardIds.includes(av3.id))
  const [coachmarkVisible, setCoachmarkVisible] = useState<boolean>(true)

  useEffect(() => {
    const hasSeenCoachmark = localStorage.getItem('GPTIsFirst')
    if (hasSeenCoachmark) {
      setCoachmarkVisible(false)
    }
  }, [])

  const handleCoachmarkClose = () => {
    setCoachmarkVisible(false)
    localStorage.setItem('GPTIsFirst', 'not')
  }

  const handleCoachmarOpen = () => {
    setCoachmarkVisible(true)
    localStorage.removeItem('GPTIsFirst')
    setCurrentStep(1)
  }

  const selectedCriteriaIds = selectedActivityV3s.reduce(
    (acc: number[], cur) => acc.concat(cur.achievementCriteriaIds),
    [],
  )

  const { data: achievementCriterias } = useAchievementCriteriaGetByIds(
    {
      ids: selectedCriteriaIds,
    },
    {
      query: {
        enabled: !!selectedCriteriaIds.length,
      },
    },
  )

  const { mutate: getGptReport, isLoading } = useActivityV3GetGPTReport({
    mutation: {
      onMutate: () => {
        setContent('')
      },
      onSuccess: (data: any) => {
        try {
          setReportContents((reportContents) =>
            reportContents.concat({
              type: 'content',
              data: {
                ...data,
                ...(!data.content && { content: data.report?.map((el: any) => el.content)?.join(' ') }),
              },
            }),
          )
          if (!conversationId) {
            setConversationId(data.report?.[0]?.conversation_id || '')
          }
        } catch (err) {
          console.log('error : ', err)
        }
      },
      onError: (error) => {
        setToastMsg(error.message)
      },
    },
  })

  const { mutate: createStudentRecord } = useStudentRecordontrollerCreate({
    mutation: {
      onSuccess: () => {
        setToastMsg('변경 사항이 저장되었습니다.')
        onClose()
        setContent('')
        setType('')
        setTitle('')
        setAchievement('')
        setCheckedCardIds([])
        setReportContents([])
        refetch()
      },
      onError: (error) => {
        setToastMsg(error.message)
      },
    },
  })

  const handleSaveClick = () => {
    if (!title) {
      if (titleInputRef.current) {
        titleInputRef.current.focus()
        alert('활동기록부 초안의 제목을 입력해 주세요.')
      }
      return
    }

    createStudentRecord({
      data: {
        content,
        type,
        title,
        subject,
        creativeType,
      },
      params: { studentId: studentInfo.id },
    })
  }

  const handleQuestionSend = () => {
    if (!question) {
      alert('질문 내용을 입력해 주세요!')
      return
    }
    setReportContents((reportContents) => reportContents.concat({ type: 'question', question }))
    getGptReport({
      data: {
        studentId: studentInfo.id,
        activityIds: selectedActivityV3s.map((av3) => av3.id),
        reportType: type,
        achievement,
        keywords: [],
        followUpQuestion: question,
        conversationId,
      },
    })
    setQuestion('')
  }

  const steps = [
    {
      title: '1단계 : 활동리스트',
      description: '학생이 참여하고 있는 활동 리스트가 나타나고, 체크박스를 통해 추가 및 제거가 가능합니다.',
      actions: [
        { text: '그만보기', onClick: () => handleCoachmarkClose() },
        { text: '다음으로', onClick: () => setCurrentStep((prev) => Math.min(prev + 1, steps.length)) },
      ],
    },
    {
      title: '2단계 : 활동기록부 종류 선택',
      description: '활동기록부 항목 종류(교과/창체)를 선택합니다.',
      actions: [
        { text: '그만보기', onClick: () => handleCoachmarkClose() },
        { text: '이전으로', onClick: () => setCurrentStep((prev) => Math.max(prev - 1, 1)) },
        { text: '다음으로', onClick: () => setCurrentStep((prev) => Math.min(prev + 1, steps.length)) },
      ],
    },
    {
      title: '3단계 : 선택한 활동',
      description: '선택한 활동 중 지우고 싶은 항목을 클릭하여 제외할 수 있습니다.',
      actions: [
        { text: '그만보기', onClick: () => handleCoachmarkClose() },
        { text: '이전으로', onClick: () => setCurrentStep((prev) => Math.max(prev - 1, 1)) },
        { text: '다음으로', onClick: () => setCurrentStep((prev) => Math.min(prev + 1, steps.length)) },
      ],
    },
    {
      title: '4단계 : 성취수준 선택',
      description:
        '성취수준을 선택합니다. 학생이 교과목 성취기준에 달성한 정도에 따라 상/중/하 중 하나를 선택합니다. 선택한 성취수준에 따라 키워드, 글자 수 등의 차이로 다른 결과가 도출됩니다.',
      actions: [
        { text: '그만보기', onClick: () => handleCoachmarkClose() },
        { text: '이전으로', onClick: () => setCurrentStep((prev) => Math.max(prev - 1, 1)) },
        { text: '다음으로', onClick: () => setCurrentStep((prev) => Math.min(prev + 1, steps.length)) },
      ],
    },
    {
      title: '5단계 : 성취기준 확인',
      description:
        '선택한 활동에 해당되는 성취기준이 자동으로 입력됩니다. 활동 생성 시 성취기준을 설정하지 않은 경우 활동 수정을 통해 설정할 수 있습니다.',
      actions: [
        { text: '그만보기', onClick: () => handleCoachmarkClose() },
        { text: '이전으로', onClick: () => setCurrentStep((prev) => Math.max(prev - 1, 1)) },
        { text: '마치기', onClick: () => handleCoachmarkClose() },
      ],
    },
  ]

  const activitiesViews = [
    {
      id: 1,
      name: '교과',
      type: SubjectType.LECTURE,
    },
    {
      id: 2,
      name: '창체',
      type: SubjectType.ACTIVITY,
    },
    {
      id: 3,
      name: '기타',
      type: SubjectType.ETC,
    },
  ]

  const byteLength = new TextEncoder().encode(content).length
  const trimmedContent = content.replace(/ /g, '')
  const trimmedByteLength = new TextEncoder().encode(trimmedContent).length

  return (
    <>
      <div className="flex h-full w-full flex-row">
        {/* 좌측 영역 - 학생 기본 정보 */}
        <section className="flex h-full max-w-[260px] min-w-[25%] flex-col space-y-2 rounded-l-lg bg-white px-6 py-4 pl-6">
          <Icon.AI className="h-20 w-24" />
          <div className="mt-2 flex flex-col items-start gap-2 border-b border-gray-300 pb-4">
            <p className="font-bold">학생 정보</p>
            <div className="flex flex-row items-center gap-4">
              <LazyLoadImage
                className="h-24 w-24 rounded-xl border border-gray-300"
                src={
                  studentInfo?.profile ? `${Constants.imageUrl}${studentInfo.profile}` : (SvgUser as unknown as string)
                }
                alt=""
                loading="lazy"
              />
              <div className="lg:text-14 flex h-full flex-col justify-center gap-1 text-xs">
                <div className="flex flex-row items-center gap-2">
                  <p className="font-semibold">이름</p>
                  <p>{studentInfo.name}</p>
                </div>
                <div className="flex flex-row items-center gap-2">
                  <p className="font-semibold">학번</p>
                  <p>
                    {studentInfo.klassGroupName} {studentInfo.studentNumber}번
                  </p>
                </div>
                <div className="flex flex-row gap-2">
                  <p className="font-semibold">진로</p>
                  <p>{studentInfo.hopePath}</p>
                </div>
                <div className="flex flex-row gap-2">
                  <p className="font-semibold">진학</p>
                  <p>{studentInfo.hopeMajor}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex w-full gap-x-0.5">
            <p className="pt-2 font-bold">참여 활동</p>
            {currentStep === 1 && coachmarkVisible && (
              <span className="relative flex h-1.5 w-1.5">
                <span className="bg-brandblue-1 absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"></span>
                <span className="bg-brandblue-1 relative inline-flex h-1.5 w-1.5 rounded-full"></span>
                <Coachmark2 steps={steps} currentStep={currentStep} position="top" arrowDirection="bottom" />
              </span>
            )}
          </div>

          <div className="mt-1 flex h-full flex-col space-y-2 overflow-y-auto px-1">
            {activitiesViews.map((el) => (
              <>
                <div className="text-brandblue-1 -mx-1 font-bold">{el.name}</div>
                <div className="flex flex-col space-y-3">
                  {_.chain(activityV3s || [])
                    .filter(['type', el.type])
                    .sortBy(['subject'])
                    .map((activityv3) => {
                      const sav = activityv3.studentActivityV3s?.[0]

                      const getIsSessionSubmitted = () => {
                        if (sav?.studentText || sav?.records?.length || sav?.summary) {
                          return true
                        }
                        let isSubmitted = false
                        activityv3.activitySessions?.map((session) => {
                          if (session?.studentActivitySessions?.[0]?.isSubmitted) {
                            isSubmitted = true
                          }
                        })
                        return isSubmitted
                      }
                      return (
                        <div key={activityv3.id} className="flex items-start space-x-2">
                          <Checkbox
                            id={`checkbox-${el.id}-${activityv3.id}`}
                            className="mt-1 disabled:bg-gray-200"
                            disabled={!getIsSessionSubmitted()}
                            checked={checkedCardIds.includes(activityv3.id)}
                            onChange={() =>
                              checkedCardIds.includes(activityv3.id)
                                ? setCheckedCardIds(checkedCardIds.filter((el) => el !== activityv3.id))
                                : setCheckedCardIds(checkedCardIds.concat(activityv3.id))
                            }
                          />
                          <label
                            className="block cursor-pointer font-semibold"
                            htmlFor={`checkbox-${el.id}-${activityv3.id}`}
                          >
                            <span className="text-brand-1">[{activityv3.subject}]</span>&nbsp;
                            {activityv3.title}
                          </label>
                        </div>
                      )
                    })
                    .value()}
                </div>
              </>
            ))}
          </div>
        </section>

        {/* 우측 영역 - 활동 초안 부분 */}
        <section className="flex h-full max-w-[600px] min-w-[75%] overflow-visible rounded-r-lg bg-[#e8ebf7] px-6 py-4">
          <div className="flex w-full rounded-lg bg-white">
            <div className={`flex h-full w-2/5 flex-col border-r border-gray-300 py-5`}>
              <div className="mb-2 h-full w-full overflow-y-scroll px-5 pb-4">
                <div className="flex items-center gap-2">
                  <div className="text-xl font-bold">
                    활동기록부 초안 작성<span className="text-brandblue-1 ml-1 align-top text-sm">AI</span>
                  </div>
                  <div
                    className="text-md flex h-4 w-4 cursor-pointer items-center justify-center rounded-full border border-gray-500 text-sm"
                    onClick={() => handleCoachmarOpen()}
                  >
                    ?
                  </div>
                </div>
                <div className="text-xs font-semibold text-[#666]">
                  선택한 활동(들)을 기반으로 활동기록부 초안을 작성합니다.
                </div>

                <div className="mt-6 flex flex-grow flex-col gap-2">
                  <div className="flex w-full gap-x-0.5">
                    <div className="text-lg font-semibold">종류</div>
                    {currentStep === 2 && coachmarkVisible && (
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="bg-brandblue-1 absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"></span>
                        <span className="bg-brandblue-1 relative inline-flex h-1.5 w-1.5 rounded-full"></span>
                        <Coachmark2 steps={steps} currentStep={currentStep} position="bottom" arrowDirection="top" />
                      </span>
                    )}
                  </div>

                  <RadioGroup className="flex items-center justify-start gap-10" onChange={() => {}}>
                    <div className="flex items-center space-x-1">
                      <Radio
                        id="교과활동"
                        name="교과활동"
                        checked={type === '교과'}
                        onChange={() => setType('교과')}
                        className="text-brandblue-1 h-6 w-6 checked:ring-0"
                      />
                      <Label htmlFor="교과활동" children="교과활동" className="text-14 cursor-pointer whitespace-pre" />
                    </div>
                    <div className="flex items-center space-x-1">
                      <Radio
                        id="창의적체험활동"
                        name="창의적체험활동"
                        checked={type === '창의적체험활동'}
                        onChange={() => setType('창의적체험활동')}
                        className="text-brandblue-1 h-6 w-6 checked:ring-0"
                      />
                      <Label
                        htmlFor="창의적체험활동"
                        children="창의적 체험활동"
                        className="text-14 cursor-pointer whitespace-pre"
                      />
                    </div>
                    {/* <div className="flex items-center space-x-1">
                  <Radio id="행동특성 및 종합의견" name="행동특성 및 종합의견"></Radio>
                  <Label
                    htmlFor="행동특성 및 종합의견"
                    children="행동특성 및 종합의견"
                    className="cursor-pointer whitespace-pre"
                  />
                </div> */}
                  </RadioGroup>
                </div>
                <div className="mt-6 flex w-full gap-x-0.5">
                  <div className="text-lg font-semibold">선택한 활동</div>
                  {currentStep === 3 && coachmarkVisible && (
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="bg-brandblue-1 absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"></span>
                      <span className="bg-brandblue-1 relative inline-flex h-1.5 w-1.5 rounded-full"></span>
                      <Coachmark2 steps={steps} currentStep={currentStep} position="bottom" arrowDirection="top" />
                    </span>
                  )}
                </div>
                <div className="mt-2 flex w-max flex-col gap-2 overflow-x-auto">
                  {selectedActivityV3s.length === 0 ? (
                    <div className="text-14 flex w-full justify-center bg-gray-500 px-4 py-2 text-white">
                      활동을 선택해주세요.
                    </div>
                  ) : (
                    selectedActivityV3s.map((activityv3) => (
                      <div key={activityv3.id} className="flex items-center gap-2 rounded-lg py-1.5">
                        <Icon.Close
                          stroke="#FFFFFF"
                          className="h-6 w-6 cursor-pointer rounded-full border border-gray-300 bg-[#466af0] p-1 text-3xl"
                          onClick={() => setCheckedCardIds(checkedCardIds.filter((el) => el !== activityv3.id))}
                        />
                        <div className="text-14 font-semibold whitespace-pre text-[#466af0]">
                          [{activityv3.subject}]&nbsp;
                          {activityv3.title}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {type === '교과' && (
                  <div className="mt-6 flex flex-grow flex-col gap-2">
                    <div className="text-lg font-semibold">과목</div>
                    <Select.lg value={subject} onChange={(e) => setSubject(e.target.value)}>
                      {_.chain(activityV3s)
                        .filter((av3) => av3.type === SubjectType.LECTURE)
                        .uniqBy('subject')
                        .map((av3) => (
                          <option key={av3.subject} value={av3.subject}>
                            {av3.subject}
                          </option>
                        ))
                        .value()}
                    </Select.lg>
                  </div>
                )}
                {type === '창의적체험활동' && (
                  <div className="mt-6 flex flex-grow flex-col gap-2">
                    <div className="text-lg font-semibold">타입</div>
                    <Select.lg value={creativeType} onChange={(e) => setCreativeType(e.target.value)}>
                      <option value="자율">자율</option>
                      <option value="봉사">봉사</option>
                      <option value="동아리">동아리</option>
                      <option value="진로">진로</option>
                    </Select.lg>
                  </div>
                )}
                <div className="mt-6 flex flex-grow flex-col gap-2">
                  <div className="flex w-full gap-x-0.5">
                    <div className="text-lg font-semibold">성취수준</div>
                    {currentStep === 4 && coachmarkVisible && (
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="bg-brandblue-1 absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"></span>
                        <span className="bg-brandblue-1 relative inline-flex h-1.5 w-1.5 rounded-full"></span>
                        <Coachmark2 steps={steps} currentStep={currentStep} position="top" arrowDirection="bottom" />
                      </span>
                    )}
                  </div>

                  <RadioGroup className="flex items-center justify-start gap-16" onChange={() => {}}>
                    <div className="flex items-center space-x-2">
                      <Radio
                        id="상"
                        name="상"
                        checked={achievement === '상'}
                        onChange={() => setAchievement('상')}
                        className="text-brandblue-1 h-6 w-6 checked:ring-0"
                      />
                      <Label htmlFor="상" children="상" className="text-14 cursor-pointer whitespace-pre" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Radio
                        id="중"
                        name="중"
                        checked={achievement === '중'}
                        onChange={() => setAchievement('중')}
                        className="text-brandblue-1 h-6 w-6 checked:ring-0"
                      />
                      <Label htmlFor="중" children="중" className="text-14 cursor-pointer whitespace-pre" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Radio
                        id="하"
                        name="하"
                        checked={achievement === '하'}
                        onChange={() => setAchievement('하')}
                        className="text-brandblue-1 h-6 w-6 checked:ring-0"
                      />
                      <Label htmlFor="하" children="하" className="text-14 cursor-pointer whitespace-pre" />
                    </div>
                  </RadioGroup>
                </div>
                <div className="mt-6 flex w-full gap-x-0.5">
                  <div className="text-lg font-semibold">성취기준</div>
                  {currentStep === 5 && coachmarkVisible && (
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="bg-brandblue-1 absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"></span>
                      <span className="bg-brandblue-1 relative inline-flex h-1.5 w-1.5 rounded-full"></span>
                      <Coachmark2 steps={steps} currentStep={currentStep} position="top" arrowDirection="bottom" />
                    </span>
                  )}
                </div>

                {achievementCriterias == undefined ? (
                  <div className="mt-2 flex w-full justify-center rounded bg-gray-500 px-4 py-2 text-white">
                    성취기준이 존재하지 않습니다.
                  </div>
                ) : (
                  <div className="text-14 mt-2 rounded bg-[#F5F5F5] p-2 whitespace-pre-line text-[#666]">
                    {achievementCriterias?.map((ac) => `[${ac.criteriaId}]\n ${ac.criteria}`).join('\n')}
                  </div>
                )}
              </div>
              <div className="min-h-max px-5">
                <button
                  className="w-full rounded-lg bg-[#163192] py-2 text-base text-white disabled:bg-gray-500"
                  onClick={() => {
                    setConversationId('')
                    getGptReport({
                      data: {
                        studentId: studentInfo.id,
                        activityIds: selectedActivityV3s.map((av3) => av3.id),
                        reportType: type,
                        achievement,
                        keywords: [],
                        followUpQuestion: '',
                        conversationId: '',
                      },
                    })
                  }}
                  disabled={isLoading || !checkedCardIds.length || !type || !studentInfo.id || !achievement}
                >
                  {isLoading ? '초안 작성중' : '활동기록부 초안 작성'}
                </button>
              </div>
            </div>
            <div className={`flex w-3/5 flex-col overflow-x-hidden overflow-y-auto p-5`}>
              {!reportContents[0] && !isLoading && (
                <div className="flex h-full w-full flex-col items-center justify-center gap-10">
                  <Icon.AIRobot className="h-60 w-60" />
                  <h6 className="text-2xl font-bold text-[#466af0]">활동기록부 초안 작성을 눌러보세요!</h6>
                </div>
              )}
              {reportContents[0] && (
                <div className="flex w-full flex-col overflow-y-auto pr-2">
                  <div className="text-xl font-bold">{t('ai_drafted_activity_record', 'AI 작성 활동기록부 초안')}</div>
                  {reportContents.map((_data, i) => {
                    if (_data.type === 'question') {
                      return (
                        <div key={_data.question} className="my-2 flex w-full items-start justify-end space-x-2">
                          <div className="mt-1 flex flex-col items-end">
                            <div> {_data.question}</div>
                          </div>
                          <Avatar size={8} />
                        </div>
                      )
                    }
                    const { data } = _data
                    const reportContent = data.content
                    const byteLength = new TextEncoder().encode(reportContent).length
                    const trimmedContent = reportContent.replaceAll(' ', '')

                    return (
                      <>
                        <div className="mt-2 flex w-full items-start space-x-2">
                          <Icon.AIRobot className="h-8 w-8" />
                          <div className="h-max w-full">
                            <div>{reportContent}</div>
                            <div className="mt-2 flex w-full items-center justify-between pb-4 text-sm">
                              <div>
                                {currentLang === 'en' && trimmedContent.length}
                                <span className="text-gray-300">{t('exclude_space_characters', '공백 제외')} </span>
                                {currentLang !== 'en' && `${trimmedContent.length} 자`}
                                &nbsp;/&nbsp;{byteLength}
                                Byte
                                <span className="text-gray-300">
                                  {currentLang === 'en' && content.length}
                                  {t('include_space_characters', '공백 포함')}
                                </span>
                                {currentLang !== 'en' && `${reportContent.length} 자`}
                                &nbsp;/&nbsp;
                                {byteLength}Byte
                              </div>
                              {i === 0 && (
                                <div
                                  className="flex min-w-[6rem] cursor-pointer items-center justify-between border border-gray-300 px-2"
                                  onClick={() => setEvidenceOpen(!isEvidenceOpen)}
                                >
                                  <span>근거</span> {isEvidenceOpen ? <Icon.ChevronUp /> : <Icon.ChevronDown />}
                                </div>
                              )}
                            </div>
                            {isEvidenceOpen && i === 0 && (
                              <div className="text-14 mt-2 rounded bg-[#F5F5F5] p-2 whitespace-pre-line text-[#666]">
                                {data.report?.map((el: any) => el.evidence).join('\n')}
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )
                  })}
                  {isLoading && (
                    <div className="flex h-80 w-full flex-col items-center justify-center gap-10">
                      <Icon.Loader className="h-60 w-60" />
                      <h6 className="text-2xl font-bold text-[#466af0]">
                        슈퍼스쿨 AI가 활동기록부 초안을 작성중입니다..
                      </h6>
                    </div>
                  )}
                </div>
              )}

              {!reportContents[0] && isLoading && (
                <div className="flex h-full w-full flex-col items-center justify-center gap-10">
                  <Icon.Loader className="h-60 w-60" />
                  <h6 className="text-2xl font-bold text-[#466af0]">슈퍼스쿨 AI가 활동기록부 초안을 작성중입니다..</h6>
                </div>
              )}
              <div className="mt-2">
                {!!reportContents.length && !isLoading && (
                  <div className="flex items-center space-x-2 py-2">
                    <SearchInput
                      placeholder="챗봇과 대화를 통해 활동기록부를 보완해 보세요."
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onSearch={handleQuestionSend}
                      className="w-full bg-gray-50 text-sm"
                    />
                    <Icon.Send onClick={handleQuestionSend} />
                  </div>
                )}
                <div className="mt-2 flex w-full justify-end space-x-2">
                  <button
                    children="나가기"
                    onClick={() => setConfirmOpen(!confirmOpen)}
                    className="box-border rounded-md border-2 border-[#163192] px-14 py-2 text-base font-semibold"
                  />
                  {!!reportContents.length && (
                    <button
                      children="저장하기"
                      onClick={() => setModalOpen(true)}
                      className="box-border rounded-md border-2 border-gray-500 bg-[#163192] px-14 py-2 text-base font-semibold text-white"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
        {confirmOpen && (
          <ConfirmDialog
            cancelText="취소"
            confirmText="나가기"
            description="저장되지 않은 내용은 다시 불러올 수 없습니다.<br/> 한번 더 확인해 주세요."
            message="저장되지 않은 내용이 있습니다."
            onCancel={() => setConfirmOpen(!confirmOpen)}
            onConfirm={() => {
              onClose()
              setTitle('')
              setContent('')
              setAchievement('')
            }}
          />
        )}
      </div>
      <SuperModal
        modalOpen={modalOpen}
        setModalClose={() => {
          setModalStep(1)
          setModalOpen(false)
          setSelectedContentIndex(undefined)
          setContent('')
        }}
        className="w-128 lg:w-256"
      >
        <div className="px-12 py-6">
          {modalStep === 1 && (
            <>
              <div className="h-screen-18 flex flex-col">
                <div>
                  <h1 className="text-xl font-bold">활동기록부 초안</h1>
                  <span className="text-sm text-gray-600">
                    AI로 작성된 초안 중 하나를 선택해주세요. 선택 후 다음 단계에서 내용 수정이 가능합니다.
                  </span>
                </div>
                <div className="mt-2 h-full space-y-2 overflow-y-auto px-1">
                  {reportContents.map(({ data, type }, i) =>
                    type === 'content' ? (
                      <div className="flex w-full items-start space-x-2" key={JSON.stringify(data.report)}>
                        <Checkbox
                          className="mt-1"
                          checked={selectedContentIndex === i}
                          onChange={() =>
                            selectedContentIndex === i ? setSelectedContentIndex(undefined) : setSelectedContentIndex(i)
                          }
                        />
                        <div
                          className="cursor-pointer rounded-lg border border-gray-600 p-2"
                          onClick={() =>
                            selectedContentIndex === i ? setSelectedContentIndex(undefined) : setSelectedContentIndex(i)
                          }
                        >
                          {data.content}
                        </div>
                      </div>
                    ) : (
                      <></>
                    ),
                  )}
                </div>
              </div>
              <button
                children="다음"
                disabled={selectedContentIndex === undefined}
                onClick={() => {
                  if (selectedContentIndex !== undefined) {
                    setModalStep(2)
                    setContent(reportContents[selectedContentIndex].data.content)
                  }
                }}
                className="mt-4 box-border w-full rounded-md border-2 border-gray-500 bg-[#163192] px-14 py-2 text-base font-semibold text-white"
              />
            </>
          )}
          {modalStep === 2 && (
            <>
              <div>
                <div className="font-bold">활동기록부 초안 제목</div>
                <TextInput
                  placeholder="활동기록부 초안의 제목을 입력해 보세요."
                  className="mt-2 h-10 rounded-lg border border-[#CCCCCC]"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  ref={titleInputRef}
                />
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="mt-2 h-96 rounded-md"
                />
                <div className="mt-2 flex w-full items-center justify-between pb-4 text-sm">
                  <div>
                    <span className="text-gray-500">{t('exclude_space_characters', '공백 제외')} </span>
                    {currentLang === 'en' && trimmedContent.length}
                    {currentLang !== 'en' && `${trimmedContent.length} 자`}
                    &nbsp;/&nbsp;{trimmedByteLength}
                    Byte <span className="text-gray-500">{t('include_space_characters', '공백 포함')}</span>{' '}
                    {currentLang === 'en' && content.length}
                    {currentLang !== 'en' && `${content.length} 자`}
                    &nbsp;/&nbsp;
                    {byteLength}Byte
                  </div>
                </div>
              </div>
              <button
                children="저장하기"
                onClick={handleSaveClick}
                className="mt-4 box-border w-full rounded-md border-2 border-gray-500 bg-[#163192] px-14 py-2 text-base font-semibold text-white"
              />
            </>
          )}
        </div>
      </SuperModal>
    </>
  )
}
