import { t } from 'i18next'
import { useState } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { BackButton, Section, TopNavbar } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { ParentInfoCard } from '@/legacy/components/MyInfo/ParentInfoCard'
import { useStudentKlassHistory } from '@/legacy/container/student-klass-history'
import { Role } from '@/legacy/generated/model'
import { isUpdateMeState, meState } from '@/stores'
import { MyDeletePage } from './MyDeletePage'
import { MyInfoUpdatePage } from './MyInfoUpdatePage'

export function MyInfoPage() {
  const me = useRecoilValue(meState)
  const [isUpdateMe, setIsUpdateMe] = useRecoilState(isUpdateMeState)
  const [isDeleteMe, setIsDeleteMe] = useState(false)

  const { klassHistoryList } = useStudentKlassHistory()

  const isNotParent = me?.role !== Role.PARENT

  if (!me) return null

  if (isUpdateMe) {
    return <MyInfoUpdatePage me={me} setIsUpdateMe={setIsUpdateMe} />
  }

  if (isDeleteMe) {
    return <MyDeletePage setIsDeleteMe={setIsDeleteMe} />
  }

  return (
    <div>
      <TopNavbar
        title="내 정보"
        left={
          <div className="h-15">
            <BackButton className="h-15" />
          </div>
        }
      />
      <div className="scroll-box h-screen-4 overflow-auto">
        <Section>
          <div>
            <div className="text-lg font-bold text-gray-800">이름</div>
            <div className="text-grey-2">{me?.name}</div>
          </div>
          {me?.role === Role.USER && (
            <div>
              <div className="text-lg font-bold text-gray-800">{t(`nickName`, '별명')}</div>
              <div className="text-grey-2">{me?.nickName}</div>
            </div>
          )}
          <div>
            <div className="text-lg font-bold text-gray-800">이메일</div>
            <div className="text-grey-2">{me?.email}</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-800">전화번호</div>
            <div className="text-grey-2">{me?.phone}</div>
          </div>

          {isNotParent && (
            <>
              <div>
                <div className="text-lg font-bold text-gray-800">학교</div>
                <div className="text-grey-2">{me?.school?.name}</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-800">반/번호</div>
                <div className="text-grey-2">
                  {klassHistoryList
                    ?.sort((a, b) => +(a?.group?.year || 0) - +(b?.group?.year || 0))
                    .map((klass) => (
                      <>
                        {klass?.group?.year} {me?.school?.name} {klass?.group?.name} {klass?.studentNumber}번
                        <br />
                      </>
                    ))}
                </div>
              </div>
            </>
          )}
          {isNotParent && (
            <>
              <div>
                <div className="text-lg font-bold text-gray-800">생년월일</div>
                <div className="text-grey-2">{me?.birthDate}</div>
              </div>
              {/* <div>
              <div className="text-lg font-bold text-gray-800">희망진로</div>
              <div className="text-grey-2">{me?.hopePath}</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-800">희망학과</div>
              <div className="text-grey-2">{me?.hopeMajor}</div>
            </div> */}
            </>
          )}
          <br />
        </Section>
        <div className="w-full px-4">
          <Button.lg children="수정하기" onClick={() => setIsUpdateMe(true)} className="filled-primary w-full" />

          <ParentInfoCard me={me} isNotParent={isNotParent} />
        </div>

        <div className="mt-2 w-full px-4">
          <Button.lg children="회원탈퇴" onClick={() => setIsDeleteMe(true)} className="filled-primary w-full" />
        </div>

        <div className="h-24 w-full" />
      </div>
    </div>
  )
}
