import clsx from 'clsx'
import { useEffect, useMemo, useState } from 'react'
import { useSetRecoilState } from 'recoil'
import { Constants } from '@/legacy/constants'
import { useCodeByCategoryName } from '@/legacy/container/category'
import { useStudentPropertyUpdate } from '@/legacy/container/student-property-update'
import { useTeacherStudentUpdate } from '@/legacy/container/teacher-student-update'
import { useTeacherStudentCard } from '@/legacy/container/teacher-studentcard'
import { Category, Code, ResponseParentUserDto } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { useModals } from '@/legacy/modals/ModalStack'
import { StudentModal } from '@/legacy/modals/StudentModal'
import { getNickName } from '@/legacy/util/status'
import { getThisYear } from '@/legacy/util/time'
import { Validator } from '@/legacy/util/validator'
import { warningState } from '@/stores'
import { Select } from '../common'
import { Icon } from '../common/icons'
import { TextInput } from '../common/TextInput'
import { Time } from '../common/Time'
import { ReactComponent as SvgUser } from '@/assets/svg/user.svg'

interface StudentInfoCardProps {
  id: number
}

export default function Studentv3InfoCard({ id }: StudentInfoCardProps) {
  const { t } = useLanguage()
  const { pushModal } = useModals()
  const setToastMsg = useSetRecoilState(warningState)

  const thisYear = getThisYear()
  const [studentStatesKey, setStudentStatesKey] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)

  const { studentInfo: info } = useTeacherStudentCard(id)
  const { categoryData: studentStates } = useCodeByCategoryName(Category.studentstatus)

  const {
    isEditMode,
    setIsEditMode,
    nickName,
    setNickName,
    phone,
    setPhone,
    expired,
    setExpired,
    expiredReason,
    setExpiredReason,
    profile,
    birthDate,
    setBirthDate,
    setStudentInfo,
    updateStudent,
    nokName,
    setNokName,
    nokPhone,
    setNokPhone,
    sendParentSignUpV2Mutate,
    handleChangeImage,
    toggleImageDelete,
    barcode,
    setBarcode,
  } = useTeacherStudentUpdate()

  const studentInfo = useMemo(() => {
    setStudentInfo(info?.student)
    return info?.student
  }, [info])
  const studentGroupInfo = useMemo(() => info?.groupNames, [info])

  const { motto } = useStudentPropertyUpdate({
    studentId: studentInfo?.id || 0,
  })

  useEffect(() => {
    if (expiredReason && studentStates) {
      const selItem = studentStates?.filter((item: Code) => item.name === expiredReason)
      if (selItem) {
        setStudentStatesKey(selItem[0].key)
      }
    }
  }, [expiredReason, studentStates])

  const setStudExpiredObj = (exp: Code) => {
    setExpired(exp.etc1 === 'true' ? true : false)
    setExpiredReason(exp.name)

    if (exp.etc1 === 'true') {
      setToastMsg(`${exp.name} 상태의 학생은 슈퍼스쿨 사용이 중지 됩니다.`)
    } else if (exp.etc2 === 'true') {
      setToastMsg(`${exp.name} 상태의 학생은 출석부에 표시되지 않습니다.`)
    }
  }

  const klassName = studentInfo?.klassGroupName
    ? studentInfo?.klassGroupName + ' ' + studentInfo?.studentNumber.toString() + '번'
    : ''

  const checkParentJoin = () => {
    let rst = false

    if (nokPhone) {
      info?.parents?.map((item: ResponseParentUserDto) => {
        if (nokPhone === item.phone) {
          rst = true
        }
      })
    } else {
      rst = true
    }
    return rst
  }

  const handleCopyToClipboard = async (text: string) => {
    if (text) {
      try {
        await navigator.clipboard.writeText(text)
        alert('이메일이 클립보드에 복사되었습니다.')
      } catch (err) {
        alert('이메일 복사에 실패했습니다. 다시 시도해주세요.')
      }
    } else {
      alert('복사할 내용이 없습니다.')
    }
  }
  return (
    <section className="relative h-full rounded-md border-2 bg-white p-4">
      <article className="flex items-center justify-between pt-3 md:pt-0">
        <h6 className="text-lg font-semibold">{t('student_information', '학생정보')}</h6>
        <div className="flex items-center gap-2">
          {isEditMode && (
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className="border-darkgray hover:bg-darkgray h-8 w-16 rounded-md border font-semibold transition-all hover:text-white"
            >
              {t('cancel', '취소')}
            </button>
          )}
          {checkParentJoin() === false && !isEditMode && (
            <button
              children={
                <div className="flex">
                  {/* 가입요청<span className="mr-1 hidden md:block">알림톡 </span> 보내기 */}
                  {t('send_signup_request_notification', '가입요청알림톡 보내기')}
                </div>
              }
              onClick={() => {
                if (nokName && nokPhone) {
                  sendParentSignUpV2Mutate({
                    studentId: Number(studentInfo?.id),
                    data: { name: nokName, phone: nokPhone },
                  })
                } else {
                  alert('보호자 정보를 확인해 주세요.')
                }
              }}
              className="border-darkgray hover:bg-darkgray md:text-16 h-8 rounded-md border px-2 text-sm font-semibold transition-all hover:text-white md:px-4"
            />
          )}
          <button
            onClick={() => {
              if (isEditMode) {
                if (phone && !Validator.phoneNumberRule(phone)) {
                  alert('학생 전화번호를 확인해 주세요.')
                  return
                }

                if (nokPhone && !Validator.phoneNumberRule(nokPhone)) {
                  alert('보호자 전화번호를 확인해 주세요.')
                  return
                }
                updateStudent()
              }
              setIsEditMode(!isEditMode)
            }}
            className={`border-darkgray hover:bg-darkgray h-8 rounded-md border font-semibold transition-all hover:text-white md:w-16 ${
              isEditMode ? 'w-16' : 'md:text-16 w-8 text-sm'
            }`}
          >
            {isEditMode ? t('save', '저장') : t('edit', '수정')}
          </button>
        </div>
      </article>
      <article className="mt-4 flex w-full flex-auto flex-col items-center overflow-hidden md:flex-row md:items-start">
        <div className="relative flex w-28 flex-1 rounded-[4px] md:h-full md:w-full md:basis-1/4">
          {isEditMode ? (
            <>
              <label htmlFor="imageupload" className="h-full w-full cursor-pointer">
                <img
                  src={`${Constants.imageUrl}${profile}`}
                  className="rounded-[8px] object-fill"
                  alt=""
                  onError={({ currentTarget }) => {
                    currentTarget.onerror = null
                    currentTarget.src = SvgUser as unknown as string
                    currentTarget.className = 'w-full'
                  }}
                />
                {profile ? (
                  <span className="absolute top-0 right-0 z-40 block h-6 w-6 rounded-full bg-red-700 ring-2 ring-white">
                    <div
                      className="flex h-full w-full cursor-pointer items-center justify-center text-white"
                      onClick={() => {
                        toggleImageDelete()
                      }}
                      style={{ transform: 'translate(0.1px, 0.1px)' }}
                    >
                      X
                    </div>
                  </span>
                ) : (
                  <div className="bg-brand-1 absolute top-1/2 left-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full">
                    <p className="text-2xl text-white">+</p>
                  </div>
                )}
                <input
                  type="file"
                  id="imageupload"
                  accept=".pdf, .png, .jpeg, .jpg"
                  onChange={(e) => handleChangeImage(e)}
                  className="hidden"
                />
              </label>
            </>
          ) : (
            <img
              src={`${Constants.imageUrl}${profile}`}
              alt="프로필 이미지"
              className="w-full rounded-[8px] object-fill"
              onError={({ currentTarget }) => {
                currentTarget.onerror = null
                currentTarget.src = SvgUser as unknown as string
                currentTarget.className = 'rounded-[8px] object-fill w-full'
              }}
            />
          )}
        </div>
        <div className="flex w-full flex-col md:ml-4 md:basis-3/4">
          <div className="mt-2 mb-2 flex flex-col items-center md:mt-0 md:flex-row md:gap-4">
            <h5 className="text-[20px] font-bold">
              <button onClick={() => pushModal(<StudentModal id={id} />)}>
                {studentInfo?.name}
                {getNickName(studentInfo?.nickName)}
              </button>
            </h5>
            <p>
              {klassName} {studentInfo?.studentRole && `(${studentInfo.studentRole})`}
            </p>
          </div>
          <div className="mt-4 flex grid-cols-2 flex-col gap-1 lg:mt-0 lg:grid">
            <div className="flex flex-1">
              <label className="w-20 font-semibold">{t(`nickName`, '별명')}</label>
              {isEditMode ? (
                <TextInput
                  placeholder={`${t(`nickName`, '별명')} 입력`}
                  value={nickName}
                  onChange={(e) => setNickName(e.target.value)}
                  className="h-6 w-30 rounded-none border-0 border-b border-gray-400 p-0 focus:border-b-2 focus:border-black focus:ring-0"
                  autoFocus
                />
              ) : (
                <div>{nickName ? nickName : '-'}</div>
              )}
            </div>
            <div className="flex flex-1">
              <label className="w-20 font-semibold">{t('phone_number', '전화번호')}</label>
              {isEditMode ? (
                <TextInput
                  placeholder="전화번호 입력"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-6 w-30 rounded-none border-0 border-b border-gray-400 p-0 focus:border-b-2 focus:border-black focus:ring-0"
                  maxLength={11}
                  autoFocus
                />
              ) : (
                <div>{phone?.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')}</div>
              )}
            </div>
            <div className="flex">
              <label className="w-20 font-semibold">{t('email', '이메일')}</label>
              {isEditMode ? (
                <>
                  {studentInfo?.email && studentInfo?.email?.length > 13 ? (
                    <>
                      <div className="relative hidden items-center md:flex">
                        {studentInfo.email.slice(0, 13) + '...'}
                      </div>
                      <div className="relative flex items-center md:hidden">{studentInfo.email}</div>
                    </>
                  ) : (
                    <p>{studentInfo?.email}</p>
                  )}
                </>
              ) : (
                <>
                  {studentInfo?.email && studentInfo?.email?.length > 13 ? (
                    <>
                      <div className="relative hidden items-center md:flex">
                        {studentInfo.email.slice(0, 13) + '...'}
                        <div className="h-6 w-6 cursor-pointer" onClick={() => setModalOpen(!modalOpen)}>
                          <Icon.ChevronDown />
                        </div>
                        {modalOpen && (
                          <div className="absolute right-2 -bottom-10 block rounded-md border bg-white px-2 py-1">
                            <div className="flex min-w-max items-center gap-2 rounded-md px-0.5 py-1 transition-all">
                              <p className="font-bold">{studentInfo.email}</p>
                              <button
                                onClick={() => studentInfo.email && handleCopyToClipboard(studentInfo.email)}
                                className="text-blue-500"
                              >
                                {t('copy', '복사')}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="relative flex items-center md:hidden">{studentInfo.email}</div>
                    </>
                  ) : (
                    <p>{studentInfo?.email}</p>
                  )}
                </>
              )}
            </div>
            <div className="flex">
              <label className="w-20 font-semibold">{t('date_of_birth', '생년월일')}</label>
              {isEditMode ? (
                <TextInput
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="h-6 w-30 rounded-none border-0 border-b border-gray-400 p-0 focus:border-b-2 focus:border-black focus:ring-0"
                />
              ) : (
                <Time date={birthDate} format="yyyy.MM.dd" className="text-16 text-black" />
              )}
            </div>
            <div className="flex">
              <label className="w-20 font-semibold">{t('academic_status', '학적상태')}</label>
              {isEditMode ? (
                <Select.lg
                  placeholder="학적 선택"
                  value={studentStatesKey}
                  onChange={(e) => {
                    const selItem = studentStates?.filter((item: Code) => item.key === Number(e.target.value))
                    selItem && setStudExpiredObj(selItem[0])
                  }}
                  className="h-6 w-30 rounded-none border-0 border-b border-gray-400 p-0 focus:border-b-2 focus:border-black focus:ring-0"
                >
                  {studentStates?.map((item: Code) => (
                    <option key={item.key} value={item.key} className={clsx(item?.etc1 === 'true' && 'text-red-500')}>
                      {t(`${item.name}`)}
                    </option>
                  ))}
                </Select.lg>
              ) : (
                <div className={` ${expired && 'text-red-500'} `}>{expiredReason}</div>
              )}
            </div>

            <div className="flex">
              <label className="w-20 font-semibold">{t('affiliation_information', '소속 정보')}</label>
              <p>
                {studentGroupInfo &&
                  studentGroupInfo.find((group) => group.type === 'KLASS' && group.year === thisYear)?.name}
              </p>
            </div>
            <div className="flex">
              <label className="w-20 font-semibold">{t('barcode', '바코드')}</label>
              {isEditMode ? (
                <TextInput
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="h-6 w-30 rounded-none border-0 border-b border-gray-400 p-0 focus:border-b-2 focus:border-black focus:ring-0"
                />
              ) : (
                <div>{barcode}</div>
              )}
            </div>
            {checkParentJoin() === false && (
              <>
                <div className="flex">
                  <label className="w-20 font-semibold">{t('guardian', '보호자')}</label>
                  {isEditMode ? (
                    <TextInput
                      value={nokName}
                      onChange={(e) => setNokName(e.target.value)}
                      className="h-6 w-30 rounded-none border-0 border-b border-gray-400 p-0 focus:border-b-2 focus:border-black focus:ring-0"
                    />
                  ) : (
                    <div>{nokName}</div>
                  )}
                </div>
                <div className="flex">
                  <label className="w-20 font-semibold">
                    {t('guardian', '보호자')}
                    {t('phone', '전화')}
                  </label>
                  {isEditMode ? (
                    <TextInput
                      placeholder="전화번호 입력"
                      value={nokPhone}
                      onChange={(e) => setNokPhone(e.target.value)}
                      className="h-6 w-30 rounded-none border-0 border-b border-gray-400 p-0 focus:border-b-2 focus:border-black focus:ring-0"
                      maxLength={11}
                    />
                  ) : (
                    <div>{nokPhone?.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')}</div>
                  )}
                </div>
              </>
            )}
            <div className="flex">
              <label className="w-20 font-semibold">{t('motto', '좌우명')}</label>
              <p>{motto}</p>
            </div>
          </div>
        </div>
      </article>
    </section>
  )
}
