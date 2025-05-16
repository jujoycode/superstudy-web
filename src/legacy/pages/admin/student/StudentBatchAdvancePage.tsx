import { useContext, useEffect, useState } from 'react'
import readXlsxFile from 'read-excel-file'

import { useHistory } from '@/hooks/useHistory'
import { Blank } from '@/legacy/components/common'
import { Admin } from '@/legacy/components/common/Admin'
import { Button } from '@/legacy/components/common/Button'
import { studentManagementAdvancedStudent } from '@/legacy/generated/endpoint'
import { RequestAdvancedStudentDto } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { AdminContext } from '@/legacy/pages/admin/AdminMainPage'
import { useNotificationStore } from '@/stores/notification'

export function StudentBatchAdvancePage() {
  const { goBack } = useHistory()
  const { year } = useContext(AdminContext)
  const [isLoading, setIsLoading] = useState(false)
  const { t } = useLanguage()
  const [items, setItems] = useState<RequestAdvancedStudentDto[]>([])
  const [itemErrors, setItemErrors] = useState<string[]>([])

  const { setToast: setToastMsg, setWarning: setWarningMsg } = useNotificationStore()

  useEffect(() => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    if (currentMonth === 2 && year !== currentYear) {
      setWarningMsg(`주의 : ${year} 학년도가 선택되어 있습니다.`)
    }
  }, [year])

  async function readFile(file: File) {
    try {
      setItemErrors([])
      const [head, ...rows] = await readXlsxFile(file)

      if (head.length === 7 && head[0] === '학년' && head[6] === '이전번호') {
        const items = rows.map(([newGrade, newKlass, newStudentNumber, name, oldGrade, oldKlass, oldStudentNumber]) => {
          return { newGrade, newKlass, newStudentNumber, name, oldGrade, oldKlass, oldStudentNumber }
        })
        setItems(items as any)
      } else {
        alert('일괄 진급 양식의 엑셀파일을 선택해주세요.')
      }
    } catch {
      alert(
        '엑셀파일을 읽는 중 오류가 발생했습니다. \n양식 다운로드하여 새로운 엑셀 파일을 작성하신 후,\n다시 시도해주세요. ',
      )
    }
  }

  async function update() {
    if (items.length === 0) return
    if (
      !confirm(
        `주의 : ${year - 1}학년도 학번을 ${year}학년도 학번으로 진급시킵니다. \n\n학생 ${items.length} 명을 진급시겠습니까?`,
      )
    ) {
      return
    }

    const errors: string[] = []
    let errorCount = 0

    setToastMsg('학생 일괄 진급을 진행중입니다. 잠시만 기다려 주세요.')
    setIsLoading(true)

    // 학급별로 그룹화
    const klassBatches = items.reduce(
      (acc, item, index) => {
        const klassKey = `${item.newGrade}-${item.newKlass}`
        if (!acc[klassKey]) {
          acc[klassKey] = []
        }
        acc[klassKey].push({ item, index })
        return acc
      },
      {} as Record<string, Array<{ item: (typeof items)[0]; index: number }>>,
    )

    // 학급별 병렬 처리
    await Promise.all(
      Object.entries(klassBatches).map(async ([_, klassItems]) => {
        // 각 학급 내에서는 순차 처리
        for (const { item, index } of klassItems) {
          try {
            await studentManagementAdvancedStudent({
              ...item,
              newGrade: Number(item.newGrade),
              newKlass: Number(item.newKlass),
              newStudentNumber: Number(item.newStudentNumber),
              oldGrade: Number(item.oldGrade),
              oldKlass: Number(item.oldKlass),
              oldStudentNumber: Number(item.oldStudentNumber),
              adventYear: year,
            })
          } catch (error: any) {
            errors[index] = error.response?.data?.message || '처리 중 오류가 발생했습니다.'
            errorCount++
          }
        }
      }),
    )

    setIsLoading(false)
    if (errorCount === 0) {
      setToastMsg('학생 일괄 진급을 완료하였습니다.')
      goBack()
    } else {
      setToastMsg(`학생 일괄 진급 처리 중, ${errorCount}개의 오류가 발생하였습니다.`)
      setItemErrors(errors)
    }
  }

  return (
    <>
      {isLoading && <Blank />}
      <Admin.Section className="w-full">
        <Admin.H2 className="mb-4">{t('bulk_promotion_students')}</Admin.H2>

        <div className="flex gap-2">
          <Button.sm
            as="a"
            children={t('download_form')}
            href="https://kr.object.gov-ncloudstorage.com/superschool/storage/%ED%95%99%EC%83%9D%EC%A7%84%EA%B8%89%EC%A0%95%EB%B3%B4.xlsx"
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
            children={t('bulk_promotion')}
            disabled={items.length === 0}
            onClick={update}
            className="outlined-gray"
          />
        </div>

        <Admin.Table>
          <Admin.TableHead>
            <Admin.TableRow>
              <Admin.TableHCell className="w-10" children={t('promotion_grade')} />
              <Admin.TableHCell className="w-10" children={t('promotion_class')} />
              <Admin.TableHCell className="w-10" children={t('promotion_number')} />
              <Admin.TableHCell className="w-30" children={t('name')} />
              <Admin.TableHCell className="w-10" children={t('previous_grade')} />
              <Admin.TableHCell className="w-10" children={t('previous_class')} />
              <Admin.TableHCell className="w-10" children={t('previous_number')} />
              <Admin.TableHCell />
            </Admin.TableRow>
          </Admin.TableHead>
          <Admin.TableBody>
            {items.map((item, i) => (
              <Admin.TableRow key={i}>
                <Admin.TableCell className="w-10" children={item.newGrade} />
                <Admin.TableCell className="w-10" children={item.newKlass} />
                <Admin.TableCell className="w-10" children={item.newStudentNumber} />
                <Admin.TableCell className="w-30" children={item.name} />
                <Admin.TableCell className="w-10" children={item.oldGrade} />
                <Admin.TableCell className="w-10" children={item.oldKlass} />
                <Admin.TableCell className="w-10" children={item.oldStudentNumber} />
                <Admin.TableCell className="text-red-400" children={itemErrors[i]} />
              </Admin.TableRow>
            ))}
          </Admin.TableBody>
        </Admin.Table>
      </Admin.Section>
    </>
  )
}
