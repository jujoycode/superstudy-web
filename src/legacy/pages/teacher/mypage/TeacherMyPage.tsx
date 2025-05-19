import { useState } from 'react'
import { Link } from 'react-router-dom'

import BgLogo from '@/assets/images/Intersect.png'
import { ReactComponent as RightArrow } from '@/assets/svg/mypage-right-arrow.svg'
import { ReactComponent as SvgUser } from '@/assets/svg/user.svg'
import { useUserStore } from '@/stores/user'
import { ErrorBlank } from '@/legacy/components'
import { BackButton, IconButton, Section, TopNavbar } from '@/legacy/components/common'
import { Icon } from '@/legacy/components/common/icons'
import { Constants } from '@/legacy/constants'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { useLogout } from '@/legacy/util/hooks'
import { checkNewVersion } from '@/legacy/util/status'

enum selectedType {
  none = 1,
  myinfo,
  question,
  manual,
  superstudy,
  logout,
}

export function TeacherMyPage() {
  const logout = useLogout()
  const { t } = useLanguage()

  checkNewVersion()

  const { me: meRecoil } = useUserStore()

  const [selectedItem, setSelectedItem] = useState(selectedType.myinfo)

  const selectedCheck = (item: selectedType) => {
    if (item === selectedItem) {
      setSelectedItem(selectedType.none)
    } else {
      setSelectedItem(item)
    }
  }

  const spacedName = (name: string) => {
    return name.split('').join('  ')
  }

  if (!meRecoil) {
    return <ErrorBlank />
  }

  return (
    <div className="flex h-full flex-col">
      <TopNavbar title="더보기" left={<BackButton />} />
      <div className="scroll-box flex-1 overflow-y-auto pb-16">
        <div className="mt-4 flex h-[428px] justify-center md:mt-16 md:px-10">
          <div className="relative w-80 rounded-lg border border-zinc-100 bg-white shadow">
            <div className="flex h-12 items-center justify-center rounded-t-lg bg-black">
              <div className="text-center font-['Pretendard'] text-xl font-semibold tracking-[0.1em] text-white">
                {t('teacher_id')}
              </div>
            </div>
            <div className="flex w-full flex-col items-center bg-white">
              <div className="flex w-full flex-col items-center bg-white">
                <div className="relative z-10 mt-6 mb-4 w-40 rounded-lg md:mt-8">
                  <img
                    src={`${Constants.imageUrl}${meRecoil?.profile}`}
                    alt="프로필 이미지"
                    loading="lazy"
                    className="h-48 w-40 rounded-lg object-cover"
                    onError={({ currentTarget }) => {
                      currentTarget.onerror = null
                      currentTarget.src = SvgUser as unknown as string
                      currentTarget.className = 'w-full'
                    }}
                  />
                </div>
                <img className="absolute right-0 bottom-10 h-auto w-auto" src={BgLogo} alt="" />
                <p className="z-10 text-2xl font-bold">{spacedName(meRecoil?.name)}</p>
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
        </div>

        <Section className="space-y-0 px-4">
          <Link to="/teacher/update">
            <div
              className="border-gray-6 flex cursor-pointer items-center justify-between border-b-2 py-3"
              onClick={() => selectedCheck(selectedType.myinfo)}
            >
              <div className="text-gray-1 font-sfpro font-bold">내 정보</div>
              <RightArrow />
            </div>
          </Link>
          <Link to="/teacher/notification-settings">
            <div
              className="border-gray-6 flex cursor-pointer items-center justify-between border-b-2 py-3"
              onClick={() => selectedCheck(selectedType.myinfo)}
            >
              <div className="text-gray-1 font-sfpro font-bold">알림 설정</div>
              <RightArrow />
            </div>
          </Link>
          <a href="https://superstudy.channel.io/lounge" target="blank">
            <div
              className="border-gray-6 flex cursor-pointer items-center justify-between border-b-2 py-3"
              onClick={() => selectedCheck(selectedType.question)}
            >
              <div className="text-gray-1 font-sfpro font-bold">문의하기</div>
              <RightArrow />
            </div>
          </a>

          <div
            className="border-gray-6 cursor-pointer border-b-2 py-3"
            onClick={() => selectedCheck(selectedType.manual)}
          >
            <div className="flex items-center justify-between">
              <div className="text-gray-1 font-sfpro font-bold">슈퍼스쿨 사용안내</div>
              {selectedItem === selectedType.manual ? <Icon.ChevronDown /> : <RightArrow />}
            </div>
          </div>
          {selectedItem === selectedType.manual && (
            <div className="border-gray-6 border-b-2 bg-gray-100">
              <a
                href={`https://superschoolofficial.notion.site/f9bae37feef94ee7b9f886b5e074fdac`}
                target="_blank"
                rel="noreferrer"
                download
              >
                <div className="flex cursor-pointer items-center justify-between py-1">
                  <div className="text-gray-1 font-sfpro pl-4 font-bold">교사 사용안내</div>
                  <RightArrow />
                </div>
              </a>
              <a
                href={`https://superschoolofficial.notion.site/e8ebd5829e2846ab8e97417c7ab589f7`}
                target="_blank"
                rel="noreferrer"
                download
              >
                <div className="flex cursor-pointer items-center justify-between py-1">
                  <div className="text-gray-1 font-sfpro pl-4 font-bold">학생 사용안내</div>
                  <RightArrow />
                </div>
              </a>
              <a
                href={`https://superschoolofficial.notion.site/70491392ea96454f8688cffee395c1c7`}
                target="_blank"
                rel="noreferrer"
                download
              >
                <div className="flex cursor-pointer items-center justify-between py-1">
                  <div className="text-gray-1 font-sfpro pl-4 font-bold">학부모 사용안내</div>
                  <RightArrow />
                </div>
              </a>
              <a href={`https://web.superschool.link/AboutSuperSchool`} target="_blank" rel="noreferrer">
                <div className="flex cursor-pointer items-center justify-between py-1">
                  <div className="text-gray-1 font-sfpro pl-4 font-bold">사용안내 동영상</div>
                  <RightArrow />
                </div>
              </a>
            </div>
          )}
          <div
            className="border-gray-6 cursor-pointer border-b-2 py-3"
            onClick={() => selectedCheck(selectedType.superstudy)}
          >
            <div className="flex items-center justify-between">
              <div className="text-gray-1 font-sfpro font-bold">슈퍼스쿨 소개자료</div>
              {selectedItem === selectedType.superstudy ? <Icon.ChevronDown /> : <RightArrow />}
            </div>
          </div>
          {selectedItem === selectedType.superstudy && (
            <div className="border-gray-6 border-b-2 bg-gray-100">
              <a href={`https://superstudy.kr`} target="_blank" rel="noreferrer">
                <div className="flex cursor-pointer items-center justify-between py-1">
                  <div className="text-gray-1 font-sfpro pl-4 font-bold">홈페이지</div>
                  <RightArrow />
                </div>
              </a>
              <a href={`https://www.youtube.com/channel/UCuUvswD4AMOlBnRE1jTkznA`} target="_blank" rel="noreferrer">
                <div className="flex cursor-pointer items-center justify-between py-1">
                  <div className="text-gray-1 font-sfpro pl-4 font-bold">유투브</div>
                  <RightArrow />
                </div>
              </a>
              <a href={`https://www.instagram.com/superstudy_official_/`} target="_blank" rel="noreferrer">
                <div className="flex cursor-pointer items-center justify-between py-1">
                  <div className="text-gray-1 font-sfpro pl-4 font-bold">인스타그램</div>
                  <RightArrow />
                </div>
              </a>
              <a href={`https://m.facebook.com/profile.php?id=100083550129006&_rdr`} target="_blank" rel="noreferrer">
                <div className="flex cursor-pointer items-center justify-between py-1">
                  <div className="text-gray-1 font-sfpro pl-4 font-bold">페이스북</div>
                  <RightArrow />
                </div>
              </a>
              <a href={`https://blog.naver.com/superschool-do`} target="_blank" rel="noreferrer">
                <div className="flex cursor-pointer items-center justify-between py-1">
                  <div className="text-gray-1 font-sfpro pl-4 font-bold">블로그</div>
                  <RightArrow />
                </div>
              </a>
            </div>
          )}

          <Link to="/teacher/announcement">
            <div className="border-gray-6 flex cursor-pointer items-center justify-between border-b-2 py-3">
              <div className="text-gray-1 font-sfpro font-bold">슈퍼스쿨 공지사항</div>
              <RightArrow />
            </div>
          </Link>

          <div
            className="border-gray-6 flex cursor-pointer items-center justify-between border-b-2 py-3"
            onClick={() => {
              logout()
            }}
          >
            <div className="text-gray-1 font-sfpro font-bold">로그아웃</div>
            <RightArrow />
          </div>
        </Section>
      </div>
    </div>
  )
}
