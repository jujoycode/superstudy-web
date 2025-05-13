import { useContext, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useParams } from 'react-router'
import { useSetRecoilState } from 'recoil'

import { useHistory } from '@/hooks/useHistory'
import { Label, Select } from '@/legacy/components/common'
import { Admin } from '@/legacy/components/common/Admin'
import { Button } from '@/legacy/components/common/Button'
import { NumberInput } from '@/legacy/components/common/NumberInput'
import { TextInput } from '@/legacy/components/common/TextInput'
import { Routes } from '@/legacy/constants/routes'
import { useCodeByCategoryName } from '@/legacy/container/category'
import {
  studentManagementCreateStudent,
  studentManagementUpdateStudent,
  useStudentManagementGetStudentInfo,
} from '@/legacy/generated/endpoint'
import { Category, RequestCreateStudentDto, RequestModifyStudentDto } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { form } from '@/legacy/lib/form'
import { getErrorMsg } from '@/legacy/util/status'
import { toastState, warningState } from '@/stores'

import { AdminContext } from '../AdminMainPage'

export function StudentEditPage() {
  const { goBack } = useHistory()
  const { id: idString } = useParams<{ id: string }>()
  const id = Number(idString)
  const { year } = useContext(AdminContext)
  const { t } = useLanguage()

  const setToastMsg = useSetRecoilState(toastState)
  const setToastWarnMsg = useSetRecoilState(warningState)

  const {
    handleSubmit,
    register,
    reset,
    setValue,
    formState: { errors, isValid },
  } = useForm<RequestModifyStudentDto & RequestCreateStudentDto>()

  console.log('errors', errors)

  const { categoryData: studentStates } = useCodeByCategoryName(Category.studentstatus)
  const { data: studentInfo } = useStudentManagementGetStudentInfo(id, { year }, { query: { enabled: !!id } })

  useEffect(() => studentInfo && reset(studentInfo.studentData), [studentInfo])

  async function save(params: any) {
    if (params.expiredReason === '') {
      params.expiredReason = null
    }
    id
      ? await studentManagementUpdateStudent(id, params)
          .then((result) => {
            setToastMsg(`${params.name} 님 수정완료`)
            goBack()
          })
          .catch((result) => {
            setToastMsg(getErrorMsg(result))
          })
      : await studentManagementCreateStudent({ ...params, year })
          .then((result) => {
            setToastMsg(`${params.name} 님 추가완료`)
            goBack()
          })
          .catch((result) => {
            setToastMsg(getErrorMsg(result))
          })
  }

  return (
    <Admin.Section className="max-w-xl">
      <Admin.H2 className="mb-4">
        {t('student')} {id ? t('edit') : t('add')}
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
        <Label.Text children={t('phone_number')} />
        <TextInput placeholder={`${t('phone_number')}`} {...register('phone', form.length(0, 100))} />
        <Label.Error children={errors.phone?.message} />
      </Label.col>
      {!id && (
        <Label.col>
          <Label.Text children={'*' + t('grade')} />
          <NumberInput placeholder={`${t('grade')}`} {...register('grade', form.minmax(1, 20))} />
          <Label.Error children={errors.grade?.message} />
        </Label.col>
      )}
      {!id && (
        <Label.col>
          <Label.Text children={'*' + t('class_section')} />
          <NumberInput placeholder={`${t('class_section')}`} {...register('klass', form.minmax(1, 100))} />
          <Label.Error children={errors.klass?.message} />
        </Label.col>
      )}
      {!id && (
        <Label.col>
          <Label.Text children={'*' + t('attendance_number')} />
          <NumberInput placeholder={`${t('attendance_number')}`} {...register('studentNumber', form.minmax(1, 100))} />
          <Label.Error children={errors.studentNumber?.message} />
        </Label.col>
      )}
      {!!id && studentStates && (
        <Label.col>
          <Label.Text children={t('academic_status')} />
          <Select.lg
            {...register('expiredReason', {
              onChange: (e) => {
                const state = studentStates.find((s) => s.name === e.target.value)
                setValue('expired', state?.etc1 === 'true')
                setValue('expiredReason', e.target.value)
                // setValue('notAttend', state?.etc2 === 'true')

                if (state?.etc1 === 'true') {
                  setToastWarnMsg(`${state?.name} 상태의 학생은 슈퍼스쿨 사용이 중지 됩니다.`)
                } else if (state?.etc2 === 'true') {
                  setToastWarnMsg(`${state?.name} 상태의 학생은 출석부에 표시되지 않습니다.`)
                }
              },
            })}
            className="h-13"
          >
            <option value="">{t('academic_status')}</option>
            {studentStates?.map((state) => (
              <option key={state.id} value={state.name} className={`${state.etc1 === 'true' && 'text-red-500'}`}>
                {t(`Student_Status.${state.name}`)}
              </option>
            ))}
          </Select.lg>
        </Label.col>
      )}
      <Label.col>
        <Label.Text children={t('parent_name')} />
        <TextInput placeholder={`${t('parent_name')}`} {...register('nokName', form.length(0, 100))} />
        <Label.Error children={errors.nokName?.message} />
      </Label.col>
      <Label.col>
        <Label.Text children={t('parent_phone_number')} />
        <TextInput placeholder={`${t('parent_phone_number')}`} {...register('nokPhone', form.length(0, 100))} />
        <Label.Error children={errors.nokPhone?.message} />
      </Label.col>
      <Label.col>
        <Label.Text children={t('member_barcode')} />
        <TextInput placeholder={`${t('member_barcode')}`} {...register('barcode', form.length(0, 100))} />
        <Label.Error children={errors.barcode?.message} />
      </Label.col>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <Button.lg
          as={Link}
          children={t('cancel')}
          to={id ? `../${id}` : Routes.admin.student.index}
          className="outlined-gray"
        />
        <Button.lg children={t('save')} disabled={!isValid} onClick={handleSubmit(save)} className="filled-gray" />
      </div>
    </Admin.Section>
  )
}
