import { useContext } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useParams } from 'react-router'
import { useSetRecoilState } from 'recoil'

import { useHistory } from '@/hooks/useHistory'
import { Label } from '@/legacy/components/common'
import { Admin } from '@/legacy/components/common/Admin'
import { Button } from '@/legacy/components/common/Button'
import { NumberInput } from '@/legacy/components/common/NumberInput'
import { Routes } from '@/legacy/constants/routes'
import { klassManagementCreateKlass } from '@/legacy/generated/endpoint'
import { RequestCreateKlassDto } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { form } from '@/legacy/lib/form'
import { AdminContext } from '@/legacy/pages/admin/AdminMainPage'
import { toastState } from '@/stores'

export function KlassEditPage() {
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
  } = useForm<RequestCreateKlassDto>()

  async function save(params: any) {
    if (id) return
    const klass = await klassManagementCreateKlass({ ...params, year }).catch((error) =>
      alert(error.response.data.message),
    )
    if (!klass) return
    setToastMsg(`${params.grade}학년 ${params.klass}반 학급이 생성되었습니다`)
    push(`${Routes.admin.klass.index}/${klass.id}`)
  }

  return (
    <Admin.Section className="max-w-xl">
      <Admin.H2 className="mb-4">{t('add_class')}</Admin.H2>

      <Label.col>
        <Label.Text children={t('grade')} />
        <NumberInput placeholder={`${t('grade')}`} {...register('grade', form.minmax(1, 20))} />
        <Label.Error children={errors.grade?.message} />
      </Label.col>
      <Label.col>
        <Label.Text children={t('class_section')} />
        <NumberInput placeholder={`${t('class_section')}`} {...register('klass', form.minmax(1, 100))} />
        <Label.Error children={errors.klass?.message} />
      </Label.col>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <Button.lg
          as={Link}
          children={t('cancel')}
          to={id ? `../${id}` : Routes.admin.klass.index}
          className="outlined-gray"
        />
        <Button.lg children={t('save')} disabled={!isValid} onClick={handleSubmit(save)} className="filled-gray" />
      </div>
    </Admin.Section>
  )
}
