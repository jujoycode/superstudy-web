import { useContext, useEffect, useState } from 'react'
import readXlsxFile from 'read-excel-file'
import { useSetRecoilState } from 'recoil'
import { Blank } from '@/legacy/components/common'
import { Admin } from '@/legacy/components/common/Admin'
import { Button } from '@/legacy/components/common/Button'
import { teacherManagementBulkCreateTeacher, teacherManagementRequestSignUp } from '@/legacy/generated/endpoint'
import { RequestCreateTeacherDto, RequestCreateUserBulkDto, Role } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { toastState, warningState } from '@/stores'
import { AdminContext } from '../AdminMainPage'

export function TeacherBatchPage() {
  const { year } = useContext(AdminContext)
  const [isLoading, setIsLoading] = useState(false)
  const [items, setItems] = useState<RequestCreateTeacherDto[]>([])
  const [itemResults, setItemResults] = useState<RequestCreateUserBulkDto[]>([])
  const [duplicateEmails, setDuplicateEmails] = useState<Record<string, number>>({})
  const { t } = useLanguage()

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

  async function readFile(file: File) {
    try {
      setItemResults([])
      const [head, ...rows] = await readXlsxFile(file)

      if (head.length === 6 && head[0] === '이메일' && head[2] === '이름') {
        const items = rows.map(([email, role, name, nickName, headNumber, homeRoomKlass]) => ({
          email,
          role,
          name,
          nickName: nickName || '',
          headNumber,
          homeRoomKlass,
        }))
        setItems(items as any)
      } else {
        alert('선생님 일괄 추가 양식의 엑셀파일을 선택해주세요.')
      }
    } catch {
      alert(
        '엑셀파일을 읽는 중 오류가 발생했습니다. \n양식 다운로드하여 새로운 엑셀 파일을 작성하신 후,\n다시 시도해주세요. ',
      )
    }
  }

  async function create() {
    if (items.length === 0) return
    if (!confirm(`선생님 ${items.length}명을 등록하시겠습니까?`)) return
    //setToastMsg('선생님 일괄 추가를 진행중입니다. 다른 화면으로 이동하셔도 됩니다.');
    setIsLoading(true)
    await teacherManagementBulkCreateTeacher(
      items.map((item) => ({ ...item, role: roleFromText(item.role), headNumber: Number(item.headNumber), year })),
    )
      .then((res) => {
        setIsLoading(false)
        setItemResults(res)

        if (res.some((dto) => dto.failReason && dto.failReason.trim() !== '')) {
          setWarningMsg('일부 선생님등록이 실패하였습니다. 실패 원인을 조치 후 다시 시도해주세요.')
        } else {
          setToastMsg('선생님 일괄 추가를 완료하였습니다. 신규 선생님에게 가입요청 메일을 전송하세요.')
        }

        //goBack();
      })
      .catch(() => {
        setIsLoading(false)
        setToastMsg('선생님 일괄 추가를 실패하였습니다.')
      })
  }

  async function requestSignUp() {
    const newMembers = itemResults.filter((dto) => dto.isNew === true)

    if (!confirm(`신규 선생님 ${newMembers.length}명에게 가입요청 메일을 보낼까요?`)) return
    setIsLoading(true)
    let sucCnt = 0
    await Promise.all(
      newMembers.map(async (item) => {
        try {
          const result = await teacherManagementRequestSignUp(item.id)
          if (result) {
            sucCnt++
            item.failReason = '전송 성공'
          } else {
            item.failReason = '가입요청 메일 전송 실패'
          }
        } catch (error) {
          item.failReason = '가입요청 메일 전송 실패'
        }
      }),
    )
    setIsLoading(false)
    setToastMsg(`가입요청 메일 전송 성공 ${sucCnt}건 / 실패 ${newMembers.length - sucCnt}건`)
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
        <Admin.H2 className="mb-4">{t('bulk_add_teachers')}</Admin.H2>
        <div className="flex gap-2">
          <Button.sm
            as="a"
            children={t('download_form')}
            href="https://kr.object.gov-ncloudstorage.com/superschool/storage/%EA%B5%90%EC%82%AC%EB%93%B1%EB%A1%9D%EC%A0%95%EB%B3%B4v3.xlsx"
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
          <Button.sm
            children={t('send_signup_request_email')}
            title="미가입한 사용자에게 가입요청 메일을 전송합니다."
            disabled={itemResults.length === 0}
            onClick={requestSignUp}
            className="filled-red-light"
          />
        </div>

        <Admin.Table>
          <Admin.TableHead>
            <Admin.TableRow>
              <Admin.TableHCell className="w-30" children={t('email')} />
              <Admin.TableHCell className="w-30" children={t('name')} />
              <Admin.TableHCell className="w-30" children={t('nickname')} />
              <Admin.TableHCell className="w-20" children={t('role')} />
              <Admin.TableHCell className="w-10" children={t('grade_head_teacher')} />
              <Admin.TableHCell className="w-10" children={t('homeroom_teacher')} />
              <Admin.TableHCell />
            </Admin.TableRow>
          </Admin.TableHead>
          <Admin.TableBody>
            {items.map((item, i) => (
              <Admin.TableRow className={item.email && duplicateEmails[item.email] > 1 ? 'text-red-500' : ''} key={i}>
                <Admin.TableCell className="w-30" children={item.email} />
                <Admin.TableCell className="w-30" children={item.name} />
                <Admin.TableCell className="w-30" children={item.nickName} />
                <Admin.TableCell className="w-20" children={item.role} />
                <Admin.TableCell className="w-10" children={item.headNumber} />
                <Admin.TableCell className="w-10" children={item.homeRoomKlass} />
                <Admin.TableCell className="text-red-400" children={itemResults[i]?.failReason} />
              </Admin.TableRow>
            ))}
          </Admin.TableBody>
        </Admin.Table>
      </Admin.Section>
    </>
  )
}

function roleFromText(text: string) {
  switch (text) {
    case '교장선생님':
      return Role.HEAD_PRINCIPAL
    case '교감선생님':
      return Role.VICE_PRINCIPAL
    case '학년부장':
      return Role.HEAD
    case '교무부장':
      return Role.PRINCIPAL
    case '관리자':
      return Role.ADMIN
    case '학년계':
      return Role.PRE_HEAD
    case '교무계':
      return Role.PRE_PRINCIPAL
    case '교감':
      return Role.VICE_PRINCIPAL
    case '교장':
      return Role.HEAD_PRINCIPAL
    case '보안관':
      return Role.SECURITY
    case '교직원':
      return Role.STAFF
    case '선생님':
    default:
      return Role.TEACHER
  }
}
