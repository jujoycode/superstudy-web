import { useContext, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useParams } from 'react-router-dom'
import { useHistory } from '@/hooks/useHistory'
import { useNotificationStore } from '@/stores/notification'
import { useUserStore } from '@/stores/user'
import { Label, Select } from '@/legacy/components/common'
import { Admin } from '@/legacy/components/common/Admin'
import { Button } from '@/legacy/components/common/Button'
import { Checkbox } from '@/legacy/components/common/Checkbox'
import { NumberInput } from '@/legacy/components/common/NumberInput'
import { TextInput } from '@/legacy/components/common/TextInput'
import { Routes } from '@/legacy/constants/routes'
import { teacherRoles } from '@/legacy/constants/teacher-roles'
import { useCodeByCategoryName } from '@/legacy/container/category'
import {
  teacherManagementCreateTeacher,
  teacherManagementUpdateTeacher,
  useTeacherManagementGetTeacherInfo,
} from '@/legacy/generated/endpoint'
import { Category, RequestCreateTeacherDto, RequestModifyTeacherDto, Role, ScoreUse } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { form } from '@/legacy/lib/form'
import { AdminContext } from '@/legacy/pages/admin/AdminMainPage'
import { getErrorMsg } from '@/legacy/util/status'

export function TeacherEditPage() {
  const { setToast: setToastMsg } = useNotificationStore()
  const { me } = useUserStore()
  const { t } = useLanguage()
  const { goBack } = useHistory()
  const { id: idString } = useParams<{ id: string }>()
  const id = Number(idString)
  const { year } = useContext(AdminContext)

  const {
    formState: { errors, isValid },
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = useForm<RequestModifyTeacherDto & RequestCreateTeacherDto>({
    defaultValues: {
      canEditNotice: true,
      canEditNewsletter: true,
      canEditTimetable: true,
      canEditCanteen: true,
    },
  })

  const { categoryData: teacherStates } = useCodeByCategoryName(Category.teacherstatus)
  const { data: teacherInfo } = useTeacherManagementGetTeacherInfo(id, { year }, { query: { enabled: !!id } })

  useEffect(() => teacherInfo && reset(teacherInfo.teacherData), [teacherInfo])

  async function save(params: any) {
    if (watch('role') !== Role.HEAD && watch('role') !== Role.PRE_HEAD) {
      params.headNumber = 0
    }
    id
      ? await teacherManagementUpdateTeacher(id, params)
          .then(() => {
            setToastMsg(`${params.name} 님 수정완료`)
            goBack()
          })
          .catch((error) => {
            setToastMsg(getErrorMsg(error))
          })
      : await teacherManagementCreateTeacher(params)
          .then(() => {
            setToastMsg(`${params.name} 님 추가완료`)
            goBack()
          })
          .catch((error) => {
            setToastMsg(getErrorMsg(error))
          })
  }

  return (
    <div>
      <div className="flex">
        <Admin.Section className="w-1/2 max-w-xl">
          <Admin.H2 className="mb-4">
            {t('teacher')} {id ? t('edit') : t('add')}
          </Admin.H2>

          <Label.col>
            <Label.Text children={'*' + t('name')} />
            <TextInput placeholder={`${t('name')}`} {...register('name', form.length(1, 100))} />
            <Label.Error children={errors.name?.message} />
          </Label.col>
          <Label.col>
            <Label.Text children={t('nickname')} />
            <TextInput placeholder={`${t('nickname')}`} {...register('nickName', { required: false })} />
            <Label.Error children={errors.name?.message} />
          </Label.col>
          <Label.col>
            <Label.Text children={'*' + t('email')} />
            <TextInput placeholder={`${t('email')}`} {...register('email', form.length(1, 100))} />
            <Label.Error children={errors.email?.message} />
          </Label.col>
          <Label.col>
            <Label.Text children={'*' + t('role')} />
            <Select.lg {...register('role', { required: true })}>
              {teacherRoles.map((role) => (
                <option key={role} value={role}>
                  {t(`Role.${role}`)}
                </option>
              ))}
            </Select.lg>
          </Label.col>
          {(watch('role') === Role.HEAD || watch('role') === Role.PRE_HEAD) && (
            <Label.col>
              <Label.Text children={'*' + t('assigned_grade')} />
              <NumberInput
                placeholder="1~6"
                {...register(
                  'headNumber',
                  form.minmax(watch('role') === Role.HEAD || watch('role') === Role.PRE_HEAD ? 1 : 0, 12),
                )}
              />
              <Label.Error children={errors.headNumber?.message} />
            </Label.col>
          )}
          <Label.col>
            <Label.Text children={t('phone_number')} />
            <TextInput placeholder={`${t('phone_number')}`} {...register('phone', form.length(0, 100))} />
            <Label.Error children={errors.phone?.message} />
          </Label.col>
          <Label.col>
            <Label.Text children={t('department')} />
            <TextInput placeholder={`${t('department')}`} {...register('department', form.length(0, 100))} />
            <Label.Error children={errors.department?.message} />
          </Label.col>
          <Label.col>
            <Label.Text children={t('approval_position')} />
            <TextInput placeholder={`${t('approval_position')}`} {...register('position', form.length(0, 100))} />
            <Label.Error children={errors.position?.message} />
          </Label.col>
          {!!id && teacherStates && (
            <Label.col>
              <Label.Text children={t('status')} />
              <Select.lg
                {...register('expiredReason', {
                  onChange: (e) => {
                    const state = teacherStates.find((s) => s.name === e.target.value)
                    setValue('expired', state?.etc1 === 'true')
                    setValue('expiredReason', e.target.value)
                  },
                })}
                className="h-13"
              >
                <option value="">{t('status')}</option>
                {teacherStates?.map((state) => (
                  <option key={state.id} value={state.name} className={`${state.etc1 === 'true' && 'text-red-500'}`}>
                    {state.name}
                  </option>
                ))}
              </Select.lg>
            </Label.col>
          )}
        </Admin.Section>
        <Admin.Section className="w-1/2 max-w-xl">
          <div className="mt-13 flex flex-col gap-1">
            <Label.Text children={t('permission')} />
            <Label.row className="gap-3">
              <Checkbox {...register('canEditNotice')} />
              <span>{t('notice_management')}</span>
            </Label.row>
            <Label.row className="gap-3">
              <Checkbox {...register('canEditNewsletter')} />
              <span>{t('newsletter_management')}</span>
            </Label.row>
            <Label.row className="gap-3">
              <Checkbox {...register('canEditTimetable')} />
              <span>{t('schedule_management')}</span>
            </Label.row>
            <Label.row className="gap-3">
              <Checkbox {...register('canEditCanteen')} />
              <span>{t('meal_menu_management')}</span>
            </Label.row>
          </div>
          {me?.role === Role.ADMIN && (
            <div className="flex flex-col gap-1">
              <Label.Text children="관리자 권한" />
              <Label.row className="gap-3">
                <Checkbox {...register('adminTeacher')} />
                <span>선생님 관리</span>
              </Label.row>
              <Label.row className="gap-3">
                <Checkbox {...register('adminStudent')} />
                <span>학생 관리</span>
              </Label.row>
              <Label.row className="gap-3">
                <Checkbox {...register('adminParent')} />
                <span>보호자 관리</span>
              </Label.row>
              <Label.row className="gap-3">
                <Checkbox {...register('adminClass')} />
                <span>학급 관리</span>
              </Label.row>
              <Label.row className="gap-3">
                <Checkbox {...register('adminGroup')} />
                <span>그룹 관리</span>
              </Label.row>
              <Label.row className="gap-3">
                <Checkbox {...register('adminApprovalLine')} />
                <span>결재라인 관리</span>
              </Label.row>
              <Label.row className="gap-3">
                <Checkbox {...register('adminTimetable')} />
                <span>시간표 관리</span>
              </Label.row>
              <Label.row className="gap-3">
                <Checkbox {...register('adminSms')} />
                <span>문자비용 관리</span>
              </Label.row>
              {me.school.isScoreActive !== ScoreUse.NONE && (
                <Label.row className="gap-3">
                  <Checkbox {...register('adminScore')} />
                  <span>성적 관리</span>
                </Label.row>
              )}
              {(me?.schoolId === 2 || me?.schoolId === 106) && (
                <Label.row className="gap-3">
                  <Checkbox {...register('adminIb')} />
                  <span>IB 관리</span>
                </Label.row>
              )}
            </div>
          )}
        </Admin.Section>
      </div>
      <Admin.Section className="w-1/2 max-w-xl">
        <div className="mt-4 grid grid-cols-2 gap-4">
          <Button.lg
            as={Link}
            children="취소"
            to={id ? `../${id}` : Routes.admin.teacher.index}
            className="outlined-gray"
          />
          <Button.lg children="저장" disabled={!isValid} onClick={handleSubmit(save)} className="filled-gray" />
        </div>
      </Admin.Section>
    </div>
  )
}
