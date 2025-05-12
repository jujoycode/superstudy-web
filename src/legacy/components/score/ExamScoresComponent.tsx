import _, { range } from 'lodash'
import { useEffect, useState } from 'react'
import { useStudentMockExamScoreDelete, useStudentScoreFileCheckMock } from '@/legacy/container/insert-exam-score'
import { useAdminCommonFindAllKlassBySchool, useSchoolManagementGetSchoolInfo } from '@/legacy/generated/endpoint'
import { getThisYear } from '@/legacy/util/time'
import { Select } from '@/legacy/components/common'
import { Admin } from '@/legacy/components/common/Admin'
import AlertDialog from '@/legacy/components/common/AlertDialog'
import ConfirmDialog from '@/legacy/components/common/ConfirmDialog'
import { ExamScoresBatcbUploadComponent } from './ExamScoresBatchUploadComponent'
import { MockExamUploadModal } from './MockExamUploadModal'

export const ExamScoresComponent = () => {
  // const thisYear = new Date().getFullYear();
  const thisYear = Number(getThisYear())
  const [startYear, setStartYear] = useState(thisYear)
  const [year, setYear] = useState(thisYear)
  const [grade, setGrade] = useState(1)
  const [month, setMonth] = useState(0)
  const [klass, setKlass] = useState(0)
  const [isUpdate, setIsUpdate] = useState(false)

  const { data: school } = useSchoolManagementGetSchoolInfo()
  const { data: klasses } = useAdminCommonFindAllKlassBySchool({ year })
  const { data } = useStudentScoreFileCheckMock(grade, year)
  const { deleteMockExamScore } = useStudentMockExamScoreDelete()
  const uniqueGrades = _.uniq(_.map(klasses, 'grade'))
  const [modalOpen, setModalClose] = useState<boolean>(false)
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [alertOpen, setAlertOpen] = useState(false)

  const MockScores = data?.scores || []
  const groupedScores = _.groupBy(MockScores, 'month')

  const completeScoresByMonth = Object.keys(groupedScores).reduce(
    (acc, month) => {
      if (klasses) {
        acc[month] = klasses
          .filter((k) => k.grade === grade)
          .map((klass) => {
            const existingScore = groupedScores[month].find((score) => score.class === klass.klass)
            return existingScore || { class: klass.klass, month: Number(month), isSubmitted: false }
          })
      } else {
        acc[month] = []
      }
      return acc
    },
    {} as Record<string, { class: number; month: number; isSubmitted: boolean }[]>,
  )

  const deleteMockScoreFile = (month: number, klass: number) => {
    setMonth(month)
    setKlass(klass)
    setDialogOpen(true)
  }

  useEffect(() => {
    if (!school?.createdAt) return
    if (new Date(school.createdAt).getFullYear() === new Date().getFullYear()) {
      setStartYear(new Date(school.createdAt).getFullYear() - 2)
    } else {
      setStartYear(new Date(school.createdAt).getFullYear())
    }
  }, [school?.createdAt])

  const handleConfirmDelete = async () => {
    await deleteMockExamScore({
      grade,
      classNum: klass,
      month: month,
      insertionYear: year,
    })
    setDialogOpen(false)
    setAlertOpen(true)
  }

  return (
    <Admin.Section className="w-full gap-0 px-0 py-0">
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
            {uniqueGrades.map((grade) => (
              <option key={grade} value={grade}>
                {grade}학년
              </option>
            ))}
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <nav className="flex h-10 items-center gap-2 text-[15px] text-[#777777]">
            <a
              href="https://kr.object.gov-ncloudstorage.com/superschool/storage/material/score/슈퍼스쿨_성적관리_모의고사_매뉴얼_20250324.pdf"
              target="_blank"
              download
              className="flex items-center gap-1 pr-1"
            >
              <p>업로드 가이드</p>
              <div className="text-md relative flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-gray-500 text-sm text-[#777777]">
                ?
              </div>
            </a>
            {MockScores.length > 0 && (
              <button
                onClick={() => setIsUpdate((prev) => !prev)}
                className={`min-w-[120px] rounded-lg border border-[#0066ff] bg-white px-3 py-2 text-[#0066ff]`}
              >
                {isUpdate ? '파일 수정 완료' : '등록 파일 수정'}
              </button>
            )}
            <button
              className={`min-w-[120px] rounded-lg border border-[#0066ff] bg-[#0066ff] px-3 py-2 text-white`}
              onClick={() => setModalClose(true)}
            >
              파일 업로드
            </button>
          </nav>
        </div>
      </section>
      {MockScores?.length > 0 ? (
        <>
          <Admin.Table className="mb-10 rounded-lg bg-white px-4 py-3 text-center">
            <Admin.TableHead className="border-b border-b-[#333333]">
              <Admin.TableRow>
                <Admin.TableHCell
                  className="w-1/4 text-center text-lg font-semibold text-[#333333]"
                  children="시행 월"
                />
                <Admin.TableHCell className="w-2/4 text-center text-lg font-semibold text-[#333333]" children="학급" />
                <Admin.TableHCell
                  className="w-1/4 text-center text-lg font-semibold text-[#333333]"
                  children="파일 업로드"
                />
              </Admin.TableRow>
            </Admin.TableHead>
            <Admin.TableBody>
              {Object.keys(completeScoresByMonth).map((month) =>
                completeScoresByMonth[month].map((score, index) => (
                  <tr key={`${score.class}-${month}-${index}`} className="border-b border-[#dddddd] bg-white">
                    {index === 0 && (
                      <td className="px-2 py-2 text-center font-semibold" rowSpan={completeScoresByMonth[month].length}>
                        {month}월
                      </td>
                    )}
                    <td className="px-2 py-2 text-center">
                      {grade}학년 {score.class}반
                    </td>
                    {isUpdate ? (
                      <td>
                        {score.isSubmitted ? (
                          <button
                            className="border-[#ff2525;] text-[#ff2525;] rounded-lg border px-4 py-1 text-[15px] font-bold"
                            onClick={() => deleteMockScoreFile(score.month, score.class)}
                          >
                            삭제
                          </button>
                        ) : (
                          '미등록'
                        )}
                      </td>
                    ) : (
                      <td
                        className={`px-2 py-2 text-center ${score.isSubmitted ? 'text-[#0066ff]' : 'text-[#aaaaaa]'}`}
                      >
                        {score.isSubmitted ? '등록 완료' : '미등록'}
                      </td>
                    )}
                  </tr>
                )),
              )}
            </Admin.TableBody>
          </Admin.Table>
        </>
      ) : (
        <ExamScoresBatcbUploadComponent />
      )}

      {modalOpen && (
        <MockExamUploadModal
          modalOpen={modalOpen}
          setModalClose={() => setModalClose(false)}
          width="w-[480px]"
          grade={grade}
          ablePropragation={true}
          year={year}
        />
      )}

      {dialogOpen && (
        <ConfirmDialog
          cancelText="취소"
          description={`${year}학년도 ${grade}학년 ${klass}반의 ${month}월<br/>모의고사 파일을 삭제하시겠습니까?`}
          confirmText="삭제"
          message="파일을 삭제하시겠습니까?"
          onCancel={() => setDialogOpen(!dialogOpen)}
          onConfirm={handleConfirmDelete}
          theme="delete"
        />
      )}

      {alertOpen && (
        <AlertDialog
          message="삭제가 완료되었습니다."
          description={`${year}학년도 ${grade}학년 ${klass}반의 ${month}월<br/>모의고사 파일이 정삭적으로 삭제되었습니다.`}
          confirmText="확인"
          onConfirm={() => setAlertOpen(!alertOpen)}
          theme="secondary"
        />
      )}
    </Admin.Section>
  )
}
