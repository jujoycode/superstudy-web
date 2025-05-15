import { Checkbox } from '@mui/material'
import { type ChangeEvent, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import BlockchainSetting from '@/legacy/components/blockchain/BlockchainSetting'
import { Label, Radio, Select } from '@/legacy/components/common'
import { Admin } from '@/legacy/components/common/Admin'
import { Button } from '@/legacy/components/common/Button'
import { TextInput } from '@/legacy/components/common/TextInput'
import {
  fieldtripsReCalculateFieldtripDaysWithUser,
  schoolManagementLoadMealData,
  schoolManagementLoadYearHolidayData,
  schoolManagementModifySchoolInfo,
  useSchoolManagementGetSchoolInfo,
} from '@/legacy/generated/endpoint'
import { OutingUse, type RequestUpdateSchoolInfoDto, ScoreUse, UploadFileTypeEnum } from '@/legacy/generated/model'
import { useFileUpload } from '@/legacy/hooks/useFileUpload'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { useSignedUrl } from '@/legacy/lib/query'
import { useNotificationStore } from '@/stores/notification'

export interface PrivacyManager {
  name: string
  position: string
  contact: string
}

export function SchoolPage() {
  const [editPrivacyManager, setEditPrivacyManager] = useState(false)
  const [editFieldtripDays, setEditFieldtripDays] = useState(false)
  const [editLastPeriod, setEditLastPeriod] = useState(false)

  const { handleSubmit, register, reset, watch, setValue } = useForm<
    RequestUpdateSchoolInfoDto & { privacyManager: PrivacyManager }
  >()

  const fieldtripType = watch('fieldtripType', []) || []
  const enhancedSecurity = watch('enhancedSecurity', false)
  const useBlockChainState = watch('useBlockChain', false)
  const hasSaturdayClass = watch('hasSaturdayClass', false)
  const isOutingActive = watch('isOutingActive', OutingUse.NONE)
  const isScoreActive = watch('isScoreActive', ScoreUse.NONE)

  const { handleUploadFile } = useFileUpload()

  const { data: school, isLoading, refetch } = useSchoolManagementGetSchoolInfo()
  const { data: mark } = useSignedUrl(school?.mark)
  const { data: stamp } = useSignedUrl(school?.stamp)

  const [name, position, contact] = (school?.privacyPolicyManager || '||').split('|')
  const privacyManager = { name, position, contact }

  const { setToast: setToastMsg } = useNotificationStore()
  const { t } = useLanguage()

  useEffect(() => school && reset({ ...school, privacyManager }), [school, editPrivacyManager, editFieldtripDays])

  const handleCheckboxChange = (value: string, isChecked: boolean) => {
    if (isChecked) {
      setValue('fieldtripType', [...fieldtripType, value])
    } else {
      setValue(
        'fieldtripType',
        fieldtripType.filter((item) => item !== value),
      )
    }
  }

  async function loadHoliday() {
    const t1 = t('load_holiday_information')
    if (!school) return
    if (!confirm(t1)) return
    const date = new Date()
    //await schoolManagementLoadHolidayData({ year: date.getFullYear(), month: date.getMonth() + 1 });
    await schoolManagementLoadYearHolidayData({ year: date.getFullYear() })
    refetch()
    setToastMsg(date.getFullYear() + t('year_holiday_information_loaded'))
  }

  async function loadMeal() {
    const t1 = t('load_meal_information_confirm')
    const t2 = t('meal_information_loaded')
    if (!school) return
    if (!confirm(t1)) return
    await schoolManagementLoadMealData()
    refetch()
    setToastMsg(t2)
  }

  async function uploadMark(e: ChangeEvent<HTMLInputElement>) {
    const [mark] = await handleUploadFile(UploadFileTypeEnum.schoolmark, [...(e.target.files ?? [])])
    await schoolManagementModifySchoolInfo({ mark })
  }

  async function uploadStamp(e: ChangeEvent<HTMLInputElement>) {
    const [stamp] = await handleUploadFile(UploadFileTypeEnum.schoolstamp, [...(e.target.files ?? [])])
    await schoolManagementModifySchoolInfo({ stamp })
  }

  const updatePrivacyManager = handleSubmit(async ({ privacyManager }) => {
    setEditPrivacyManager(false)
    const privacyPolicyManager = `${privacyManager.name}|${privacyManager.position}|${privacyManager.contact}`
    await schoolManagementModifySchoolInfo({ privacyPolicyManager })
  })

  const updateFieldtripDays = handleSubmit(
    async ({ fieldtripDays, fieldtripDueDays, fieldtripResultDueDays, studentSafeText, fieldtripType }) => {
      setEditFieldtripDays(false)
      await schoolManagementModifySchoolInfo({
        fieldtripDays,
        fieldtripDueDays,
        fieldtripResultDueDays,
        studentSafeText,
        fieldtripType,
      })
    },
  )

  const updateLastPeriod = handleSubmit(
    async ({ lastPeriod, hasSaturdayClass, smsHeader, isOutingActive, isScoreActive }) => {
      setEditLastPeriod(false)
      await schoolManagementModifySchoolInfo({
        lastPeriod,
        hasSaturdayClass,
        smsHeader,
        isOutingActive,
        isScoreActive,
      })
    },
  )

  const updateEnhancedSecurity = handleSubmit(async ({ enhancedSecurity }) => {
    await schoolManagementModifySchoolInfo({
      enhancedSecurity,
    })
  })

  const updateUseBlockChain = handleSubmit(async ({ useBlockChain }) => {
    await schoolManagementModifySchoolInfo({
      useBlockChain,
    })
  })

  async function recalculateFieldtripDays() {
    const t1 = t('recalculate_usage_days')
    const t2 = t('recalculate_experiential_learning_days_all_students')
    if (!school) return
    if (!confirm(t1)) return
    await fieldtripsReCalculateFieldtripDaysWithUser(school.id)
    refetch()
    setToastMsg(t2)
  }

  if (isLoading) return <>Loading...</>
  if (!school) return <>Not Found</>
  return (
    <>
      <Admin.Section>
        <div className="flex items-center justify-between">
          <Admin.H2>{t('school_information')}</Admin.H2>
          <div className="flex gap-2">
            <Button.sm children={t('load_holidays')} onClick={loadHoliday} className="outlined-gray" />
            <Button.sm children={t('load_meal_information')} onClick={loadMeal} className="outlined-gray" />
          </div>
        </div>
        <Admin.Card className="grid grid-cols-3 divide-x">
          <div className="grid divide-y">
            <Admin.Cell>
              <Label.Text children={t('school_name')} />
              <p className="mt-2">{school.name}</p>
            </Admin.Cell>
            <Admin.Cell>
              <Label.Text children={t('edu_office_code_school_code')} />
              <p className="mt-2">
                {school.ooeCode} / {school.schoolCode}
              </p>
            </Admin.Cell>
            <Admin.Cell>
              <div className="flex items-center justify-between">
                <Label.Text children={'시간표 마지막 교시'} />
                <div className="flex gap-2">
                  {editLastPeriod ? (
                    <Button.sm children={t('save')} onClick={updateLastPeriod} className="filled-gray-dark" />
                  ) : (
                    <Button.sm children={t('edit')} onClick={() => setEditLastPeriod(true)} className="outlined-gray" />
                  )}
                </div>
              </div>
              {editLastPeriod ? (
                <TextInput {...register('lastPeriod', { valueAsNumber: true })} className="w-16" />
              ) : (
                <p className="">{school.lastPeriod} 교시</p>
              )}
              <div className="mt-2 flex items-center justify-between">
                <Label.Text children={'토요일 수업'} />
              </div>
              {editLastPeriod ? (
                <div className="flex h-9 items-center">
                  <Radio
                    checked={hasSaturdayClass}
                    onChange={(e) => {
                      setValue('hasSaturdayClass', e.target.checked)
                    }}
                    className="filled-red-light mr-1 rounded-full"
                  />
                  <p className="mr-2">있음</p>
                  <Radio
                    checked={!hasSaturdayClass}
                    onChange={(e) => {
                      setValue('hasSaturdayClass', !e.target.checked)
                    }}
                    className="filled-red-light mr-1 rounded-full"
                  />
                  <p className="">없음</p>
                </div>
              ) : (
                <p className="mt-1">{hasSaturdayClass ? '있음' : '없음'}</p>
              )}
              <div className="mt-2 flex items-center justify-between">
                <Label.Text children={'문자메시지 머리말'} />
              </div>
              {editLastPeriod ? (
                <TextInput {...register('smsHeader')} className="w-full" />
              ) : (
                <p className="">
                  [{school.smsHeader === '' ? school.name.replace('등학교', '').replace('학교', '') : school.smsHeader}]
                </p>
              )}

              <div className="mt-2 flex items-center justify-between">
                <Label.Text children={'확인증 사용'} />
              </div>
              {editLastPeriod ? (
                <div className="flex h-9 items-center">
                  <Select
                    value={watch('isOutingActive')}
                    onChange={(e) => {
                      setValue('isOutingActive', e.target.value as OutingUse)
                    }}
                  >
                    <option value={OutingUse.NONE}>미사용</option>
                    <option value={OutingUse.USE_STUDENT_ONLY}>사용(보호자승인 미사용)</option>
                    <option value={OutingUse.USE_PARENT_APPROVE}>사용(보호자승인 사용)</option>
                  </Select>
                </div>
              ) : (
                <p className="mt-1">
                  {isOutingActive === OutingUse.USE_PARENT_APPROVE
                    ? '사용(보호자승인 사용)'
                    : isOutingActive === OutingUse.USE_STUDENT_ONLY
                      ? '사용(보호자승인 미사용)'
                      : '미사용'}
                </p>
              )}

              {school.schoolType === 'HS' && (
                <div className="">
                  <div className="mt-2 flex items-center justify-between">
                    <Label.Text children={'성적관리 사용'} />
                  </div>
                  {editLastPeriod ? (
                    <div className="flex h-9 items-center">
                      <Select
                        value={watch('isScoreActive')}
                        onChange={(e) => {
                          setValue('isScoreActive', e.target.value as ScoreUse)
                        }}
                      >
                        <option value={ScoreUse.NONE}>미사용</option>
                        <option value={ScoreUse.USE_PRIVATE}>사용(비공개)</option>
                        <option value={ScoreUse.USE_PUBLIC}>사용(학생/보호자 공개)</option>
                      </Select>
                    </div>
                  ) : (
                    <p className="mt-1">
                      {isScoreActive === ScoreUse.USE_PRIVATE
                        ? '사용(비공개)'
                        : isScoreActive === ScoreUse.USE_PUBLIC
                          ? '사용(학생/보호자 공개)'
                          : '미사용'}
                    </p>
                  )}
                </div>
              )}
            </Admin.Cell>
          </div>

          <Admin.Cell>
            <Label.Text children={t('school_mark')} />
            <div className="mt-2 flex h-40 items-center justify-center">
              {school.mark ? (
                <img src={mark} className="aspect-square h-full object-cover" />
              ) : (
                <p className="text-gray-500">{t('no_image_registered')}</p>
              )}
            </div>
            {school.mark ? (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button
                  children={t('delete')}
                  onClick={() =>
                    confirm('학교 마크 이미지를 삭제하시겠습니까?') && schoolManagementModifySchoolInfo({ mark: '' })
                  }
                  className="filled-red-light"
                />
                <Button as="label" className="outlined-gray cursor-pointer">
                  <p>{t('edit_image')}</p>
                  <input type="file" accept=".png, .jpeg, .jpg" onChange={uploadMark} className="sr-only" />
                </Button>
              </div>
            ) : (
              <Button as="label" className="filled-gray-light mt-4 cursor-pointer">
                <p>{t('image_upload')}</p>
                <input type="file" accept=".png, .jpeg, .jpg" onChange={uploadMark} className="sr-only" />
              </Button>
            )}
          </Admin.Cell>
          <Admin.Cell>
            <Label.Text children={t('school_seal')} />
            <div className="mt-2 flex h-40 items-center justify-center">
              {school.stamp ? (
                <img src={stamp} className="aspect-square h-full object-cover" />
              ) : (
                <p className="text-gray-500">{t('no_image_registered')}</p>
              )}
            </div>
            {school.stamp ? (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button
                  children={t('delete')}
                  onClick={() =>
                    confirm('학교 직인 이미지를 삭제하시겠습니까?') && schoolManagementModifySchoolInfo({ stamp: '' })
                  }
                  className="filled-red-light"
                />
                <Button as="label" className="outlined-gray cursor-pointer">
                  <p>{t('edit_image')}</p>
                  <input type="file" accept=".png, .jpeg, .jpg" onChange={uploadStamp} className="sr-only" />
                </Button>
              </div>
            ) : (
              <Button as="label" className="filled-gray-light mt-4 cursor-pointer">
                <p>{t('image_upload')}</p>
                <input type="file" accept=".png, .jpeg, .jpg" onChange={uploadStamp} className="sr-only" />
              </Button>
            )}
          </Admin.Cell>
        </Admin.Card>
      </Admin.Section>

      <Admin.Section>
        <div className="flex items-center justify-between">
          <Admin.H2>{t('personal_info_manager_info')}</Admin.H2>
          <div className="flex gap-2">
            {editPrivacyManager ? (
              <>
                <Button.sm
                  children={t('cancel')}
                  onClick={() => setEditPrivacyManager(false)}
                  className="outlined-gray"
                />
                <Button.sm children={t('save')} onClick={updatePrivacyManager} className="filled-gray-dark" />
              </>
            ) : (
              <Button.sm
                children={school.privacyPolicyManager ? t('edit') : t('register')}
                onClick={() => setEditPrivacyManager(true)}
                className={school.privacyPolicyManager ? 'outlined-gray' : 'filled-gray-dark'}
              />
            )}
          </div>
        </div>
        {school.privacyPolicyManager || editPrivacyManager ? (
          <Admin.Card className="grid grid-cols-3 divide-x">
            <Admin.Cell>
              <Label.col>
                <Label.Text children={t('name')} />
                {editPrivacyManager ? (
                  <TextInput {...register('privacyManager.name', { minLength: 1 })} />
                ) : (
                  <p>{privacyManager.name}</p>
                )}
              </Label.col>
            </Admin.Cell>
            <Admin.Cell>
              <Label.col>
                <Label.Text children={t('job_position')} />
                {editPrivacyManager ? (
                  <TextInput {...register('privacyManager.position', { minLength: 1 })} />
                ) : (
                  <p>{privacyManager.position}</p>
                )}
              </Label.col>
            </Admin.Cell>
            <Admin.Cell>
              <Label.col>
                <Label.Text children={t('contact_information')} />
                {editPrivacyManager ? (
                  <TextInput {...register('privacyManager.contact', { minLength: 1 })} />
                ) : (
                  <p>{privacyManager.contact}</p>
                )}
              </Label.col>
            </Admin.Cell>
          </Admin.Card>
        ) : (
          <Admin.Card className="flex items-center justify-center py-10">
            <p>{t('no_information_registered')}</p>
          </Admin.Card>
        )}
      </Admin.Section>

      {school?.id === 2 && (
        <Admin.Section>
          <div className="flex items-center justify-between">
            <Admin.H2>{t('security_settings')}</Admin.H2>
          </div>
          <Admin.Card className="grid grid-cols-3 divide-x">
            <div className="col-span-2 grid">
              <Admin.Cell>
                <Label.row className="h-9 rounded-md px-1">
                  <Radio
                    checked={enhancedSecurity}
                    onChange={(e) => {
                      if (confirm('향상된 보안 모드를 사용하시겠습니까?')) {
                        setValue('enhancedSecurity', e.target.checked)
                        updateEnhancedSecurity()
                      }
                    }}
                    className="filled-red-light mr-1 rounded-full"
                  />
                  <p className="">{t('enhanced_security_mode')}</p>
                </Label.row>
                <div className="ml-10">
                  <Label.Text children={t('enhanced_security_mode_description')} />
                  <Label.Text children={t('login_with_id_pw_and_code')} />
                  <Label.Text children={t('masked_personal_information')} />
                </div>
              </Admin.Cell>
              <Admin.Cell>
                <Label.row className="h-9 rounded-md px-1">
                  <Radio
                    checked={!enhancedSecurity}
                    onChange={(e) => {
                      if (confirm('편의성 우선 모드를 사용하시겠습니까?')) {
                        setValue('enhancedSecurity', !e.target.checked)
                        updateEnhancedSecurity()
                      }
                    }}
                    className="filled-red-light mr-1 rounded-full"
                  />
                  <p>{t('convenience_mode')}</p>
                </Label.row>
                <div className="ml-10">
                  <Label.Text children={t('login_with_id_pw')} />
                </div>
              </Admin.Cell>
            </div>
            <div className="col-span-1 grid">
              <BlockchainSetting
                useBlockChainState={useBlockChainState}
                setValue={setValue}
                updateUseBlockChain={updateUseBlockChain}
              />
            </div>
          </Admin.Card>
        </Admin.Section>
      )}

      <Admin.Section>
        <div className="flex items-center justify-between">
          <Admin.H2>{t('experiential_learning_activity')}</Admin.H2>
          <div className="flex gap-2">
            {editFieldtripDays ? (
              <>
                <Button.sm children={t('edit')} onClick={() => setEditFieldtripDays(false)} className="outlined-gray" />
                <Button.sm children={t('save')} onClick={updateFieldtripDays} className="filled-gray-dark" />
              </>
            ) : (
              <>
                <Button.sm
                  children={t('recalculate_days_per_student')}
                  onClick={recalculateFieldtripDays}
                  className="outlined-gray"
                />
                <Button.sm children={t('edit')} onClick={() => setEditFieldtripDays(true)} className="outlined-gray" />
              </>
            )}
          </div>
        </div>
        <Admin.Card>
          <div className="grid grid-cols-2 divide-x">
            <Admin.Cell className="flex-row items-center justify-between">
              <p>{t('experiential_learning_types')}</p>
              {editFieldtripDays ? (
                <div>
                  <Checkbox
                    checked={fieldtripType?.includes('suburb')}
                    onChange={(e) => handleCheckboxChange('suburb', e.target.checked)}
                  />
                  <span>{t('off_campus_experiential_learning')}</span>

                  <Checkbox
                    checked={fieldtripType?.includes('home')}
                    onChange={(e) => handleCheckboxChange('home', e.target.checked)}
                  />
                  <span>{t('home_study')}</span>
                </div>
              ) : (
                <p className="flex items-center font-medium">
                  {fieldtripType?.includes('suburb') && t('off_campus_experiential_learning') + ' | '}
                  {fieldtripType?.includes('home') && t('home_study') + ' | '}
                </p>
              )}
            </Admin.Cell>
          </div>
          <div className="grid grid-cols-3 divide-x">
            <Admin.Cell className="flex-row items-center justify-between">
              <p>{t('annual_used_days')}</p>
              {editFieldtripDays ? (
                <TextInput {...register('fieldtripDays', { valueAsNumber: true })} className="w-16" />
              ) : (
                <p className="font-medium">{school.fieldtripDays}</p>
              )}
            </Admin.Cell>
            <Admin.Cell className="flex-row items-center justify-between">
              <p>{t('submission_deadline')}</p>
              {editFieldtripDays ? (
                <TextInput {...register('fieldtripDueDays', { valueAsNumber: true })} className="w-16" />
              ) : (
                <p className="font-medium">{school.fieldtripDueDays}</p>
              )}
            </Admin.Cell>
            <Admin.Cell className="flex-row items-center justify-between">
              <p>{t('report_submission_deadline')}</p>
              {editFieldtripDays ? (
                <TextInput {...register('fieldtripResultDueDays', { valueAsNumber: true })} className="w-16" />
              ) : (
                <p className="font-medium">{school.fieldtripResultDueDays}</p>
              )}
            </Admin.Cell>
          </div>
          <div className="grid grid-cols-1 divide-x">
            <Admin.Cell>
              <Label.col>
                <Label.Text children={t('student_safety_text')} />
                {editFieldtripDays ? <TextInput {...register('studentSafeText')} /> : <p>{school.studentSafeText}</p>}
              </Label.col>
            </Admin.Cell>
          </div>
        </Admin.Card>
      </Admin.Section>
    </>
  )
}
