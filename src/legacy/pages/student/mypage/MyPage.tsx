import preval from 'preval.macro'
import { useState } from 'react'
import Barcode from 'react-barcode'
import { Link, useHistory } from 'react-router-dom'
import { useRecoilValue } from 'recoil'
import { ReactComponent as RightArrow } from '@/legacy/assets/svg/mypage-right-arrow.svg'
import { StudentIDCard } from '@/legacy/components'
import { Blank, IconButton, Section, TopNavbar } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { Constants } from '@/legacy/constants'
import { useParentGetChildrenInfo } from '@/legacy/container/parent-get-children-info'
import { ResponseUserDto, Role, ScoreUse } from '@/legacy/generated/model'
import { meState } from '@/legacy/store'
import { globalEnv } from '@/legacy/util/global-env'
import { useLogout } from '@/legacy/util/hooks'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/swiper.min.css'

export function MyPage() {
  const logout = useLogout()

  const meRecoil = useRecoilValue(meState)
  const { childrenInfoList, refetch, deleteChild } = useParentGetChildrenInfo()
  const localChildId = +(localStorage.getItem('child-user-id') || '0')
  const history = useHistory()

  const [selectedGuide, setSelectedGuide] = useState(false)
  const [delStudent, setDelStudent] = useState<ResponseUserDto | undefined>()

  const [isLoading, setLoading] = useState(false)

  const handleChangeChild = (child: ResponseUserDto) => {
    if (!child.id) {
      alert('해당 자녀로 로그인하던 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요')
    }
    localStorage.setItem('child-user-id', JSON.stringify(child.id))
    refetch()

    if (!child?.klassGroupName) {
      setDelStudent(child)
    }
  }

  const BARCODE_FORMAT = meRecoil?.school.barcodeType || 'CODE128'
  return (
    <div>
      <TopNavbar
        title="더보기"
        left={<div className="h-15 w-10"></div>}
        right={
          <div
            className="text-brand-1"
            onClick={() => {
              setLoading(true)
              window?.location?.reload()
            }}
          >
            새로고침
          </div>
        }
      />
      <div className="overflow-hidden">
        {/*{loading && <Blank />}*/}
        {isLoading && <Blank />}

        {meRecoil?.role === Role.PARENT ? (
          <Swiper
            initialSlide={childrenInfoList.findIndex((el) => el.id === localChildId)}
            slidesPerView={1.1}
            spaceBetween={10}
            className="mySwiper mx-2 mt-2"
          >
            {childrenInfoList?.map((child: ResponseUserDto) => (
              <SwiperSlide key={child.id}>
                <div className="card_shadow w-full overflow-hidden">
                  <div>
                    <div className="flex h-80 w-full flex-col items-center bg-[#FAFAFA]">
                      <div
                        className="z-10 mt-12 mb-2 h-32 w-32 cursor-pointer rounded-md bg-white bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: `url(${Constants.imageUrl}${child?.profile})` }}
                      />

                      <table>
                        <tbody>
                          <tr>
                            <td className="text-grey-4 flex justify-between py-1 pr-3 text-xs">
                              <p>성</p>
                              <p>명</p>
                            </td>
                            <td className="text-sm font-bold tracking-widest text-black">{child?.name}</td>
                          </tr>
                          <tr>
                            <td className="text-grey-4 flex justify-between py-1 pr-3 text-xs">
                              <p>학</p>
                              <p>번</p>
                            </td>

                            <td className="text-sm font-bold text-black">
                              {`${child?.klassGroupName || ''} ${child?.studentNumber || ''}번`}
                            </td>
                          </tr>
                          {/* <tr>
                          <td className="text-xs text-grey-4 pr-3">생년월일</td>
                          <td className="text-black text-sm">
                            {child?.birthDate && makeDateToString(child.birthDate, '.')}
                          </td>
                        </tr> */}
                        </tbody>
                      </table>
                      {child?.school.schoolType === 'HS' && child.school.isScoreActive === ScoreUse.USE_PUBLIC && (
                        <div className="mt-2">
                          <ButtonV2
                            color="gray400"
                            variant="outline"
                            size={40}
                            onClick={() => {
                              history.push(`/student/score/${child.id}/school-exam`)
                            }}
                          >
                            성적확인
                          </ButtonV2>
                        </div>
                      )}
                    </div>

                    <div className="flex h-30 flex-col justify-center px-6">
                      <div>
                        <div className="flex items-center justify-center space-x-2 font-semibold">
                          {child?.school?.mark && (
                            <IconButton
                              children={
                                <img src={`${Constants.imageUrl}${child?.school?.mark}`} alt="" loading="lazy" />
                              }
                              className="h-8 w-8"
                            />
                          )}
                          <p className="text-black">{child?.school?.name}</p>
                          {child?.school?.stamp && (
                            <IconButton
                              children={
                                <img src={`${Constants.imageUrl}${child?.school?.stamp}`} alt="" loading="lazy" />
                              }
                              className="h-8 w-8"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  {child?.id === localChildId ? (
                    <Button.lg
                      children={
                        <div className="flex w-full justify-between">
                          <div>&lt;</div>
                          <div>현재 선택된 자녀</div>
                          <div>&gt;</div>
                        </div>
                      }
                      disabled
                      className="filled-gray w-full"
                    />
                  ) : (
                    <Button.lg
                      children={
                        <div className="flex w-full justify-between">
                          <div>&lt;</div>
                          <div>자녀 선택</div>
                          <div>&gt;</div>
                        </div>
                      }
                      onClick={() => handleChangeChild(child)}
                      className="filled-primary w-full"
                    />
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <>{meRecoil && <StudentIDCard meRecoil={meRecoil} />}</>
        )}

        {meRecoil?.barcode && meRecoil?.role !== Role.PARENT && (
          <div className="flex w-full min-w-max justify-center">
            {/* @ts-ignore */}
            <Barcode value={meRecoil?.barcode || ''} format={BARCODE_FORMAT} />
          </div>
        )}
        <div className="flex flex-col px-5 py-5">
          <Link to="/student/info" className="-mx-5 border-b px-5 py-4 font-semibold">
            내 정보
          </Link>
          {meRecoil?.role === Role.USER &&
            meRecoil?.school.schoolType === 'HS' &&
            meRecoil.school.isScoreActive === ScoreUse.USE_PUBLIC && (
              <Link
                to={`/student/score/${meRecoil?.id}/school-exam`}
                className="-mx-5 border-b px-5 py-4 font-semibold"
              >
                성적확인
              </Link>
            )}
          {meRecoil?.role === Role.USER && (
            <Link to="/student/self-test" className="-mx-5 border-b px-5 py-4 font-semibold">
              자기 평가
            </Link>
          )}
          {meRecoil?.role === Role.USER && (
            <Link to="/student/study" className="-mx-5 border-b px-5 py-4 font-semibold">
              학습/진로 목표
            </Link>
          )}
          <Link to="/student/notification-settings" className="-mx-5 border-b px-5 py-4 font-semibold">
            알림 설정
          </Link>
          <a
            href="https://superstudy.channel.io/lounge"
            target="blank"
            className="-mx-5 cursor-pointer border-b px-5 py-4 font-semibold"
          >
            문의하기
          </a>
          <Link
            to={`/privacy-policy/${meRecoil?.schoolId}`}
            target="blank"
            className="-mx-5 cursor-pointer border-b px-5 py-4 font-semibold"
          >
            개인정보처리방침
          </Link>

          <Link to={`/terms-of-use`} target="blank" className="-mx-5 cursor-pointer border-b px-5 py-4 font-semibold">
            이용약관
          </Link>
          <div
            className="-mx-5 cursor-pointer border-b px-5 py-4 font-semibold"
            onClick={() => setSelectedGuide(!selectedGuide)}
          >
            슈퍼스쿨 사용안내
          </div>
          {selectedGuide && (
            <div className="border-gray-6 -mx-5 border-b-2 bg-gray-100">
              <a
                href={`https://superschoolofficial.notion.site/e8ebd5829e2846ab8e97417c7ab589f7`}
                target="_blank"
                rel="noreferrer"
                download
              >
                <div className="ml-10 flex cursor-pointer items-center justify-between py-1">
                  <div className="text-gray-1 font-bold">학생 사용안내</div>
                  <RightArrow />
                </div>
              </a>
              <a
                href={`https://superschoolofficial.notion.site/70491392ea96454f8688cffee395c1c7`}
                target="_blank"
                rel="noreferrer"
                download
              >
                <div className="ml-10 flex cursor-pointer items-center justify-between py-1">
                  <div className="text-gray-1 font-bold">학부모 사용안내</div>
                  <RightArrow />
                </div>
              </a>
              <a href={`https://web.superschool.link/AboutSuperSchool`} target="_blank" rel="noreferrer">
                <div className="ml-10 flex cursor-pointer items-center justify-between py-1">
                  <div className="text-gray-1 font-bold">사용안내 동영상</div>
                  <RightArrow />
                </div>
              </a>
            </div>
          )}
          {/* <a
          href={`${
            meRecoil?.role === Role.PARENT
              ? 'https://superstudy-image.s3.ap-northeast-2.amazonaws.com/tutorials/%ED%8A%9C%ED%86%A0%EB%A6%AC%EC%96%BC%20%ED%95%99%EB%B6%80%EB%AA%A8%EC%9A%A9_2022.10.31.pdf'
              : 'https://superstudy-image.s3.ap-northeast-2.amazonaws.com/tutorials/%ED%8A%9C%ED%86%A0%EB%A6%AC%EC%96%BC%20%ED%95%99%EC%83%9D%EC%9A%A9.pdf'
          }`}
          target="blank"
          className="-mx-5 cursor-pointer border-b px-5 py-4 font-semibold"
        >
          사용설명서
        </a> */}

          <Link to="/student/announcement">
            <div className="-mx-5 cursor-pointer border-b px-5 py-4 font-semibold">슈퍼스쿨 공지사항</div>
          </Link>

          <div onClick={() => logout()} className="-mx-5 cursor-pointer border-b px-5 py-4 font-semibold">
            로그아웃
          </div>

          <div className="my-5 w-full text-center text-sm text-gray-500">
            <div className="text-white">
              v{globalEnv.version} build at {preval`module.exports = new Date().toLocaleString().split("├")[0]`}
            </div>
            {/* {meRecoil?.school.name} <br /> */}
            Copyright 2022. SUPERSCHOOL all right reserved.
          </div>
        </div>
      </div>

      {delStudent && (
        <div
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          className="bg-littleblack fixed inset-0 z-100 m-0 flex h-screen w-full items-center justify-center"
        >
          <div className="relative rounded-lg bg-white opacity-100 shadow-sm">
            <Section>
              <div className="text-center text-2xl font-bold">자녀 정보 삭제 안내</div>
              <div className="text-lg">
                <span className="font-bold">{delStudent?.school?.name}</span>{' '}
                <span className="font-bold">{delStudent?.name}</span> 학생의 학급 정보가 없습니다.
                <br />
                <br />
                <span className="font-bold">{delStudent?.name}</span> 학생이{' '}
                <span className="font-bold">{delStudent?.school?.name}</span> 재학중이면{' '}
                <span className="filled-blue rounded-md p-1 text-sm">유지</span> 버튼을 눌러주세요. <br />
                <span className="font-bold">{delStudent?.name}</span> 학생의 학급 정보가 입력된 후 사용 가능합니다.
                <br />
                <br />
                재학중이 아니면 <span className="filled-primary rounded-md p-1 text-sm">삭제</span> 버튼을 눌러주세요.
              </div>
              <div className="h-4"></div>

              <div className="flex justify-between space-x-2">
                <Button.lg children="유지" onClick={() => setDelStudent(undefined)} className="filled-blue w-full" />
                <Button.lg
                  children="삭제"
                  onClick={() => {
                    setDelStudent(undefined)
                    deleteChild(delStudent?.id)
                  }}
                  className="filled-primary w-full"
                />
              </div>
            </Section>
          </div>
        </div>
      )}
    </div>
  )
}
