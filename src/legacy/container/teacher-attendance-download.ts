import { useEffect, useState } from 'react'
import readXlsxFile, { Row } from 'read-excel-file'
import { useAttendanceDownloadAbsents, useStudentGroupsDownloadStudentListByGroupId } from '@/legacy/generated/endpoint'
import { downloadExcel } from '@/legacy/util/download-excel'
import { getDayOfSemester, getDayOfYear, getEndDayOfSemester, getStartDayOfSemester } from '@/legacy/util/time'

export function useAttendanceDownload({ groupId, startDate }: { groupId?: number; startDate: string }) {
  const [rows, setRows] = useState<Row[]>()
  const { data: excelData } = useStudentGroupsDownloadStudentListByGroupId(groupId as number, {
    query: {
      enabled: !!groupId,
    },
  })

  const [dw, setDw] = useState(false)

  const download = () => {
    const filename = '명렬표'
    excelData && downloadExcel(excelData, filename)
  }

  useEffect(() => {
    if (excelData) {
      new Promise((r) => r(excelData))
        .then((blob) => readXlsxFile(blob as Blob))
        .then((rows) => setRows(rows))
        .catch((e) => console.log(e))
    }
  }, [groupId, excelData])

  const { refetch: refetchAttendanceBookDataSemester, isLoading: loadingAttendanceBookDataSemester } =
    useAttendanceDownloadAbsents(
      {
        groupId: groupId || -1,
        year: +getDayOfYear(new Date(startDate)),
        semester: +getDayOfSemester(new Date(startDate)),
        startDate: getStartDayOfSemester(new Date(startDate)).toISOString(),
        endDate: getEndDayOfSemester(new Date(startDate)).toISOString(),
      },
      {
        query: {
          enabled: !!groupId && dw,
          onSuccess: (res: any) => {
            if (dw) {
              setDw(false)
              res && downloadExcel(res, getDayOfSemester(new Date(startDate)) + '학기 출석부')
            }
          },
        },
      },
    )

  useEffect(() => {
    if (dw) {
      refetchAttendanceBookDataSemester()
    }
  }, [dw])

  const downloadAttendanceBook = () => {
    setDw(true)
  }

  return { downloadStudentNameMatrix: download, rows, downloadAttendanceBook, loadingAttendanceBookDataSemester }
}
