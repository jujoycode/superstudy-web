import { useState } from 'react'
import { useParams } from 'react-router'
import { Row } from 'read-excel-file'

import { Td } from '@/legacy/components'
import { Section } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { NewslettersDownloadView } from '@/legacy/components/pdfDocs/NewslettersDownloadView'
import { useTeacherNewsletterDetail } from '@/legacy/container/teacher-newsletter-detail'
import { useTeacherNewsletterDownload } from '@/legacy/container/teacher-newsletter-download'
import { DateFormat, DateUtil } from '@/legacy/util/date'
import { makeDateToString } from '@/legacy/util/time'

export function NewsletterDownloadPage() {
  const { id } = useParams<{ id: string }>()
  const [isCsvData, setCsvData] = useState(false)
  const nowDate = makeDateToString(new Date())

  const { newsletter: newData } = useTeacherNewsletterDetail({ id: Number(id) })

  const { download, rows, studentNewsletters } = useTeacherNewsletterDownload({
    newsletterId: Number(id),
    surveyTitle: newData?.title,
  })

  const sortedRows = []
  const sortedStudentNewsletters = []

  // 정렬 함수
  function sortStudentRows(rows: Row[]) {
    // 헤더(0번째 행)와 나머지 데이터 분리
    const header = rows[0]
    const data = rows.slice(1)

    // 데이터 정렬: 학년(0) -> 반(1) -> 번호(2) 순서로
    const sortedData = data.sort((a, b) => {
      // 학년 비교
      const gradeA = Number(a[0])
      const gradeB = Number(b[0])
      if (gradeA !== gradeB) {
        return gradeA - gradeB
      }

      // 반 비교
      const classA = Number(a[1])
      const classB = Number(b[1])
      if (classA !== classB) {
        return classA - classB
      }

      // 번호 비교
      const numA = Number(a[2])
      const numB = Number(b[2])
      return numA - numB
    })

    // 헤더와 정렬된 데이터 합치기
    return [header, ...sortedData]
  }

  if (rows) {
    // 정렬 함수 호출
    sortedRows.push(...sortStudentRows(rows))
  }

  // 학생 데이터를 정렬하는 함수
  function sortStudentsByGradeClassNumber(students: any) {
    return students.sort((a: any, b: any) => {
      // "2학년 4반" 형식에서 학년과 반 추출
      const aGradeClass = a.studentGradeKlass.match(/(\d+)학년\s*(\d+)반/)
      const bGradeClass = b.studentGradeKlass.match(/(\d+)학년\s*(\d+)반/)

      if (!aGradeClass || !bGradeClass) return 0

      // 학년 비교
      const aGrade = Number(aGradeClass[1])
      const bGrade = Number(bGradeClass[1])

      if (aGrade !== bGrade) {
        return aGrade - bGrade
      }

      // 반 비교
      const aClass = Number(aGradeClass[2])
      const bClass = Number(bGradeClass[2])

      if (aClass !== bClass) {
        return aClass - bClass
      }

      // 번호 비교
      return a.studentNumber - b.studentNumber
    })
  }

  if (studentNewsletters) {
    sortedStudentNewsletters.push(...sortStudentsByGradeClassNumber(studentNewsletters))
  }

  return (
    <div className="w-fit min-w-full rounded-lg border bg-white p-5">
      <div className="flex w-full items-center space-x-2 border-b border-gray-500 bg-white px-5 py-3">
        <Button.lg children="Excel" onClick={download} className="filled-primary" />
        {/* PDF 버튼 */}

        <NewslettersDownloadView
          newsletter={newData}
          studentNewsletter={sortedStudentNewsletters?.filter((sn) => sn.isSubmitted)}
          submitPerson={sortedRows}
          nowDate={`${DateUtil.formatDate(new Date(nowDate), DateFormat['YYYY/MM/DD'])}`}
          setCsvData={(b: boolean) => setCsvData(b)}
          isCsvData={isCsvData}
        />
      </div>
      <Section className="mt-2">
        <div className="text-xl font-bold">미리보기</div>
        <table>
          <tbody>
            {sortedRows?.map((row, i) => (
              <tr key={i}>
                {row?.map((cell, j) => (
                  <Td key={j} innerClassName="min-w-max">
                    {cell.toString()}
                  </Td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </div>
  )
}
