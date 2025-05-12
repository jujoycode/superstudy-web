import { format } from 'date-fns'
import _, { flatten, map, uniq } from 'lodash'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useHistory } from '@/hooks/useHistory'
import { useRecoilState, useRecoilValue } from 'recoil'
import { ReactComponent as FileItemIcon } from '@/legacy/assets/svg/file-item-icon.svg'
import { SuperModal } from '@/legacy/components'
import { DocumentObjectComponentDel } from '@/legacy/components/DocumentObjectComponentDel'
import { ImageObjectComponentDel } from '@/legacy/components/ImageObjectComponentDel'
import {
  ActivityCriteriaSelectModal,
  getCriteriaTitle,
} from '@/legacy/components/activityv3/ActivityCriteriaSelectModal'
import { ActivityGroupSelectModal } from '@/legacy/components/activityv3/ActivityGroupSelectModal'
import { ActivityTeacherSelectModal } from '@/legacy/components/activityv3/ActivityTeacherSelectModal'
import { CloseButton, Label, Radio, RadioGroup, Select, Textarea } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { Checkbox } from '@/legacy/components/common/Checkbox'
import { Coachmark2 } from '@/legacy/components/common/CoachMark2'
import ConfirmDialog from '@/legacy/components/common/ConfirmDialog'
import { TextInput } from '@/legacy/components/common/TextInput'
import { ToggleSwitch } from '@/legacy/components/common/ToggleSwitch'
import { Icon } from '@/legacy/components/common/icons'
import ColorSVGIcon from '@/legacy/components/icon/ColorSVGIcon'
import { Constants } from '@/legacy/constants'
import { ACTIVITYV3_TYPE_KOR } from '@/legacy/constants/activityv3.enum'
import {
  useAchievementCriteriaGetAll,
  useActivityV3Create,
  useActivityV3Update,
  useGroupsFindAllByIds,
  useGroupsFindAllKlassBySchool,
  useGroupsFindLectureGroupsByTeacher,
  useTeacherGroupsFindBySubject,
  useUserGetAllTeachers,
} from '@/legacy/generated/endpoint'
import {
  AchievementChapter,
  AchievementCriteria,
  ActivityV3,
  Group,
  GroupType,
  RequestCreateActivityV3Dto,
  ResponseSubjectGroupDto,
  ResponseTeachersDto,
  SubjectType,
  TeacherActivityV3InfoDto,
  TeacherGroupsFindBySubjectSubjectType,
  UploadFileTypeEnum,
} from '@/legacy/generated/model'
import { useFileUpload } from '@/legacy/hooks/useFileUpload'
import { useImageAndDocument } from '@/legacy/hooks/useImageAndDocument'
import { meState, toastState } from 'src/store'
import { nameWithId } from '@/legacy/types'
import { getFileNameFromUrl } from '@/legacy/util/file'

interface ActivityV3AddPageProps {
  activityv3Data?: ActivityV3
}

export const DEFAULT_EXPLAIN_TEXT = '예) 주제, 주요활동을 중심으로 200자 이내로 활동요약을 작성해주세요.'

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
  const me = useRecoilValue(meState)

  const [currentStep, setCurrentStep] = useState(1)
  const [toastMsg, setToastMsg] = useRecoilState(toastState)
  const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([])
  const [previewOpen, setPreviewOpen] = useState(false)
  const [selectGroupModalOpen, setSelectGroupModalOpen] = useState(false)
  const [selectTeacherModalOpen, setSelectTeacherModalOpen] = useState(false)
  const [selectCriteriaModalOpen, setSelectCriteriaModalOpen] = useState(false)
  const [achievementChapters, setAchievementChapters] = useState<AchievementChapter[]>([])
  const [hasStudentText, setHasStudentText] = useState(false)
  const [selectedCriteriaIds, setSelectedCriteriaIds] = useState<number[]>([])
  const [selectedTeacherInfos, setSelectedTeacherInfos] = useState<TeacherActivityV3InfoDto[]>([])
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

  const {
    imageObjectMap,
    documentObjectMap,
    handleImageAdd,
    toggleImageDelete,
    handleDocumentAdd,
    toggleDocumentDelete,
    addFiles,
  } = useImageAndDocument({ images: activityv3Data?.images, documents: activityv3Data?.files })

  const { isUploadLoading, handleUploadFile } = useFileUpload()

  const { data: klassGroups } = useGroupsFindAllKlassBySchool()

  const { data: teacherGroups } = useTeacherGroupsFindBySubject(
    { subjectType: activityv3type },
    { query: { enabled: !!activityv3type } },
  )

  const { data: lectureGroups = [] } = useGroupsFindLectureGroupsByTeacher({
    query: { enabled: activityv3type === SubjectType.LECTURE },
  })

  const { data: teachers = [] } = useUserGetAllTeachers<ResponseTeachersDto[]>({
    query: { enabled: watch('isJointActivity') },
  })

  const activityV3GroupIds = uniq(
    flatten(selectedTeacherInfos.map((info) => info.groupIds)).concat(
      activityv3Data?.groupActivityV3s?.map((el) => el.groupId) || [],
    ),
  )

  const { data: groupByIdsData } = useGroupsFindAllByIds(
    { ids: activityV3GroupIds },
    { query: { enabled: !!activityV3GroupIds.length } },
  )

  const allGroupData = groupByIdsData?.groupsByIds || []

  const subjectArray: nameWithId[] = useMemo(() => {
    switch (activityv3type) {
      case SubjectType.ACTIVITY:
        return SUBJECTS_TYPE_ACTIVITY
      case SubjectType.LECTURE:
        return (
          _.chain(teacherGroups)
            .map((el) => ({ id: el.id, name: el.subject }))
            //@ts-ignore
            .concat(_.map(lectureGroups, (lg: any) => ({ id: lg.id, name: lg.subject })))
            .filter((el) => !subjectExclusionValues.includes(el.name))
            .uniqBy('name')
            .value()
        )
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
    if (!selectedTeacherInfos.length && me) {
      setSelectedTeacherInfos([{ teacherId: me.id, groupIds: [] }])
    }
  }, [me])

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
      setSelectedGroupIds(
        activityv3Data.groupActivityV3s
          ?.filter(
            (el) =>
              !activityv3Data?.isJointActivity ||
              !!activityv3Data?.teacherActivityV3s?.find((el) => el.userId === me?.id)?.groupIds?.includes(el.groupId),
          )
          ?.map((el) => el.group?.id) || [],
      )
      setSelectedCriteriaIds(activityv3Data.achievementCriteriaIds || [])
      setSelectedTeacherInfos(
        activityv3Data.teacherActivityV3s?.map((el) => ({ teacherId: el.userId, groupIds: el.groupIds })) || [],
      )
    }
  }, [activityv3Data])

  const groupData: Record<string, Group[]> = useMemo(() => {
    switch (activityv3type) {
      case SubjectType.ACTIVITY: {
        const result: any = {}
        teacherGroups
          ?.filter((el) => el.group.type === GroupType.KLUB)
          ?.forEach((el: any) => {
            result[el.subject] = result[el.subject] || []
            result[el.subject].push(el.group)
          })
        return result
      }
      case SubjectType.LECTURE: {
        const result: any = {}
        teacherGroups?.forEach((el) => {
          result[el.subject] = result[el.subject] || []
          result[el.subject].push(el.group)
        })
        lectureGroups?.forEach((el: any) => {
          result[el.subject] = result[el.subject] || []
          result[el.subject].push(el)
        })
        return result
      }
      case SubjectType.ETC: {
        const result: any = {}
        teacherGroups?.forEach((el) => {
          result[el.subject] = result[el.subject] || []
          result[el.subject].push(el.group)
        })
        lectureGroups?.forEach((el: any) => {
          result[el.subject] = result[el.subject] || []
          result[el.subject].push(el)
        })
        return result
      }
    }
    return {}
  }, [teacherGroups, lectureGroups])

  const teacherSubjects =
    groupData[watch('subject')]?.map(
      (el: any) => ({ subject: watch('subject'), group: el }) as ResponseSubjectGroupDto,
    ) || []

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
          //@ts-ignore
          .concat(lectureGroups.map((el) => ({ group: el, subject: el.subject }) as ResponseSubjectGroupDto))
          .uniqBy('group.name')
          .value()
    : []

  const isFormValid = useMemo(
    () =>
      activityv3type &&
      watch('subject') &&
      watch('title') &&
      (watch('isJointActivity')
        ? selectedTeacherInfos.filter((el) => el.groupIds.length > 0).length > 0
        : selectedGroupIds.length > 0),
    [
      activityv3type,
      watch('subject'),
      watch('title'),
      watch('isJointActivity'),
      selectedTeacherInfos,
      selectedGroupIds,
    ],
  )

  const steps = [
    {
      title: '1단계 : 활동 생성 기본 설정',
      description: '활동 타입, 과목, 기간, 활동명을 선택하고 학생들에게 보여줄 활동에 대한 설명을 간략하게 요약합니다.',
      actions: [
        { text: '그만보기', onClick: () => handleCoachmarkClose() },
        { text: '다음으로', onClick: () => setCurrentStep((prev) => Math.min(prev + 1, steps.length)) },
      ],
    },
    {
      title: '2단계 : AI 요약',
      description: '공통문구와 성취기준을 입력하면 AI 활동기록부 초안 작성 시 답변 정확도가 높아집니다.',
      actions: [
        { text: '그만보기', onClick: () => handleCoachmarkClose() },
        { text: '이전으로', onClick: () => setCurrentStep((prev) => Math.max(prev - 1, 1)) },
        { text: '다음으로', onClick: () => setCurrentStep((prev) => Math.min(prev + 1, steps.length)) },
      ],
    },
    {
      title: '3단계 : 활동보고서 제출 설정',
      description: '활동보고서는 학생이 자신이 참여한 활동의 주요 내용을 통합 요약한 것입니다.',
      actions: [
        { text: '그만보기', onClick: () => handleCoachmarkClose() },
        { text: '이전으로', onClick: () => setCurrentStep((prev) => Math.max(prev - 1, 1)) },
        { text: '마치기', onClick: () => handleCoachmarkClose() },
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
                  <div className="text-3xl font-bold">활동 {activityv3Data ? '수정' : '생성'}하기</div>
                  <div
                    className="text-md flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-gray-500"
                    onClick={() => handleCoachmarOpen()}
                  >
                    ?
                  </div>
                </div>
                <div className="text-18 font-normal text-[#444]">
                  학생들에게 활동&nbsp;/&nbsp; 활동보고서의 상세 내용을 안내할 수 있습니다.
                </div>
              </div>

              <div className="3xl:px-30 h-full min-w-2/3 md:px-10">
                <div className="flex w-full gap-x-0.5 border-b border-[#333333] py-2">
                  <div className="text-xl font-bold">활동</div>
                  {currentStep === 1 && coachmarkVisible && (
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="bg-brandblue-1 absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"></span>
                      <span className="bg-brandblue-1 relative inline-flex h-1.5 w-1.5 rounded-full"></span>
                      <Coachmark2 steps={steps} currentStep={currentStep} position="bottom" arrowDirection="top" />
                    </span>
                  )}
                </div>
                {/* 테이블 영역 */}

                <div className="flex w-full flex-col">
                  <div className="border-gray-[#444] flex h-14 items-center border-b">
                    <div className="text-[#333333 w-30 py-3 font-bold whitespace-pre">
                      <div className="flex gap-x-0.5">
                        <p>공동 활동</p>
                      </div>
                    </div>
                    <div className="py-3">
                      <ToggleSwitch
                        checked={watch('isJointActivity')}
                        {...register('isJointActivity', {
                          onChange: (e) => {
                            if (!e.target.checked && activityv3Data) {
                              setToastMsg(
                                '활동의 전달 대상이 변경되면 전달 대상에서 제외되는 학생들이 발생할 수 있으며, 해당 학생들은 더 이상 활동을 열람하거나 제출물을 제출할 수 없습니다. 또한 이미 제출된 학생의 제출물이 유실될 수 있습니다.',
                              )
                            }
                            if (e.target.checked && activityv3Data && !activityv3Data.isJointActivity && me) {
                              setSelectedTeacherInfos([
                                {
                                  teacherId: me.id,
                                  groupIds: activityv3Data.groupActivityV3s?.map((el) => el.group?.id) || [],
                                },
                              ])
                            }
                          },
                        })}
                      />
                    </div>
                  </div>
                  <div className="border-gray-[#444] flex h-14 items-center border-b">
                    <div className="text-[#333333 w-30 py-3 font-bold whitespace-pre">
                      <div className="flex gap-x-0.5">
                        <p>타입</p>
                        <div className="bg-primary-orange-800 h-1.5 w-1.5 overflow-hidden rounded-full" />
                      </div>
                    </div>
                    <div className="py-3">
                      <RadioGroup className="flex items-center space-x-4" onChange={() => {}}>
                        {Object.entries(ACTIVITYV3_TYPE_KOR).map(([type, kor]) => (
                          <div className={`flex items-center space-x-2 ${!!activityv3Data && 'opacity-60'}`} key={type}>
                            <Radio
                              key={type}
                              id={type}
                              name="type"
                              value={type}
                              checked={activityv3type === type}
                              onChange={() => {
                                setActivityV3Type(type as SubjectType)
                                setSelectedGroupIds([])
                              }}
                              disabled={!!activityv3Data}
                            ></Radio>
                            <Label
                              htmlFor={type}
                              children={kor}
                              className={'cursor-pointer ' + (!!activityv3Data && 'text-gray-600')}
                            />
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>

                  <div className="border-gray-[#444] flex h-14 items-center border-b py-3">
                    <div className="w-30 font-bold whitespace-pre text-[#333333]">
                      <div className="flex gap-x-0.5">
                        <p>과목</p>
                        <div className="bg-primary-orange-800 h-1.5 w-1.5 overflow-hidden rounded-full" />
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

                  {watch('isJointActivity') ? (
                    <div className="border-gray-[#444] flex h-14 flex-1 items-center border-b">
                      <div className="w-30 flex-shrink-0 py-3 font-bold whitespace-pre text-[#333333]">
                        <div className="flex gap-x-0.5">
                          <p>
                            공유 교사 / <br />
                            전달대상
                          </p>
                          <div className="bg-primary-orange-800 h-1.5 w-1.5 overflow-hidden rounded-full" />
                        </div>
                      </div>
                      <div className="flex-grow py-3">
                        <div className="space-y-2 placeholder:w-full">
                          <div
                            className="flex h-10 w-28 cursor-pointer items-center justify-center rounded-lg border border-dashed border-[#CCCCCC] bg-gray-50 px-6 py-2"
                            onClick={() => setSelectTeacherModalOpen(true)}
                          >
                            <Icon.Plus />
                          </div>
                          {selectedTeacherInfos?.map((info) => (
                            <div className="flex items-center space-x-2" key={info.teacherId}>
                              <div className="bg-primary-orange-100 flex items-center space-x-2 rounded-lg px-3 py-2 whitespace-pre">
                                <div className="bg-primary-orange-800 text-12 rounded-md px-1.5 py-0.5 font-medium text-white">
                                  교사
                                </div>
                                <div className="gray-700 text-15 font-medium">
                                  {teachers?.find((el) => el.id === info.teacherId)?.name}
                                </div>
                                {info.teacherId !== me?.id && (
                                  <ColorSVGIcon.Close
                                    className="cursor-pointer"
                                    color="gray700"
                                    size={24}
                                    onClick={() =>
                                      setSelectedTeacherInfos(
                                        selectedTeacherInfos.filter((el) => el.teacherId !== info.teacherId),
                                      )
                                    }
                                  />
                                )}
                              </div>
                              {info.groupIds.map((groupId) => (
                                <div
                                  className="flex items-center space-x-2 rounded-lg bg-gray-50 px-3 py-2 whitespace-pre"
                                  key={info.teacherId + 'group' + groupId}
                                >
                                  <div className="gray-700 text-15 font-medium">
                                    {allGroupData
                                      .map((el) => ({ group: el }))
                                      .concat(groups)
                                      .find((el) => el.group?.id === groupId)?.group?.name || ''}
                                  </div>
                                  <ColorSVGIcon.Close
                                    className="cursor-pointer"
                                    color="gray700"
                                    size={24}
                                    onClick={() =>
                                      setSelectedTeacherInfos((prevInfos) =>
                                        map(prevInfos, (pi) =>
                                          pi.teacherId === info.teacherId
                                            ? { ...pi, groupIds: pi.groupIds.filter((el) => el !== groupId) }
                                            : pi,
                                        ),
                                      )
                                    }
                                  />
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border-gray-[#444] flex h-14 flex-1 items-center border-b">
                      <div className="w-30 flex-shrink-0 py-3 font-bold whitespace-pre text-[#333333]">
                        <div className="flex gap-x-0.5">
                          <p>전달대상</p>
                          <div className="bg-primary-orange-800 h-1.5 w-1.5 overflow-hidden rounded-full" />
                        </div>
                      </div>
                      <div className="flex-grow py-3">
                        <div className="space-y-2 placeholder:w-full">
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
                          {!!selectedGroupIds?.length && (
                            <div className="flex items-center space-x-2">
                              <div className="bg-primary-orange-100 flex items-center space-x-2 rounded-lg px-3 py-2 whitespace-pre">
                                <div className="bg-primary-orange-800 text-12 rounded-md px-1.5 py-0.5 font-medium text-white">
                                  교사
                                </div>
                                <div className="gray-700 text-15 font-medium">{me?.name}</div>
                              </div>
                              {selectedGroupIds.map((groupId) => (
                                <div
                                  className="flex items-center space-x-2 rounded-lg bg-gray-50 px-3 py-2 whitespace-pre"
                                  key={'group' + groupId}
                                >
                                  <div className="gray-700 text-15 font-medium">
                                    {allGroupData
                                      .map((el) => ({ group: el }))
                                      .concat(groups)
                                      .find((el) => el.group?.id === groupId)?.group?.name || ''}
                                  </div>
                                  <ColorSVGIcon.Close
                                    className="cursor-pointer"
                                    color="gray700"
                                    size={24}
                                    onClick={() => setSelectedGroupIds(selectedGroupIds.filter((id) => id !== groupId))}
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="border-gray-[#444] flex h-14 w-full flex-1 items-center border-b">
                    <div className="w-30 flex-shrink-0 py-3 font-bold whitespace-pre text-[#333333]">
                      <div className="flex gap-x-0.5">
                        <p>활동명</p>
                        <div className="bg-primary-orange-800 h-1.5 w-1.5 overflow-hidden rounded-full" />
                      </div>
                    </div>
                    <div className="flex-grow py-3">
                      <TextInput
                        id="title"
                        placeholder="예) 통계포스터 만들기"
                        className="h-10 rounded-lg border border-[#CCCCCC]"
                        {...register('title', { required: true })}
                      />
                      <Label.Error children={errors.title?.message} />
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

                  <div className="border-gray-[#444] flex w-full flex-1 items-center border-b">
                    <div className="w-30 flex-shrink-0 py-3 font-bold whitespace-pre text-[#333333]">활동 설명</div>
                    <div className="flex-grow py-3">
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
                    <div className="w-30 flex-shrink-0 py-3 font-bold whitespace-pre text-[#333333]">
                      <div className="flex gap-x-0.5">
                        <p>공통문구</p>
                        {currentStep === 2 && coachmarkVisible && (
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="bg-brandblue-1 absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
                            <span className="bg-brandblue-1 relative inline-flex h-1.5 w-1.5 rounded-full" />
                            <Coachmark2 steps={steps} currentStep={currentStep} />
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex-grow py-3">
                      <Textarea
                        id="commonText"
                        className="h-20 resize-none rounded-lg border border-[#CCCCCC]"
                        rows={3}
                        placeholder="공통문구를 입력해 주세요. 공통문구는 선생님에게만 보여집니다."
                        {...register('commonText')}
                      />
                      <Label.Error children={errors.commonText?.message} />
                    </div>
                  </div>
                  {activityv3type === SubjectType.LECTURE && (
                    <div className="border-gray-[#444] flex h-14 w-full flex-1 items-center border-b">
                      <div className="w-30 flex-shrink-0 py-3 font-bold whitespace-pre text-[#333333]">
                        <div className="flex gap-x-0.5">
                          <p>성취기준</p>
                        </div>
                      </div>
                      <div className="flex w-full flex-grow flex-col gap-2 py-3">
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
                                <div className="flex h-8 flex-grow items-center overflow-x-hidden">
                                  <div className="w-full truncate text-neutral-500">
                                    {getCriteriaTitle(allCriterias?.find((el) => el.id === criteriaId))}
                                  </div>
                                </div>
                                <div className="flex min-w-max items-center justify-center bg-white px-2">
                                  <div className="flex h-full w-full cursor-pointer items-center justify-center text-white">
                                    <Icon.Close
                                      className="cursor-pointer rounded-full bg-zinc-100 p-1 text-zinc-400"
                                      onClick={() =>
                                        setSelectedCriteriaIds(selectedCriteriaIds.filter((id) => id !== criteriaId))
                                      }
                                    />
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
                    <div className="w-30 flex-shrink-0 font-bold whitespace-pre text-[#333333]">첨부파일</div>
                    <div className="py-3">
                      {/* 이미지 */}
                      {[...imageObjectMap].length > 0 && (
                        <div className="grid w-full flex-grow grid-flow-row grid-cols-6 gap-2 pb-2">
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
                        <p className="text-xs text-neutral-500">100MB 이하의 이미지/문서 파일을 첨부할 수 있습니다.</p>
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
                              <span className="bg-brandblue-1 absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
                              <span className="bg-brandblue-1 relative inline-flex h-1.5 w-1.5 rounded-full" />
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
                <div>
                  <Button
                    className="h-12 w-40 rounded-lg border border-neutral-500 bg-white text-lg font-semibold"
                    onClick={() => setShowDialog(true)}
                  >
                    취소
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    className="h-12 w-40 rounded-lg border border-orange-500 bg-white text-lg font-semibold text-orange-500 disabled:border-gray-500 disabled:text-gray-500"
                    onClick={() => setPreviewOpen(true)}
                    disabled={!isFormValid}
                  >
                    미리보기
                  </Button>
                  <Button
                    className="h-12 w-40 rounded-lg bg-orange-500 text-lg font-semibold text-white disabled:bg-gray-500"
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
                        teacherActivityV3Infos: selectedTeacherInfos,
                      }
                      if (activityv3Data) {
                        updateActivityV3({ id: activityv3Data.id, data: _data })
                      } else {
                        createActivityV3({ data: _data })
                      }
                    })}
                  >
                    확인
                  </Button>
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
          {watch('isJointActivity') && (
            <ActivityTeacherSelectModal
              teachers={teachers}
              modalOpen={selectTeacherModalOpen}
              setModalOpen={setSelectTeacherModalOpen}
              selectedTeacherInfos={selectedTeacherInfos}
              setSelectedTeacherInfos={setSelectedTeacherInfos}
              me={me}
              groups={allGroupData}
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
                          className="bg-brand-5 rounded-md px-2 py-1 text-sm font-bold whitespace-pre text-gray-800"
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
                        <div key={key} className="flex h-8 items-center space-x-2 rounded bg-stone-50 px-3 py-1">
                          <FileItemIcon />
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
                    <Button.lg
                      className="bg-brand-1 w-full text-white disabled:bg-gray-500"
                      disabled
                      children="제출하기"
                    />
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
