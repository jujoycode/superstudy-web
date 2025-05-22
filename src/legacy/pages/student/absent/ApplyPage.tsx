import { t } from 'i18next'
import { useState } from 'react'

import { ReactComponent as RightArrow } from '@/assets/svg/mypage-right-arrow.svg'
import { useHistory } from '@/hooks/useHistory'
import { SuperModal } from '@/legacy/components'
import { Section, TopNavbar } from '@/legacy/components/common'
import { UserContainer } from '@/legacy/container/user'
import { OutingUse } from '@/legacy/generated/model'

export function ApplyPage() {
  const { push } = useHistory()
  const { me } = UserContainer.useContext()
  const [modalopen, setModalopen] = useState(false)

  return (
    <>
      <TopNavbar title="출결" left={<div className="h-15 w-10" />} />

      <Section>
        {me?.school.isOutingActive !== OutingUse.NONE && (
          <div
            onClick={() => push('/student/outing')}
            className="flex cursor-pointer items-center justify-between border-b border-gray-50 pb-4"
          >
            <div>
              <div className="font-sfpro font-bold text-gray-800">확인증</div>
              <div className="text-sm text-gray-500">조퇴, 외출, 확인 전 작성 서류</div>
            </div>
            <RightArrow />
          </div>
        )}
        <div
          onClick={() => push('/student/absent')}
          className="flex cursor-pointer items-center justify-between border-b border-gray-50 pb-4"
        >
          <div>
            <div className="font-sfpro font-bold text-gray-800">{t(`absentTitle`, '결석신고서')}</div>
            <div className="text-sm text-gray-500">조퇴, 외출, 지각, 결과, 결석 후 작성 서류</div>
          </div>
          <RightArrow />
        </div>
        <div
          onClick={() => push('/student/fieldtrip')}
          className="flex cursor-pointer items-center justify-between border-b border-gray-50 pb-4"
        >
          <div>
            <div className="font-sfpro font-bold text-gray-800">체험학습</div>
            <div className="text-sm text-gray-500">체험학습, 가정학습 전후 작성하는 서류</div>
          </div>
          <RightArrow />
        </div>
        <div
          onClick={() => push('/student/pointlogs')}
          className="flex cursor-pointer items-center justify-between border-b border-gray-50 pb-4"
        >
          <div>
            <div className="font-sfpro font-bold text-gray-800">상벌점기록</div>
            <div className="text-sm text-gray-500">학교 생활 중 받은 상벌점기록</div>
          </div>
          <RightArrow />
        </div>
      </Section>
      <SuperModal modalOpen={modalopen} setModalClose={() => setModalopen(false)}>
        <div className="mt-14 flex w-full items-center justify-center">
          <button
            children="🏔 교외 체험학습"
            className="border-primary-800 text-primary-800 w-4/5 rounded-lg border bg-white py-5 font-bold"
          />
        </div>
        <div className="my-5 mb-10 flex w-full items-center justify-center">
          <button
            children="🏠 가정학습"
            className="w-4/5 rounded-lg border border-blue-500 bg-white py-5 font-bold text-blue-500"
          />
        </div>
        <div className="my-2 mb-5 flex w-full items-center justify-center">
          <button
            children="닫기"
            className="w-4/5 rounded-lg border border-gray-100 bg-gray-100 py-2 font-bold text-neutral-500"
          />
        </div>
      </SuperModal>
    </>
  )
}
