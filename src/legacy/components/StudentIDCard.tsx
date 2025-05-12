import { useState, type ChangeEvent } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Constants } from '@/legacy/constants'
import { DateUtil } from '@/legacy/util/date'
import { Validator } from '@/legacy/util/validator'
import { makeDateToString } from '@/legacy/util/time'
import { checkFileSizeLimit100MB } from '@/legacy/util/file'
import { useUserUpdateMe } from '@/legacy/generated/endpoint'
import { useFileUpload } from '@/legacy/hooks/useFileUpload'
import { Button } from '@/legacy/components/common/Button'
import { Blank, CloseButton, IconButton, Section } from '@/legacy/components/common'
import { UploadFileTypeEnum, type ResponseUserDto, type UpdateUserDto } from '@/legacy/generated/model'

// ? 추후 고도화
import Edit from '@/legacy/assets/svg/edit.svg'

interface StudentIDCardProps {
  meRecoil: ResponseUserDto
}

export function StudentIDCard({ meRecoil }: StudentIDCardProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)

  const [customProfile, setCustomProfile] = useState<File | string | null | undefined>(meRecoil.customProfile)
  const [background, setBackground] = useState<File | string | null | undefined>(meRecoil.customBackground)

  const { handleUploadFile } = useFileUpload()

  const handleBackgroundImageAdd = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return
    }

    const selectedImageFiles = (e.target as HTMLInputElement).files
    if (!selectedImageFiles || !selectedImageFiles.length) {
      return
    }

    if (!Validator.fileNameRule(selectedImageFiles[0].name)) {
      alert('특수문자(%, &, ?, ~)가 포함된 파일명은 사용할 수 없습니다.')
      return
    }

    if (!checkFileSizeLimit100MB([selectedImageFiles[0]])) {
      alert('한번에 최대 100MB까지만 업로드 가능합니다.')
      return
    }

    setBackground(selectedImageFiles[0])
  }

  const handleProfileImageAdd = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return
    }

    const selectedImageFiles = (e.target as HTMLInputElement).files
    if (!selectedImageFiles || !selectedImageFiles.length) {
      return
    }

    if (!Validator.fileNameRule(selectedImageFiles[0].name)) {
      alert('특수문자(%, &, ?, ~)가 포함된 파일명은 사용할 수 없습니다.')
      return
    }

    if (!checkFileSizeLimit100MB([selectedImageFiles[0]])) {
      alert('한번에 최대 100MB까지만 업로드 가능합니다.')
      return
    }

    setCustomProfile(selectedImageFiles[0])
  }

  const { mutate: updateBackgroundImagMutate, isLoading } = useUserUpdateMe({
    mutation: {
      onSuccess: () => {
        setEditMode(false)
      },
    },
  })
  const handleUpdateBackgroundImage = async () => {
    if (background instanceof File) {
      const imageFileNames = await handleUploadFile(UploadFileTypeEnum['profiles/custombackground'], [background])
      const payload = {
        customBackground: imageFileNames[0],
      } as UpdateUserDto
      updateBackgroundImagMutate({
        data: payload,
      })
    }
    handleUpdateProfile()

    setEditMode(false)
  }

  const handleUpdateProfile = async () => {
    if (customProfile instanceof File) {
      const imageFileNames = await handleUploadFile(UploadFileTypeEnum['profiles'], [customProfile])
      const payload = {
        customProfile: imageFileNames[0],
      } as UpdateUserDto
      updateBackgroundImagMutate({
        data: payload,
      })
    }
    //setModalOpen(false);
  }

  return (
    <>
      {isLoading && <Blank />}
      <Swiper slidesPerView={1.05} spaceBetween={10} className="mySwiper px-6 pt-6 pb-5">
        <SwiperSlide>
          <div className="card_shadow relative overflow-hidden">
            <div className="absolute right-0 left-0 z-10">
              <div className="flex items-center justify-end space-x-2 rounded-xl">
                <input
                  type="file"
                  id="bg-upload"
                  className="hidden"
                  accept=".pdf, .png, .jpeg, .jpg"
                  onChange={(e) => e.target.validity.valid && setBackground(e.target.files?.item(0))}
                />
              </div>
            </div>
            <div className="from-littleblack relative flex h-80 w-full flex-col bg-transparent bg-gradient-to-t">
              {/* 뒷배경 */}
              {background ? (
                typeof background === 'string' ? (
                  <img
                    className="absolute -z-10 h-full w-full object-cover"
                    src={`${Constants.imageUrl}${background}`}
                    alt=""
                    loading="lazy"
                  />
                ) : (
                  <img
                    className="absolute -z-10 h-full w-full object-cover"
                    src={URL.createObjectURL(background)}
                    alt=""
                    loading="lazy"
                  />
                )
              ) : (
                <div className="absolute -z-10 h-full w-full bg-[#333D4B] bg-cover bg-center bg-no-repeat" />
              )}

              {editMode && background && (
                <span className="absolute top-3 right-3 z-40 block h-6 w-6 rounded-full bg-red-700 ring-2 ring-white">
                  <div
                    className="flex h-full w-full cursor-pointer items-center justify-center text-white"
                    onClick={() => {
                      setBackground(undefined)
                    }}
                    style={{ transform: 'translate(0.1px, 0.1px)' }}
                  >
                    X
                  </div>
                </span>
              )}

              {/* 프로필 이미지 */}
              <div className="my-12 grid place-content-center">
                <label htmlFor="profile-upload" className="z-20">
                  {customProfile ? (
                    <img
                      className="h-32 w-32 cursor-pointer rounded-full object-cover"
                      src={
                        typeof customProfile === 'string'
                          ? `${Constants.imageUrl}${customProfile}`
                          : URL.createObjectURL(customProfile)
                      }
                      alt=""
                      loading="lazy"
                    />
                  ) : (
                    <img
                      className="h-32 w-32 cursor-pointer rounded-full object-cover"
                      src={`${Constants.imageUrl}${meRecoil.profile}`}
                      alt=""
                      loading="lazy"
                    />
                  )}
                </label>
                {editMode && (
                  <div>
                    <input
                      id="profile-upload"
                      type="file"
                      accept=".png, .jpeg, .jpg"
                      className="hidden"
                      onChange={(e) => {
                        handleProfileImageAdd
                        e.target.validity.valid && setCustomProfile(e.target.files?.item(0))
                      }}
                    />
                    {customProfile && (
                      <span className="absolute top-15 z-40 block h-6 w-6 rounded-full bg-red-700 ring-2 ring-white">
                        <div
                          className="flex h-full w-full cursor-pointer items-center justify-center text-white"
                          onClick={() => {
                            setCustomProfile(undefined)
                          }}
                          style={{ transform: 'translate(0.1px, 0.1px)' }}
                        >
                          X
                        </div>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* 히딘 프로필 이름 edit */}
              <div className="flex w-full items-end justify-between p-6">
                <div>
                  <p className="mb-1 text-sm text-white">
                    {meRecoil &&
                      `${meRecoil.klassGroupName || ''} ${meRecoil.studentNumber ? meRecoil.studentNumber + '번' : ''}`}
                  </p>
                  <h1 className="text-md text-overflow- font-semibold text-white">{meRecoil?.name}</h1>
                </div>
                <div className="flex items-center space-x-2 pb-0.5">
                  <input
                    type="file"
                    id="bg-upload"
                    className="hidden"
                    accept=".png, .jpeg, .jpg"
                    onChange={handleBackgroundImageAdd}
                  />
                  {editMode ? (
                    <>
                      <label htmlFor="bg-upload">
                        <div className="bg-littleblack cursor-pointer rounded-xl p-2 text-sm text-white">
                          배경 업로드
                        </div>
                      </label>

                      <div
                        className="bg-littleblack cursor-pointer rounded-xl p-2 text-sm text-white"
                        onClick={handleUpdateBackgroundImage}
                      >
                        완료
                      </div>
                    </>
                  ) : (
                    // @ts-ignore svg에 className을 왜...?
                    // 추후, Svg 용 atom 생성하여 대체
                    <Edit className="p-0.5" onClick={() => setEditMode(true)} />
                  )}
                </div>
              </div>
            </div>
            {/* 학교 마크 */}
            <div className="flex h-30 justify-center px-6">
              <div className="flex items-center justify-center space-x-2 font-semibold">
                {meRecoil?.school.mark && (
                  <IconButton
                    children={<img src={`${Constants.imageUrl}${meRecoil?.school.mark}`} alt="" loading="lazy" />}
                    className="h-8 w-8"
                  />
                )}

                <p className="text-black">{meRecoil?.school.name}</p>
                {meRecoil?.school?.stamp && (
                  <IconButton
                    children={<img src={`${Constants.imageUrl}${meRecoil?.school.stamp}`} alt="" loading="lazy" />}
                    className="h-8 w-8"
                  />
                )}
              </div>
            </div>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="card_shadow w-full overflow-hidden">
            <div>
              <div className="flex h-80 w-full flex-col items-center bg-[#FAFAFA]">
                {meRecoil && (
                  <img
                    className="mt-12 mb-2 h-32 w-32 cursor-pointer rounded-md object-cover"
                    src={`${Constants.imageUrl}${meRecoil.profile}`}
                    alt=""
                    loading="lazy"
                  />
                )}

                <table>
                  <tbody>
                    <tr>
                      <td className="text-grey-4 flex justify-between py-1 pr-3 text-xs">
                        <p>성</p>
                        <p>명</p>
                      </td>
                      <td className="text-sm font-bold tracking-widest text-black">{meRecoil?.name}</td>
                    </tr>
                    <tr>
                      <td className="text-grey-4 flex justify-between py-1 pr-3 text-xs">
                        <p>학</p>
                        <p>번</p>
                      </td>
                      <td className="text-sm font-bold text-black">
                        {meRecoil &&
                          `${meRecoil.klassGroupName || ''} ${meRecoil.studentNumber ? meRecoil.studentNumber + '번' : ''}`}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-grey-4 pr-3 text-xs">생년월일</td>
                      <td className="text-sm text-black">
                        {meRecoil?.birthDate && makeDateToString(meRecoil.birthDate, '.')}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-grey-4 pr-3 text-xs">유효기간</td>
                      <td className="text-sm text-gray-500">{DateUtil.getYear() + 1}.02.28</td>
                    </tr>
                    <tr>
                      <td className="text-grey-4 flex justify-between py-1 pr-3 text-xs">
                        <p>발</p>
                        <p>급</p>
                        <p>일</p>
                      </td>
                      <td className="text-sm text-gray-500">{DateUtil.getSchoolYear()}.03.02</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex h-30 flex-col justify-center px-6">
                <div>
                  <div className="mb-4 text-xs text-gray-700">
                    <p>* 위 학생은 본교 학생임을 증명합니다.</p>
                    <p>* 본 학생증을 타인에게 대여 및 양도할 수 없습니다.</p>
                  </div>

                  <div className="flex items-center justify-center space-x-2 font-semibold">
                    {meRecoil?.school.mark && (
                      <IconButton
                        children={<img src={`${Constants.imageUrl}${meRecoil?.school.mark}`} alt="" loading="lazy" />}
                        className="h-8 w-8"
                      />
                    )}
                    <p className="text-black">{meRecoil?.school.name}</p>
                    {meRecoil?.school.stamp && (
                      <IconButton
                        children={<img src={`${Constants.imageUrl}${meRecoil?.school.stamp}`} alt="" loading="lazy" />}
                        className="h-8 w-8"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>

      {modalOpen && (
        <div className={`bg-littleblack fixed inset-0 z-60 flex h-screen w-full items-center justify-center`}>
          <div className={`relative w-80 rounded-lg bg-white opacity-100`}>
            <div className="absolute top-3 right-3">
              <CloseButton onClick={() => setModalOpen(false)} />
            </div>
            <Section>
              <div className="w-full text-center text-lg font-bold text-gray-900">프로필 이미지 업데이트</div>

              <label htmlFor="image-upload">
                <div className="relative mx-auto h-24 w-24 cursor-pointer overflow-hidden rounded-full">
                  {customProfile ? (
                    <img
                      className="absolute h-full w-full rounded object-cover"
                      src={
                        typeof customProfile === 'string'
                          ? `${Constants.imageUrl}${customProfile}`
                          : URL.createObjectURL(customProfile)
                      }
                      alt=""
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className="h-24 w-24 cursor-pointer rounded-full bg-gray-400 bg-cover bg-center bg-no-repeat"
                      style={{ backgroundImage: `url(${meRecoil?.profile || ''})` }}
                    />
                  )}
                </div>
              </label>
              <div className="w-full text-center">이미지를 업로드해주세요.</div>
              <input
                type="file"
                id="image-upload"
                className="hidden"
                accept=".png, .jpeg, .jpg"
                onChange={handleProfileImageAdd}
              />
              {customProfile && (
                <Button.lg children="프로필 변경하기" onClick={handleUpdateProfile} className="filled-primary w-full" />
              )}
            </Section>
          </div>
        </div>
      )}
    </>
  )
}
