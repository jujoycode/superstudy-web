import { useContext } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useHistory, useParams } from 'react-router-dom'
import { useSetRecoilState } from 'recoil'
import { Label } from '@/legacy/components/common'
import { Admin } from '@/legacy/components/common/Admin'
import { Button } from '@/legacy/components/common/Button'
import { TextInput } from '@/legacy/components/common/TextInput'
import { groupManagementCreateGroup } from '@/legacy/generated/endpoint'
import { RequestCreateGroupOnlyDto } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { form } from '@/legacy/lib/form'
import { Routes } from '@/legacy/routes'
import { toastState } from 'src/store'
import { AdminContext } from '../AdminMainPage'

export function GroupEditPage() {
  const { push } = useHistory()
  const { id: idString } = useParams<{ id: string }>()
  const id = Number(idString)
  const setToastMsg = useSetRecoilState(toastState)
  const { year } = useContext(AdminContext)
  const { t } = useLanguage()

  const {
    handleSubmit,
    register,
    formState: { errors, isValid },
  } = useForm<RequestCreateGroupOnlyDto>()

  async function save(params: any) {
    if (id) return
    const group = await groupManagementCreateGroup({ ...params, year: `${year}` })
    setToastMsg(`${group.name} 그룹이 생성되었습니다`)
    push(`${Routes.admin.group.index}/${group.id}`)
  }

  return (
    <Admin.Section className="max-w-xl">
      <Admin.H2 className="mb-4">{t('add_group')}</Admin.H2>

      <Label.col>
        <Label.Text children={t('group_name')} />
        <TextInput placeholder={`${t('group_name')}`} {...register('name', form.length(1, 1000))} />
        <Label.Error children={errors.name?.message} />
      </Label.col>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <Button.lg
          as={Link}
          children={t('cancel')}
          to={id ? `../${id}` : Routes.admin.group.index}
          className="outlined-gray"
        />
        <Button.lg children={t('save')} disabled={!isValid} onClick={handleSubmit(save)} className="filled-gray" />
      </div>
    </Admin.Section>
  )
}
