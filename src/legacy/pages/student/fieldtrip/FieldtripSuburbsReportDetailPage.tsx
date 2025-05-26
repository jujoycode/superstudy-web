import { useState } from 'react'
import { cn } from '@/utils/commonUtil'

import { useUserStore } from '@/stores/user'
import { SuperModal } from '@/legacy/components'
import { BackButton, Label, PhoneNumberField, Section, Textarea, TopNavbar } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { TextInput } from '@/legacy/components/common/TextInput'

export function FieldtripSuburbsReportDetailPage() {
  const { me: meRecoil } = useUserStore()

  const [reason, setReason] = useState('')
  const [content, setContent] = useState('')
  const [parentsName, setParentsName] = useState('')
  const [parentsPhone, setParentsPhone] = useState('')
  const [startAt, setStartAt] = useState('')
  const [endAt, setEndAt] = useState('')
  const [modalopen, setModalopen] = useState(false)

  return (
    <>
      <TopNavbar
        title="교외 체험학습 결과 보고서 확인"
        left={
          <div className="h-15">
            <BackButton className="h-15" />
          </div>
        }
      />
      <Section className="bg-[#F7F7F7]">
        <h1 className="text-xl font-semibold">교외 체험학습 결과 보고서</h1>
        <div className="mb-2 text-xs whitespace-pre-line text-gray-600">
          제출기한 : 체험학습 종료 후 {meRecoil?.school.fieldtripResultDueDays || 5}일 이내
        </div>
        <label className="mb-1 text-sm text-gray-800">*기간</label>
        <div className="space-y-3 pb-6">
          <div>
            <div className="flex space-x-4">
              <input
                type="date"
                lang="ko-KR"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                className="focus:border-primary-800 mb-5 h-12 w-80 flex-1 rounded-md border border-gray-200 px-4 placeholder-gray-400 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400 sm:text-sm"
              />
              <span className="pt-2">부터</span>
            </div>
            <div className="flex space-x-4">
              <input
                type="date"
                lang="ko-KR"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                className="focus:border-primary-800 h-12 w-80 flex-1 rounded-md border border-gray-200 px-4 placeholder-gray-400 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400 sm:text-sm"
              />
              <span className="pt-2">까지</span>
            </div>
          </div>
          <div className="mb-2 text-lg whitespace-pre-line">
            남은 일수
            <span className="text-primary-800 underline">50일 중 OO일을 신청</span>
            합니다.
          </div>
          <div className="mb-2 text-xs whitespace-pre-line text-gray-600">
            ※<span className="font-bold">토,일, 개교기념일 등 학교 휴업일</span>은 체험학습 신청 일수에 넣지 않음.
          </div>
          <Label.col>
            <Label.Text children="*체험학습 형태" />
            <TextInput placeholder="체험활동" value={reason} onChange={(e) => setReason(e.target.value)} />
          </Label.col>
          <Label.col>
            <Label.Text children="*목적지" />
            <TextInput
              placeholder="목적지를 입력해주세요."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </Label.col>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-gray-800">*현장학습 결과 보고서 작성 </div>
          <Button.lg children="예시보기" onClick={() => setModalopen(true)} className="filled-primary w-24" />
        </div>
        <Textarea
          placeholder=" 할아버지 칠순 잔치에 대한 참여는 가족과 좋은 시간을 보냈습니다. 경주의 역사 유적지를 방문하면서 신라 시대의 장엄한 유산과 불교문화의 중요성에 대해 깊이 이해할 수 있었습니다.
          대구에 살고 있는 조부모와 친척들을 만나는 시간은 가족 간의 유대를 더욱 강화하는 계기가 되었습니다. 서로의 이야기를 나누고 공감하는 과정에서 가족 간의 우애와 사랑이 더욱 깊어졌습니다"
          rows={10}
          value={content}
          onChange={(e) => {
            setContent(e.target.value)
          }}
          className="h-auto border"
        />
        <Label.col>
          <Label.Text children="보호자 이름" />
          <TextInput
            placeholder="보호자 이름을 입력해주세요."
            value={parentsName}
            disabled
            onChange={(e) => setParentsName(e.target.value)}
            className={cn(parentsName ? 'border-gray-300' : 'border-red-700')}
          />
        </Label.col>
        <Label.col>
          <Label.Text children="보호자 연락처" />
          <PhoneNumberField
            value={parentsPhone}
            disabled
            onChange={(e) => setParentsPhone(e.target.value)}
            style={{ borderColor: !parentsPhone ? 'rgba(185, 28, 28)' : '' }}
          />
        </Label.col>
      </Section>
      <SuperModal modalOpen={modalopen} setModalClose={() => setModalopen(false)}>
        <div className="font-smibold text-primary-800 mt-5 text-center text-lg">현장 학습 계획 예시</div>
        <div className="mt-6 mr-6 mb-6 ml-6 text-sm">
          1.할머니 칠순맞이 가족과 국내 장거리 여행
          <br />
          숙박, 식사 등 활동으로 친척과의 관계를 배울 수 있다.
          <br />
          칠순, 고희에 대해 배울 수 있다.
          <br />
          <br />
          2.통영 케이블카 탑승
          <br />
          케이블카 체허뮤하고 한려해상국립공원의 아름다운 자연을 배울 수 있다.
          <br />
          <br />
          3.식사
          <br />
          남해안과 경상도 지역의 식재료 및 음식을 알 수 있다.
        </div>

        <div className="my-2 mb-5 flex w-full items-center justify-center">
          <button
            children="닫기"
            onClick={() => {
              setModalopen(false)
              const regExp = /^010(?:\d{4})\d{4}$/
              if (parentsPhone && !regExp.test(parentsPhone.replace(/-/g, ''))) {
                alert('보호자 연락처를 확인해 주세요.')
                setModalopen(false)
                return
              }
            }}
            className="w-4/5 rounded-lg border border-gray-100 bg-gray-100 py-2 font-bold text-neutral-500"
          />
        </div>
      </SuperModal>
    </>
  )
}
