import { useEffect, useState } from 'react'
import readXlsxFile, { type Row } from 'read-excel-file'
import { useNewsLettersDownloadUnreadStudentList } from '@/legacy/generated/endpoint'
import { downloadExcel } from '@/legacy/util/download-excel'

export function useTeacherNewsletterCheckDownload({
  newsletterId,
  surveyTitle,
}: {
  newsletterId: number
  surveyTitle?: string
}) {
  const [rows, setRows] = useState<Row[]>()
  const { data: excelData } = useNewsLettersDownloadUnreadStudentList(newsletterId)

  const download = () => {
    const filename = surveyTitle || '가정통신문'
    excelData && downloadExcel(excelData, filename)
  }

  useEffect(() => {
    if (excelData) {
      new Promise((r) => r(excelData))
        .then((blob) => readXlsxFile(blob as Blob))
        .then((rows) => setRows(rows))
        .catch((e) => console.log(e))
    }
  }, [newsletterId, excelData])

  return { download, rows }
}
