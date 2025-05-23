import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import NODATA from '@/assets/images/no-data.png'
import { useHistory } from '@/hooks/useHistory'
import { useUserStore } from '@/stores/user'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { BadgeV2 } from '@/legacy/components/common/BadgeV2'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { Check } from '@/legacy/components/common/Check'
import { IBBlank } from '@/legacy/components/common/IBBlank'
import MemberSearch from '@/legacy/components/common/MemberSearch'
import ScheduleAndPeriodPicker from '@/legacy/components/common/ScheduleAndPeriodPicker'
import Stepper from '@/legacy/components/common/Stepper'
import { TextareaV2 } from '@/legacy/components/common/TextareaV2'
import { Typography } from '@/legacy/components/common/Typography'
import ColorSVGIcon from '@/legacy/components/icon/ColorSVGIcon'
import SolidSVGIcon from '@/legacy/components/icon/SolidSVGIcon'
import SVGIcon from '@/legacy/components/icon/SVGIcon'
import { CAS_ATL, CAS_LEARNERPROFILE, CAS_LEARNINGOUTCOME } from '@/legacy/constants/ib'
import { useIBDelete, useIBUpdate } from '@/legacy/container/ib-project'
import { useInterviewGetByStudentId } from '@/legacy/container/ib-student-interview'
import {
  RequestIBCasDtoAtl,
  RequestIBCasDtoLearnerProfile,
  RequestIBCasDtoLearningOutcome,
  RequestIBCasDtoStrands,
  RequestIBDto,
  RequestIBUpdateDto,
  ResponseIBCasDtoAtl,
  ResponseIBCasDtoLearnerProfile,
  ResponseIBCasDtoLearningOutcome,
  ResponseIBDto,
  ResponseIBStudentDto,
} from '@/legacy/generated/model'
import { useHandleGoBack } from '@/legacy/hooks/useHandleGoBack'
import { DateFormat, DateUtil } from '@/legacy/util/date'
import { Feedback } from '../Feedback'
import { InputField } from '../InputField'

interface ProjectActivityPlanProps {
  data: ResponseIBDto
  refetch: () => void
  type?: 'student' | 'teacher'
  setEdit: (value: boolean) => void
  hasPermission?: boolean
}

function ProjectActivityPlan({
  data,
  refetch,
  type = 'student',
  setEdit,
  hasPermission = true,
}: ProjectActivityPlanProps) {
  const { me } = useUserStore()

  const [editMode, setEditMode] = useState<boolean>(false)
  const handleChangeStatus = () => {
    setEditMode(!editMode)
    setEdit(!editMode)
  }
  const [isFocused, setIsFocused] = useState(false)
  const [isFocused2, setIsFocused2] = useState(false)
  const [searchOpen, setSearchOpen] = useState<boolean>(false)
  const history = useHistory()
  const handleGoBack = useHandleGoBack(type === 'student' ? '/ib/student' : '/teacher/project')
  const [calendarOpen, setCalendarOpen] = useState<boolean>(false)
  const [leader, setLeader] = useState<ResponseIBStudentDto>(data.leader)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [selectedATL, setSelectedATL] = useState<number[]>([])
  const [selectedLearnerProfile, setSelectedLearnerProfile] = useState<number[]>([])
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false)
  const [useRiskAssessment, setUseRiskAssessment] = useState<boolean>(data?.cas?.riskAssessment !== null)
  const [alertMessage, setAlertMessage] = useState<{ text: string; action?: () => void; description?: string } | null>(
    null,
  )

  const { data: riskAssessment } = useInterviewGetByStudentId(me?.id || 0, 'CAS_RISK_ASSESSMENT')
  const [group, setGroup] = useState<ResponseIBStudentDto[]>([
    { ...data.leader },
    ...(data.members || []).map((member) => ({ ...member })),
  ])

  const mapLearningOutcomeToIds = (learningOutcome: ResponseIBCasDtoLearningOutcome): number[] => {
    const mapping = [
      { key: 'strengthsDevelopment', id: 1 },
      { key: 'newSkills', id: 2 },
      { key: 'initiativePlanning', id: 3 },
      { key: 'perseverance', id: 4 },
      { key: 'teamworkBenefits', id: 5 },
      { key: 'globalIssues', id: 6 },
      { key: 'ethicalChoices', id: 7 },
    ]

    return mapping
      .filter(({ key }) => learningOutcome[key as keyof ResponseIBCasDtoLearningOutcome])
      .map(({ id }) => id)
  }

  const mapLearnerProfileToIds = (learnerProfile: ResponseIBCasDtoLearnerProfile): number[] => {
    const mapping = [
      { key: 'inquirer', id: 1 },
      { key: 'knowledgeable', id: 2 },
      { key: 'thinker', id: 3 },
      { key: 'communicator', id: 4 },
      { key: 'principled', id: 5 },
      { key: 'openMinded', id: 6 },
      { key: 'caring', id: 7 },
      { key: 'riskTaker', id: 8 },
      { key: 'balanced', id: 9 },
      { key: 'reflective', id: 10 },
    ]

    return mapping.filter(({ key }) => learnerProfile[key as keyof ResponseIBCasDtoLearnerProfile]).map(({ id }) => id)
  }

  const mapATLToIds = (atl: ResponseIBCasDtoAtl): number[] => {
    const mapping = [
      { key: 'communication', id: 1 },
      { key: 'social', id: 2 },
      { key: 'selfManagement', id: 3 },
      { key: 'research', id: 4 },
      { key: 'thinking', id: 5 },
    ]

    return mapping.filter(({ key }) => atl[key as keyof ResponseIBCasDtoAtl]).map(({ id }) => id)
  }

  const [strands, setStrands] = useState<RequestIBCasDtoStrands>({
    creativity: data.cas?.strands.creativity,
    activity: data.cas?.strands.activity,
    service: data.cas?.strands.service,
  })

  const [date, setDate] = useState<{
    startDate: Date | undefined
    endDate: Date | undefined
    cycle: string | undefined
  }>({
    startDate: data.startAt ? new Date(data.startAt) : undefined,
    endDate: data.endAt ? new Date(data.endAt) : undefined,
    cycle: data.activityFrequency,
  })
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: {},
  } = useForm<RequestIBDto>({
    defaultValues: data,
  })

  const requiredFields = watch([
    'title',
    'cas.goal',
    'cas.step.research',
    'cas.step.preparation',
    'cas.step.activity',
    'cas.step.reflection',
    'cas.step.evidence',
    'cas.externalContacts',
  ])

  const areAllFieldsFilled =
    requiredFields.every((field) => field && field.trim() !== '') &&
    date.startDate &&
    date.endDate &&
    (strands.creativity || strands.activity || strands.service) &&
    selectedIds.length > 0 &&
    selectedATL.length > 0 &&
    selectedLearnerProfile.length > 0

  const { updateIBProject, isLoading } = useIBUpdate({
    onSuccess: () => {
      setAlertMessage({ text: `계획서가\n저장되었습니다` })
      refetch()
    },
    onError: (error) => {
      console.error('IB 프로젝트 수정 중 오류 발생:', error)
    },
  })

  const { deleteIBProject } = useIBDelete({
    onSuccess: () => {
      setConfirmOpen(!confirmOpen)
      history.push('/ib/student', {
        alertMessage: `계획서가\n삭제되었습니다`,
      })
    },
    onError: () => {
      setConfirmOpen(!confirmOpen)
      setAlertMessage({
        text: `계획서를 삭제할 수 없습니다.`,
        description: `이미 작성한 활동일지가 있습니다.\n계획서 삭제를 원하시면 활동일지를 삭제해주세요.`,
      })
    },
  })

  const handleGroupChange = (selectedValues: number[]) => {
    setSelectedIds(selectedValues)
  }

  const handleLearnerProfileChange = (selectedValues: number[]) => {
    setSelectedLearnerProfile(selectedValues)
  }

  const handleATLChange = (selectedValues: number[]) => {
    setSelectedATL(selectedValues)
  }

  const isDisabled = () => {
    if (data.status === 'COMPLETE') {
      return true
    }
    if (
      (data.status === 'IN_PROGRESS' || data.status === 'REJECT_COMPLETE' || data.status === 'WAIT_COMPLETE') &&
      data.leader.id !== me?.id &&
      type === 'student'
    ) {
      return true
    }
    return false
  }

  const onSubmit = (formData: RequestIBDto) => {
    if (!me?.id) {
      console.error('Leader ID가 없습니다. 로그인 상태를 확인하세요.')
      return
    }

    const learningOutcome: RequestIBCasDtoLearningOutcome = {
      strengthsDevelopment: selectedIds.includes(1),
      newSkills: selectedIds.includes(2),
      initiativePlanning: selectedIds.includes(3),
      perseverance: selectedIds.includes(4),
      teamworkBenefits: selectedIds.includes(5),
      globalIssues: selectedIds.includes(6),
      ethicalChoices: selectedIds.includes(7),
    }

    const learnerProfile: RequestIBCasDtoLearnerProfile = {
      inquirer: selectedLearnerProfile.includes(1),
      knowledgeable: selectedLearnerProfile.includes(2),
      thinker: selectedLearnerProfile.includes(3),
      communicator: selectedLearnerProfile.includes(4),
      principled: selectedLearnerProfile.includes(5),
      openMinded: selectedLearnerProfile.includes(6),
      caring: selectedLearnerProfile.includes(7),
      riskTaker: selectedLearnerProfile.includes(8),
      balanced: selectedLearnerProfile.includes(9),
      reflective: selectedLearnerProfile.includes(10),
    }

    const atl: RequestIBCasDtoAtl = {
      communication: selectedATL.includes(1),
      social: selectedATL.includes(2),
      selfManagement: selectedATL.includes(3),
      research: selectedATL.includes(4),
      thinking: selectedATL.includes(5),
    }

    const riskAssessmentData =
      riskAssessment?.[0]?.commonQuestion?.map((item, index) => ({
        question: item.question,
        answer: formData.cas?.riskAssessment?.[index].answer,
      })) || []

    const requestData: RequestIBUpdateDto = {
      title: formData.title,
      description: `${me?.name}의 CAS 계획서`,
      activityFrequency: date.cycle,
      startAt: date.startDate ? DateUtil.formatDate(new Date(date.startDate), DateFormat['YYYY-MM-DD']) : undefined,
      endAt: date.endDate ? DateUtil.formatDate(new Date(date.endDate), DateFormat['YYYY-MM-DD']) : undefined,
      leaderId: leader.id,
      memberIds: group.filter((member) => member.id !== leader.id).map((member) => member.id),
      cas: {
        ...formData.cas,
        id: data.cas?.id || 0,
        learningOutcome,
        learnerProfile,
        atl,
        riskAssessment: useRiskAssessment ? riskAssessmentData : null,
        strands,
      },
    }

    updateIBProject({ id: data.id, data: requestData })
    setEditMode(!editMode)
    setEdit(false)
  }

  const handleFocus = () => setIsFocused(true)
  const handleBlur = () => setIsFocused(false)
  const handleFocus2 = () => setIsFocused2(true)
  const handleBlur2 = () => setIsFocused2(false)

  const handleMemberRemove = (memberId: number) => {
    setGroup((prevGroup) => prevGroup.filter((member) => member.id !== memberId))
  }

  useEffect(() => {
    if (!editMode) {
      setStrands({
        creativity: data.cas?.strands.creativity || 0,
        activity: data.cas?.strands.activity || 0,
        service: data.cas?.strands.service || 0,
      })

      setDate({
        startDate: data.startAt ? new Date(data.startAt) : undefined,
        endDate: data.endAt ? new Date(data.endAt) : undefined,
        cycle: data.activityFrequency || undefined,
      })

      if (data.cas?.learningOutcome) {
        setSelectedIds(mapLearningOutcomeToIds(data.cas.learningOutcome))
      }
      if (data.cas?.learnerProfile) {
        setSelectedLearnerProfile(mapLearnerProfileToIds(data.cas.learnerProfile))
      }
      if (data.cas?.atl) {
        setSelectedATL(mapATLToIds(data.cas.atl))
      }
      reset(data)
      setUseRiskAssessment(data.cas?.riskAssessment !== null)
    }
  }, [editMode, data])

  if (me == null) {
    return <IBBlank />
  }

  return (
    <div className="flex grow flex-col">
      {isLoading && <IBBlank />}
      <div className="flex h-full flex-row gap-4">
        <div className="flex w-[848px] flex-col rounded-xl bg-white p-6">
          {editMode ? (
            <>
              <div>
                <div className="scroll-box flex h-full flex-col gap-10 overflow-auto pb-10">
                  <InputField
                    titleVariant="title2"
                    label="활동 제목"
                    name="title"
                    control={control}
                    mode="page"
                    placeholder="제목을 입력해주세요"
                    required
                  />
                  <div className="flex flex-col gap-4">
                    <Typography variant="title2" className="font-semibold">
                      활동 일정 및 주기<span className="text-old-primary-red-800"> *</span>
                    </Typography>

                    <div className="relative">
                      <div
                        className={`flex h-12 items-center gap-2 rounded-lg border border-gray-200 px-4 py-[9px] focus:ring-0 focus:outline-hidden ${
                          isFocused && 'border-gray-700'
                        }`}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        onClick={() => setCalendarOpen(!calendarOpen)}
                      >
                        <SVGIcon.Calendar size={20} color="gray700" />
                        <input
                          className="text-15 caret-old-primary-blue-800 w-full flex-1 border-none p-0 text-gray-900 placeholder-gray-400 focus:border-gray-700 focus:text-gray-700 focus:ring-0 focus:outline-hidden"
                          placeholder="활동 일정 및 주기 선택"
                          value={
                            date.startDate && date.endDate
                              ? `${date.startDate.getFullYear()}.${(date.startDate.getMonth() + 1)
                                  .toString()
                                  .padStart(2, '0')}.${date.startDate
                                  .getDate()
                                  .toString()
                                  .padStart(2, '0')} ~ ${date.endDate.getFullYear()}.${(date.endDate.getMonth() + 1)
                                  .toString()
                                  .padStart(2, '0')}.${date.endDate.getDate().toString().padStart(2, '0')} ${
                                  date.cycle || ''
                                }`
                              : ''
                          }
                        />
                      </div>
                      {calendarOpen && (
                        <div className="absolute top-full left-0 z-50 mt-2">
                          <ScheduleAndPeriodPicker
                            initialDate={date}
                            onSave={(finalDate) => {
                              setDate(finalDate)
                              setCalendarOpen(false)
                            }}
                            onCancel={() => setCalendarOpen(false)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-4">
                    <InputField
                      titleVariant="title2"
                      label="프로젝트 목표"
                      name="cas.goal"
                      mode="page"
                      type="textarea"
                      className="h-24"
                      control={control}
                      placeholder="프로젝트 목표를 입력해주세요"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-row items-center justify-between">
                      <Typography variant="title2" className="font-semibold">
                        프로젝트 멤버<span className="text-old-primary-red-800"> *</span>
                      </Typography>
                      <Typography variant="caption2" className="text-gray-500">
                        프로젝트 멤버를 추가하고 리더를 변경할 수 있습니다.
                      </Typography>
                    </div>
                    <div className="relative">
                      <div
                        className={`flex h-12 items-center gap-2 rounded-lg border border-gray-200 px-3 py-[9px] focus:ring-0 focus:outline-hidden ${
                          isFocused2 && 'border-gray-700'
                        }`}
                        onFocus={handleFocus2}
                        onBlur={handleBlur2}
                        onClick={() => setSearchOpen(!searchOpen)}
                      >
                        <SVGIcon.Profile size={20} color="gray700" />
                        <input
                          className="caret-old-primary-blue-800 w-full flex-1 border-none p-0 text-gray-900 placeholder-gray-400 focus:border-gray-700 focus:text-gray-700 focus:ring-0 focus:outline-hidden"
                          placeholder="멤버 선택"
                          readOnly
                        />
                      </div>
                      {searchOpen && (
                        <div className="relative top-2 left-0 z-50">
                          <MemberSearch
                            onCancel={() => setSearchOpen(false)}
                            initialStudents={group}
                            id={me.id}
                            onSave={(finalMember) => {
                              setGroup(finalMember)
                              setSearchOpen(false)
                            }}
                          />
                        </div>
                      )}
                      {data.leader && (
                        <div className="flex flex-wrap items-center gap-2 pt-3">
                          {group.map((member) => {
                            return (
                              <div
                                key={member.id}
                                onClick={() => {
                                  if (leader.id !== member.id) setLeader(member)
                                }}
                                className={`flex h-[48px] flex-row items-center gap-2 rounded-lg px-4 py-[9px] ${
                                  leader.id === member.id
                                    ? 'bg-primary-100'
                                    : 'hover:border-primary-400 hover:bg-primary-50 cursor-pointer bg-gray-50 hover:border'
                                }`}
                              >
                                {leader.id === member.id && (
                                  <BadgeV2 color="orange" type="solid_strong" size={20}>
                                    리더
                                  </BadgeV2>
                                )}
                                <Typography variant="body2" className={`font-medium text-gray-700`}>
                                  {member.name}&nbsp;
                                  {member.studentGroup.group.grade}
                                  {String(member.studentGroup.group.klass).padStart(2, '0')}
                                  {String(member.studentGroup.studentNumber).padStart(2, '0')}
                                </Typography>
                                {leader.id !== member.id && member.id !== me?.id && (
                                  <ColorSVGIcon.Close
                                    className="cursor-pointer"
                                    color="dimmed"
                                    size={24}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleMemberRemove(member.id)
                                    }}
                                  />
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex flex-row items-center justify-between">
                      <Typography variant="title2" className="font-semibold">
                        Strands
                        <span className="text-old-primary-red-800"> *</span>
                      </Typography>
                      <Typography variant="caption2" className="text-gray-500">
                        단위 : 시간
                      </Typography>
                    </div>
                    <nav className="flex w-full flex-row items-center justify-between gap-3">
                      <div
                        className={`flex w-[254px] flex-row items-center gap-2 rounded-lg border ${
                          strands.creativity && strands.creativity > 0
                            ? 'border-primary-100 bg-primary-50'
                            : 'border-gray-100'
                        } p-4`}
                      >
                        <SolidSVGIcon.C size={20} color="orange800" />
                        <Typography variant="body2" className="w-[82px]">
                          Creativity
                        </Typography>
                        <Stepper
                          number={strands.creativity || 0}
                          setNumber={(value) => setStrands((prev) => ({ ...prev, creativity: value }))}
                        />
                      </div>
                      <div
                        className={`flex w-[254px] flex-row items-center gap-2 rounded-lg border ${
                          strands.activity && strands.activity > 0
                            ? 'border-old-primary-blue-100 bg-old-primary-blue-50'
                            : 'border-gray-100'
                        } p-4`}
                      >
                        <SolidSVGIcon.A size={20} color="orange800" />
                        <Typography variant="body2" className="w-[82px]">
                          Activity
                        </Typography>
                        <Stepper
                          number={strands.activity || 0}
                          setNumber={(value) => setStrands((prev) => ({ ...prev, activity: value }))}
                        />
                      </div>
                      <div
                        className={`flex w-[254px] flex-row items-center gap-2 rounded-lg border ${
                          strands.service && strands.service > 0
                            ? 'border-old-primary-green-100 bg-old-primary-green-50'
                            : 'border-gray-100'
                        } p-4`}
                      >
                        <SolidSVGIcon.S size={20} color="orange800" />
                        <Typography variant="body2" className="w-[82px]">
                          Service
                        </Typography>
                        <Stepper
                          number={strands.service || 0}
                          setNumber={(value) => setStrands((prev) => ({ ...prev, service: value }))}
                        />
                      </div>
                    </nav>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Typography variant="title3" className="font-semibold">
                      IB 학습자 상<span className="text-old-primary-red-800">*</span>
                    </Typography>
                    <Check.Group
                      selectedValues={selectedLearnerProfile}
                      onChange={handleLearnerProfileChange}
                      className="flex flex-wrap gap-2"
                    >
                      {CAS_LEARNERPROFILE?.map((item) => (
                        <Check.Box
                          key={item.id}
                          label={item.value}
                          size={20}
                          value={item.id}
                          checked={selectedLearnerProfile.includes(item.id)}
                        />
                      ))}
                    </Check.Group>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Typography variant="title3" className="font-semibold">
                      ATL
                      <span className="text-old-primary-red-800">*</span>
                    </Typography>
                    <Check.Group
                      selectedValues={selectedATL}
                      onChange={handleATLChange}
                      className="flex flex-wrap gap-2"
                    >
                      {CAS_ATL?.map((item) => (
                        <Check.Box
                          key={item.id}
                          label={item.value}
                          size={20}
                          value={item.id}
                          checked={selectedATL.includes(item.id)}
                        />
                      ))}
                    </Check.Group>
                  </div>
                  <div className="flex flex-col gap-4">
                    <Typography variant="title2" className="font-semibold">
                      7가지 학습성과
                      <span className="text-old-primary-red-800"> *</span>
                    </Typography>
                    <Check.Group
                      selectedValues={selectedIds}
                      onChange={handleGroupChange}
                      className="grid grid-cols-2 gap-3"
                    >
                      {CAS_LEARNINGOUTCOME?.map((item) => (
                        <Check.Box
                          key={item.id}
                          label={item.value}
                          size={20}
                          value={item.id}
                          checked={selectedIds.includes(item.id)}
                        />
                      ))}
                    </Check.Group>
                  </div>
                  <div className="flex flex-col gap-10 border-t border-t-gray-100 pt-10">
                    <div className="flex flex-col gap-2">
                      <Typography variant="title2" className="font-semibold">
                        단계
                      </Typography>
                      <Typography variant="caption2" className="text-gray-500">
                        각 CAS 단계에서 무엇을 계획했는지 혹은 무엇을 했는지 기록합니다.
                      </Typography>
                    </div>
                    <InputField
                      type="textarea"
                      mode="page"
                      label="조사"
                      titleVariant="title2"
                      className="h-40"
                      placeholder="Sdg's(셰계적 이슈)과 지역 문제를 연계한 문제를 탐색해주세요"
                      name="cas.step.research"
                      control={control}
                      required
                    />
                    <InputField
                      type="textarea"
                      label="준비"
                      mode="page"
                      titleVariant="title2"
                      className="h-40"
                      placeholder="내용을 입력해주세요"
                      name="cas.step.preparation"
                      control={control}
                      required
                    />
                    <InputField
                      type="textarea"
                      label="실행"
                      mode="page"
                      titleVariant="title2"
                      className="h-40"
                      placeholder="내용을 입력해주세요"
                      name="cas.step.activity"
                      control={control}
                      required
                    />
                    <InputField
                      type="textarea"
                      label="성찰"
                      mode="page"
                      titleVariant="title2"
                      className="h-40"
                      placeholder="내용을 입력해주세요"
                      name="cas.step.reflection"
                      control={control}
                      required
                    />
                    <InputField
                      type="textarea"
                      label="입증"
                      mode="page"
                      titleVariant="title2"
                      className="h-40"
                      placeholder="내용을 입력해주세요"
                      name="cas.step.evidence"
                      control={control}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-4 border-t border-t-gray-100 py-8">
                    <div className="flex flex-row items-center justify-between">
                      <Typography variant="title2" className="font-semibold">
                        단체명(강사명) 및 연락처
                        <span className="text-old-primary-red-800"> *</span>
                      </Typography>
                      <Typography variant="caption2" className="text-gray-500">
                        외부 단체, 강사와 협력하는 경우 기입해주세요.
                      </Typography>
                    </div>
                    <InputField
                      mode="page"
                      name="cas.externalContacts"
                      size={48}
                      titleVariant="title2"
                      control={control}
                      placeholder="단체명(강사명) 및 연락처를 입력해주세요"
                      type="input"
                      inputType="text"
                      required
                    />
                  </div>
                  {riskAssessment && riskAssessment.length > 0 && (
                    <div className="flex flex-col border-t border-t-gray-100 pt-8">
                      <div className="flex flex-col gap-8">
                        <div className="flex flex-col gap-2">
                          <Typography variant="title3" className="font-semibold">
                            위험평가
                          </Typography>
                          <Typography variant="caption2" className="text-gray-500">
                            위험평가는 스스로를 보호하기 위해 매우 중요합니다. 하고자 하는 활동에 대해 심사숙고하여
                            위험평가를 해주세요.
                          </Typography>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Typography variant="body1" className="font-medium">
                            위험평가 여부
                          </Typography>
                          <div className="flex flex-row items-center gap-4">
                            <Check.BoxNB
                              label="YES"
                              size={20}
                              checked={useRiskAssessment}
                              onChange={() => setUseRiskAssessment(!useRiskAssessment)}
                            />
                            <Check.BoxNB
                              label="NO"
                              size={20}
                              checked={!useRiskAssessment}
                              onChange={() => setUseRiskAssessment(!useRiskAssessment)}
                            />
                          </div>
                        </div>
                        {useRiskAssessment && (
                          <div className="flex flex-col gap-4">
                            <Typography variant="body1" className="font-medium">
                              고려해야 할 위험 요소
                            </Typography>
                            {riskAssessment?.[0]?.commonQuestion?.map((item, index) => (
                              <InputField
                                key={index}
                                label={`${index + 1}. ${item.question}`}
                                name={`cas.riskAssessment.${index}.answer`}
                                type="textarea"
                                className="h-24"
                                control={control}
                                placeholder={item.hint}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-10 pb-10">
                <div className="flex flex-col gap-4">
                  <Typography variant="title2" className="font-semibold">
                    활동 일정 및 주기
                  </Typography>
                  <div className="relative">
                    <div
                      className={`flex h-12 items-center gap-2 rounded-lg border border-gray-200 px-4 py-[9px] focus:ring-0 focus:outline-hidden`}
                    >
                      <SVGIcon.Calendar size={20} color="gray700" />
                      <input
                        className="text-15 caret-old-primary-blue-800 w-full flex-1 border-none p-0 text-gray-900 placeholder-gray-400 focus:border-gray-700 focus:text-gray-700 focus:ring-0 focus:outline-hidden"
                        readOnly
                        placeholder="활동 일정 및 주기 선택"
                        value={
                          date.startDate && date.endDate
                            ? `${date.startDate.getFullYear()}.${(date.startDate.getMonth() + 1)
                                .toString()
                                .padStart(2, '0')}.${date.startDate
                                .getDate()
                                .toString()
                                .padStart(2, '0')} ~ ${date.endDate.getFullYear()}.${(date.endDate.getMonth() + 1)
                                .toString()
                                .padStart(2, '0')}.${date.endDate.getDate().toString().padStart(2, '0')} ${
                                date.cycle || ''
                              }`
                            : '-'
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <Typography variant="title2" className="font-semibold">
                    프로젝트 목표
                  </Typography>
                  <TextareaV2 placeholder="-" readonly={true} value={data.cas?.goal} />
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-row items-center justify-between">
                    <Typography variant="title2" className="font-semibold">
                      프로젝트 멤버
                    </Typography>
                    <Typography variant="caption2" className="text-gray-500">
                      프로젝트 멤버를 추가하고 리더를 변경할 수 있습니다.
                    </Typography>
                  </div>
                  {data.members && data.leader && (
                    <div className="flex flex-wrap items-center gap-2">
                      <div
                        className={`flex h-[48px] flex-row items-center gap-2 rounded-lg border border-gray-200 px-4 py-[9px]`}
                      >
                        <BadgeV2 color="orange" type="solid_strong" size={20}>
                          리더
                        </BadgeV2>
                        <Typography variant="body2" className={`font-medium text-gray-700`}>
                          {data.leader.name}&nbsp;
                          {data.leader.studentGroup.group.grade}
                          {String(data.leader.studentGroup.group.klass).padStart(2, '0')}
                          {String(data.leader.studentGroup.studentNumber).padStart(2, '0')}
                        </Typography>
                      </div>
                      {data.members.map((member) => {
                        return (
                          <div
                            key={member.id}
                            className={`flex h-[48px] flex-row items-center gap-2 rounded-lg border border-gray-200 px-4 py-[9px]`}
                          >
                            <Typography variant="body2" className={`font-medium text-gray-700`}>
                              {member.name}&nbsp;
                              {member.studentGroup.group.grade}
                              {String(member.studentGroup.group.klass).padStart(2, '0')}
                              {String(member.studentGroup.studentNumber).padStart(2, '0')}
                            </Typography>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-row items-center justify-between">
                    <Typography variant="title2" className="font-semibold">
                      Strands
                    </Typography>
                    <Typography variant="caption2" className="text-gray-500">
                      단위 : 시간
                    </Typography>
                  </div>
                  <nav className="flex w-full flex-row items-center justify-between gap-3">
                    <div
                      className={`flex w-[254px] flex-row items-center gap-2 rounded-lg ${
                        data.cas?.strands.creativity && data.cas.strands.creativity > 0
                          ? 'border-primary-100 bg-primary-50 border'
                          : 'border border-gray-100'
                      } p-4`}
                    >
                      <SolidSVGIcon.C size={20} color="orange800" />
                      <Typography variant="body2" className="w-[82px]">
                        Creativity
                      </Typography>
                      <Stepper
                        number={strands.creativity || 0}
                        disabled={true}
                        setNumber={(value) => setStrands((prev) => ({ ...prev, creativity: value }))}
                      />
                    </div>
                    <div
                      className={`flex w-[254px] flex-row items-center gap-2 rounded-lg ${
                        data.cas?.strands.activity && data.cas.strands.activity > 0
                          ? 'border-old-primary-blue-100 bg-old-primary-blue-50 border'
                          : 'border border-gray-100'
                      } p-4`}
                    >
                      <SolidSVGIcon.A size={20} color="orange800" />
                      <Typography variant="body2" className="w-[82px]">
                        Activity
                      </Typography>
                      <Stepper
                        number={strands.activity || 0}
                        disabled={true}
                        setNumber={(value) => setStrands((prev) => ({ ...prev, activity: value }))}
                      />
                    </div>
                    <div
                      className={`flex w-[254px] flex-row items-center gap-2 rounded-lg ${
                        data.cas?.strands.service && data.cas.strands.service > 0
                          ? 'border-old-primary-green-100 bg-old-primary-green-50 border'
                          : 'border border-gray-100'
                      } p-4`}
                    >
                      <SolidSVGIcon.S size={20} color="orange800" />
                      <Typography variant="body2" className="w-[82px]">
                        Service
                      </Typography>
                      <Stepper
                        number={strands.service || 0}
                        disabled={true}
                        setNumber={(value) => setStrands((prev) => ({ ...prev, service: value }))}
                      />
                    </div>
                  </nav>
                </div>
                <div className="flex flex-col gap-4">
                  <Typography variant="title2" className="font-semibold">
                    IB 학습자 상
                  </Typography>
                  <Check.Group
                    selectedValues={selectedLearnerProfile}
                    onChange={handleLearnerProfileChange}
                    className="flex flex-wrap gap-2"
                  >
                    {CAS_LEARNERPROFILE?.map((item) => (
                      <Check.Box
                        key={item.id}
                        label={item.value}
                        size={20}
                        disabled={true}
                        value={item.id}
                        checked={selectedLearnerProfile.includes(item.id)}
                      />
                    ))}
                  </Check.Group>
                </div>
                <div className="flex flex-col gap-4">
                  <Typography variant="title2" className="font-semibold">
                    ATL
                  </Typography>
                  <Check.Group selectedValues={selectedATL} onChange={handleATLChange} className="flex flex-wrap gap-2">
                    {CAS_ATL?.map((item) => (
                      <Check.Box
                        key={item.id}
                        label={item.value}
                        size={20}
                        disabled={true}
                        value={item.id}
                        checked={selectedATL.includes(item.id)}
                      />
                    ))}
                  </Check.Group>
                </div>
                <div className="flex flex-col gap-4">
                  <Typography variant="title2" className="font-semibold">
                    7가지 학습성과
                  </Typography>
                  <Check.Group
                    selectedValues={selectedIds}
                    onChange={handleGroupChange}
                    className="grid grid-cols-2 gap-3"
                  >
                    {CAS_LEARNINGOUTCOME?.map((item) => (
                      <Check.Box
                        key={item.id}
                        label={item.value}
                        size={20}
                        disabled={true}
                        value={item.id}
                        checked={selectedIds.includes(item.id)}
                      />
                    ))}
                  </Check.Group>
                </div>
                <div className="flex flex-col gap-10 border-t border-t-gray-100 pt-10">
                  <div className="flex flex-col gap-2">
                    <Typography variant="title2" className="font-semibold">
                      단계
                    </Typography>
                    <Typography variant="caption2" className="text-gray-500">
                      각 CAS 단계에서 무엇을 계획했는지 혹은 무엇을 했는지 기록합니다.
                    </Typography>
                  </div>
                  <div className="flex flex-col gap-4">
                    <Typography variant="title2" className="font-semibold">
                      조사
                    </Typography>
                    <div className="shrink grow basis-0 rounded-lg border border-gray-200 bg-white p-4">
                      <Typography variant="body2" className="font-medium text-gray-700">
                        {data.cas?.step?.research || '-'}
                      </Typography>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4">
                    <Typography variant="title2" className="font-semibold">
                      준비
                    </Typography>
                    <div className="shrink grow basis-0 rounded-lg border border-gray-200 bg-white p-4">
                      <Typography variant="body2" className="font-medium text-gray-700">
                        {data.cas?.step?.preparation || '-'}
                      </Typography>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4">
                    <Typography variant="title2" className="font-semibold">
                      실행
                    </Typography>
                    <div className="shrink grow basis-0 rounded-lg border border-gray-200 bg-white p-4">
                      <Typography variant="body2" className="font-medium text-gray-700">
                        {data.cas?.step?.activity || '-'}
                      </Typography>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4">
                    <Typography variant="title2" className="font-semibold">
                      성찰
                    </Typography>
                    <div className="shrink grow basis-0 rounded-lg border border-gray-200 bg-white p-4">
                      <Typography variant="body2" className="font-medium text-gray-700">
                        {data.cas?.step?.reflection || '-'}
                      </Typography>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4">
                    <Typography variant="title2" className="font-semibold">
                      입증
                    </Typography>
                    <div className="shrink grow basis-0 rounded-lg border border-gray-200 bg-white p-4">
                      <Typography variant="body2" className="font-medium text-gray-700">
                        {data.cas?.step?.evidence || '-'}
                      </Typography>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-4 border-t border-t-gray-100 pt-10">
                  <Typography variant="title2" className="font-semibold">
                    단체명(강사명) 및 연락처
                  </Typography>
                  <div className="shrink grow basis-0 rounded-lg border border-gray-200 bg-white px-4 py-[13px]">
                    <Typography variant="body2" className="font-medium text-gray-700">
                      {data.cas?.externalContacts || '-'}
                    </Typography>
                  </div>
                </div>
                {useRiskAssessment && (
                  <div className="flex flex-col gap-10 border-t border-t-gray-100 pt-10">
                    <div className="flex flex-col gap-2">
                      <Typography variant="title2" className="font-semibold">
                        위험평가
                      </Typography>
                      <Typography variant="caption2" className="text-gray-500">
                        위험평가는 스스로를 보호하기 위해 매우 중요합니다. 하고자 하는 활동에 대해 심사숙고하여
                        위험평가를 해주세요.
                      </Typography>
                    </div>
                    {data.cas?.riskAssessment?.map((item, index) => (
                      <div className="flex flex-col gap-4" key={index}>
                        <Typography variant="title2" className="font-semibold">
                          {`${index + 1}. ${item.question}`}
                        </Typography>
                        <div className="shrink grow basis-0 rounded-lg border border-gray-200 bg-white p-4">
                          <Typography variant="body2" className="font-medium text-gray-700">
                            {item.answer || '-'}
                          </Typography>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          <footer className={`flex flex-row items-center justify-between`}>
            {editMode ? (
              <>
                <ButtonV2 size={40} variant="solid" color="gray100" onClick={handleChangeStatus}>
                  취소
                </ButtonV2>
                <ButtonV2
                  size={40}
                  variant="solid"
                  color="orange100"
                  onClick={handleSubmit(onSubmit)}
                  disabled={!areAllFieldsFilled}
                >
                  저장하기
                </ButtonV2>
              </>
            ) : (
              <>
                <div className="flex flex-row items-center gap-2">
                  {data.status !== 'COMPLETE' && (data.leader.id === me.id || hasPermission) && (
                    <ButtonV2
                      size={40}
                      variant="outline"
                      color="gray400"
                      onClick={handleChangeStatus}
                      disabled={data.status === 'WAIT_COMPLETE'}
                    >
                      수정
                    </ButtonV2>
                  )}

                  {data.status === 'PENDING' || (data.status === 'WAIT_MENTOR' && data.mentor === null) ? (
                    <ButtonV2 size={40} variant="outline" color="gray400" onClick={() => setConfirmOpen(!confirmOpen)}>
                      삭제
                    </ButtonV2>
                  ) : null}
                </div>
                <ButtonV2 size={40} variant="solid" color="gray100" onClick={handleGoBack}>
                  목록 돌아가기
                </ButtonV2>
              </>
            )}
          </footer>
        </div>
        <div className="flex h-[720px] w-[416px] flex-col gap-6 rounded-xl bg-white p-6">
          <Typography variant="title1">진행기록</Typography>
          {data?.status !== 'PENDING' ? (
            <div className="h-full w-full">
              <Feedback
                referenceId={data.id}
                referenceTable="IB"
                user={me}
                disabled={isDisabled()}
                useTextarea={data.status !== 'COMPLETE'}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 py-20">
              <div className="h-12 w-12 px-[2.50px]">
                <img src={NODATA} className="h-12 w-[43px] object-cover" />
              </div>
              <Typography variant="body2">진행기록이 없습니다.</Typography>
            </div>
          )}
        </div>
      </div>
      {alertMessage && (
        <AlertV2
          message={alertMessage.text}
          confirmText="확인"
          description={alertMessage.description}
          onConfirm={() => {
            if (alertMessage.action) alertMessage.action()
            setAlertMessage(null)
          }}
        />
      )}
      {confirmOpen && (
        <AlertV2
          message={`계획서를 삭제하시겠습니까?`}
          confirmText="확인"
          cancelText="취소"
          description={`삭제 후 다시 되돌릴 수 없습니다.`}
          onCancel={() => setConfirmOpen(!confirmOpen)}
          onConfirm={() => deleteIBProject(data.id)}
        />
      )}
    </div>
  )
}

export default ProjectActivityPlan
