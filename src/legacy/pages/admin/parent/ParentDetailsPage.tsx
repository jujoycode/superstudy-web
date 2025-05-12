import { useContext } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Label } from '@/legacy/components/common'
import { Admin } from '@/legacy/components/common/Admin'
import { Button } from '@/legacy/components/common/Button'
import { parentManagementUpdateParent, useParentManagementGetParentInfo } from '@/legacy/generated/endpoint'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { getNickName } from '@/legacy/util/status'
import { AdminContext } from '../AdminMainPage'

export function ParentDetailsPage() {
  const { year } = useContext(AdminContext)
  const { id: idString } = useParams<{ id: string }>()
  const id = Number(idString)
  const { t } = useLanguage()

  const { data: parent } = useParentManagementGetParentInfo(id, { year })

  return (
    <>
      <Admin.Section>
        <Admin.H2>{t('guardian_information')}</Admin.H2>
        <div className="flex gap-2">
          <Button.sm as={Link} children={t('edit')} to={`${id}/edit`} className="outlined-gray" />
        </div>
        <Admin.Card className="grid h-[270px] grid-cols-3 divide-x">
          <Admin.Cell className="grid grid-rows-3">
            <div>
              <Label.Text children={t('name')} />
              <p className="mt-2">{parent?.name}</p>
            </div>
            <div>
              <Label.Text children={t('email')} />
              <p className="mt-2">{parent?.email}</p>
            </div>
            <div>
              <Label.Text children={t('phone_number')} />
              <p className="mt-2">{parent?.phone}</p>
            </div>
            <div>
              <Label.Text children={t('account_status')} />
              <p className="mt-2">{parent?.expired ? t('expired_status') : t('active')}</p>
            </div>
          </Admin.Cell>
          <Admin.Cell className="grid grid-rows-3">
            {!!parent?.loginFailCount && parent?.loginFailCount >= 5 && (
              <div>
                <Label.Text children={t('status')} />
                <Button.sm
                  children={t('unlock_password')}
                  onClick={() => {
                    const text = t('confirm_unlock_password')
                    confirm(text) && parentManagementUpdateParent(id, { loginFailCount: 0 })
                  }}
                  className="filled-red-light"
                />
              </div>
            )}
          </Admin.Cell>
          <Admin.Cell></Admin.Cell>
        </Admin.Card>
      </Admin.Section>

      <Admin.Section>
        <Admin.H2>{t('student')}</Admin.H2>
        <Admin.Table>
          <Admin.TableHead>
            <Admin.TableRow>
              <Admin.TableHCell children={t('name')} />
              <Admin.TableHCell children={t('class')} />
              <Admin.TableHCell children={t('attendance_number')} />
            </Admin.TableRow>
          </Admin.TableHead>
          <Admin.TableBody>
            {parent?.children.map((child) => (
              <Admin.TableRow key={child.childrenId}>
                <Admin.TableCell children={child.childrenName + getNickName(child.childrenNickName)} />
                <Admin.TableCell children={child.childrenKlassGroupName} />
                <Admin.TableCell children={child.childrenStudentNumber} />
              </Admin.TableRow>
            ))}
          </Admin.TableBody>
        </Admin.Table>
      </Admin.Section>
    </>
  )
}
