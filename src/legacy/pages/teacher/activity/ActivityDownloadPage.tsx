import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import readXlsxFile, { Row } from 'read-excel-file'

import { ErrorBlank, Td } from '@/legacy/components'
import { Blank, Section } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { useActivityDownloadSubmitters, useActivityFindOne } from '@/legacy/generated/endpoint'
import { nameWithId } from '@/legacy/types'
import { downloadExcel } from '@/legacy/util/download-excel'

interface ActivityDownloadPageProps {
  group?: nameWithId | null
}

export function ActivityDownloadPage({ group }: ActivityDownloadPageProps) {
  const { id } = useParams<{ id: string }>()
  const [rows, setRows] = useState<Row[]>()

  const {
    data: excelData,
    isLoading: isActivityDownloadLoading,
    isFetching,
    error,
  } = useActivityDownloadSubmitters(Number(id), { groupId: group?.id ? group?.id : undefined })

  const { data: activity, isLoading: isGetActivityLoading } = useActivityFindOne(Number(id))

  useEffect(() => {
    if (excelData) {
      new Promise((r) => r(excelData))
        .then((blob) => readXlsxFile(blob as Blob))
        .then((rows) => setRows(rows))
        .catch((e) => console.log(e))
    }
  }, [id, excelData])

  if (error) {
    return <ErrorBlank />
  }

  const handleDownload = () => {
    const filename = `${activity?.title ?? ''}-${group?.name ?? ''}`
    excelData && downloadExcel(excelData, filename)
  }

  const isLoading = isActivityDownloadLoading || isGetActivityLoading

  // TODO 활동기록부의 모든 그룹의 데이터를 다운로드 받을 수 있는 "모두" 라는 체크박스가 추가되었음
  // TODO 백앤드에 해당 엑셀파일을 다운받을 수 있는 api 추가 요청
  return (
    <>
      {isLoading && <Blank reversed />}
      {isFetching && <Blank reversed />}
      <div className="top-0 flex w-full items-center space-x-2 border-b border-gray-500 bg-white px-5 py-3 pt-6">
        <Button.lg children="Excel" onClick={handleDownload} className="filled-green" />
      </div>
      <div className="h-screen-12 md:h-screen-8 ml-0.5 grid w-full overflow-auto bg-white">
        <Section className="mt-2">
          <table className="pt-24">
            <tbody>
              {rows?.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <Td key={cellIndex} innerClassName="min-w-max">
                      {String(cell)}
                    </Td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      </div>
    </>
  )
}
