import _, { range } from 'lodash'
import { useEffect, useState } from 'react'

import { Blank, Select } from '@/legacy/components/common'
import { Admin } from '@/legacy/components/common/Admin'
import AlertDialog from '@/legacy/components/common/AlertDialog'
import AlertV2 from '@/legacy/components/common/AlertV2'
import ConfirmDialog from '@/legacy/components/common/ConfirmDialog'
import { IBBlank } from '@/legacy/components/common/IBBlank'
import { Typography } from '@/legacy/components/common/Typography'
import {
  useStudentExamScoreDelete,
  useStudentScoreFileCheck,
  useStudentScoreFileCheckTest,
  useStudentTestExamScoreDelete,
} from '@/legacy/container/insert-exam-score'
import { useTargetScoreAnalysis } from '@/legacy/container/student-score'
import { useAdminCommonFindAllKlassBySchool, useSchoolManagementGetSchoolInfo } from '@/legacy/generated/endpoint'
import {
  StudentExamScoreDeleteStudentExamScoreParams,
  StudentExamScoreDeleteTestScoreParams,
  StudentExamScorePatchStudentExamScoresParams,
} from '@/legacy/generated/model'
import { getThisYear } from '@/legacy/util/time'

import { ExamUploadModal } from './ExamUploadModal'

export const AcademicRecordsComponent = () => {
  // const thisYear = new Date().getFullYear();
  const thisYear = Number(getThisYear())
  const [startYear, setStartYear] = useState(thisYear)
  const [year, setYear] = useState(thisYear)
  const [grade, setGrade] = useState(1)
  const [semester, setSemester] = useState(1)
  const [step, setStep] = useState(0)
  const [klass, setKlass] = useState(0)
  const [isUpdate, setIsUpdate] = useState(false)
  const [modalOpen, setModalClose] = useState<boolean>(false)
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [alertOpen, setAlertOpen] = useState(false)
  const [errorAlertOpen, setErrorAlertOpen] = useState({
    message: '',
    description: '',
  })
  const [submitAlertOpen, setSubmitAlertOpen] = useState(false)
  const [successAlertOpen, setSuccessAlertOpen] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ message: string; description: string } | null>(null)
  const deleteScoreFile = (step: number, klass: number) => {
    setStep(step)
    setKlass(klass)
    setDialogOpen(true)
  }

  const { data: school } = useSchoolManagementGetSchoolInfo()
  const { data: klasses, isLoading: isLoadingKlasses } = useAdminCommonFindAllKlassBySchool({ year })
  const uniqueGrades = _.uniq(_.map(klasses, 'grade'))
  const { data: SCORE, isLoading } = useStudentScoreFileCheck(grade, year)
  const { data: TESTSCORE, isLoading: isLoadingM } = useStudentScoreFileCheckTest(grade, year)
  const { deleteExamScoreMutate } = useStudentExamScoreDelete()
  const { deleteTestExamScoreMutate } = useStudentTestExamScoreDelete()
  const { patchTargetScoreAnalysisMutate, isLoading: isLoadingPatchTargetScoreAnalysis } = useTargetScoreAnalysis()

  // 학년별 학급 정보 분리
  const classesByGrade = _.groupBy(klasses, 'grade')

  // 성적이 등록된 학급 정보를 추출
  const registeredClasses = SCORE?.scores || []
  const mockScores = TESTSCORE?.res || []

  const handleDeleteScoreFile = async ({
    grade,
    classNum,
    semester,
    insertionYear,
  }: StudentExamScoreDeleteStudentExamScoreParams) => {
    try {
      await deleteExamScoreMutate({ params: { grade, classNum, semester, insertionYear } })
      setAlertOpen(true)
    } catch (error: any) {
      console.error(error)
      setErrorAlertOpen({
        message: '삭제 실패',
        description: '2학기 종합성적 데이터를<br/>먼저 삭제해주세요.',
      })
    } finally {
      setDialogOpen(false)
    }
  }

  const handleDeleteMockScoreFile = ({
    grade,
    classNum,
    semester,
    step,
    insertionYear,
  }: StudentExamScoreDeleteTestScoreParams) => {
    try {
      deleteTestExamScoreMutate({ params: { grade, classNum, semester, step, insertionYear } })
      setAlertOpen(true)
    } catch (error: any) {
      console.error(error)
      setErrorAlertOpen({
        message: '삭제 실패',
        description: error.message || '잠시 후 다시 시도해주세요.',
      })
    } finally {
      setDialogOpen(false)
    }
  }

  const handlePatchTargetScoreAnalysis = async ({
    year,
    grade,
    semester,
  }: StudentExamScorePatchStudentExamScoresParams) => {
    try {
      await patchTargetScoreAnalysisMutate({ params: { year, grade, semester } })
      setSuccessAlertOpen(true)
      setSubmitAlertOpen(false)
    } catch (error: any) {
      console.error(error)
      setErrorAlertOpen({
        message: '목표성적분석 실패',
        description: error.message || '잠시 후 다시 시도해주세요.',
      })
    }
  }

  const checkStatus = () => {
    // 종합성적 존재 여부 확인
    const hasNextSemesterScores = registeredClasses.some((score) => score.semester === semester + 1)

    if (semester === 1) {
      const hasNextSemesterMockScores = TESTSCORE?.res?.some(
        (semesterData) =>
          semesterData.semester === 2 && semesterData.scores.some((score) => score.first_test || score.second_test),
      )

      if (hasNextSemesterMockScores) {
        setStatusMessage({
          message: '현재 2학기 성적이 존재합니다.',
          description: `${semester + 1}학기를 선택 후 목표성적분석을 진행해주세요.`,
        })
        return
      }
    }

    if (hasNextSemesterScores) {
      setStatusMessage({
        message: '현재 2학기 성적이 존재합니다.',
        description: `${semester + 1}학기를 선택 후 목표성적분석을 진행해주세요.`,
      })
      return
    }

    const hasOverallScores = registeredClasses.some((score) => score.semester === semester)

    if (hasOverallScores) {
      const unregisteredClassesOverall = classesByGrade[grade].filter(
        (klass) =>
          !registeredClasses.some(
            (score) => score.class === klass.klass && score.grade === grade && score.semester === semester,
          ),
      )

      if (unregisteredClassesOverall.length > 0) {
        setStatusMessage({
          message: '종합 성적이 등록되지 않은 학급이 있습니다.\n추가 후 진행해 주세요.',
          description: `미등록 학급 : ${unregisteredClassesOverall
            .map((klass) => `${klass.grade}-${klass.klass}`)
            .join(', ')}`,
        })
        return
      } else {
        setSubmitAlertOpen(true)
        setStep(3)
        return
      }
    }

    const hasSubmittedSecondTest = TESTSCORE?.res?.some(
      (semesterData) => semesterData.semester === semester && semesterData.scores.some((score) => score.second_test),
    )

    if (hasSubmittedSecondTest) {
      const unregisteredClassesSecondTest = classesByGrade[grade].filter((klass) => {
        const mockScore = TESTSCORE?.res
          .find((semesterData) => semesterData.semester === semester)
          ?.scores.find((score) => score.class === klass.klass)
        return !mockScore || !mockScore.second_test
      })

      if (unregisteredClassesSecondTest.length > 0) {
        setStatusMessage({
          message: '2차 지필 성적이 등록되지 않은 학급이 있습니다.\n추가 후 진행해 주세요.',
          description: `미등록 학급 : ${unregisteredClassesSecondTest
            .map((klass) => `${klass.grade}-${klass.klass}`)
            .join(', ')}`,
        })
        return
      } else {
        setSubmitAlertOpen(true)
        setStep(2)
        return
      }
    }

    const hasSubmittedFirstTest = TESTSCORE?.res?.some(
      (semesterData) => semesterData.semester === semester && semesterData.scores.some((score) => score.first_test),
    )

    if (hasSubmittedFirstTest) {
      const unregisteredClassesFirstTest = classesByGrade[grade].filter((klass) => {
        const mockScore = TESTSCORE?.res
          .find((semesterData) => semesterData.semester === semester)
          ?.scores.find((score) => score.class === klass.klass)
        return !mockScore || (mockScore && !mockScore.first_test)
      })

      if (unregisteredClassesFirstTest.length > 0) {
        setStatusMessage({
          message: '1차 지필 성적이 등록되지 않은 학급이 있습니다.\n추가 후 진행해 주세요.',
          description: `미등록 학급 : ${unregisteredClassesFirstTest
            .map((klass) => `${klass.grade}-${klass.klass}`)
            .join(', ')}`,
        })
        return
      } else {
        setSubmitAlertOpen(true)
        setStep(1)
        return
      }
    }
  }

  useEffect(() => {
    if (!school?.createdAt) return
    // 학교 생성일과 현재 연도가 같으면 학교 생성일의 전년도를 시작 연도로 설정
    if (new Date(school.createdAt).getFullYear() === new Date().getFullYear()) {
      // TODO : 학교 생성일과 현재 연도가 같으면 학교 생성일의 2년 전을 시작 연도로 설정
      setStartYear(new Date(school.createdAt).getFullYear() - 2)
    } else {
      setStartYear(new Date(school.createdAt).getFullYear())
    }
  }, [school?.createdAt])

  if (isLoadingPatchTargetScoreAnalysis) {
    return <Blank />
  }

  return (
    <Admin.Section className="w-full gap-0 px-0 py-0">
      {isLoading || isLoadingKlasses ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg bg-white py-30">
          <IBBlank type="section" />
          <Typography variant="body3" className="font-medium">
            성적 데이터를 불러오고 있습니다.
          </Typography>
        </div>
      ) : (
        <>
          <section className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Select value={year} onChange={(e) => setYear(Number(e.target.value))}>
                {range(thisYear, startYear - 1, -1).map((year) => (
                  <option key={year} value={year}>
                    {year}학년도
                  </option>
                ))}
              </Select>

              <Select value={grade} onChange={(e) => setGrade(Number(e.target.value))}>
                {uniqueGrades.length > 0 ? (
                  uniqueGrades.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}학년
                    </option>
                  ))
                ) : (
                  <option>학급정보가 없습니다</option>
                )}
              </Select>

              {uniqueGrades.length > 0 && (
                <Select value={semester} onChange={(e) => setSemester(Number(e.target.value))}>
                  {[1, 2].map((semester) => (
                    <option key={semester} value={semester}>
                      {semester}학기
                    </option>
                  ))}
                </Select>
              )}
            </div>
            <div className="flex items-center gap-2">
              <nav className="flex h-10 items-center gap-2 text-[15px] text-[#777777]">
                <a
                  href="https://kr.object.gov-ncloudstorage.com/superschool/storage/material/score/슈퍼스쿨_성적관리_내신_메뉴얼_20250324.pdf"
                  target="_blank"
                  download
                  className="flex items-center gap-1 pr-1"
                >
                  <p>업로드 가이드</p>
                  <div className="text-md relative flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-gray-500 text-sm text-[#777777]">
                    ?
                  </div>
                </a>
                {(registeredClasses.length > 0 || mockScores.length > 0) && (
                  <>
                    <button
                      onClick={() => setIsUpdate((prev) => !prev)}
                      className={`min-w-[120px] rounded-lg border border-[#0066ff] bg-white px-3 py-2 text-[#0066ff]`}
                    >
                      {isUpdate ? '파일 수정 완료' : '등록 파일 수정'}
                    </button>
                    <button
                      onClick={() => checkStatus()}
                      disabled={isLoadingPatchTargetScoreAnalysis}
                      className={`border-old-primary-blue-400 bg-old-primary-blue-400 min-w-[120px] rounded-lg border px-3 py-2 text-white disabled:opacity-50`}
                    >
                      {isLoadingPatchTargetScoreAnalysis ? '분석중' : '목표성적분석'}
                    </button>
                  </>
                )}
                <button
                  onClick={() => setModalClose(!modalOpen)}
                  className={`min-w-[120px] rounded-lg border border-[#0066ff] bg-[#0066ff] px-3 py-2 text-white`}
                >
                  파일 업로드
                </button>
              </nav>
            </div>
          </section>
          {isLoadingM ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-lg bg-white py-30">
              <IBBlank type="section" />
              <Typography variant="body3" className="font-medium">
                성적 데이터를 불러오고 있습니다.
              </Typography>
            </div>
          ) : (
            <Admin.Table className="mb-10 rounded-lg bg-white px-4 py-3 text-center">
              <Admin.TableHead className="border-b border-b-[#333333]">
                <Admin.TableRow>
                  <Admin.TableHCell
                    className="w-1/4 text-center text-lg font-semibold text-[#333333]"
                    children="학급"
                  />
                  <Admin.TableHCell
                    className="w-1/4 text-center text-lg font-semibold text-[#333333]"
                    children="1차 지필"
                  />
                  <Admin.TableHCell
                    className="w-1/4 text-center text-lg font-semibold text-[#333333]"
                    children="2차 지필"
                  />
                  <Admin.TableHCell
                    className="w-1/4 text-center text-lg font-semibold text-[#333333]"
                    children="종합 성적"
                  />
                </Admin.TableRow>
              </Admin.TableHead>
              <Admin.TableBody>
                {(classesByGrade[grade] || []).length > 0 ? (
                  (classesByGrade[grade] || []).map((klass, i) => {
                    const registeredScore = registeredClasses.find(
                      (score) =>
                        score.class === klass.klass && score.grade === grade && [semester, 2].includes(score.semester),
                    )
                    const mockScore =
                      semester === 1
                        ? TESTSCORE?.res
                            .find((semesterData) => semesterData.semester === 1)
                            ?.scores.find((score) => score.class === klass.klass && TESTSCORE?.grade === grade)
                        : TESTSCORE?.res
                            .find((semesterData) => semesterData.semester === 2)
                            ?.scores.find((score) => score.class === klass.klass && TESTSCORE?.grade === grade)
                    const isLastRow = i === classesByGrade[grade].length - 1
                    return (
                      <Admin.TableRow
                        key={`${klass.klass}-${i}`}
                        className={isLastRow ? 'rounded-br-lg rounded-bl-lg' : ''}
                      >
                        <Admin.TableCell
                          className="h-14 text-lg font-normal text-[#333333]"
                          children={`${klass.grade}학년 ${klass.klass}반`}
                        />
                        {isUpdate ? (
                          <>
                            <Admin.TableCell
                              className="text-lg font-normal"
                              children={
                                mockScore?.first_test ? (
                                  <Admin.Box className="flex items-center justify-center gap-1">
                                    <button
                                      className="border-[#ff2525;] text-[#ff2525;] rounded-lg border px-4 py-1 text-[15px] font-bold"
                                      onClick={() => deleteScoreFile(1, klass.klass)}
                                    >
                                      삭제
                                    </button>
                                  </Admin.Box>
                                ) : (
                                  '미등록'
                                )
                              }
                              style={{ color: mockScore?.first_test ? '#0066ff' : '#aaaaaa' }}
                            />
                            <Admin.TableCell
                              className="text-lg font-normal"
                              children={
                                mockScore?.second_test ? (
                                  <Admin.Box className="flex items-center justify-center gap-1">
                                    <button
                                      className="border-[#ff2525;] text-[#ff2525;] rounded-lg border px-4 py-1 text-[15px] font-bold"
                                      onClick={() => deleteScoreFile(2, klass.klass)}
                                    >
                                      삭제
                                    </button>
                                  </Admin.Box>
                                ) : (
                                  '미등록'
                                )
                              }
                              style={{ color: mockScore?.second_test ? '#0066ff' : '#aaaaaa' }}
                            />
                            <Admin.TableCell
                              className="text-lg font-normal"
                              children={
                                registeredScore ? (
                                  <Admin.Box className="flex items-center justify-center gap-1">
                                    <button
                                      className="border-[#ff2525;] rounded-lg border px-4 py-1 text-[15px] font-bold text-[#ff2525]"
                                      onClick={() => deleteScoreFile(3, klass.klass)}
                                    >
                                      삭제
                                    </button>
                                  </Admin.Box>
                                ) : (
                                  '미등록'
                                )
                              }
                              style={{ color: registeredScore ? '#0066ff' : '#aaaaaa' }}
                            />
                          </>
                        ) : (
                          <>
                            <Admin.TableCell
                              className="text-lg font-normal"
                              children={mockScore?.first_test ? '등록 완료' : '미등록'}
                              style={{ color: mockScore?.first_test ? '#0066ff' : '#aaaaaa' }}
                            />
                            <Admin.TableCell
                              className="text-lg font-normal"
                              children={mockScore?.second_test ? '등록 완료' : '미등록'}
                              style={{ color: mockScore?.second_test ? '#0066ff' : '#aaaaaa' }}
                            />
                            <Admin.TableCell
                              className="text-lg font-normal"
                              children={registeredScore ? '등록 완료' : '미등록'}
                              style={{ color: registeredScore ? '#0066ff' : '#aaaaaa' }}
                            />
                          </>
                        )}
                      </Admin.TableRow>
                    )
                  })
                ) : (
                  <Admin.TableRow>
                    <Admin.TableCell className="text-center text-lg font-normal">-</Admin.TableCell>
                    <Admin.TableCell className="text-center text-lg font-normal">-</Admin.TableCell>
                    <Admin.TableCell className="text-center text-lg font-normal">-</Admin.TableCell>
                    <Admin.TableCell className="text-center text-lg font-normal">-</Admin.TableCell>
                  </Admin.TableRow>
                )}
              </Admin.TableBody>
            </Admin.Table>
          )}
        </>
      )}

      {dialogOpen && (
        <ConfirmDialog
          cancelText="취소"
          description={`${year}학년도 ${grade}학년 ${klass}반의 ${semester}학기<br/>${
            step === 1 ? '1차 지필' : step === 2 ? '2차 지필' : '종합 성적'
          } 파일을 삭제하시겠습니까?`}
          confirmText="삭제"
          message="파일을 삭제하시겠습니까?"
          onCancel={() => setDialogOpen(!dialogOpen)}
          onConfirm={() => {
            if (step === 3) {
              handleDeleteScoreFile({ grade, classNum: klass, semester, insertionYear: year })
            } else {
              handleDeleteMockScoreFile({ grade, classNum: klass, semester, step, insertionYear: year })
            }
          }}
          theme="delete"
        />
      )}
      {modalOpen && (
        <ExamUploadModal
          modalOpen={modalOpen}
          setModalClose={() => setModalClose(false)}
          width="w-[480px]"
          grade={grade}
          semester={semester}
          year={year}
          ablePropragation={true}
        />
      )}
      {alertOpen && (
        <AlertDialog
          message="삭제가 완료되었습니다."
          description={`${year}학년도 ${grade}학년 ${klass}반의 ${semester}학기<br/>${
            step === 1 ? '1차 지필' : step === 2 ? '2차 지필' : '종합 성적'
          } 파일이 정삭적으로 삭제되었습니다.`}
          confirmText="확인"
          onConfirm={() => setAlertOpen(!alertOpen)}
          theme="secondary"
        />
      )}
      {submitAlertOpen && (
        <ConfirmDialog
          message={`목표성적분석을 진행하시겠습니까?`}
          description={`${year}학년도 ${grade}학년 ${semester}학기 ${
            step === 1 ? '1차 지필' : step === 2 ? '2차 지필' : '종합 성적'
          } 목표성적분석을 진행하시겠습니까?`}
          confirmText="확인"
          cancelText="취소"
          onConfirm={() => handlePatchTargetScoreAnalysis({ year, grade, semester })}
          onCancel={() => setSubmitAlertOpen(!submitAlertOpen)}
          theme="secondary"
        />
      )}
      {errorAlertOpen.message && (
        <AlertDialog
          message={errorAlertOpen.message}
          description={errorAlertOpen.description}
          confirmText="확인"
          onConfirm={() => setErrorAlertOpen({ message: '', description: '' })}
          theme="primary"
        />
      )}
      {statusMessage && (
        <AlertV2
          message={statusMessage.message}
          description={statusMessage.description}
          confirmText="확인"
          onConfirm={() => setStatusMessage(null)}
        />
      )}
      {successAlertOpen && (
        <AlertDialog
          message="목표성적분석 완료"
          description="목표성적분석이 완료되었습니다."
          confirmText="확인"
          onConfirm={() => setSuccessAlertOpen(false)}
          theme="secondary"
        />
      )}
    </Admin.Section>
  )
}
