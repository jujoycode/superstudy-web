import { useSetRecoilState } from 'recoil'
import { Admin } from '@/legacy/components/common/Admin'
import { Button } from '@/legacy/components/common/Button'
import { Checkbox, useCheckbox } from '@/legacy/components/common/Checkbox'
import { Pagination } from '@/legacy/components/common/Pagination'
import { adminCommonDeleteUser, useAdminCommonGetExpiredUsers } from '@/legacy/generated/endpoint'
import { Role } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { useSearch } from '@/legacy/lib/router'
import { toastState } from '@/stores'
import { Routes } from '@/legacy/constants/routes'

export function ExpiredUserPage() {
  const { page, size } = useSearch({ page: 1, size: 25 })
  const { t } = useLanguage()

  const { data: responseData } = useAdminCommonGetExpiredUsers({ page, limit: size })
  const cb = useCheckbox(responseData?.items)
  const ids = cb.items.map(({ id }) => id)
  const setToastMsg = useSetRecoilState(toastState)

  async function deleteExpiredUser() {
    if (!confirm(`삭제된 계정은 복구할 수 없습니다.\n만료된 계정 ${cb.items.length}개를 삭제하시겠습니까?`)) return
    let sucCnt = 0

    await Promise.all(
      ids.map(async (id) => {
        const result = await adminCommonDeleteUser(id)
        if (result) {
          sucCnt++
        }
      }),
    )

    setToastMsg(`항목 삭제 성공 ${sucCnt}건 / 실패 ${cb.items.length - sucCnt}건`)
    cb.clear()
  }

  const roleMapping: Record<string, string> = {
    USER: '학생',
    PARENT: '학부모',
  }

  return (
    <Admin.Section>
      <Admin.H2>{t('expired_user')}</Admin.H2>

      <div className="flex gap-2">
        <Button.sm
          children="삭제"
          title="삭제"
          disabled={cb.allUnchecked || cb.items.some((item) => !item.expired)}
          onClick={deleteExpiredUser}
          className="outlined-gray"
        />
      </div>

      <Admin.Table>
        <Admin.TableHead>
          <Admin.TableRow>
            <Admin.TableHCell>
              <Checkbox checked={cb.allChecked} onChange={cb.clickAll} />
            </Admin.TableHCell>
            <Admin.TableHCell children={t('name')} />
            <Admin.TableHCell children={t('email')} />
            <Admin.TableHCell children={t('phone_number')} />
            <Admin.TableHCell children={t('type')} />
            <Admin.TableHCell children={t('expired_reason')} />
          </Admin.TableRow>
        </Admin.TableHead>
        <Admin.TableBody>
          {responseData?.items.map((user, i) => (
            <Admin.TableRow
              key={user.id}
              to={`${user.role === Role.TEACHER ? Routes.admin.teacher.index : Routes.admin.student.index}/${user.id}`}
            >
              <Admin.TableCell onClick={(e) => (e.stopPropagation(), cb.click(i))}>
                <Checkbox checked={cb.checked(i)} onChange={() => cb.click(i)} />
              </Admin.TableCell>
              <Admin.TableCell children={user.name} />
              <Admin.TableCell children={user.email} />
              <Admin.TableCell children={user.phone} />
              <Admin.TableCell children={roleMapping[user.role] || '선생님'} />
              <Admin.TableCell children={user.expiredReason} />
            </Admin.TableRow>
          ))}
        </Admin.TableBody>
      </Admin.Table>

      <Pagination data={responseData} />
    </Admin.Section>
  )
}
