import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link, useHistory, useParams } from 'react-router-dom'
import { useSetRecoilState } from 'recoil'
import { Label } from '@/legacy/components/common'
import { Admin } from '@/legacy/components/common/Admin'
import { Button } from '@/legacy/components/common/Button'
import { TextInput } from '@/legacy/components/common/TextInput'
import { adminPointCreate, adminPointUpdate, useAdminPointGetOne } from '@/legacy/generated/endpoint'
import { PointCreateBody, PointUpdateBody } from '@/legacy/generated/model'
import { form } from '@/legacy/lib/form'
import { cn } from '@/legacy/lib/tailwind-merge'
import { Routes } from '@/legacy/routes'
import { toastState } from '@/legacy/store'
import { getErrorMsg } from '@/legacy/util/status'

type PointSaveBody = PointCreateBody | PointUpdateBody

function isCreating(id: number, body: PointSaveBody): body is PointCreateBody {
  return Number.isNaN(id)
}

export function PointEditPage() {
  const { t } = useTranslation()
  const { t: ta } = useTranslation('admin', { keyPrefix: 'point_edit_page' })
  const { goBack } = useHistory()
  const { id: idString } = useParams<{ id?: string }>()
  const id = Number(idString)
  const setToastMsg = useSetRecoilState(toastState)

  const {
    formState: { errors, isValid },
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = useForm<PointSaveBody>({ defaultValues: { title: '', value: 1 } })

  const { data: point } = useAdminPointGetOne(id)

  useEffect(() => point && reset(point), [point])

  async function save(params: PointSaveBody) {
    try {
      isCreating(id, params) ? await adminPointCreate(params) : await adminPointUpdate(id, params)
    } catch (error) {
      setToastMsg(getErrorMsg(error))
    }
    setToastMsg(`저장되었습니다: ${params.title}`)
    goBack()
  }

  const pointValue = watch('value') ?? 1

  return (
    <Admin.Section className="max-w-xl">
      <Admin.H2>{ta(id ? 'edit_point' : 'add_point')}</Admin.H2>

      <Label.col>
        <Label.Text children={'*' + ta('point_title')} />
        <TextInput autoFocus {...register('title', form.length(1, 100))} />
        <Label.Error children={errors.title?.message} />
      </Label.col>
      <div className="flex items-end gap-2">
        <Button
          children="-"
          onClick={() => setValue('value', -Math.abs(pointValue))}
          className={cn('text-24 mb-1 h-12 w-12', pointValue < 0 ? 'filled-gray' : 'outlined-gray')}
        />
        <Button
          children="+"
          onClick={() => setValue('value', Math.abs(pointValue))}
          className={cn('text-24 mb-1 h-12 w-12', pointValue > 0 ? 'filled-gray' : 'outlined-gray')}
        />
        <Label.col className="flex-1">
          <Label.Text children={'*' + ta('point_value')} />
          <TextInput type="number" min={-100} max={100} {...register('value', form.minmax(-100, 100))} />
          <Label.Error children={errors.value?.message} />
        </Label.col>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <Button.lg
          as={Link}
          children={t('cancel')}
          to={id ? `../${id}` : Routes.admin.point.index}
          className="outlined-gray"
        />
        <Button.lg children={t('save')} disabled={!isValid} onClick={handleSubmit(save)} className="filled-gray" />
      </div>
    </Admin.Section>
  )
}
