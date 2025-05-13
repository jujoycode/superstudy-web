import { debounce } from 'lodash'
import { type ChangeEvent, useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useSetRecoilState } from 'recoil'

import { Select } from '@/legacy/components/common'
import { Admin } from '@/legacy/components/common/Admin'
import { Button } from '@/legacy/components/common/Button'
import { Checkbox, useCheckbox } from '@/legacy/components/common/Checkbox'
import { Pagination } from '@/legacy/components/common/Pagination'
import { SearchInput } from '@/legacy/components/common/SearchInput'
import { Routes } from '@/legacy/constants/routes'
import {
  studentManagementDeleteStudent,
  studentManagementGetStudents,
  studentManagementRequestSignUp,
  useAdminCommonFindAllKlassBySchool,
  useStudentManagementGetStudents,
} from '@/legacy/generated/endpoint'
import type { ResponseGroupDto } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { useSearch } from '@/legacy/lib/router'
import { AdminContext } from '@/legacy/pages/admin/AdminMainPage'
import { exportCSVToExcel } from '@/legacy/util/download-excel'
import { getNickName } from '@/legacy/util/status'
import { toastState, warningState } from '@/stores'

export function StudentPage() {
  const { t } = useLanguage()
  const { t: ta } = useTranslation('admin', { keyPrefix: 'student_page' })
  const { year } = useContext(AdminContext)
  const { page, size } = useSearch({ page: 1, size: 25 })
  const [klassName, setKlassName] = useState('')
  const [firstVisit, setFirstVisit] = useState<boolean>()
  const [keyword, setKeyword] = useState('')

  const [sortField, setSortField] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('ASC')

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

  const { data: klasses } = useAdminCommonFindAllKlassBySchool({ year })
  const { data: students } = useStudentManagementGetStudents(
    { page, size, year, klass: klassName, first_visit: firstVisit, keyword, sortField, sortDirection },
    { query: { keepPreviousData: true } },
  )

  const cb = useCheckbox(students?.items)
  const ids = cb.items.map(({ id }) => id)

  async function requestSignUp() {
    if (!confirm(`사용자 ${cb.items.length}명에게 가입요청 메일을 보낼까요?`)) return
    let sucCnt = 0
    await Promise.all(
      ids.map((id) =>
        studentManagementRequestSignUp(id).then((result) => {
          if (result) {
            sucCnt++
          }
        }),
      ),
    )
    setToastMsg(`가입요청 메일 전송 성공 ${sucCnt}건 / 실패 ${cb.items.length - sucCnt}건`)
    cb.clear()
  }

  async function deleteStudent() {
    if (!confirm(`항목 ${cb.items.length}개를 삭제할까요?`)) return
    let sucCnt = 0
    await Promise.all(
      ids.map((id) =>
        studentManagementDeleteStudent(id).then((result) => {
          if (result) {
            sucCnt++
          }
        }),
      ),
    )
    setToastMsg(`항목 삭제 성공 ${sucCnt}건 / 실패 ${cb.items.length - sucCnt}건`)
    cb.clear()
  }

  async function downloadAsExcel() {
    const { items } = await studentManagementGetStudents({ size: 10000, year })
    const content =
      '학급,출석번호,이름,이메일,전화번호\n' +
      items
        .map((item) => [item.klassGroupName, item.studentNumber, item.name, item.email, item.phone].join())
        .join('\n')
    exportCSVToExcel(content, '학생')
  }

  function onFirstVisitChange(e: ChangeEvent<HTMLSelectElement>) {
    if (e.target.value === 'undefined') return setFirstVisit(undefined)
    if (e.target.value === 'false') return setFirstVisit(false)
    if (e.target.value === 'true') return setFirstVisit(true)
  }

  const onKeywordChange = debounce((e: ChangeEvent<HTMLInputElement>) => setKeyword(e.target.value), 300)

  const handleSort = (field: string) => {
    if (sortField === field) {
      // 같은 필드 클릭 시 방향 토글
      setSortDirection((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'))
    } else {
      // 다른 필드 클릭 시 필드 변경 + 기본 asc
      setSortField(field)
      setSortDirection('ASC')
    }
  }

  return (
    <Admin.Section>
      <Admin.H2>{`${t('student')} (${students?.total}${t('count', '명')}) `}</Admin.H2>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Select value={klassName} onChange={(e) => setKlassName(e.target.value)}>
            <option value="">{t('select_class')}</option>
            {klasses
              ?.reduce((acc: ResponseGroupDto[], current: ResponseGroupDto) => {
                if (!acc.find((item) => item.id === current.id)) {
                  acc.push(current)
                }
                return acc
              }, [])
              .map((k) => (
                <option key={k.id} value={k.name ?? ''}>
                  {k.name}
                </option>
              ))}
          </Select>
          <Select onChange={onFirstVisitChange}>
            <option value="undefined">{t('membership_status')}</option>
            <option value="true">{t('pending_signup')}</option>
            <option value="false">{t('signup_complete')}</option>
          </Select>
        </div>
        <div className="flex gap-2">
          <SearchInput placeholder={`${t('search')}`} onChange={onKeywordChange} />
        </div>
      </div>

      <div className="flex gap-2">
        <Button.sm as={Link} children={t('add')} to={Routes.admin.student.new} className="outlined-gray" />
        <Button.sm as={Link} children={t('bulk_add')} to={Routes.admin.student.batch} className="outlined-gray" />
        <Button.sm
          as={Link}
          children={t('bulk_promotion')}
          to={Routes.admin.student.advance}
          className="outlined-gray"
        />
        <Button.sm as={Link} children={ta('edit_photos')} to={Routes.admin.student.photos} className="outlined-gray" />
        <Button.sm
          children={t('send_signup_request_email')}
          title={`${t('only_users_with_status_x_can_register')}`}
          disabled={cb.allUnchecked || cb.items.some((item) => !item.firstVisit)}
          onClick={requestSignUp}
          className="outlined-gray"
        />
        <Button.sm
          children={t('delete')}
          title={`${t('only_users_with_status_x_can_be_deleted')}`}
          disabled={cb.allUnchecked || cb.items.some((item) => !(item.firstVisit || item.expired))}
          onClick={deleteStudent}
          className="outlined-gray"
        />
        <Button.sm children={t('download_excel')} onClick={downloadAsExcel} className="outlined-gray" />
      </div>

      <Admin.Table>
        <Admin.TableHead>
          <Admin.TableRow>
            <Admin.TableHCell>
              <Checkbox checked={cb.allChecked} onChange={cb.clickAll} />
            </Admin.TableHCell>
            <Admin.TableHCellEX
              sortField="number"
              activeSortField={sortField}
              sortDirection={sortDirection}
              onClick={() => handleSort('number')}
              children={t('class')}
            />
            <Admin.TableHCellEX
              sortField="number"
              activeSortField={sortField}
              sortDirection={sortDirection}
              onClick={() => handleSort('number')}
              children={t('attendance_number')}
            />
            <Admin.TableHCellEX
              sortField="name"
              activeSortField={sortField}
              sortDirection={sortDirection}
              onClick={() => handleSort('name')}
              children={t('name')}
            />
            <Admin.TableHCell children={t('email')} />
            <Admin.TableHCell children={t('phone_number')} />
            <Admin.TableHCell children={t('member_barcode')} />
            {/* <Admin.TableHCell children={t('academic_status')} /> */}
            <Admin.TableHCell children={t('status')} />
          </Admin.TableRow>
        </Admin.TableHead>
        <Admin.TableBody>
          {students?.items.map((student, i) => (
            <Admin.TableRow key={student.id} to={`${Routes.admin.student.index}/${student.id}`}>
              <Admin.TableCell onClick={(e) => (e.stopPropagation(), cb.click(i))}>
                <Checkbox checked={cb.checked(i)} onChange={() => cb.click(i)} />
              </Admin.TableCell>
              <Admin.TableCell children={student.klassGroupName} />
              <Admin.TableCell children={student.studentNumber} />
              <Admin.TableCell children={student.name + getNickName(student.nickName)} />
              <Admin.TableCell children={student.email} />
              <Admin.TableCell children={student.phone} />
              <Admin.TableCell children={student.barcode} />
              {/* <Admin.TableCell children={t(`Student_Status.${student.expiredReason}`)} /> */}
              <Admin.TableCell
                children={
                  student.firstVisit
                    ? t('not_joined')
                    : t(`Student_Status.${student.expiredReason}`) || t('signup_complete')
                }
              />
            </Admin.TableRow>
          ))}
        </Admin.TableBody>
      </Admin.Table>

      <Pagination data={students} />
    </Admin.Section>
  )
}
