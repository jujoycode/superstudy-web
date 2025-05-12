import { debounce } from 'lodash'
import { type ChangeEvent, useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSetRecoilState } from 'recoil'
import { Select } from '@/legacy/components/common'
import { Admin } from '@/legacy/components/common/Admin'
import { Button } from '@/legacy/components/common/Button'
import { Checkbox, useCheckbox } from '@/legacy/components/common/Checkbox'
import { Pagination } from '@/legacy/components/common/Pagination'
import { SearchInput } from '@/legacy/components/common/SearchInput'
import { teacherRoles } from '@/legacy/constants/teacher-roles'
import {
  teacherManagementDeleteTeacher,
  teacherManagementGetTeachers,
  teacherManagementRequestSignUp,
  useTeacherManagementGetTeachers,
} from '@/legacy/generated/endpoint'
import { type ResponseTeacherInfoDto, Role } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { useSearch } from '@/legacy/lib/router'
import { Routes } from '@/legacy/constants/routes'
import { toastState, warningState } from 'src/store'
import { exportCSVToExcel } from '@/legacy/util/download-excel'
import { getNickName } from '@/legacy/util/status'
import { AdminContext } from '../AdminMainPage'

export function TeacherPage() {
  const { t } = useLanguage()
  const { year } = useContext(AdminContext)
  const { page, size } = useSearch({ page: 1, size: 25 })
  const [role, setRole] = useState<Role>()
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

  const { data: teachers } = useTeacherManagementGetTeachers(
    { page, size, year, role, first_visit: firstVisit, keyword, sortField, sortDirection },
    { query: { keepPreviousData: true } },
  )

  const idMap = teachers?.items.reduce((map: Record<number, ResponseTeacherInfoDto>, obj: ResponseTeacherInfoDto) => {
    map[obj.id] = obj
    return map
  }, {})

  // idMap의 값들을 배열로 변환합니다.
  let uniqueTeachers: ResponseTeacherInfoDto[] = []

  if (idMap) {
    uniqueTeachers = Object.values(idMap)
  }

  const cb = useCheckbox(uniqueTeachers)
  const ids = cb.items.map(({ id }) => id)

  async function requestSignUp() {
    if (!confirm(`사용자 ${cb.items.length}명에게 가입요청 메일을 보낼까요?`)) return
    let sucCnt = 0
    await Promise.all(
      ids.map((id) =>
        teacherManagementRequestSignUp(id).then((result) => {
          if (result) {
            sucCnt++
          }
        }),
      ),
    )
    setToastMsg(`가입요청 메일 전송 성공 ${sucCnt}건 / 실패 ${cb.items.length - sucCnt}건`)
    cb.clear()
  }

  async function deleteTeacher() {
    if (!confirm(`항목 ${cb.items.length}개를 삭제할까요?`)) return
    let sucCnt = 0
    await Promise.all(
      ids.map((id) =>
        teacherManagementDeleteTeacher(id).then((result) => {
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
    const { items } = await teacherManagementGetTeachers({ size: 10000, year })
    const content =
      '역할,이름,이메일,전화번호,부서,직책\n' +
      items
        .map((item) =>
          [t(`Role.${item.role}`), item.name, item.email, item.phone, item.department, item.position].join(),
        )
        .join('\n')
    exportCSVToExcel(content, '선생님')
  }

  function onRoleChange(e: ChangeEvent<HTMLSelectElement>) {
    if (e.target.value === 'undefined') return setRole(undefined)
    setRole(e.target.value as Role)
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
      <Admin.H2>{`${t('teacher')} (${teachers?.total}${t('count', '명')}) `}</Admin.H2>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Select onChange={onRoleChange}>
            <option value="undefined">{t('all_roles')}</option>
            {teacherRoles.map((role) => (
              <option key={role} value={role}>
                {t(`Role.${role}`)}
              </option>
            ))}
          </Select>
          <Select onChange={onFirstVisitChange}>
            <option value="undefined">{t('membership_status')}</option>
            <option value="false">{t('signup_complete')}</option>
            <option value="true">{t('pending_signup')}</option>
          </Select>
        </div>
        <div className="flex gap-2">
          <SearchInput placeholder={`${t('search')}`} onChange={onKeywordChange} />
        </div>
      </div>

      <div className="flex gap-2">
        <Button.sm as={Link} children={t('add')} to={Routes.admin.teacher.new} className="outlined-gray" />
        <Button.sm as={Link} children={t('bulk_add')} to={Routes.admin.teacher.batch} className="outlined-gray" />
        <Button.sm
          children={t('send_signup_request_email')}
          title="가입여부 X 상태의 사용자만 가능합니다"
          disabled={cb.allUnchecked || cb.items.some((item) => !item.firstVisit)}
          onClick={requestSignUp}
          className="outlined-gray"
        />
        <Button.sm
          children={t('delete')}
          title="미가입/퇴직 상태의 사용자만 삭제 가능합니다"
          disabled={cb.allUnchecked || cb.items.some((item) => !(item.firstVisit || item.expired))}
          onClick={deleteTeacher}
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
            <Admin.TableHCell children={t('role')} />
            <Admin.TableHCellEX
              sortField="name"
              activeSortField={sortField}
              sortDirection={sortDirection}
              onClick={() => handleSort('name')}
              children={t('name')}
            />
            <Admin.TableHCell children={t('email')} />
            <Admin.TableHCell children={t('phone_number')} />
            <Admin.TableHCell children={t('department')} />
            <Admin.TableHCell children={t('approval_position')} />
            <Admin.TableHCell children={t('status')} />
          </Admin.TableRow>
        </Admin.TableHead>
        <Admin.TableBody>
          {uniqueTeachers?.map((teacher, i) => (
            <Admin.TableRow key={teacher.id} to={`${Routes.admin.teacher.index}/${teacher.id}`}>
              <Admin.TableCell onClick={(e) => (e.stopPropagation(), cb.click(i))}>
                <Checkbox checked={cb.checked(i)} onChange={() => cb.click(i)} />
              </Admin.TableCell>
              <Admin.TableCell children={t(`Role.${teacher.role}`)} />
              <Admin.TableCell children={teacher.name + getNickName(teacher.nickName)} />
              <Admin.TableCell children={teacher.email} />
              <Admin.TableCell children={teacher.phone} />
              <Admin.TableCell children={teacher.department} />
              <Admin.TableCell children={teacher.position} />
              <Admin.TableCell
                children={teacher.firstVisit ? t('not_joined') : teacher.expiredReason || t('employed')}
              />
            </Admin.TableRow>
          ))}
        </Admin.TableBody>
      </Admin.Table>

      <Pagination data={teachers} />
    </Admin.Section>
  )
}
