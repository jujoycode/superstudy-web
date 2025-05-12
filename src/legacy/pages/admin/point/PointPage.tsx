import { sumBy } from 'lodash'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useSetRecoilState } from 'recoil'
import { Admin } from '@/legacy/components/common/Admin'
import { Button } from '@/legacy/components/common/Button'
import { Checkbox, useCheckbox } from '@/legacy/components/common/Checkbox'
import { Pagination } from '@/legacy/components/common/Pagination'
import { adminPointDelete, useAdminPointGet } from '@/legacy/generated/endpoint'
import { useSearch } from '@/legacy/lib/router'
import { Routes } from '@/legacy/constants/routes'
import { toastState } from '@/stores'

export function PointPage() {
  const { t } = useTranslation()
  const { t: ta } = useTranslation('admin', { keyPrefix: 'point_page' })
  const { page, size } = useSearch({ page: 1, size: 25 })
  const setToastMsg = useSetRecoilState(toastState)

  const { data: points } = useAdminPointGet({ page, size })

  const cb = useCheckbox(points?.items)
  const ids = cb.items.map(({ id }) => id)

  async function deletePoint() {
    if (!confirm(`항목 ${cb.items.length}개를 삭제할까요?`)) return
    const results = await Promise.all(ids.map((id) => adminPointDelete(id)))
    const sucCnt = sumBy(results, ({ affected }) => affected)
    setToastMsg(`항목 삭제 성공 ${sucCnt}건 / 실패 ${cb.items.length - sucCnt}건`)
    cb.clear()
  }

  return (
    <Admin.Section>
      <Admin.H2>{ta('points')}</Admin.H2>

      <div className="flex gap-2">
        <Button.sm as={Link} children={t('add')} to={Routes.admin.point.new} className="outlined-gray" />
        <Button.sm children={t('delete')} disabled={cb.allUnchecked} onClick={deletePoint} className="outlined-gray" />
      </div>

      <Admin.Table>
        <Admin.TableHead>
          <Admin.TableRow>
            <Admin.TableHCell>
              <Checkbox checked={cb.allChecked} onChange={cb.clickAll} />
            </Admin.TableHCell>
            <Admin.TableHCell children={ta('point_title')} />
            <Admin.TableHCell children={ta('point_value')} className="text-end" />
          </Admin.TableRow>
        </Admin.TableHead>
        <Admin.TableBody>
          {points?.items.map((point, i) => (
            <Admin.TableRow key={point.id} to={`${Routes.admin.point.index}/${point.id}`}>
              <Admin.TableCell onClick={(e) => (e.stopPropagation(), cb.click(i))}>
                <Checkbox checked={cb.checked(i)} onChange={() => cb.click(i)} />
              </Admin.TableCell>
              <Admin.TableCell children={point.title} />
              <Admin.TableCell children={point.value} className="text-end" />
            </Admin.TableRow>
          ))}
        </Admin.TableBody>
      </Admin.Table>

      <Pagination data={points} />
    </Admin.Section>
  )
}
