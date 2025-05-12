import { useEffect, useState } from 'react'
import readXlsxFile, { type Row } from 'read-excel-file'
import {
  useNewsLettersDownloadSubmitters,
  useStudentNewsletterFindAllByNewsletterId,
} from '@/legacy/generated/endpoint'
import { downloadExcel } from '@/legacy/util/download-excel'

export function useTeacherNewsletterDownload({
  newsletterId,
  surveyTitle,
}: {
  newsletterId: number
  surveyTitle?: string
}) {
  const [rows, setRows] = useState<Row[]>()
  const { data: excelData } = useNewsLettersDownloadSubmitters(newsletterId)

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

  const { data: studentNewsletters } = useStudentNewsletterFindAllByNewsletterId(newsletterId, {
    query: {
      enabled: !!newsletterId,
      onSuccess: (_) => {
        // ?
      },
    },
  })

  return { download, rows, studentNewsletters }
}
