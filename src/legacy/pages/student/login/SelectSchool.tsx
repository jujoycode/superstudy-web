import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useHistory } from '@/hooks/useHistory'
import { BackButton, Label, Select, TopNavbar } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { TextInput } from '@/legacy/components/common/TextInput'
import { useSchoolsFindAll } from '@/legacy/generated/endpoint'
import { buildSearch } from '@/legacy/lib/router'
import { Routes } from '@/legacy/constants/routes'

interface SelectSchoolForm {
  schoolCode: string
}

export function SelectSchool() {
  const { push } = useHistory()
  const { t } = useTranslation(undefined, { keyPrefix: 'select_school_page' })
  const [schoolId, setSchoolId] = useState<number>()

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<SelectSchoolForm>()

  const { data: allSchools } = useSchoolsFindAll()

  const schools = useMemo(() => allSchools?.filter((school) => school.selfJoin !== 0) ?? [], [allSchools])

  useEffect(() => schools[0] && setSchoolId(schools[0].id), [schools])

  function signup() {
    if (!schoolId) return
    push(Routes.auth.signup, { search: buildSearch({ schoolId }) })
  }

  return (
    <>
      <TopNavbar
        borderless
        title={t('title')}
        left={
          <div className="h-15">
            <BackButton className="h-15" />
          </div>
        }
      />

      <div className="mx-auto flex w-full max-w-xl flex-col gap-8 p-8">
        <h2 className="text-20">{t('select_school')}</h2>

        <section className="flex flex-col gap-4">
          <Label.col>
            <Label.Text children={'*' + t('school.label')} />
            <Select.xl
              placeholder={t('school.placeholder')}
              value={schoolId}
              onChange={(e) => setSchoolId(Number(e.target.value))}
            >
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </Select.xl>
          </Label.col>
          <Label.col>
            <Label.Text children={'*' + t('school_code.label')} />
            <TextInput
              placeholder={t('school_code.placeholder')}
              {...register('schoolCode', { validate: (value) => value === '051001' || '유효한 값이 아닙니다' })} // TODO: 학교가 추가될 경우 수정 필요
            />
            <Label.Error children={errors.schoolCode?.message} />
            <Label.Text
              children="늘봄전용학교의 학생과 보호자의 회원가입 페이지입니다. 늘봄전용학교가 아닌 경우 소속학교에 문의하시기 바랍니다. 늘봄전용학교 코드번호를 모를 경우 소속학교에 문의하시기 바랍니다." // TODO: 학교가 추가될 경우 수정 필요
            />
          </Label.col>
        </section>

        {schoolId && <Button.xl children={t('signup')} onClick={handleSubmit(signup)} className="filled-primary" />}
      </div>
    </>
  )
}
