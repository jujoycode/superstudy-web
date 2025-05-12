import { AxiosError } from 'axios'
import { range } from 'lodash'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link, useHistory } from 'react-router-dom'
import { useSetRecoilState } from 'recoil'
import { BackButton, Divider, Label, PhoneNumberField, Select, TopNavbar } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { Checkbox } from '@/legacy/components/common/Checkbox'
import { TextInput } from '@/legacy/components/common/TextInput'
import { Toast } from '@/legacy/components/Toast'
import { useOtp } from '@/legacy/container/otp'
import { useCodeGetPartnerSchoolBySchool, userSignup, useSchoolsFindOne } from '@/legacy/generated/endpoint'
import { RequestSignupDto } from '@/legacy/generated/model'
import { form } from '@/legacy/lib/form'
import { useSearch } from '@/legacy/lib/router'
import { Routes } from '@/legacy/constants/routes'
import { toastState } from 'src/store'
import { Validator } from '@/legacy/util/validator'

export function Signup() {
  const { push } = useHistory()
  const { t } = useTranslation(undefined, { keyPrefix: 'signup_page' })
  const { schoolId } = useSearch({ schoolId: 0 })
  const setToastMsg = useSetRecoilState(toastState)
  const [otpNumStudent, setOtpNumStudent] = useState('')
  const [otpNumParent, setOtpNumParent] = useState('')
  const [privacy, setPrivacy] = useState(false)
  const [policy, setPolicy] = useState(false)

  const {
    sendOtp: sendOtpStudent,
    checkOtp: checkOtpStudent,
    remainSecString: remainSecStringStudent,
    otpCheckResult: otpCheckResultStudent,
  } = useOtp()
  const {
    sendOtp: sendOtpParent,
    checkOtp: checkOtpParent,
    remainSecString: remainSecStringParent,
    otpCheckResult: otpCheckResultParent,
  } = useOtp()

  const {
    handleSubmit,
    register,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RequestSignupDto & { student: { repeatPassword: string }; parent: { repeatPassword: string } }>({
    defaultValues: { grade: 1, klass: 0, studentNumber: 0 },
  })

  const { data: school } = useSchoolsFindOne(schoolId, { query: { enabled: !!schoolId } })
  const { data: codes = [] } = useCodeGetPartnerSchoolBySchool(schoolId, { query: { enabled: !!schoolId } })

  useEffect(() => setValue('schoolId', schoolId), [schoolId])
  useEffect(() => codes[0] && setValue('codeId', codes[0].id), [codes])

  function signup(params: RequestSignupDto) {
    if (!otpCheckResultStudent) {
      params.student.phone = ''
    }
    userSignup(params)
      .then(() => {
        alert(`회원가입이 완료되었습니다. 로그인해주세요.`)
        push(Routes.auth.login)
      })
      .catch(({ response }: AxiosError) => {
        console.log(response?.data)
        setToastMsg((response?.data as any)?.message)
      })
  }

  const signupDisabled =
    !privacy || !policy || (watch('student.phone')?.length > 10 && !otpCheckResultStudent) || !otpCheckResultParent

  return (
    <div className="scroll-box h-screen overflow-y-auto">
      <TopNavbar
        borderless
        title={`${t('title')}`}
        left={
          <div className="h-15">
            <BackButton className="h-15" />
          </div>
        }
      />

      <div className="mx-auto flex w-full max-w-xl flex-col gap-8 p-8">
        <h2 className="text-20">{t('signup_for', { school_name: school?.name })}</h2>

        {school?.selfJoin === 1 && (
          <>
            <section className="flex flex-col gap-4">
              <h3 className="text-18">{t('student_section_title')}</h3>
              <Label.col>
                <Label.Text children={'*' + t('school.label')} />
                <Select.xl {...register('codeId', { valueAsNumber: true })}>
                  {codes.map((code) => (
                    <option key={code.id} value={code.id}>
                      {code.name}
                    </option>
                  ))}
                </Select.xl>
                <div className="flex gap-1">
                  <Select.xl className="flex-1" {...register('grade', { valueAsNumber: true })}>
                    {range(1, 7).map((num) => (
                      <option key={num} value={num}>
                        {num} 학년
                      </option>
                    ))}
                  </Select.xl>
                  <Select.xl className="flex-1" {...register('klass', { valueAsNumber: true })}>
                    {range(21).map((num) => (
                      <option key={num} value={num}>
                        {num === 0 ? '미정' : `${num} 반`}
                      </option>
                    ))}
                  </Select.xl>
                  <Select.xl className="flex-1" {...register('studentNumber', { valueAsNumber: true })}>
                    {range(100).map((num) => (
                      <option key={num} value={num}>
                        {num === 0 ? '미정' : `${num} 번`}
                      </option>
                    ))}
                  </Select.xl>
                </div>
              </Label.col>
              <Label.col>
                <Label.Text children={'*' + t('student_name.label')} />
                <TextInput
                  placeholder={t('student_name.placeholder')}
                  {...register('student.name', form.length(1, 100))}
                />
                <Label.Error children={errors.student?.name?.message} />
              </Label.col>
              <Label.col>
                <Label.Text children={'*' + t('student_email.label')} />
                <TextInput
                  type="email"
                  placeholder={t('student_email.placeholder')}
                  {...register('student.email', {
                    ...form.email(),
                    validate: (value) =>
                      value !== watch('parent.email') || '아래 보호자의 이메일과 다른 이메일을 사용해주세요',
                  })}
                />
                <Label.Error children={errors.student?.email?.message} />
                <Label.Text children="이메일은 로그인시 아이디로 사용됩니다. 학생의 이메일이 없을 시 보호자의 이메일을 작성해주셔도 됩니다. 단, 아래 보호자의 이메일과 다른 이메일을 작성해주세요." />
              </Label.col>
              <Label.col>
                <Label.Text children={'*' + t('password.label')} />
                <TextInput
                  type="password"
                  placeholder={t('password.placeholder')}
                  {...register('student.password', form.password())}
                />
                <Label.Error children={errors.student?.password?.message} />
                <Label.Text
                  className="text-red-600"
                  children="문자, 숫자, 특수문자가 포함된 8자 이상의 비밀번호를 입력하세요. 사용 가능한 특수문자는 ! @ # $ % & * ? 입니다."
                />
              </Label.col>
              <Label.col>
                <Label.Text children={'*' + t('repeat_password.label')} />
                <TextInput
                  type="password"
                  placeholder={t('repeat_password.placeholder')}
                  {...register('student.repeatPassword', form.repeatPassword(watch('student.password') ?? ''))}
                />
                <Label.Error children={errors.student?.repeatPassword?.message} />
              </Label.col>
              <Label.col>
                <Label.Text children={t('student_phone.label')} />
                <PhoneNumberField
                  value={watch('student.phone')}
                  onChange={(e) => setValue('student.phone', e.target.value)}
                />
                <Label.Error children={errors.student?.phone?.message} />
                <div>
                  <div className="flex space-x-2">
                    <TextInput
                      maxLength={6}
                      placeholder="인증번호를 입력해주세요."
                      value={otpNumStudent}
                      onChange={(e) => setOtpNumStudent(e.target.value)}
                      className="mb-2"
                    />
                    {!!remainSecStringStudent ? (
                      <Button.lg
                        children="인증번호 확인"
                        disabled={otpNumStudent.length !== 6}
                        onClick={() => checkOtpStudent(watch('student.phone'), otpNumStudent)}
                        className="filled-primary"
                      />
                    ) : (
                      <Button.lg
                        children="인증번호 받기"
                        disabled={!Validator.phoneNumberRule(watch('student.phone')) || otpCheckResultStudent}
                        onClick={() => sendOtpStudent(watch('student.phone'), 'sms')}
                        className="filled-primary"
                      />
                    )}
                  </div>
                  {!otpCheckResultStudent && !!remainSecStringStudent && (
                    <div className="text-sm text-red-600">
                      * 3분안에 인증번호를 입력하세요. 남은시간 - {remainSecStringStudent}{' '}
                    </div>
                  )}
                  {otpCheckResultStudent && <div className="text-sm text-red-600">인증번호 확인 완료</div>}
                </div>
              </Label.col>
            </section>

            <Divider />

            <section className="flex flex-col gap-4">
              <h3 className="text-18">{t('parent_section_title')}</h3>
              <Label.col>
                <Label.Text children={'*' + t('parent_name.label')} />
                <TextInput
                  placeholder={t('parent_name.placeholder')}
                  {...register('parent.name', form.length(1, 100))}
                />
                <Label.Error children={errors.parent?.name?.message} />
              </Label.col>
              <Label.col>
                <Label.Text children={'*' + t('parent_email.label')} />
                <TextInput
                  type="email"
                  placeholder={t('parent_email.placeholder')}
                  {...register('parent.email', form.email())}
                />
                <Label.Error children={errors.parent?.email?.message} />
              </Label.col>
              <Label.col>
                <Label.Text children={'*' + t('password.label')} />
                <TextInput
                  type="password"
                  placeholder={t('password.placeholder')}
                  {...register('parent.password', form.password())}
                />
                <Label.Error children={errors.parent?.password?.message} />
                <Label.Text
                  className="text-red-600"
                  children="문자, 숫자, 특수문자가 포함된 8자 이상의 비밀번호를 입력하세요. 사용 가능한 특수문자는 ! @ # $ % & * ? 입니다."
                />
              </Label.col>
              <Label.col>
                <Label.Text children={'*' + t('repeat_password.label')} />
                <TextInput
                  type="password"
                  placeholder={t('repeat_password.placeholder')}
                  {...register('parent.repeatPassword', form.repeatPassword(watch('parent.password') ?? ''))}
                />
                <Label.Error children={errors.parent?.repeatPassword?.message} />
              </Label.col>
              <Label.col>
                <Label.Text children={'*' + t('parent_phone.label')} />
                <PhoneNumberField
                  value={watch('parent.phone')}
                  onChange={(e) => setValue('parent.phone', e.target.value)}
                />
                <Label.Error children={errors.parent?.phone?.message} />
                <div>
                  <div className="flex space-x-2">
                    <TextInput
                      maxLength={6}
                      placeholder="인증번호를 입력해주세요."
                      value={otpNumParent}
                      onChange={(e) => setOtpNumParent(e.target.value)}
                      className="mb-2"
                    />
                    {!!remainSecStringParent ? (
                      <Button.lg
                        children="인증번호 확인"
                        disabled={otpNumParent.length !== 6}
                        onClick={() => checkOtpParent(watch('parent.phone'), otpNumParent)}
                        className="filled-primary"
                      />
                    ) : (
                      <Button.lg
                        children="인증번호 받기"
                        disabled={!Validator.phoneNumberRule(watch('parent.phone')) || otpCheckResultParent}
                        onClick={() => sendOtpParent(watch('parent.phone'), 'sms')}
                        className="filled-primary"
                      />
                    )}
                  </div>
                  {!otpCheckResultParent && !!remainSecStringParent && (
                    <div className="text-sm text-red-600">
                      * 3분안에 인증번호를 입력하세요. 남은시간 - {remainSecStringParent}{' '}
                    </div>
                  )}
                  {otpCheckResultParent && <div className="text-sm text-red-600">인증번호 확인 완료</div>}
                </div>
              </Label.col>
            </section>

            <section>
              <div className="space-y-2">
                <Label.row>
                  <Checkbox
                    checked={privacy && policy}
                    onChange={() => {
                      const allChecked = privacy && policy
                      setPrivacy(!allChecked)
                      setPolicy(!allChecked)
                    }}
                  />
                  <p className="font-bold">전체 동의</p>
                </Label.row>
                <div className="flex items-center space-x-2">
                  <Checkbox checked={policy} onChange={() => setPolicy(!policy)} />
                  <Link to={`/terms-of-use`} target="_blank">
                    <span className="cursor-pointer text-base font-semibold">슈퍼스쿨이용약관 (필수)</span>
                  </Link>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox checked={privacy} onChange={() => setPrivacy(!privacy)} />
                  <Link to={`/privacy-policy/${schoolId}`} target="_blank">
                    <span className="cursor-pointer text-base font-semibold">개인정보처리방침 (필수)</span>
                  </Link>
                </div>
              </div>
            </section>

            <Button.xl
              children={t('signup')}
              disabled={signupDisabled}
              onClick={handleSubmit(signup)}
              className="filled-primary"
            />
          </>
        )}
      </div>

      <Toast />
    </div>
  )
}
