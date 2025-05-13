import { debounce } from 'lodash'
import { type ChangeEvent, useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Select } from '@/legacy/components/common'
import { Admin } from '@/legacy/components/common/Admin'
import { Button } from '@/legacy/components/common/Button'
import { Checkbox, useCheckbox } from '@/legacy/components/common/Checkbox'
import { Pagination } from '@/legacy/components/common/Pagination'
import { SearchInput } from '@/legacy/components/common/SearchInput'
import { Routes } from '@/legacy/constants/routes'
import {
  parentManagementGetParents,
  useAdminCommonFindAllKlassBySchool,
  useParentManagementGetParents,
} from '@/legacy/generated/endpoint'
import type { ResponseGroupDto } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { useSearch } from '@/legacy/lib/router'
import { AdminContext } from '@/legacy/pages/admin/AdminMainPage'
import { exportCSVToExcel } from '@/legacy/util/download-excel'
import { getNickName } from '@/legacy/util/status'

export function ParentPage() {
  const { t } = useLanguage()
  //@ts-expect-error useTranslation type instantiation error
  const { t: ta } = useTranslation('admin', { keyPrefix: 'parent_page' })
  const { year } = useContext(AdminContext)
  const { page, size } = useSearch({ page: 1, size: 25 })
  const [klassName, setKlassName] = useState('')
  const [keyword, setKeyword] = useState('')

  const [sortField, setSortField] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('ASC')

  const { data: klasses } = useAdminCommonFindAllKlassBySchool({ year })
  const { data: parents } = useParentManagementGetParents(
    { page, size, year, klass: klassName, first_visit: false, keyword, sortField, sortDirection },
    { query: { keepPreviousData: true } },
  )

  const cb = useCheckbox(parents?.items)

  // 버튼 추가할 필요가 생기면 활용
  // async function deleteParent() {
  //   if (!confirm(`항목 ${cb.items.length}개를 삭제할까요?`)) return;
  //   await Promise.all(ids.map((id) => parentManagementDeleteParent(id)));
  //   cb.clear();
  // }

  async function downloadAsExcel() {
    const { items } = await parentManagementGetParents({ size: 10000, year, klass: klassName })
    const content =
      '학급,출석번호,이름,이메일,전화번호,학생이름\n' +
      items
        .map((item) =>
          [
            item.childrenKlassGroupName,
            item.childrenStudentNumber,
            item.name,
            item.email,
            item.phone,
            item.childrenName,
          ].join(),
        )
        .join('\n')
    exportCSVToExcel(content, '보호자')
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
      <Admin.H2>{`${t('parent')} (${parents?.total}${t('count', '명')}) `}</Admin.H2>

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
          {/* <Select onChange={onFirstVisitChange}>
            <option value="undefined">가입여부</option>
            <option value="false">가입완료</option>
            <option value="true">가입대기</option>
          </Select> */}
        </div>
        <div className="flex gap-2">
          <SearchInput placeholder={`${t('search')}`} onChange={onKeywordChange} />
        </div>
      </div>

      <div className="flex gap-2">
        {/* <Button.sm
          children="삭제"
          title="가입여부 X 상태의 사용자만 삭제 가능합니다"
          disabled={cb.allUnchecked || cb.items.some((item) => !item.firstVisit)}
          onClick={deleteParent}
          className="outlined-gray"
        /> */}
        <Button.sm children={ta('export_as_xlsx')} onClick={downloadAsExcel} className="outlined-gray" />
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
            <Admin.TableHCellEX
              sortField="childname"
              activeSortField={sortField}
              sortDirection={sortDirection}
              onClick={() => handleSort('childname')}
              children={t('student_name')}
            />
            <Admin.TableHCell children={t('is_primary_guardian')} />
            <Admin.TableHCell children={t('account_status')} />
          </Admin.TableRow>
        </Admin.TableHead>
        <Admin.TableBody>
          {parents?.items.map((parent, i) => (
            <Admin.TableRow key={`${parent.id}-${parent.childrenId}`} to={`${Routes.admin.parent.index}/${parent.id}`}>
              <Admin.TableCell onClick={(e) => (e.stopPropagation(), cb.click(i))}>
                <Checkbox checked={cb.checked(i)} onChange={() => cb.click(i)} />
              </Admin.TableCell>
              <Admin.TableCell children={parent.childrenKlassGroupName} />
              <Admin.TableCell children={parent.childrenStudentNumber} />
              <Admin.TableCell children={parent.name} />
              <Admin.TableCell children={parent.email} />
              <Admin.TableCell children={parent.phone} />
              <Admin.TableCell children={parent.childrenName + getNickName(parent.childrenNickName)} />
              <Admin.TableCell children={parent.isPrimaryGuardian ? 'O' : 'X'} />
              <Admin.TableCell children={parent.expired ? t('expired_status') : t('active')} />
            </Admin.TableRow>
          ))}
        </Admin.TableBody>
      </Admin.Table>

      <Pagination data={parents} />
    </Admin.Section>
  )
}
