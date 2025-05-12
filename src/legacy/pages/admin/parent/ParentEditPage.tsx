import { useContext, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useHistory, useParams } from 'react-router'
import { Link } from 'react-router'
import { useSetRecoilState } from 'recoil'
import { Label, Select } from '@/legacy/components/common'
import { Admin } from '@/legacy/components/common/Admin'
import { Button } from '@/legacy/components/common/Button'
import { TextInput } from '@/legacy/components/common/TextInput'
import { parentManagementUpdateParent, useParentManagementGetParentInfo } from '@/legacy/generated/endpoint'
import { RequestModifyParentDto } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { form } from '@/legacy/lib/form'
import { Routes } from '@/legacy/routes'
import { toastState } from 'src/store'
import { AdminContext } from '../AdminMainPage'

export function ParentEditPage() {
  const { goBack } = useHistory()
  const { id: idString } = useParams<{ id: string }>()
  const id = Number(idString)
  const { year } = useContext(AdminContext)
  const { t } = useLanguage()

  const setToastMsg = useSetRecoilState(toastState)

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, isValid },
  } = useForm<RequestModifyParentDto>()

  const { data: parentInfo } = useParentManagementGetParentInfo(id, { year }, { query: { enabled: !!id } })

  useEffect(() => parentInfo && reset(parentInfo), [parentInfo])

  async function save(params: any) {
    await parentManagementUpdateParent(id, params).then((result) => {
      setToastMsg(`${params.name} 님 수정완료`)
    })
    goBack()
  }

  if (!id) return null
  return (
    <Admin.Section className="max-w-xl">
      <Admin.H2>{t('edit_guardian')}</Admin.H2>

      <Label.col>
        <Label.Text children={t('email')} />
        <TextInput placeholder={`${t('email')}`} {...register('email', form.length(1, 100))} />
        <Label.Error children={errors.email?.message} />
      </Label.col>
      <Label.col>
        <Label.Text children={t('name')} />
        <TextInput placeholder={`${t('name')}`} {...register('name', form.length(1, 100))} />
        <Label.Error children={errors.name?.message} />
      </Label.col>
      <Label.col>
        <Label.Text children={t('account_status')} />
        <Select.lg
          {...register('expired', {
            onChange: (e) => {
              return e.target.value === '만료' // '만료' 선택 시 true, '정상' 선택 시 false
            },
          })}
          className="h-13"
        >
          <option value="false">{t('active')}</option>
          <option value="true">{t('expired_status')}</option>
        </Select.lg>
      </Label.col>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <Button.lg
          as={Link}
          children={t('cancel')}
          to={id ? `../${id}` : Routes.admin.parent.index}
          className="outlined-gray"
        />
        <Button.lg children={t('save')} disabled={!isValid} onClick={handleSubmit(save)} className="filled-gray" />
      </div>
    </Admin.Section>
  )
}
