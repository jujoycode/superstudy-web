import { useState } from 'react'

import NODATA from '@/assets/images/no-data.png'
import SvgUser from '@/assets/images/no_profile.png'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { IBBlank } from '@/legacy/components/common/IBBlank'
import { Typography } from '@/legacy/components/common/Typography'
import { Constants } from '@/legacy/constants'
import { useIBProfileGetById } from '@/legacy/container/ib-cas'
import { ResponseIBPortfolioDto, ResponseUserDto } from '@/legacy/generated/model'
import { makeStudNum5 } from '@/legacy/util/status'

import { IbCASProfile } from './IbCASProfile'

type ProfileType = 'create' | 'update'
interface CASProfileProps {
  data?: ResponseIBPortfolioDto
  refetch: () => void
  me: ResponseUserDto
}

function CASProfile({ data, refetch, me }: CASProfileProps) {
  const [profileModal, setProfileModal] = useState<boolean>(false)
  const [type, setType] = useState<ProfileType>('create')
  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const { data: profile, isLoading } = useIBProfileGetById(me?.id || 0)

  const handleSuccess = () => {
    setAlertMessage(`프로필이\n저장되었습니다`)
    setProfileModal(!profileModal)
    refetch()
  }

  const handleClick = (type: ProfileType) => {
    setProfileModal(!profileModal)
    setType(type)
  }

  return (
    <>
      {isLoading ? (
        <section className={`flex h-80 w-[416px] rounded-xl bg-white p-6`}>
          <IBBlank type="section" />
        </section>
      ) : (
        <section
          className={`flex w-[416px] flex-col gap-6 self-start rounded-xl bg-white p-6 ${
            data === undefined && 'border-primary-orange-400 border shadow-[0_0_15px_5px_0_4px_8px_0_#ffe8db]'
          }`}
        >
          <div className="flex flex-row items-center justify-between">
            <Typography variant="title1">내 프로필</Typography>
            <div className="flex flex-row items-center">
              <Typography variant="body3" className="text-primary-gray-700">
                지도교사
              </Typography>
              <Typography variant="body3" className="text-primary-gray-400 mx-1">
                ·
              </Typography>
              <Typography variant="body3" className="text-primary-gray-700">
                {data?.profile.mentor ? `${data.profile.mentor.name} 선생님` : '미지정'}
              </Typography>
            </div>
          </div>
          <div className="flex items-center gap-4 py-2 select-none">
            <div className="flex h-12 w-12 overflow-hidden rounded-xl">
              <img
                className="mx-auto h-12 w-12 rounded-xl"
                src={`${Constants.imageUrl}${me?.profile}`}
                alt=""
                loading="lazy"
                onError={({ currentTarget }) => {
                  currentTarget.onerror = null // prevents looping
                  currentTarget.src = SvgUser
                  currentTarget.className = 'w-full'
                }}
              />
            </div>
            <div className="flex h-12 flex-1 flex-col justify-between gap-1">
              <div className="flex items-center">
                <Typography variant="title3">{me?.name.length > 5 ? `${me?.name.slice(0, 5)}` : me?.name}</Typography>
                <span className="mx-1">·</span>
                <Typography variant="title3">
                  {makeStudNum5({
                    grade: me.groupGrade || 0,
                    classNum: me.groupKlass || 0,
                    studentNum: me?.studentNumber,
                  })}
                </Typography>
              </div>
              {/* TODO : 서버에서 전달받은 코드 사용 */}
              <Typography variant="caption2" className="text-primary-gray-500 font-medium">
                응시코드 {profile?.ibCode || '-'}
              </Typography>
            </div>
          </div>
          <span>
            {data === undefined ? (
              <div className="flex flex-col items-center justify-center gap-6 py-20">
                <div className="h-12 w-12 px-[2.50px]">
                  <img src={NODATA} className="h-12 w-[43px] object-cover" />
                </div>
                <Typography
                  variant="body2"
                  className="text-center"
                >{`내 CAS 프로필이 없습니다.\n프로필을 생성해주세요.`}</Typography>
                <ButtonV2 variant="solid" color="orange100" size={40} onClick={() => handleClick('create')}>
                  프로필 생성하기
                </ButtonV2>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {data.profile.casInfo?.map((qna) => {
                  return (
                    <div key={qna.question} className="flex flex-col gap-1">
                      <Typography variant="body3" className="text-primary-gray-500">
                        {qna.question}
                      </Typography>
                      <Typography variant="body3" className="font-medium">
                        {qna.answer}
                      </Typography>
                    </div>
                  )
                })}
              </div>
            )}
          </span>
          {data && (
            <footer className="mt-auto text-right">
              <ButtonV2 size={40} variant="outline" color="gray400" onClick={() => handleClick('update')}>
                수정
              </ButtonV2>
            </footer>
          )}
          {profileModal && (
            <IbCASProfile
              modalOpen={profileModal}
              type={type}
              profileData={data?.profile}
              setModalClose={() => setProfileModal(!profileModal)}
              onSuccess={handleSuccess}
            />
          )}
          {alertMessage && (
            <AlertV2 message={alertMessage} confirmText="확인" onConfirm={() => setAlertMessage(null)} />
          )}
        </section>
      )}
    </>
  )
}

export default CASProfile
