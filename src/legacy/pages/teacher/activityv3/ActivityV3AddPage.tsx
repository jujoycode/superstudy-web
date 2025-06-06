import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import _ from 'lodash'
import { useForm } from 'react-hook-form'
import { ReactComponent as FileItemIcon } from '@/assets/svg/file-item-icon.svg'
import { useHistory } from '@/hooks/useHistory'
import { useNotificationStore } from '@/stores/notification'
import { Button } from '@/atoms/Button'
import { Radio } from '@/atoms/Radio'
import { SuperModal } from '@/legacy/components'
import {
  ActivityCriteriaSelectModal,
  getCriteriaTitle,
} from '@/legacy/components/activityv3/ActivityCriteriaSelectModal'
import { ActivityGroupSelectModal } from '@/legacy/components/activityv3/ActivityGroupSelectModal'
import { CloseButton, Label, Select, Textarea } from '@/legacy/components/common'
import { Checkbox } from '@/legacy/components/common/Checkbox'
import { Coachmark2 } from '@/legacy/components/common/CoachMark2'
import ConfirmDialog from '@/legacy/components/common/ConfirmDialog'
import { Icon } from '@/legacy/components/common/icons'
import { TextInput } from '@/legacy/components/common/TextInput'
import { DocumentObjectComponentDel } from '@/legacy/components/DocumentObjectComponentDel'
import { ImageObjectComponentDel } from '@/legacy/components/ImageObjectComponentDel'
import { Constants } from '@/legacy/constants'
import { ACTIVITYV3_TYPE_KOR } from '@/legacy/constants/activityv3.enum'
import {
  useAchievementCriteriaGetAll,
  useActivityV3Create,
  useActivityV3Update,
  useGroupsFindAllKlassBySchool,
  useGroupsFindLectureGroupsByTeacher,
  useTeacherGroupsFindBySubject,
} from '@/legacy/generated/endpoint'
import {
  AchievementChapter,
  AchievementCriteria,
  ActivityV3,
  Group,
  GroupType,
  RequestCreateActivityV3Dto,
  ResponseSubjectGroupDto,
  SubjectType,
  TeacherGroupsFindBySubjectSubjectType,
  UploadFileTypeEnum,
} from '@/legacy/generated/model'
import { useFileUpload } from '@/legacy/hooks/useFileUpload'
import { useImageAndDocument } from '@/legacy/hooks/useImageAndDocument'
import type { nameWithId } from '@/legacy/types'
import { getFileNameFromUrl } from '@/legacy/util/file'

interface ActivityV3AddPageProps {
  activityv3Data?: ActivityV3
}

export const DEFAULT_EXPLAIN_TEXT = '예시) 주제/주요 활동한 내용을 중심으로 200자 이내 요약해 작성하세요.'

export const SUBJECTS_TYPE_ACTIVITY = [
  { id: 1, name: '자율' },
  { id: 2, name: '봉사' },
  { id: 3, name: '진로' },
  { id: 4, name: '동아리' },
]

const subjectExclusionValues = [
  '자율',
  '봉사',
  '동아리',
  '진로',
  '자율활동',
  '봉사활동',
  '동아리활동',
  '진로활동',
  '교내활동',
  '우리반',
]

export const ActivityV3AddPage: React.FC<ActivityV3AddPageProps> = ({ activityv3Data }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const { setToast: setToastMsg } = useNotificationStore()
  const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([])
  const [previewOpen, setPreviewOpen] = useState(false)
  const [selectGroupModalOpen, setSelectGroupModalOpen] = useState(false)
  const [selectCriteriaModalOpen, setSelectCriteriaModalOpen] = useState(false)
  const [achievementChapters, setAchievementChapters] = useState<AchievementChapter[]>([])
  const [hasStudentText, setHasStudentText] = useState(!!activityv3Data?.hasStudentText || false)
  const [selectedCriteriaIds, setSelectedCriteriaIds] = useState<number[]>(activityv3Data?.achievementCriteriaIds || [])
  const [docYear, setDocYear] = useState<string>('2015')
  const [code, setCode] = useState<string>('')

  const { data: initialAchievementChapters } = useAchievementCriteriaGetAll(
    { docYear: '' },
    {
      query: {
        onSuccess: (data) => {
          setAchievementChapters(data)
        },
      },
    },
  )

  const allCriterias = useMemo(() => {
    const chapters = achievementChapters || []
    return chapters.reduce((acc: AchievementCriteria[], cur) => acc.concat(cur.achievementCriterias), [])
  }, [achievementChapters])

  const { push, goBack } = useHistory()
  const [activityv3type, setActivityV3Type] = useState<TeacherGroupsFindBySubjectSubjectType>(SubjectType.LECTURE)
  const [showDialog, setShowDialog] = useState(false)
  const [coachmarkVisible, setCoachmarkVisible] = useState<boolean>(true)

  useEffect(() => {
    const hasSeenCoachmark = localStorage.getItem('activityAddIsFirst')
    if (hasSeenCoachmark) {
      setCoachmarkVisible(false)
    }
  }, [])

  const handleCoachmarkClose = () => {
    setCoachmarkVisible(false)
    localStorage.setItem('activityAddIsFirst', 'not')
  }

  const handleCoachmarOpen = () => {
    setCoachmarkVisible(true)
    localStorage.removeItem('activityAddIsFirst')
    setCurrentStep(1)
  }

  const handleConfirm = () => {
    setShowDialog(false)
    goBack()
  }

  const handleCancel = () => {
    setShowDialog(false)
  }

  const {
    handleSubmit,
    register,
    formState: { errors },
    watch,
    reset,
  } = useForm<RequestCreateActivityV3Dto>()

  const { imageObjectMap, documentObjectMap, toggleImageDelete, toggleDocumentDelete, addFiles } = useImageAndDocument({
    images: activityv3Data?.images,
    documents: activityv3Data?.files,
  })

  const { handleUploadFile } = useFileUpload()

  const { data: klassGroups } = useGroupsFindAllKlassBySchool()

  const { data: teacherGroups } = useTeacherGroupsFindBySubject(
    { subjectType: activityv3type },
    { query: { enabled: !!activityv3type } },
  )

  const { data: lectureGroups = [] } = useGroupsFindLectureGroupsByTeacher({
    query: { enabled: activityv3type === SubjectType.LECTURE },
  })

  const subjectArray: nameWithId[] = useMemo(() => {
    switch (activityv3type) {
      case SubjectType.ACTIVITY:
        return SUBJECTS_TYPE_ACTIVITY
      case SubjectType.LECTURE:
        return _.chain(teacherGroups)
          .map((el) => ({ id: el.id, name: el.subject }))
          .concat(_.map(lectureGroups, (lg: any) => ({ id: lg.id, name: lg.subject })))
          .filter((el) => !subjectExclusionValues.includes(el.name))
          .uniqBy('name')
          .value()
      case SubjectType.ETC:
        return _.chain(teacherGroups)
          .map((el) => ({ id: el.id, name: el.subject }))
          .filter((el) => !subjectExclusionValues.includes(el.name))
          .uniqBy('name')
          .value()
      default:
        return []
    }
  }, [activityv3type, teacherGroups, lectureGroups])

  useEffect(() => {
    if (activityv3Data) {
      reset({
        ...activityv3Data,
        groupIds: activityv3Data.groupActivityV3s?.map((el) => el.group?.id) || [],
        startDate: activityv3Data.startDate ? format(new Date(activityv3Data.startDate), 'yyyy-MM-dd') : '',
        endDate: activityv3Data.endDate ? format(new Date(activityv3Data.endDate), 'yyyy-MM-dd') : '',
        studentTextEndDate: activityv3Data.studentTextEndDate
          ? format(new Date(activityv3Data.studentTextEndDate), "yyyy-MM-dd'T'HH:mm")
          : '',
      })
      setActivityV3Type(activityv3Data.type)
      setHasStudentText(activityv3Data.hasStudentText)
      setSelectedGroupIds(activityv3Data.groupActivityV3s?.map((el) => el.group?.id) || [])
      setSelectedCriteriaIds(activityv3Data.achievementCriteriaIds || [])
    }
  }, [activityv3Data, reset])

  const groupData: Record<string, Group[]> = useMemo(() => {
    switch (activityv3type) {
      case SubjectType.ACTIVITY: {
        const result: Record<string, Group[]> = {}
        teacherGroups
          ?.filter((el) => el.group.type === GroupType.KLUB)
          ?.forEach((el: ResponseSubjectGroupDto) => {
            result[el.subject] = result[el.subject] || []
            result[el.subject].push(el.group)
          })
        return result
      }
      case SubjectType.LECTURE: {
        const result: Record<string, Group[]> = {}
        teacherGroups?.forEach((el) => {
          const typedEl = el as unknown as Group & { subject: string }
          result[typedEl.subject] = result[typedEl.subject] || []
          result[typedEl.subject].push(typedEl)
        })
        lectureGroups?.forEach((el) => {
          const typedEl = el as unknown as Group & { subject: string }
          result[typedEl.subject] = result[typedEl.subject] || []
          result[typedEl.subject].push(typedEl)
        })
        return result
      }
      case SubjectType.ETC: {
        const result: Record<string, Group[]> = {}
        teacherGroups?.forEach((el) => {
          const typedEl = el as unknown as Group & { subject: string }
          result[typedEl.subject] = result[typedEl.subject] || []
          result[typedEl.subject].push(typedEl)
        })
        lectureGroups?.forEach((el) => {
          const typedEl = el as unknown as Group & { subject: string }
          result[typedEl.subject] = result[typedEl.subject] || []
          result[typedEl.subject].push(typedEl)
        })
        return result
      }
    }
    return {}
  }, [teacherGroups, lectureGroups, activityv3type])

  const teacherSubjects =
    groupData[watch('subject')]?.map((el) => ({ subject: watch('subject'), group: el }) as ResponseSubjectGroupDto) ||
    []

  const { mutateAsync: createActivityV3 } = useActivityV3Create({
    mutation: {
      onSuccess: (data) => {
        setToastMsg('활동이 추가되었습니다.')
        data && push(`/teacher/activityv3/${data.id}/session/add`)
        reset()
      },
      onError: (error) => {
        setToastMsg(error.message)
      },
    },
  })
  const { mutateAsync: updateActivityV3 } = useActivityV3Update({
    mutation: {
      onSuccess: (data) => {
        setToastMsg('활동이 수정되었습니다.')
        data && push(`/teacher/activityv3/${data.id}`)
        reset()
      },
      onError: (error) => {
        setToastMsg(error.message)
      },
    },
  })
  const teacherGroupSubjectInfos = _.chain(teacherSubjects)
    .filter((tg) => tg?.subject === watch('subject'))
    .slice()
    .sort((a, b) => {
      if (!a.group.name || !b.group.name) {
        return 0
      }
      const aData = a.group.name.match('([0-9]|[0-9][0-9])학년 ([0-9]|[0-9][0-9])반')
      const bData = b.group.name.match('([0-9]|[0-9][0-9])학년 ([0-9]|[0-9][0-9])반')

      if (aData?.[1] === bData?.[1]) {
        return Number(aData?.[2]) - Number(bData?.[2])
      } else {
        return Number(aData?.[1]) - Number(bData?.[1])
      }
    })
    .value()

  const groups = watch('subject')
    ? activityv3type === SubjectType.ACTIVITY || activityv3type === SubjectType.ETC
      ? _.chain(klassGroups || [])
          .map((el) => ({ group: el, subject: watch('subject') }) as ResponseSubjectGroupDto)
          .concat(teacherSubjects)
          .uniqBy('group.name')
          .value()
      : _.chain(teacherGroupSubjectInfos)
          .concat(
            lectureGroups.map((el: unknown) => {
              const typedEl = el as Group & { subject: string }
              return { group: typedEl, subject: typedEl.subject } as ResponseSubjectGroupDto
            }),
          )
          .uniqBy('group.name')
          .value()
    : []

  // watch 값을 변수로 추출
  const subjectValue = watch('subject')
  const titleValue = watch('title')

  const isFormValid = useMemo(() => {
    return activityv3type && subjectValue && titleValue && selectedGroupIds.length > 0
  }, [activityv3type, subjectValue, titleValue, selectedGroupIds])

  const steps = [
    {
      title: '1단계 활동 영역 작성',
      description:
        '활동 영역/과목/기간을 선택하고 활동명을 입력하세요. 활동 영역/과목과 활동명은 필수 입력 항목이에요.',
      actions: [
        { text: '닫기', onClick: () => handleCoachmarkClose() },
        { text: '다음', onClick: () => setCurrentStep((prev) => Math.min(prev + 1, steps.length)) },
      ],
    },
    {
      title: '2단계 활동 안내 작성/성취 기준 선택',
      description: '성취 기준을 선택하고, 어떤 활동인지 자세히 입력하면 AI가 활동 기록 초안을 더 정확하게 작성해요.',
      actions: [
        { text: '닫기', onClick: () => handleCoachmarkClose() },
        { text: '이전', onClick: () => setCurrentStep((prev) => Math.max(prev - 1, 1)) },
        { text: '다음', onClick: () => setCurrentStep((prev) => Math.min(prev + 1, steps.length)) },
      ],
    },
    {
      title: '3단계 활동보고서 제출 여부 선택',
      description:
        '활동보고서 제출 여부를 선택하세요. 제출이 필요한 경우, 마감일을 선택하고 학생에게 보여줄 예시와 작성 가이드를 입력하세요. ',
      actions: [
        { text: '닫기', onClick: () => handleCoachmarkClose() },
        { text: '이전', onClick: () => setCurrentStep((prev) => Math.max(prev - 1, 1)) },
      ],
    },
  ]

  return (
    <>
      <div className="col-span-6">
        {/* 배경 */}
        <div className="h-screen-6 3xl:px-[208px] 3xl:pb-[128px] 3xl:pt-[64px] flex flex-col bg-gray-50 p-2 md:h-screen md:px-10 md:pt-10 md:pb-20">
          {/* 활동 생성 박스 */}
          <div className="relative h-full">
            <div className="3xl:py-20 h-full overflow-y-auto bg-white p-2 md:py-5">
              {/* 활동 생성하기 박스 */}
              <div className="3xl:px-30 flex w-full flex-col gap-2 bg-white pb-8 md:px-10">
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-bold">활동 {activityv3Data ? '수정' : '추가'}하기</div>
                  <div
                    className="text-md flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-gray-500"
                    onClick={() => handleCoachmarOpen()}
                  >
                    ?
                  </div>
                </div>
                <div className="text-18 font-normal text-[#444]">추가할 활동 정보를 입력해 주세요</div>
              </div>

              <div className="3xl:px-30 h-full min-w-2/3 md:px-10">
                <div className="flex w-full gap-x-0.5 border-b border-[#333333] py-2">
                  <div className="text-xl font-bold">활동</div>
                  {currentStep === 1 && coachmarkVisible && (
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75"></span>
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                      <Coachmark2 steps={steps} currentStep={currentStep} position="bottom" arrowDirection="top" />
                    </span>
                  )}
                </div>
                {/* 테이블 영역 */}

                <div className="flex w-full flex-col">
                  <div className="border-gray-[#444] flex h-14 items-center border-b">
                    <div className="text-[#333333 w-30 py-3 font-bold whitespace-pre">
                      <div className="flex gap-x-0.5">
                        <p>유형</p>
                        <div className="h-1.5 w-1.5 overflow-hidden rounded-full bg-orange-500" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 py-3">
                      {Object.entries(ACTIVITYV3_TYPE_KOR).map(([type, kor]) => (
                        <Label.row
                          htmlFor={type}
                          className={activityv3Data ? 'cursor-pointer text-gray-600 opacity-60' : ''}
                          key={type}
                        >
                          <Radio
                            id={type}
                            checked={activityv3type === type}
                            onChange={() => {
                              setActivityV3Type(type as SubjectType)
                              setSelectedGroupIds([])
                            }}
                            disabled={!!activityv3Data}
                          ></Radio>
                          <div>{kor}</div>
                        </Label.row>
                      ))}
                    </div>
                  </div>

                  <div className="border-gray-[#444] flex h-14 items-center border-b py-3">
                    <div className="w-30 font-bold whitespace-pre text-[#333333]">
                      <div className="flex gap-x-0.5">
                        <p>과목/차시</p>
                        <div className="h-1.5 w-1.5 overflow-hidden rounded-full bg-orange-500" />
                      </div>
                    </div>
                    <div className="py-3">
                      {subjectArray.length >= 1 ? (
                        <Select.lg
                          id="subject"
                          {...register('subject', { required: true, onChange: () => setSelectedGroupIds([]) })}
                          disabled={!!activityv3Data}
                          className="h-10 rounded-lg border border-[#CCCCCC]"
                        >
                          <option selected hidden value="">
                            과목을 선택하세요.
                          </option>
                          {subjectArray?.map((subject) => <option value={subject.name || ''}>{subject.name}</option>)}
                        </Select.lg>
                      ) : (
                        <Select.lg disabled className="h-10 rounded-lg border border-[#CCCCCC]">
                          <option>과목이 존재하지 없습니다.</option>
                        </Select.lg>
                      )}

                      <Label.Error children={errors.subject?.message} />
                    </div>
                  </div>

                  <div className="border-gray-[#444] flex h-14 items-center border-b">
                    <div className="w-30 font-bold whitespace-pre text-[#333333]">활동 기간</div>
                    <div className="py-3">
                      <div className="flex items-center space-x-2 overflow-hidden">
                        <TextInput
                          id="startDate"
                          type="date"
                          className="h-10 w-40 rounded-lg border border-[#CCCCCC]"
                          {...register('startDate')}
                        />
                        <Label.Error children={errors.startDate?.message} />
                        ~
                        <TextInput
                          id="endDate"
                          type="date"
                          className="h-10 w-40 rounded-lg border border-[#CCCCCC]"
                          {...register('endDate')}
                        />
                        <Label.Error children={errors.endDate?.message} />
                      </div>
                    </div>
                  </div>

                  <div className="border-gray-[#444] flex h-14 w-full flex-1 items-center border-b">
                    <div className="w-30 shrink-0 py-3 font-bold whitespace-pre text-[#333333]">
                      <div className="flex gap-x-0.5">
                        <p>활동명</p>
                        <div className="h-1.5 w-1.5 overflow-hidden rounded-full bg-orange-500" />
                      </div>
                    </div>
                    <div className="grow py-3">
                      <TextInput
                        id="title"
                        placeholder="예시) 통계 포스터 만들기"
                        className="h-10 rounded-lg border border-[#CCCCCC]"
                        {...register('title', { required: true })}
                      />
                      <Label.Error children={errors.title?.message} />
                    </div>
                  </div>

                  <div className="border-gray-[#444] flex w-full flex-1 items-center border-b">
                    <div className="w-30 shrink-0 py-3 font-bold whitespace-pre text-[#333333]">활동 안내</div>
                    <div className="grow py-3">
                      <Textarea
                        id="description"
                        className="h-20 resize-none rounded-lg border border-[#CCCCCC]"
                        rows={3}
                        placeholder="활동에 대한 설명을 입력해 주세요."
                        {...register('description')}
                      />
                      <Label.Error children={errors.description?.message} />
                    </div>
                  </div>
                  <div className="border-gray-[#444] flex h-14 w-full flex-1 items-center border-b">
                    <div className="w-30 shrink-0 py-3 font-bold whitespace-pre text-[#333333]">
                      <div className="flex gap-x-0.5">
                        <p>공통문구</p>
                      </div>
                    </div>
                    <div className="grow py-3">
                      <Textarea
                        id="commonText"
                        className="h-20 resize-none rounded-lg border border-[#CCCCCC]"
                        rows={3}
                        placeholder={`활동요약을 작성할 때 필요한 공통 문구를 작성해 주세요.
해당 문구는 학생에게 노출되지 않아요.`}
                        {...register('commonText')}
                      />
                      <Label.Error children={errors.commonText?.message} />
                    </div>
                  </div>
                  {activityv3type === SubjectType.LECTURE && (
                    <div className="border-gray-[#444] flex h-14 w-full flex-1 items-center border-b">
                      <div className="w-30 shrink-0 py-3 font-bold whitespace-pre text-[#333333]">
                        <div className="flex gap-x-0.5">
                          <p>성취기준</p>
                          {currentStep === 2 && coachmarkVisible && (
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75" />
                              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-500" />
                              <Coachmark2 steps={steps} currentStep={currentStep} />
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex w-full grow flex-col gap-2 py-3">
                        <div
                          className="flex h-10 w-28 cursor-pointer items-center justify-center rounded-lg border border-dashed border-[#CCCCCC] bg-gray-50 px-6 py-2"
                          onClick={() => {
                            setSelectCriteriaModalOpen(true)
                          }}
                        >
                          <Icon.Plus />
                        </div>
                        {!!selectedCriteriaIds?.length && (
                          <div className="flex flex-col gap-2">
                            {selectedCriteriaIds.map((criteriaId) => (
                              <div
                                className="flex w-max max-w-full items-center rounded-lg border border-[#333333] px-2 py-1"
                                key={criteriaId}
                              >
                                <div className="flex h-8 grow items-center overflow-x-hidden">
                                  <div className="w-full truncate text-neutral-500">
                                    {getCriteriaTitle(allCriterias?.find((el) => el.id === criteriaId))}
                                  </div>
                                </div>
                                <div className="flex min-w-max items-center justify-center bg-white px-2">
                                  <div
                                    className="cursor-pointer rounded-full bg-zinc-100 p-1 text-zinc-400"
                                    onClick={() =>
                                      setSelectedCriteriaIds(selectedCriteriaIds.filter((id) => id !== criteriaId))
                                    }
                                  >
                                    <Icon.Close />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="border-gray-[#444] flex h-14 flex-1 items-center border-b">
                    <div className="w-30 shrink-0 py-3 font-bold whitespace-pre text-[#333333]">
                      <div className="flex gap-x-0.5">
                        <p>참여 대상</p>
                        <div className="h-1.5 w-1.5 overflow-hidden rounded-full bg-orange-500" />
                      </div>
                    </div>
                    <div className="grow py-3">
                      <div className="flex items-center space-x-2 placeholder:w-full">
                        {!!selectedGroupIds?.length ? (
                          <div className="flex w-full flex-wrap gap-2 space-x-2">
                            {selectedGroupIds.map((groupId) => (
                              <div
                                className="flex h-10 items-center justify-between gap-2 space-x-2 rounded-lg border border-orange-500 px-2 py-1 whitespace-pre"
                                key={groupId}
                              >
                                {groups?.find((el) => el.group?.id === groupId)?.group?.name}
                                <div
                                  className="cursor-pointer rounded-full bg-zinc-100 p-1 text-zinc-400"
                                  onClick={() => setSelectedGroupIds(selectedGroupIds.filter((id) => id !== groupId))}
                                >
                                  <Icon.Close />
                                </div>
                              </div>
                            ))}
                            <div
                              className="flex h-10 w-28 cursor-pointer items-center justify-center rounded-lg border border-dashed border-[#CCCCCC] bg-gray-50"
                              onClick={() => {
                                if (!watch('subject')) {
                                  setToastMsg('먼저 과목을 선택해주세요.')
                                  return
                                }
                                setSelectGroupModalOpen(true)
                              }}
                            >
                              <Icon.Plus />
                            </div>
                          </div>
                        ) : (
                          <div
                            className="flex h-10 w-28 cursor-pointer items-center justify-center rounded-lg border border-dashed border-[#CCCCCC] bg-gray-50 px-6 py-2"
                            onClick={() => {
                              if (!watch('subject')) {
                                setToastMsg('먼저 과목을 선택해주세요.')
                                return
                              }
                              setSelectGroupModalOpen(true)
                            }}
                          >
                            <Icon.Plus />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-gray-[#444] flex h-14 flex-1 items-center border-b">
                    <div className="w-30 shrink-0 font-bold whitespace-pre text-[#333333]">첨부파일</div>
                    <div className="py-3">
                      {/* 이미지 */}
                      {[...imageObjectMap].length > 0 && (
                        <div className="grid w-full grow grid-flow-row grid-cols-6 gap-2 pb-2">
                          {[...imageObjectMap].map(([key, value]) => (
                            <ImageObjectComponentDel
                              key={key}
                              id={key}
                              imageObjet={value}
                              onDeleteClick={toggleImageDelete}
                            />
                          ))}
                        </div>
                      )}
                      {/* 문서 */}
                      {[...documentObjectMap].length > 0 && (
                        <div className="flex flex-col gap-1 pb-2">
                          {[...documentObjectMap].map(([key, value]) => (
                            <DocumentObjectComponentDel
                              key={key}
                              id={key}
                              documentObjet={value}
                              onDeleteClick={toggleDocumentDelete}
                            />
                          ))}
                        </div>
                      )}
                      <input
                        type="file"
                        id="file-upload"
                        name="file-upload"
                        className="hidden"
                        multiple
                        onChange={(e) => {
                          e.preventDefault()
                          const files = e.target.files
                          if (!files || files.length === 0) return
                          addFiles(files)
                        }}
                      />
                      <div className="flex items-center gap-4">
                        <label
                          className={`flex h-10 w-28 cursor-pointer items-center justify-center rounded-lg border border-dashed border-[#CCCCCC] bg-gray-50`}
                          htmlFor="file-upload"
                        >
                          <Icon.Plus />
                        </label>
                        <p className="text-xs text-neutral-500">100MB 이하 이미지/문서 파일을 첨부해 주세요.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="pt-8">
                    <div className="flex items-center space-x-8 border-b border-[#333333] pb-2">
                      <div className="flex gap-x-0.5">
                        <p className="text-xl font-bold">활동보고서</p>
                        <span className="relative flex h-1.5 w-1.5">
                          {currentStep === 3 && coachmarkVisible ? (
                            <>
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75" />
                              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-500" />
                              <Coachmark2 steps={steps} currentStep={currentStep} />
                            </>
                          ) : (
                            <span className="relative inline-flex h-full w-full rounded-full bg-transparent" />
                          )}
                        </span>
                      </div>
                      <div className="text-14 flex items-center space-x-2">
                        <Checkbox
                          id="hasStudentText"
                          checked={!hasStudentText}
                          onChange={() => setHasStudentText(!hasStudentText)}
                        />
                        <label htmlFor="hasStudentText">활동보고서 제출 없음</label>
                      </div>
                    </div>
                  </div>
                  <table className="w-full table-fixed">
                    <tr className="border-gray-[#444] border-b">
                      <td className="h-14 w-44 whitespace-pre">활동보고서 제출 마감일</td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <TextInput
                            id="studentTextEndDate"
                            type="datetime-local"
                            className="h-10 w-60 rounded-lg border border-[#CCCCCC]"
                            {...register('studentTextEndDate')}
                            disabled={!hasStudentText}
                          />
                          <div>까지</div>
                        </div>
                        <Label.Error children={errors.studentTextEndDate?.message} />
                      </td>
                    </tr>
                    <tr className="border-gray-[#444] border-b">
                      <td className="h-14 py-3 whitespace-pre">활동보고서 예시</td>
                      <td className="py-3">
                        <Textarea
                          id="exampleText"
                          className="h-14 resize-none rounded-lg border border-[#CCCCCC]"
                          cols={3}
                          placeholder="활동보고서 작성 예시를 작성해 주세요."
                          {...register('exampleText')}
                          disabled={!hasStudentText}
                        />
                        <Label.Error children={errors.exampleText?.message} />
                      </td>
                    </tr>
                    <tr className="border-gray-[#444] border-b">
                      <td className="h-14 py-3 whitespace-pre">활동보고서 작성 가이드</td>
                      <td className="py-3">
                        <Textarea
                          id="explainText"
                          className="h-14 resize-none rounded-lg border border-[#CCCCCC]"
                          placeholder={DEFAULT_EXPLAIN_TEXT}
                          {...register('explainText')}
                          disabled={!hasStudentText}
                        />
                        <Label.Error children={errors.explainText?.message} />
                      </td>
                    </tr>
                  </table>
                </div>
              </div>
            </div>
            {/* 하단 버튼 영역 */}
            <div className="3xl:-bottom-20 absolute -bottom-14 left-0 w-full">
              <div className="flex items-center justify-between">
                <Button size="lg" children="취소" onClick={() => setShowDialog(true)} />

                <div className="flex items-center space-x-2">
                  <Button size="lg" onClick={() => setPreviewOpen(true)} children="미리보기" disabled={!isFormValid} />
                  <Button
                    size="lg"
                    disabled={!isFormValid}
                    onClick={handleSubmit(async (data) => {
                      // file image 처리
                      const imageFiles = [...imageObjectMap.values()]
                        .filter((value) => !value.isDelete && value.image instanceof File)
                        .map((value) => value.image) as File[]
                      const imageFileNames = await handleUploadFile(UploadFileTypeEnum['activityv3/images'], imageFiles)
                      // url image 처리
                      const imageUrlNames = [...imageObjectMap.values()]
                        .filter((value) => !value.isDelete && typeof value.image === 'string')
                        .map((value) => value.image) as string[]
                      const allImageNames = [...imageUrlNames, ...imageFileNames]
                      // file document 처리
                      const documentFiles = [...documentObjectMap.values()]
                        .filter((value) => !value.isDelete && value.document instanceof File)
                        .map((value) => value.document) as File[]
                      const documentFileNames = await handleUploadFile(
                        UploadFileTypeEnum['activityv3/files'],
                        documentFiles,
                      )
                      const documentUrlNames = [...documentObjectMap.values()]
                        .filter((value) => !value.isDelete && typeof value.document === 'string')
                        .map((value) => value.document) as string[]
                      const allDocumentNames = [...documentUrlNames, ...documentFileNames]
                      const _data = {
                        ...data,
                        ...(!data.explainText && { explainText: DEFAULT_EXPLAIN_TEXT }),
                        groupIds: selectedGroupIds,
                        images: allImageNames,
                        files: allDocumentNames,
                        type: activityv3type as SubjectType,
                        hasStudentText,
                        achievementCriteriaIds: selectedCriteriaIds,
                      }
                      if (activityv3Data) {
                        updateActivityV3({ id: activityv3Data.id, data: _data })
                      } else {
                        createActivityV3({ data: _data })
                      }
                    })}
                    children="등록하기"
                  />
                </div>
              </div>
            </div>
          </div>
          {achievementChapters && (
            <ActivityCriteriaSelectModal
              modalOpen={selectCriteriaModalOpen}
              setModalOpen={setSelectCriteriaModalOpen}
              selectedCriteriaIds={selectedCriteriaIds}
              setSelectedCriteriaIds={setSelectedCriteriaIds}
              code={code}
              setCode={setCode}
              docYear={docYear}
              setDocYear={setDocYear}
              initialAchievementChapters={initialAchievementChapters}
            />
          )}

          <ActivityGroupSelectModal
            groups={groups}
            activityv3type={activityv3type}
            modalOpen={selectGroupModalOpen}
            setModalOpen={setSelectGroupModalOpen}
            selectedGroupIds={selectedGroupIds}
            setSelectedGroupIds={setSelectedGroupIds}
          />

          {showDialog && (
            <ConfirmDialog
              message="저장되지 않은 내용이 있습니다."
              description={`저장되지 않은 내용은 다시 불러올 수 없습니다. \n한번 더 확인해 주세요.`}
              confirmText="나가기"
              cancelText="취소"
              onConfirm={handleConfirm}
              onCancel={handleCancel}
            />
          )}

          {/* 미리보기 모달 영역 */}
          <SuperModal
            className="h-2/3 w-1/4 overflow-y-auto"
            modalOpen={previewOpen}
            setModalClose={() => setPreviewOpen(false)}
          >
            <div className="max-h-screen-12 flex flex-col lg:border-r lg:border-gray-300">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-300 bg-gray-50 px-4 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">미리보기</span>
                  <span className="text-14 ml-2 text-gray-600">학생에게 보여지는 화면입니다.</span>
                </div>
                <CloseButton onClick={() => setPreviewOpen(false)} />
              </div>
              <div className="h-full bg-gray-50 pb-2">
                <div className="flex flex-col space-y-2 p-4 text-left">
                  <div className="scroll-box flex w-full items-center space-x-2 overflow-x-scroll">
                    {groups
                      ?.filter((g) => selectedGroupIds.includes(g.group?.id))
                      ?.map((el) => (
                        <div
                          key={el.group?.id}
                          className="bg-primary-100 rounded-md px-2 py-1 text-sm font-bold whitespace-pre text-gray-800"
                        >
                          {el.group?.name}
                        </div>
                      ))}
                  </div>
                  <div className="max-w-min rounded-md bg-gray-300 px-2 py-1 text-sm font-bold whitespace-pre text-gray-800">
                    {activityv3type && ACTIVITYV3_TYPE_KOR[activityv3type as SubjectType]}
                  </div>
                  <div className={`text-18 font-bold`}>{watch('title')}</div>
                  <div className="text-13 text-gray-500">
                    기간: {watch('startDate') && format(new Date(watch('startDate') || ''), 'yyyy.MM.dd')} ~{' '}
                    {watch('endDate') && format(new Date(watch('endDate') || ''), 'yyyy.MM.dd')}
                  </div>
                  {[...imageObjectMap].length > 0 && (
                    <div className="w-full pb-2">
                      {[...imageObjectMap].map(([key, value]) => (
                        <ImageObjectComponentDel key={key} id={key} imageObjet={value} />
                      ))}
                    </div>
                  )}
                  {/* 문서 */}
                  {[...documentObjectMap].length > 0 && (
                    <div className="flex flex-col gap-1 pb-2">
                      {[...documentObjectMap].map(([key, value]) => (
                        <div key={key} className="flex h-8 items-center space-x-2 rounded-sm bg-stone-50 px-3 py-1">
                          <img src={FileItemIcon as unknown as string} alt="file-icon" />
                          {typeof value.document === 'string' ? (
                            <a
                              className="ml-2 text-xs text-neutral-500"
                              href={`${Constants.imageUrl}${value.document}`}
                              target="_blank"
                              rel="noreferrer"
                              download={getFileNameFromUrl(value.document)}
                            >
                              {getFileNameFromUrl(value.document)}
                            </a>
                          ) : (
                            <div className="w-full overflow-x-hidden text-xs whitespace-pre text-neutral-500">
                              {value?.document.name}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {watch('description') && (
                  <div className="mb-2 px-4">
                    <div className="text-16 font-semibold">활동 설명</div>
                    <div className="text-15 w-full break-words whitespace-pre-line">{watch('description')}</div>
                  </div>
                )}
                {hasStudentText && watch('exampleText') && (
                  <div className="px-4">
                    <div className="text-16 font-semibold">학생 활동 보고서 예시</div>
                    <div className="text-15 mt-1 border border-gray-300 p-2 whitespace-pre-line">
                      {watch('exampleText')}
                    </div>
                  </div>
                )}
                {hasStudentText && (
                  <div className="bg-gray-50 p-4">
                    <div className="text-16 w-full cursor-pointer border-b border-gray-300 pb-2 font-semibold">
                      학생 활동 보고서
                    </div>
                    <div className="text-gray-600">
                      활동의 <b>차시</b> 참여 후, 생기부 작성을 위해 예시를 참고하여 <b>학생 활동 보고서</b>를
                      작성해주세요.
                    </div>
                    <Textarea className="my-2 resize-none" placeholder={watch('explainText') || DEFAULT_EXPLAIN_TEXT} />
                    <Button size="lg" disabled children="제출하기" />
                    <div className="text-13 mt-4 w-full text-center text-red-500">
                      *미리보기 화면에선 제출이 불가합니다.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </SuperModal>
        </div>
      </div>
    </>
  )
}
