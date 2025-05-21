import { t } from 'i18next'
import { useState } from 'react'

import { ReactComponent as RightArrow } from '@/assets/svg/mypage-right-arrow.svg'
import { useHistory } from '@/hooks/useHistory'
import { BackButton, Section, TopNavbar } from '@/legacy/components/common'
import { Icon } from '@/legacy/components/common/icons'
import { UserContainer } from '@/legacy/container/user'
import { OutingUse } from '@/legacy/generated/model'

export function TeacherApplyPage() {
  const { push } = useHistory()
  const { me } = UserContainer.useContext()
  const [selectedFieldtrip, setSelectedFieldtrip] = useState(false)

  return (
    <>
      <div className="block md:hidden">
        <TopNavbar title="출결" left={<BackButton onClick={() => push('/')} />} />

        <Section>
          <div
            className="flex cursor-pointer items-center justify-between border-b-2 border-gray-200 py-3"
            onClick={() => push('/teacher/attendance')}
          >
            <div>
              <div className="font-sfpro text-lg font-bold text-gray-800">출석부</div>
              <div className="text-gray-5 text-sm">반별 출석상태 조회/관리</div>
            </div>
            <RightArrow />
          </div>
          <div
            className="flex cursor-pointer items-center justify-between border-b-2 border-gray-200 py-3"
            onClick={() => push('/teacher/timetable')}
          >
            <div>
              <div className="font-sfpro text-lg font-bold text-gray-800">시간표/출석체크</div>
              <div className="text-gray-5 text-sm">교사별/학급별 시간표 조회 및 출석체크</div>
            </div>
            <RightArrow />
          </div>
          {me?.school?.isOutingActive !== OutingUse.NONE && (
            <div
              className="flex cursor-pointer items-center justify-between border-b-2 border-gray-200 py-3"
              onClick={() => push('/teacher/outing')}
            >
              <div>
                <div className="font-sfpro text-lg font-bold text-gray-800">확인증</div>
                <div className="text-gray-5 text-sm">조퇴증,외출증,확인증 / 조퇴,외출,확인 전 작성 서류</div>
              </div>
              <RightArrow />
            </div>
          )}
          <div
            className="flex cursor-pointer items-center justify-between border-b-2 border-gray-200 py-3"
            onClick={() => push('/teacher/absent')}
          >
            <div>
              <div className="font-sfpro text-lg font-bold text-gray-800">{t(`absentTitle`, '결석신고서')}</div>
              <div className="text-gray-5 text-sm">구,결석계 / 조퇴,외출,결과,지각,결석 후 작성 서류</div>
            </div>
            <RightArrow />
          </div>
          <div
            className={`flex items-center justify-between pt-3 ${
              !selectedFieldtrip && 'border-b-2 pb-3'
            } cursor-pointer border-gray-200`}
            onClick={() => setSelectedFieldtrip(!selectedFieldtrip)}
          >
            <div>
              <div className="font-sfpro text-lg font-bold text-gray-800">체험학습</div>
              <div className="text-gray-5 text-sm">신청,통보,결과보고서 / 체험학습 관련 작성 서류</div>
            </div>
            {selectedFieldtrip ? <Icon.ChevronDown /> : <RightArrow />}
          </div>
          {selectedFieldtrip && (
            <div className="border-b-2 border-gray-200 bg-gray-100">
              <div
                className="flex cursor-pointer items-center justify-between py-1"
                onClick={() => push('/teacher/fieldtrip')}
              >
                <div className="font-sfpro pl-4 font-bold text-gray-900">신청서</div>
                <RightArrow />
              </div>

              <div
                className="flex cursor-pointer items-center justify-between py-1"
                onClick={() => push('/teacher/fieldtrip/notice')}
              >
                <div className="font-sfpro pl-4 font-bold text-gray-900">통보서</div>
                <RightArrow />
              </div>

              <div
                className="flex cursor-pointer items-center justify-between py-1"
                onClick={() => push('/teacher/fieldtrip/result')}
              >
                <div className="font-sfpro pl-4 font-bold text-gray-900">결과보고서</div>
                <RightArrow />
              </div>
            </div>
          )}

          <div
            className="flex cursor-pointer items-center justify-between border-b-2 border-gray-200 py-3"
            onClick={() => push('/teacher/studentcard')}
          >
            <div>
              <div className="font-sfpro text-lg font-bold text-gray-800">학생정보</div>
              <div className="text-gray-5 text-sm">학생 신상정보 관리, 상담카드</div>
            </div>
            <RightArrow />
          </div>
          <div
            className="hidden cursor-pointer items-center justify-between border-b-2 border-gray-200 py-3 md:flex"
            onClick={() => push('/teacher/history')}
          >
            <div>
              <div className="font-sfpro text-lg font-bold text-gray-800">출결서류관리</div>
              <div className="text-gray-5 text-sm">{`학생증, ${t(
                `absentTitle`,
                '결석신고서',
              )}, 체험학습 이력관리`}</div>
            </div>
            <RightArrow />
          </div>
          <div
            className="flex cursor-pointer items-center justify-between border-b-2 border-gray-200 py-3"
            onClick={() => push('/teacher/pointlogs')}
          >
            <div>
              <div className="font-sfpro text-lg font-bold text-gray-800">상벌점관리</div>
              <div className="text-gray-5 text-sm">상벌점 부여 및 조회</div>
            </div>
            <RightArrow />
          </div>
        </Section>
      </div>
    </>
  )
}
