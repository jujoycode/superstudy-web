import { useContext, useEffect, useState } from 'react'
import readXlsxFile from 'read-excel-file'
import { useSetRecoilState } from 'recoil'

import { useHistory } from '@/hooks/useHistory'
import { Blank } from '@/legacy/components/common'
import { Admin } from '@/legacy/components/common/Admin'
import { Button } from '@/legacy/components/common/Button'
import { studentManagementBulkCreateStudent } from '@/legacy/generated/endpoint'
import { RequestCreateStudentDto, RequestCreateUserBulkDto } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { toastState, warningState } from '@/stores'

import { AdminContext } from '../AdminMainPage'

export function StudentBatchPage() {
  const { goBack } = useHistory()
  const { year } = useContext(AdminContext)
  const [isLoading, setIsLoading] = useState(false)
  const [items, setItems] = useState<RequestCreateStudentDto[]>([])
  const [itemResults, setItemResults] = useState<RequestCreateUserBulkDto[]>([])
  const [duplicateEmails, setDuplicateEmails] = useState<Record<string, number>>({})

  const setToastMsg = useSetRecoilState(toastState)
  const setWarningMsg = useSetRecoilState(warningState)

  useEffect(() => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    if (currentMonth === 2 && year !== currentYear) {
      setWarningMsg(`주의 : ${year} 학년도가 선택되어 있습니다.`)
    }
  }, [year])

  const { t } = useLanguage()

  async function readFile(file: File) {
    try {
      setItemResults([])
      const [head, ...rows] = await readXlsxFile(file)

      if (head.length === 9 && head[0] === '학년' && head[5] === '이메일') {
        const items = rows.map(([grade, klass, studentNumber, name, nickName, email, barcode, nokName, nokPhone]) => {
          return { grade, klass, studentNumber, name, nickName, email, barcode, nokName, nokPhone }
        })
        setItems(items as any)
      } else {
        alert('학생 일괄 추가 양식의 엑셀파일을 선택해주세요.')
      }
    } catch {
      alert(
        '엑셀파일을 읽는 중 오류가 발생했습니다. \n양식 다운로드하여 새로운 엑셀 파일을 작성하신 후,\n다시 시도해주세요. ',
      )
    }
  }

  async function create() {
    if (items.length === 0) return
    if (!confirm(`주의 : ${year}학년도 학생을 등록합니다. \n\n학생 ${items.length} 명을 등록하시겠습니까?`)) return

    //setToastMsg('학생 일괄 추가를 진행중입니다. 다른 화면으로 이동하셔도 됩니다.');
    setIsLoading(true)

    const CHUNK_SIZE = 50
    const chunkedItems = []
    for (let i = 0; i < items.length; i += CHUNK_SIZE) {
      chunkedItems.push(items.slice(i, i + CHUNK_SIZE))
    }

    const allResults: any[] = []

    try {
      for (const chunk of chunkedItems) {
        console.log('chunk')
        const formattedChunk = chunk.map((item) => ({
          ...item,
          grade: Number(item.grade),
          klass: Number(item.klass),
          studentNumber: Number(item.studentNumber),
          year,
        }))

        const res = await studentManagementBulkCreateStudent(formattedChunk)
        allResults.push(...res)
      }

      setIsLoading(false)
      setItemResults(allResults)

      if (allResults.some((dto) => dto.failReason && dto.failReason.trim() !== '')) {
        setWarningMsg('일부 학생 등록이 실패하였습니다. 실패 원인을 조치 후 다시 시도해주세요.')
      } else {
        setToastMsg('학생 일괄 추가를 완료하였습니다')
        goBack()
      }
    } catch (error) {
      setIsLoading(false)
      setToastMsg('학생 일괄 추가를 실패하였습니다.')
    }
  }

  useEffect(() => {
    const emailCounts = items.reduce(
      (acc, item) => {
        if (item.email) {
          acc[item.email] = (acc[item.email] || 0) + 1
        }
        return acc
      },
      {} as Record<string, number>,
    )
    setDuplicateEmails(emailCounts)
  }, [items])

  return (
    <>
      {isLoading && <Blank />}
      <Admin.Section className="w-full">
        <Admin.H2 className="mb-4">{t('bulk_add_students')}</Admin.H2>

        <div className="flex gap-2">
          <Button.sm
            as="a"
            children={t('download_form')}
            href="https://kr.object.gov-ncloudstorage.com/superschool/storage/%ED%95%99%EC%83%9D%EB%93%B1%EB%A1%9D%EC%A0%95%EB%B3%B4v2.xlsx"
            className="outlined-gray"
          />
          <Button.sm as="label" className="outlined-gray cursor-pointer">
            <p>{t('select_excel_file')}</p>
            <input
              type="file"
              accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  readFile(e.target.files[0])
                  e.target.value = ''
                }
              }}
              className="sr-only"
            />
          </Button.sm>
          <Button.sm
            children={t('bulk_add')}
            disabled={items.length === 0}
            onClick={create}
            className="outlined-gray"
          />
        </div>

        <Admin.Table>
          <Admin.TableHead>
            <Admin.TableRow>
              <Admin.TableHCell className="w-30" children={t('email')} />
              <Admin.TableHCell className="w-30" children={t('name')} />
              <Admin.TableHCell className="w-30" children={t('nickname')} />
              <Admin.TableHCell children={t('grade')} />
              <Admin.TableHCell children={t('class_section')} />
              <Admin.TableHCell children={t('attendance_number')} />
              <Admin.TableHCell children={t('barcode')} />
              <Admin.TableHCell children={t('parent_name')} />
              <Admin.TableHCell children={t('parent_phone_number')} />
              <Admin.TableHCell />
            </Admin.TableRow>
          </Admin.TableHead>
          <Admin.TableBody>
            {items.map((item, i) => (
              <Admin.TableRow key={i} className={item.email && duplicateEmails[item.email] > 1 ? 'text-red-500' : ''}>
                <Admin.TableCell children={item.email} />
                <Admin.TableCell children={item.name} />
                <Admin.TableCell children={item.nickName} />
                <Admin.TableCell children={item.grade} />
                <Admin.TableCell children={item.klass} />
                <Admin.TableCell children={item.studentNumber} />
                <Admin.TableCell children={item.barcode} />
                <Admin.TableCell children={item.nokName} />
                <Admin.TableCell children={item.nokPhone} />
                <Admin.TableCell className="text-red-400" children={itemResults[i]?.failReason} />
              </Admin.TableRow>
            ))}
          </Admin.TableBody>
        </Admin.Table>
      </Admin.Section>
    </>
  )
}
