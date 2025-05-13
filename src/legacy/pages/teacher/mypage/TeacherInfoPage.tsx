import { ChangeEvent, useEffect, useState } from 'react'
import { useRecoilValue } from 'recoil'

import { ErrorBlank } from '@/legacy/components'
import { BackButton, Blank, IconButton, Section, TopNavbar } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { Checkbox } from '@/legacy/components/common/Checkbox'
import { Constants } from '@/legacy/constants'
import { GroupContainer } from '@/legacy/container/group'
import { useTeacherInfoUpdate } from '@/legacy/container/teacher-info-update'
import { userDeleteUser } from '@/legacy/generated/endpoint'
import { UploadFileTypeEnum } from '@/legacy/generated/model'
import { useFileUpload } from '@/legacy/hooks/useFileUpload'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { checkFileSizeLimit100MB } from '@/legacy/util/file'
import { useLogout } from '@/legacy/util/hooks'
import { getNickName } from '@/legacy/util/status'
import { getHoursfromHHmmString, getMinutesfromHHmmString } from '@/legacy/util/time'
import { Validator } from '@/legacy/util/validator'
import { meState } from '@/stores'

import BgLogo from '@/assets/images/Intersect.png'
import SvgUser from '@/assets/svg/user.svg'

export function TeacherInfoPage() {
  const meRecoil = useRecoilValue(meState)
  const { t } = useLanguage()
  const { allTeacherGroups, errorGroups } = GroupContainer.useContext()
  const [isUpdateMe, setIsUpdateMe] = useState(false)
  const [name, setName] = useState(meRecoil?.name)
  const [nickName, setNickName] = useState(meRecoil?.nickName)
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [phone, setPhone] = useState(meRecoil?.phone || '')
  const [profile, setProfile] = useState(meRecoil?.profile || '')
  const [department, setDepartment] = useState(meRecoil?.teacherProperty?.department || '')
  const [position, setPosition] = useState(meRecoil?.teacherProperty?.position || '')
  const { handleUploadFile } = useFileUpload()
  const { isUpdateMeLoading, updateMe } = useTeacherInfoUpdate()
  const [isDeleteMe, setIsDeleteMe] = useState(false)
  const [deleteReason, setDeleteReason] = useState('')

  const [enableChatTime, setEnableChatTime] = useState(true)
  const [startH, setStartH] = useState(0)
  const [startM, setStartM] = useState(0)
  const [endH, setEndH] = useState(0)
  const [endM, setEndM] = useState(0)

  const spacedName = (name: string) => {
    return name.split('').join('  ')
  }

  const logout = useLogout()

  useEffect(() => {
    if (meRecoil?.teacherProperty) {
      setStartH(getHoursfromHHmmString(meRecoil?.teacherProperty?.chatStartTime, 9))
      setStartM(getMinutesfromHHmmString(meRecoil?.teacherProperty?.chatStartTime, 0))
      setEndH(getHoursfromHHmmString(meRecoil?.teacherProperty?.chatEndTime, 18))
      setEndM(getMinutesfromHHmmString(meRecoil?.teacherProperty?.chatEndTime, 0))
      setEnableChatTime(meRecoil?.teacherProperty?.chatStartTime !== meRecoil?.teacherProperty?.chatEndTime)
    }
  }, [])

  async function deleteExpiredUser() {
    if (password.length === 0) {
      alert('비밀번호를 입력해주세요.')
      return
    } else {
      if (password !== password2) {
        alert('비밀번호와 비밀번호 확인이 다릅니다.')
        return
      }
    }

    if (deleteReason === '') {
      alert('탈퇴이유는 필수로 적어주세요.')
      return
    }

    if (!confirm(`탈퇴한 계정은 복구할 수 없습니다.\n탈퇴하시겠습니까?`)) return

    await userDeleteUser({ password: password, reason: deleteReason })
      .then((result) => {
        alert('회원탈퇴가 완료되었습니다.')
        logout()
      })
      .catch((result) => {
        if (result?.response?.data?.code == '1001100') {
          alert(result?.response?.data?.msg?.ko ?? '비밀번호가 일치하지 않습니다.')
        } else {
          alert('회원탈퇴에 실패했습니다.')
        }
      })
  }

  const handleUpdate = () => {
    updateMe({
      name,
      nickName,
      phone,
      password,
      profile: profile || '',
      position,
      department,
      chatStartTime: enableChatTime ? startH + ':' + startM.toString().padStart(2, '0') : '00:00',
      chatEndTime: enableChatTime ? endH + ':' + endM.toString().padStart(2, '0') : '00:00',
    })
      .then(() => {
        setIsUpdateMe(false)
      })
      .catch((e) => {
        console.log('update error', e)
      })
  }

  const handleChangeImage = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return
    }

    const selectedImageFiles = (e.target as HTMLInputElement).files
    if (!selectedImageFiles || !selectedImageFiles.length) {
      return
    }

    if (!Validator.fileNameRule(selectedImageFiles[0].name)) {
      alert('특수문자(%, &, ?, ~, +)가 포함된 파일명은 사용할 수 없습니다.')
      return
    }

    if (!checkFileSizeLimit100MB([selectedImageFiles[0]])) {
      alert('한번에 최대 100MB까지만 업로드 가능합니다.')
      return
    }

    const imageFileNames = await handleUploadFile(UploadFileTypeEnum['userpictures'], [selectedImageFiles[0]])

    setProfile(imageFileNames[0])
  }

  if (!meRecoil || errorGroups) {
    return <ErrorBlank />
  }

  return (
    <div className="col-span-6">
      <div className="block md:hidden">
        <TopNavbar title={`${t('my_information')}`} left={<BackButton />} />
      </div>
      <Section className="h-screen-6 flex flex-col bg-gray-50 py-0 pb-4 md:h-screen">
        {isUpdateMeLoading && <Blank />}
        <div className="mx-0 overflow-y-scroll bg-white md:mx-40 md:h-screen">
          {/* 교원증 영역 */}
          <div className="mt-4 flex h-[428px] justify-center md:mt-16 md:px-10">
            <div className="relative w-80 rounded-lg border border-zinc-100 bg-white shadow">
              <div className="flex h-12 items-center justify-center rounded-t-lg bg-black">
                <div className="text-center font-['Pretendard'] text-xl font-semibold tracking-[0.1em] text-white">
                  {t('teacher_id')}
                </div>
              </div>
              <div className="flex w-full flex-col items-center bg-white">
                <div className="relative z-10 mt-6 mb-4 w-40 rounded-lg md:mt-8">
                  {isUpdateMe ? (
                    <label htmlFor="imageupload" className="h-48 w-40 cursor-pointer">
                      <img
                        className="h-48 w-40 rounded-lg object-cover"
                        src={`${Constants.imageUrl}${profile}`}
                        alt=""
                        loading="lazy"
                      />
                      <div className="bg-brand-1 absolute top-1/2 left-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full">
                        <p className="text-2xl text-white">+</p>
                      </div>
                      <input
                        type="file"
                        id="imageupload"
                        accept=".pdf, .png, .jpeg, .jpg"
                        onChange={(e) => handleChangeImage(e)}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <img
                      src={`${Constants.imageUrl}${profile}`}
                      alt="프로필 이미지"
                      loading="lazy"
                      className="h-48 w-40 rounded-lg object-cover"
                      onError={({ currentTarget }) => {
                        currentTarget.onerror = null
                        currentTarget.src = SvgUser
                        currentTarget.className = 'w-full'
                      }}
                    />
                  )}
                </div>
                <img className="absolute right-0 bottom-10 h-auto w-auto" src={BgLogo} alt="" />
                <p className="z-10 text-2xl font-bold">
                  {spacedName(meRecoil?.name)} {getNickName(meRecoil?.nickName)}
                </p>
                <p className="z-10 mt-1">{meRecoil?.email}</p>
                <div className="flex flex-row items-center justify-center gap-1 pt-6">
                  {meRecoil?.school.mark && (
                    <IconButton
                      children={<img src={`${Constants.imageUrl}${meRecoil?.school.mark}`} alt="" loading="lazy" />}
                      className="h-8 w-8"
                    />
                  )}
                  <p className="text-black">{meRecoil?.school.name}</p>
                </div>
              </div>
            </div>
          </div>
          {/* 내 정보 영역 */}
          {!isDeleteMe && (
            <div className="mt-16 px-4 py-4 md:px-10 md:py-5">
              <div className="flex items-center justify-between">
                <div className="text-24 font-bold whitespace-pre">{t('my_information')}</div>
                {isUpdateMe ? (
                  <div className="flex items-center gap-2">
                    <Button className="h-8 w-16 border border-gray-600" onClick={() => setIsUpdateMe(!isUpdateMe)}>
                      {t('cancel')}
                    </Button>
                    <Button
                      className="h-8 w-16 bg-zinc-800 text-white"
                      // disabled={buttonDisabled}
                      onClick={() => {
                        if (!Validator.phoneNumberRule(phone)) {
                          alert('전화번호를 확인해 주세요.')
                          return
                        }
                        if (password.length === 0) {
                          alert('비밀번호를 공백으로 기입할 시 기존 비밀번호가 유지됩니다.')
                          handleUpdate()
                        } else {
                          if (password !== password2) {
                            alert('비밀번호와 비밀번호 확인이 다릅니다.')
                            return
                          }
                          if (!Validator.passwordRule(password)) {
                            alert('안전한 비밀번호를 입력하세요.')
                            return
                          }
                          handleUpdate()
                          setIsUpdateMe(!isUpdateMe)
                        }
                      }}
                    >
                      {t('save')}
                    </Button>
                  </div>
                ) : (
                  <Button className="h-8 w-16 border border-gray-600" onClick={() => setIsUpdateMe(!isUpdateMe)}>
                    {t('edit')}
                  </Button>
                )}
              </div>

              <div className="mt-4 border border-zinc-300">
                <div className="flex flex-col rounded-sm xl:grid xl:grid-cols-2">
                  <div className="flex">
                    <label className="w-24 border border-zinc-300 bg-stone-50 p-4 font-semibold md:w-32">
                      {t('name')}
                    </label>
                    {isUpdateMe ? (
                      <>
                        <input
                          className="flex w-30 flex-1 rounded-none border border-zinc-300 px-4 underline underline-offset-4 focus:border-zinc-300"
                          placeholder={`${t('enter_name')}`}
                          value={name}
                          disabled
                          onChange={(e) => setName(e.target.value)}
                        />
                      </>
                    ) : (
                      <div className="flex flex-1 border border-zinc-300 p-4">{meRecoil?.name}</div>
                    )}
                  </div>
                  <div className="flex">
                    <label className="w-24 border border-zinc-300 bg-stone-50 p-4 font-semibold md:w-32">
                      {t(`Custom.SID${meRecoil?.schoolId}.nickName`, '별명')}
                    </label>
                    {isUpdateMe ? (
                      <>
                        <input
                          className="flex w-30 flex-1 rounded-none border border-zinc-300 px-4 underline underline-offset-4 focus:border-zinc-300"
                          placeholder={`${t(`Custom.SID${meRecoil?.schoolId}.nickName`, '별명')} 입력`}
                          value={nickName}
                          onChange={(e) => setNickName(e.target.value)}
                        />
                      </>
                    ) : (
                      <div className="flex flex-1 border border-zinc-300 p-4">{meRecoil?.nickName}</div>
                    )}
                  </div>
                  <div className="flex">
                    <label className="w-24 border border-zinc-300 bg-stone-50 p-4 font-semibold md:w-32">
                      {t('email')}
                    </label>
                    <div className="flex flex-1 border border-zinc-300 p-4">{meRecoil?.email}</div>
                  </div>
                  <div className="flex">
                    <label className="w-24 border border-zinc-300 bg-stone-50 p-4 font-semibold md:w-32">
                      {t('phone_number')}
                    </label>
                    {isUpdateMe ? (
                      <>
                        <input
                          className="flex w-30 flex-1 rounded-none border border-zinc-300 px-4 underline underline-offset-4 focus:border-zinc-300"
                          placeholder={`${t('enter_phone_number')}`}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </>
                    ) : (
                      <div className="flex flex-1 border border-zinc-300 p-4">
                        {meRecoil?.phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')}
                      </div>
                    )}
                  </div>
                  {/* <div className="flex">
                  <label className="w-24 border border-zinc-300 bg-stone-50 p-4 font-semibold md:w-32">
                    {t('school')}
                  </label>
                  <div className="flex flex-1 border border-r border-zinc-300 border-r-zinc-300 p-4">
                    {meRecoil?.school.name}
                  </div>
                </div> */}
                  <div className="flex">
                    <label className="w-24 border border-zinc-300 bg-stone-50 p-4 font-semibold md:w-32">
                      {t('department')}
                    </label>
                    {isUpdateMe ? (
                      <>
                        <input
                          className="flex w-30 flex-1 rounded-none border border-zinc-300 px-4 underline underline-offset-4 focus:border-zinc-300"
                          placeholder={`${t('enter_department')}`}
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                        />
                      </>
                    ) : (
                      <div className="flex flex-1 border border-zinc-300 p-4">
                        {meRecoil?.teacherProperty?.department}
                      </div>
                    )}
                  </div>
                  <div className="flex">
                    <label className="w-24 border border-zinc-300 bg-stone-50 p-4 font-semibold md:w-32">
                      {t('position')}
                    </label>
                    {isUpdateMe ? (
                      <>
                        <input
                          className="flex w-30 flex-1 rounded-none border border-zinc-300 px-4 underline underline-offset-4 focus:border-zinc-300"
                          placeholder={`${t('enter_position')}`}
                          value={position}
                          onChange={(e) => setPosition(e.target.value)}
                        />
                      </>
                    ) : (
                      <div className="flex flex-1 border border-zinc-300 p-4">
                        {meRecoil?.teacherProperty?.position}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex">
                  <label className="flex w-24 items-center border border-zinc-300 bg-stone-50 p-4 font-semibold md:w-32">
                    {t('available_time_for_conversation')}
                  </label>
                  <div className="flex flex-1 flex-col border border-zinc-300 px-2 2xl:flex-row">
                    {isUpdateMe ? (
                      <div className="flex flex-1 flex-col items-start justify-between md:flex-row md:items-center">
                        <div className="flex flex-col gap-2 p-4">
                          <div className="flex flex-col items-center space-x-2 md:flex-row">
                            <div className="items flex items-center justify-between gap-1">
                              <select
                                value={startH}
                                onChange={(e) => setStartH(Number(e.target.value))}
                                disabled={!enableChatTime}
                                className="w-14 min-w-max appearance-none border-0 border-b-2 border-gray-200 px-0 py-1 placeholder-gray-400 focus:border-gray-200 focus:ring-0 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400 sm:text-sm"
                              >
                                {new Array(24).fill(null).map((item, num: number) => (
                                  <option key={num} value={num}>
                                    {num}
                                  </option>
                                ))}
                              </select>
                              <span>:</span>
                              <select
                                value={startM}
                                onChange={(e) => setStartM(Number(e.target.value))}
                                disabled={!enableChatTime}
                                className="w-14 min-w-max appearance-none border-0 border-b-2 border-gray-200 px-0 py-1 placeholder-gray-400 focus:border-gray-200 focus:ring-0 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400 sm:text-sm"
                              >
                                <option value={0}>00</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={30}>30</option>
                                <option value={40}>40</option>
                                <option value={50}>50</option>
                              </select>
                            </div>
                            <div className="items flex items-center justify-between gap-1">
                              <span>~</span>
                              <select
                                value={endH}
                                onChange={(e) => setEndH(Number(e.target.value))}
                                disabled={!enableChatTime}
                                className="w-14 min-w-max appearance-none border-0 border-b-2 border-gray-200 px-0 py-1 placeholder-gray-400 focus:border-gray-200 focus:ring-0 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400 sm:text-sm"
                              >
                                {new Array(24).fill(null).map((item, num: number) => (
                                  <option key={num} value={num}>
                                    {num}
                                  </option>
                                ))}
                              </select>
                              <span>:</span>
                              <select
                                className="w-14 min-w-max appearance-none border-0 border-b-2 border-gray-200 px-0 py-1 placeholder-gray-400 focus:border-gray-200 focus:ring-0 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400 sm:text-sm"
                                onChange={(e) => setEndM(Number(e.target.value))}
                                disabled={!enableChatTime}
                                value={endM}
                              >
                                <option value={0}>00</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={30}>30</option>
                                <option value={40}>40</option>
                                <option value={50}>50</option>
                              </select>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox checked={enableChatTime} onChange={() => setEnableChatTime(!enableChatTime)} />
                            <div className="text-stone-500">{t('enable_available_time_for_conversation')}</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-1 p-2 md:flex-row md:items-center">
                        <div className="flex items-center">
                          {meRecoil?.teacherProperty?.chatStartTime &&
                          meRecoil?.teacherProperty?.chatEndTime &&
                          meRecoil?.teacherProperty?.chatStartTime !== meRecoil?.teacherProperty?.chatEndTime ? (
                            <div className="">
                              {meRecoil?.teacherProperty?.chatStartTime} ~ {meRecoil?.teacherProperty?.chatEndTime}
                            </div>
                          ) : (
                            <div className="font-['Pretendard'] text-base leading-normal font-normal text-neutral-400">
                              {t('no_available_time_for_conversation')}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {(isUpdateMe ||
                      meRecoil?.teacherProperty?.chatStartTime !== meRecoil?.teacherProperty?.chatEndTime) && (
                      <div className="flex flex-col p-3 md:flex-row md:items-center md:justify-between md:p-4">
                        <div className="text-sm text-orange-500">
                          <p>{t('explanation_new_conversation_time')}</p>
                          <p>{t('explanation_separate_time')}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex w-full">
                  <label className="flex w-24 items-center border border-zinc-300 bg-stone-50 p-4 font-semibold md:w-32">
                    {t('assigned_group')}
                  </label>
                  <div className="flex flex-1 flex-wrap gap-2 border-y border-r border-y-zinc-300 border-r-zinc-300 p-4">
                    {allTeacherGroups?.map((tg) => (
                      <div key={tg.id} className="w-full rounded bg-orange-100 px-2 py-1 md:w-[calc(50%-0.5rem)]">
                        {tg.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {isUpdateMe && (
            <>
              <div className="mt-4 flex flex-col rounded-sm px-4 py-2 md:grid md:grid-cols-2 md:px-10 md:py-5">
                <div className="flex flex-1">
                  <label className="w-24 border border-zinc-300 bg-stone-50 p-4 font-semibold md:w-32">
                    {t('password')}
                  </label>
                  <input
                    className="flex flex-1 rounded-none border border-zinc-300 underline underline-offset-4 focus:border-zinc-300 focus:ring-0"
                    type="password"
                    placeholder={`${t('enter_password')}`}
                    value={password}
                    onChange={(e) => setPassword(Validator.removeSpace(String(e.target.value)))}
                  />
                </div>
                <div className="flex">
                  <label className="w-24 border border-zinc-300 bg-stone-50 p-4 font-semibold md:w-32">
                    {t('confirm_password')}
                  </label>
                  <input
                    type="password"
                    className="flex flex-1 rounded-none border border-zinc-300 underline underline-offset-4 focus:border-zinc-300 focus:ring-0"
                    placeholder={`${t('enter_password_again')}`}
                    value={password2}
                    onChange={(e) => setPassword2(Validator.removeSpace(String(e.target.value)))}
                  />
                </div>
              </div>
              <div className="mt-2 px-4 py-2 text-sm md:px-10 md:py-5">
                <p className="flex items-center gap-1">
                  <p className="text-orange-500">*</p> {t('explanation_safe_password')}
                </p>
                <p className="flex items-center gap-1">
                  <p className="text-orange-500">*</p> {t('explanation_special_characters')}
                </p>
                <p className="flex items-center gap-1">
                  <p className="text-orange-500">*</p> {t('explanation_password_not_changed')}
                </p>
              </div>
            </>
          )}

          {!isUpdateMe && (
            <div className="px-4 py-4 md:px-10 md:py-5">
              <div className="flex items-center justify-end">
                <div className="flex items-center gap-2">
                  {isDeleteMe ? (
                    <div className="flex items-center gap-2">
                      <Button className="h-8 w-16 border border-gray-600" onClick={() => setIsDeleteMe(!isDeleteMe)}>
                        {t('cancel')}
                      </Button>
                      <Button className="h-8 w-16 bg-zinc-800 text-white" onClick={deleteExpiredUser}>
                        {t('account_deletion')}
                      </Button>
                    </div>
                  ) : (
                    <Button className="h-8 w-16 border border-gray-600" onClick={() => setIsDeleteMe(!isDeleteMe)}>
                      {t('account_deletion')}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {isDeleteMe && (
            <>
              <div className="mt-4 flex flex-col rounded-sm px-4 py-2 md:grid md:grid-cols-2 md:px-10 md:py-5">
                <div className="flex flex-1">
                  <label className="w-24 border border-zinc-300 bg-stone-50 p-4 font-semibold md:w-32">
                    {t('password')}
                  </label>
                  <input
                    className="flex flex-1 rounded-none border border-zinc-300 underline underline-offset-4 focus:border-zinc-300 focus:ring-0"
                    type="password"
                    placeholder={`${t('enter_password')}`}
                    value={password}
                    onChange={(e) => setPassword(Validator.removeSpace(String(e.target.value)))}
                  />
                </div>
                <div className="flex">
                  <label className="w-24 border border-zinc-300 bg-stone-50 p-4 font-semibold md:w-32">
                    {t('confirm_password')}
                  </label>
                  <input
                    type="password"
                    className="flex flex-1 rounded-none border border-zinc-300 underline underline-offset-4 focus:border-zinc-300 focus:ring-0"
                    placeholder={`${t('enter_password_again')}`}
                    value={password2}
                    onChange={(e) => setPassword2(Validator.removeSpace(String(e.target.value)))}
                  />
                </div>
                <div className="flex w-full md:col-span-2">
                  <label className="w-24 border border-zinc-300 bg-stone-50 p-4 font-semibold md:w-32">
                    {t(`account_deletion_reason`)}
                  </label>
                  <input
                    className="flex-1 rounded-none border border-zinc-300 px-4 underline underline-offset-4 focus:border-zinc-300"
                    placeholder={`${t(`account_deletion_reason`)}`}
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </Section>
    </div>
  )
}
