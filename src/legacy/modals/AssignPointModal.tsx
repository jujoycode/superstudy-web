import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNotificationStore } from '@/stores/notification'
import { Button } from '@/atoms/Button'
import { Text } from '@/atoms/Text'
import { SuperModal } from '@/legacy/components'
import { Label, Select } from '@/legacy/components/common'
import { TextInput } from '@/legacy/components/common/TextInput'
import { GroupContainer } from '@/legacy/container/group'
import {
  teacherPointLogCreate,
  useTeacherPointGet,
  useTeacherStudentGroupGet,
  useTeacherUserGet,
} from '@/legacy/generated/endpoint'
import { PointLogCreateBody } from '@/legacy/generated/model'
import { form } from '@/legacy/lib/form'
import { cn } from '@/legacy/lib/tailwind-merge'
import { getNickName } from '@/legacy/util/status'
import { numberWithSign } from '@/legacy/util/string'

export interface AssignPointModalProps {
  modalOpen: boolean
  setModalClose: () => void
  studentId?: number
  groupId?: number
}

export function AssignPointModal({
  studentId,
  groupId: defaultGroupId,
  modalOpen,
  setModalClose,
}: AssignPointModalProps) {
  const { t } = useTranslation()
  const { t: tm } = useTranslation('modal', { keyPrefix: 'assign_point_modal' })
  const { setToast: setToastMsg } = useNotificationStore()
  const [groupId, setGroupId] = useState(defaultGroupId)
  const [studentIds, setStudentIds] = useState<number[]>(studentId ? [studentId] : [])

  const {
    formState: { errors },
    handleSubmit,
    register,
    setValue,
    watch,
  } = useForm<PointLogCreateBody>({ defaultValues: { value: 1 } })

  const { allKlassGroupsUnique } = GroupContainer.useContext()
  const { data: studentGroups } = useTeacherStudentGroupGet(
    { groupId, size: 10000, join: ['user'] },
    { query: { enabled: !!groupId } },
  )
  const { data: students } = useTeacherUserGet({ ids: studentIds }, { query: { keepPreviousData: true } })
  const { data: points } = useTeacherPointGet({ size: 10000 })

  useEffect(() => {
    if (groupId || allKlassGroupsUnique.length === 0) return
    setGroupId(allKlassGroupsUnique[0].id)
  }, [allKlassGroupsUnique])

  useEffect(() => points?.items[0] && setValue('pointId', points.items[0].id), [points])

  async function assign(body: PointLogCreateBody) {
    if (!confirm(`실행할까요?`)) return
    if (body.pointId) {
      delete body.title
      delete body.value
    }
    const promises = studentIds.map((studentId) => teacherPointLogCreate({ ...body, studentId }))
    const pointLogs = await Promise.all(promises)
    setToastMsg(
      `${pointLogs.length}명에게 부여되었습니다: ${pointLogs[0].title} (${numberWithSign(pointLogs[0].value)})`,
    )
    setModalClose()
  }

  const pointValue = watch('value') ?? 1

  return (
    <SuperModal
      modalOpen={modalOpen}
      setModalClose={setModalClose}
      className="max-md:h-screen-3.5 md:max-h-screen-48 flex w-96 flex-col overflow-y-auto pt-16 max-md:w-full max-md:self-start max-md:rounded-none md:gap-8"
    >
      <div className="flex flex-1 flex-col gap-4 px-4">
        <Text size="lg" weight="lg">
          {tm('assign_points')}
        </Text>

        <Select.lg value={groupId} onChange={(e) => setGroupId(Number(e.target.value))}>
          {allKlassGroupsUnique.map((k) => (
            <option key={k.id} value={k.id}>
              {k.name}
            </option>
          ))}
        </Select.lg>

        <div className="flex flex-wrap gap-2">
          {studentGroups?.items.map(({ user }) => {
            const selected = studentIds.includes(user.id)
            return (
              <Button
                color={selected ? 'sub' : 'tertiary'}
                // variant={selected ? 'solid' : 'outline'}
                size="sm"
                key={user.id}
                onClick={() => {
                  selected
                    ? setStudentIds((prev) => prev.filter((id) => id !== user.id))
                    : setStudentIds((prev) => [...prev, user.id])
                }}
              >
                {user.name}
              </Button>
            )
          })}
        </div>

        <div className="flex flex-col gap-1">
          <Label.Text children={tm('assignees')} />
          <div className="flex flex-wrap gap-2">
            {students?.items.map((student) => (
              <Button
                key={student.id}
                color="sub"
                variant="solid"
                size="sm"
                onClick={() => setStudentIds((prev) => prev.filter((id) => id !== student.id))}
              >
                {student.name} {getNickName(student.nickName)}
              </Button>
            ))}
          </div>
        </div>
        <Label.col>
          <Label.Text children={'*' + tm('details')} />
          <Select.lg {...register('pointId', { valueAsNumber: true })}>
            <option>{tm('enter_manually')}</option>
            {points?.items.map((point) => (
              <option key={point.id} value={point.id}>
                {point.title} ({numberWithSign(point.value)})
              </option>
            ))}
          </Select.lg>
        </Label.col>
        {!watch('pointId') && (
          <Label.col>
            <Label.Text children={'*' + tm('point_log_title')} />
            <TextInput autoFocus {...register('title', form.length(1, 100))} />
            <Label.Error children={errors.title?.message} />
          </Label.col>
        )}
        {!watch('pointId') && (
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
              <Label.Text children={'*' + tm('point_log_value')} />
              <TextInput type="number" min={-100} max={100} {...register('value', form.minmax(-100, 100))} />
              <Label.Error children={errors.value?.message} />
            </Label.col>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 flex gap-4 bg-white p-4">
        <Button color="sub" variant="outline" children={t('cancel')} onClick={setModalClose} className="flex-1" />
        <Button
          children={tm('assign')}
          onClick={handleSubmit(assign)}
          disabled={!studentIds.length}
          className="filled-gray flex-1"
        />
      </div>
    </SuperModal>
  )
}
