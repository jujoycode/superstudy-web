import { FC, useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { GeneralGPTModal } from '@/legacy/components/activityv3/GPT/GeneralGPTModal'
import { Blank } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { Checkbox } from '@/legacy/components/common/Checkbox'
import { Icon } from '@/legacy/components/common/icons'
import { AnnualReviewRecordItem } from '@/legacy/components/studentCard/AnnualReviewRecordItem'
import { TeacherStudentAssessmentUpdate } from '@/legacy/components/studentCard/TeacherStudentAssessmentUpdate'
import { TeacherStudentAssessmentView } from '@/legacy/components/studentCard/TeacherStudentAssessmentView'
import { useTeacherCounseling } from '@/legacy/container/teacher-counseling'
import {
  useStudentCardFindStudent,
  useStudentRecordontrollerFindAnnualReviewByStudentId,
  useStudentSelfAssessmentFindStudentAssessment,
  useTeacherStudentAssessmentFindStudentAssessment,
} from '@/legacy/generated/endpoint'

export const GeneralCardPage: FC = () => {
  const { id } = useParams<{ id: string }>()

  const [open, setOpen] = useState(false)

  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([])
  const [isStudentAssessmentSelected, setStudentAssessmentSelected] = useState<boolean>(true)
  const [isTeacherAssessmentSelected, setTeacherAssessmentSelected] = useState<boolean>(true)
  const [selectedCounselingIds, setSelectedCounselingIds] = useState<number[]>([])
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<number[]>([])
  const [view, setView] = useState('view')

  const { counselingData, isLoading: counselingLoading } = useTeacherCounseling(Number(id))
  const { data: studentInfo } = useStudentCardFindStudent(Number(id), {
    query: {
      enabled: !!id,
    },
  })

  const { data: studentSelfAssessment, isLoading: studentLoading } = useStudentSelfAssessmentFindStudentAssessment(
    Number(id),
  )

  const { data: teacherStudentAssessment, isLoading: teacherLoading } =
    useTeacherStudentAssessmentFindStudentAssessment(Number(id))

  const { data: studentRecords, refetch } = useStudentRecordontrollerFindAnnualReviewByStudentId(
    { studentId: Number(id) },
    {
      query: {
        onError: (err) => console.error(err),
      },
    },
  )
  const [coachmarkVisible, setCoachmarkVisible] = useState<boolean>(true)

  useEffect(() => {
    const hasSeenCoachmark = localStorage.getItem('ACTIsFirst')
    if (hasSeenCoachmark) {
      setCoachmarkVisible(false)
    }
  }, [])

  const handleCoachmarkClose = () => {
    setCoachmarkVisible(false)
    localStorage.setItem('ACTIsFirst', 'not')
  }

  const handleCoachmarkOpen = () => {
    setCoachmarkVisible(true)
    localStorage.removeItem('ACTIsFirst')
  }

  const isLoading = counselingLoading || studentLoading || teacherLoading
  useEffect(() => {
    if (!selectedTeacherIds.length && teacherStudentAssessment) {
      setSelectedTeacherIds(Object.keys(teacherStudentAssessment.keywords).map((el) => Number(el)))
    }
  }, [teacherStudentAssessment])

  return (
    <>
      {isLoading && <Blank />}
      <div className="scroll-box h-screen-12 md:h-screen-4 mt-4 overflow-y-auto pb-4">
        {/* Desktop V */}
        <div className="hidden md:block">
          <div className="h-screen-4 space-y-4 overflow-hidden md:flex md:space-y-0 md:space-x-4 md:overflow-y-hidden md:p-4">
            <div className="w-full rounded-xl border border-gray-300 bg-white">
              <div className="flex h-full flex-col space-y-4 overflow-y-auto p-4">
                <div className="mt-1 text-sm text-gray-500">아래 항목 중 선택한 내용이 종합의견 작성에 반영됩니다.</div>
                <div>
                  <h1 className="text-xl font-bold text-gray-600">학생 자기 평가</h1>
                  <p className="mt-1 text-sm text-gray-500">
                    학생이 자신의 학교 생활을 평가한 내용 [작성: 학생 / 더보기 → 자기평가]
                  </p>
                </div>
                <div>
                  {studentSelfAssessment?.keywords &&
                    Object.entries(studentSelfAssessment.keywords).map(([id, { keyword, reason }]) => (
                      <label key={id} className="flex items-start space-x-2">
                        <Checkbox
                          className="mt-1"
                          checked={selectedStudentIds.includes(Number(id))}
                          onChange={() =>
                            selectedStudentIds.includes(Number(id))
                              ? setSelectedStudentIds(selectedStudentIds.filter((el) => el !== Number(id)))
                              : setSelectedStudentIds(selectedStudentIds.concat(Number(id)))
                          }
                        />
                        <div>
                          {keyword} : {reason}
                        </div>
                      </label>
                    ))}
                  {studentSelfAssessment?.assessment && (
                    <>
                      <div className="mt-2 flex items-center space-x-2">
                        <Checkbox
                          checked={isStudentAssessmentSelected}
                          onChange={() => setStudentAssessmentSelected(!isStudentAssessmentSelected)}
                        />
                        <p className="text-sm text-gray-500">학생 자기 평가 내용</p>
                      </div>
                      <div className="mt-1 w-full rounded-lg border border-gray-300 p-2 whitespace-pre-line">
                        {studentSelfAssessment.assessment}
                      </div>
                    </>
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-600">학생 상담 기록</h1>
                  <p className="mt-1 text-sm text-gray-500">
                    선생님이 기록한 학생 상담 기록 [작성: 교사 / 학생정보 → 상담카드]
                  </p>
                </div>
                <div>
                  {counselingData?.map(({ id, content }) => (
                    <label key={id} className="flex items-start space-x-2">
                      <Checkbox
                        className="mt-1"
                        checked={selectedCounselingIds.includes(id)}
                        onChange={() =>
                          selectedCounselingIds.includes(id)
                            ? setSelectedCounselingIds(selectedCounselingIds.filter((el) => el !== id))
                            : setSelectedCounselingIds(selectedCounselingIds.concat(id))
                        }
                      />
                      <div>{content}</div>
                    </label>
                  ))}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-600">교사 학생 평가</h1>
                  <p className="mt-1 text-sm text-gray-500">학생의 학교 생활을 평가한 내용[아래에서 작성해주세요] </p>
                </div>
                {view === 'view' && (
                  <TeacherStudentAssessmentView
                    teacherStudentAssessment={teacherStudentAssessment}
                    selectedTeacherIds={selectedTeacherIds}
                    setSelectedTeacherIds={setSelectedTeacherIds}
                    goToUpdate={() => setView('update')}
                  />
                )}
                {view === 'update' && (
                  <TeacherStudentAssessmentUpdate
                    studentId={Number(id)}
                    teacherStudentAssessment={teacherStudentAssessment}
                    goToView={() => setView('view')}
                  />
                )}
              </div>
            </div>
            <div className="flex w-full flex-col space-y-2 rounded-xl border border-gray-600 bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-row items-center gap-1">
                  <div className="text-18 font-bold">작성한 행동특성 및 종합의견 초안</div>
                  <div
                    className="text-md flex h-4 w-4 cursor-pointer items-center justify-center rounded-full border border-gray-500 text-sm"
                    onClick={() => handleCoachmarkOpen()}
                  >
                    ?
                  </div>
                </div>
                <Button.lg className="filled-primary" onClick={() => setOpen(true)}>
                  작성하기
                </Button.lg>
              </div>
              <div className="scroll-box h-full overflow-y-scroll">
                {studentRecords
                  ?.sort((a, b) => (new Date(a.createdAt) < new Date(b.createdAt) ? 1 : -1))
                  .map((record) => (
                    <AnnualReviewRecordItem key={record.id} record={record} refetch={() => refetch()} />
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {open && (
        <>
          <div className="bg-littleblack fixed inset-0 z-10"></div>
          <div className="scroll-box fixed inset-x-0 inset-y-12 z-20 flex flex-col overflow-y-scroll rounded-3xl border border-gray-300 md:inset-x-10 md:inset-y-10 md:flex-row">
            <GeneralGPTModal
              studentId={Number(id)}
              studentInfo={studentInfo}
              studentSelfAssessment={studentSelfAssessment}
              counselingData={counselingData}
              teacherStudentAssessment={teacherStudentAssessment}
              selectedStudentIds={selectedStudentIds}
              setSelectedStudentIds={setSelectedStudentIds}
              selectedCounselingIds={selectedCounselingIds}
              setSelectedCounselingIds={setSelectedCounselingIds}
              selectedTeacherIds={selectedTeacherIds}
              setSelectedTeacherIds={setSelectedTeacherIds}
              isStudentAssessmentSelected={isStudentAssessmentSelected}
              setStudentAssessmentSelected={setStudentAssessmentSelected}
              isTeacherAssessmentSelected={isTeacherAssessmentSelected}
              setTeacherAssessmentSelected={setTeacherAssessmentSelected}
              onClose={() => {
                setOpen(false)
              }}
            />
          </div>
        </>
      )}
      {coachmarkVisible && (
        <>
          <div className="bg-littleblack fixed inset-0 z-10"></div>
          <div className="scroll-box fixed inset-0 z-20 flex items-center justify-center">
            <div className="h-screen-6 relative my-12 w-full max-w-[400px] min-w-[35%] overflow-hidden rounded-3xl">
              <Icon.Close
                className="absolute top-4 right-6 cursor-pointer text-zinc-400"
                onClick={() => handleCoachmarkClose()}
              />
              <section className="text-14 h-full overflow-y-scroll bg-white px-4 pt-12 pb-6 whitespace-pre-line">
                <img
                  src={
                    'https://kr.object.gov-ncloudstorage.com/superschool/production/tutorials/annualreporttutorial.jpg'
                  }
                  className="object-cover"
                />
              </section>
            </div>
          </div>
        </>
      )}
    </>
  )
}
