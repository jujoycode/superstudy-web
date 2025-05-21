import { PropsWithChildren, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useUserStore } from '@/stores/user'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { Check } from '@/legacy/components/common/Check'
import { IBBlank } from '@/legacy/components/common/IBBlank'
import ScheduleAndPeriodPicker from '@/legacy/components/common/ScheduleAndPeriodPicker'
import Stepper from '@/legacy/components/common/Stepper'
import { Typography } from '@/legacy/components/common/Typography'
import SolidSVGIcon from '@/legacy/components/icon/SolidSVGIcon'
import SVGIcon from '@/legacy/components/icon/SVGIcon'
import { CAS_ATL, CAS_LEARNERPROFILE, CAS_LEARNINGOUTCOME } from '@/legacy/constants/ib'
import { useIBCreate } from '@/legacy/container/ib-project'
import { useInterviewGetByStudentId } from '@/legacy/container/ib-student-interview'
import {
  RequestIBCasDtoAtl,
  RequestIBCasDtoLearnerProfile,
  RequestIBCasDtoLearningOutcome,
  RequestIBCasDtoRiskAssessmentItem,
  RequestIBCasDtoStrands,
  RequestIBDto,
} from '@/legacy/generated/model'
import { DateFormat, DateUtil } from '@/legacy/util/date'
import ColorSVGIcon from '../../icon/ColorSVGIcon'
import { InputField } from '../InputField'

interface IbCASNormalProps {
  modalOpen: boolean
  setModalClose?: () => void
  size?: 'medium' | 'large'
  handleBack?: () => void
  onSuccess: (action: 'CAS_NORMAL', data?: any) => void
  ablePropragation?: boolean
}

export function IbCASNormal({
  modalOpen,
  setModalClose,
  handleBack,
  onSuccess,
  ablePropragation = false,
}: PropsWithChildren<IbCASNormalProps>) {
  const { me } = useUserStore()
  const [isFocused, setIsFocused] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState<boolean>(false)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [selectedATL, setSelectedATL] = useState<number[]>([])
  const [selectedLearnerProfile, setSelectedLearnerProfile] = useState<number[]>([])
  const [useRiskAssessment, setUseRiskAssessment] = useState<boolean>(false)
  const [strands, setStrands] = useState<RequestIBCasDtoStrands>({
    creativity: 0,
    activity: 0,
    service: 0,
  })
  const [date, setDate] = useState<{
    startDate: Date | undefined
    endDate: Date | undefined
    cycle: string | undefined
  }>({
    startDate: undefined,
    endDate: undefined,
    cycle: undefined,
  })

  const { data: riskAssessment } = useInterviewGetByStudentId(me?.id || 0, 'CAS_RISK_ASSESSMENT')

  const {
    control,
    handleSubmit,
    watch,
    formState: {},
  } = useForm<RequestIBDto>()

  const requiredFields = watch([
    'title',
    'cas.sixWhDescription.who',
    'cas.sixWhDescription.when',
    'cas.sixWhDescription.where',
    'cas.sixWhDescription.what',
    'cas.sixWhDescription.how',
    'cas.sixWhDescription.why',
    'cas.goal',
  ])

  const areAllFieldsFilled =
    requiredFields.every((field) => field && field.trim() !== '') &&
    date.startDate &&
    date.endDate &&
    (strands.creativity || strands.activity || strands.service) &&
    selectedIds.length > 0

  const { createIBProject, isLoading } = useIBCreate({
    onSuccess: (data) => {
      onSuccess('CAS_NORMAL', data)
    },
    onError: (error) => {
      console.error('IB 프로젝트 생성 중 오류 발생:', error)
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

  const onSubmit = (data: RequestIBDto) => {
    if (!me?.id) {
      console.error('Leader ID가 없습니다. 로그인 상태를 확인하세요.')
      return
    }

    if (isLoading) {
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

    const riskAssessments: RequestIBCasDtoRiskAssessmentItem[] | null = useRiskAssessment
      ? riskAssessment?.[0]?.commonQuestion?.map((item, index) => ({
          question: item.question,
          answer: String(data.cas?.riskAssessment?.[index] || ''),
        })) || []
      : null

    const requestData: RequestIBDto = {
      title: data.title,
      ibType: 'CAS_NORMAL',
      description: `${me?.name}의 CAS 계획서`,
      activityFrequency: date.cycle,
      startAt: date.startDate ? DateUtil.formatDate(new Date(date.startDate), DateFormat['YYYY-MM-DD']) : undefined,
      endAt: date.endDate ? DateUtil.formatDate(new Date(date.endDate), DateFormat['YYYY-MM-DD']) : undefined,
      leaderId: me.id,
      cas: { ...data.cas, learningOutcome, learnerProfile, strands, atl, riskAssessment: riskAssessments },
    }

    createIBProject(requestData)
  }

  const handleFocus = () => setIsFocused(true)
  const handleBlur = () => setIsFocused(false)

  return (
    <div
      className={`bg-opacity-50 fixed inset-0 z-60 flex h-screen w-full items-center justify-center bg-black ${
        !modalOpen && 'hidden'
      }`}
      onClick={(e) => {
        if (!ablePropragation) {
          e.preventDefault()
          e.stopPropagation()
        }
      }}
    >
      <div className={`relative w-[848px] overflow-hidden rounded-xl bg-white`}>
        {isLoading && <IBBlank type="section-opacity" />}
        <div className="backdrop-blur-20 sticky top-0 z-10 flex h-[88px] items-center justify-between bg-white/70 px-8 pt-8 pb-6">
          <Typography variant="title1">일반 계획서 작성</Typography>
          <ColorSVGIcon.Close color="gray700" size={32} onClick={setModalClose} className="cursor-pointer" />
        </div>

        <div className="scroll-box flex max-h-[608px] flex-col overflow-auto pt-4 pb-8">
          <div className="flex flex-col gap-6 px-8 pb-8">
            <InputField label="활동 제목" name="title" control={control} placeholder="제목을 입력해주세요" required />
            <div className="flex flex-col gap-3">
              <Typography variant="title3" className="font-semibold">
                활동 일정 및 주기
                <span className="text-old-primary-red-800">*</span>
              </Typography>
              <div className="relative">
                <div
                  className={`flex h-10 items-center gap-2 rounded-lg border border-gray-200 px-3 py-[9px] focus:ring-0 focus:outline-hidden ${
                    isFocused && 'border-gray-700'
                  }`}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  onClick={() => setCalendarOpen(!calendarOpen)}
                >
                  <SVGIcon.Calendar size={20} color="gray700" />
                  <input
                    className="text-15 caret-ib-blue-800 w-full flex-1 border-none p-0 text-gray-900 placeholder-gray-400 focus:border-gray-700 focus:text-gray-700 focus:ring-0 focus:outline-hidden"
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
                    placeholder="활동 일정 및 주기 선택"
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
            <div className="flex flex-col gap-3">
              <div className="flex flex-row items-center justify-between">
                <Typography variant="title3" className="font-semibold">
                  Strands
                  <span className="text-old-primary-red-800">*</span>
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
                    strands.activity && strands.activity > 0 ? 'border-ib-blue-100 bg-ib-blue-50' : 'border-gray-100'
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
                    strands.service && strands.service > 0 ? 'border-ib-green-100 bg-ib-green-50' : 'border-gray-100'
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
              <Check.Group selectedValues={selectedATL} onChange={handleATLChange} className="flex flex-wrap gap-2">
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
            <div className="flex flex-col gap-3">
              <Typography variant="title3" className="font-semibold">
                7가지 학습성과
                <span className="text-old-primary-red-800">*</span>
              </Typography>
              <Check.Group selectedValues={selectedIds} onChange={handleGroupChange} className="grid grid-cols-2 gap-3">
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
          </div>
          <div className="flex flex-col gap-6 border-t border-t-gray-100 px-8 py-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <Typography variant="title3" className="font-semibold">
                  활동 설명
                </Typography>
                <Typography variant="caption2" className="text-gray-500">
                  6하원칙에 따라 작성해 주세요.
                </Typography>
              </div>
              <InputField
                label="누가"
                name="cas.sixWhDescription.who"
                type="textarea"
                className="h-40"
                control={control}
                placeholder="내용을 입력해주세요"
                required
              />
              <InputField
                label="언제"
                name="cas.sixWhDescription.when"
                type="textarea"
                className="h-40"
                control={control}
                placeholder="내용을 입력해주세요"
                required
              />
              <InputField
                label="어디서"
                name="cas.sixWhDescription.where"
                type="textarea"
                className="h-40"
                control={control}
                placeholder="내용을 입력해주세요"
                required
              />
              <InputField
                label="무엇을"
                name="cas.sixWhDescription.what"
                type="textarea"
                className="h-40"
                control={control}
                placeholder="내용을 입력해주세요"
                required
              />
              <InputField
                label="어떻게"
                name="cas.sixWhDescription.how"
                type="textarea"
                className="h-40"
                control={control}
                placeholder="내용을 입력해주세요"
                required
              />
              <InputField
                label="왜"
                name="cas.sixWhDescription.why"
                type="textarea"
                className="h-40"
                control={control}
                placeholder="내용을 입력해주세요"
                required
              />
            </div>
          </div>
          <div className="flex flex-col border-t border-t-gray-100 px-8 py-8">
            <InputField
              label="개인적인 목표"
              name="cas.goal"
              type="textarea"
              className="h-24"
              control={control}
              placeholder="IB 학습자상과 관련하여 작성해 주세요"
              required
            />
          </div>
          {riskAssessment && riskAssessment.length > 0 && (
            <div className="flex flex-col border-t border-t-gray-100 px-8 pt-8">
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-2">
                  <Typography variant="title3" className="font-semibold">
                    위험평가
                  </Typography>
                  <Typography variant="caption2" className="text-gray-500">
                    위험평가는 스스로를 보호하기 위해 매우 중요합니다. 하고자 하는 활동에 대해 심사숙고하여 위험평가를
                    해주세요.
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
                        name={`cas.riskAssessment.${index}`}
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

        <div
          className={
            'backdrop-blur-20 sticky bottom-0 flex h-[104px] justify-between gap-4 border-t border-t-gray-100 bg-white/70 px-8 pt-6 pb-8'
          }
        >
          <ButtonV2 variant="solid" color="gray100" size={48} onClick={handleBack}>
            이전
          </ButtonV2>
          <div className="flex gap-3">
            <ButtonV2
              variant="solid"
              color="gray700"
              size={48}
              onClick={handleSubmit(onSubmit)}
              disabled={!areAllFieldsFilled}
            >
              계획서 저장
            </ButtonV2>
          </div>
        </div>
      </div>
    </div>
  )
}
