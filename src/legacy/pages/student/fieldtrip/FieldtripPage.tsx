import { useState } from 'react'
import { useRecoilValue } from 'recoil'

import { useHistory } from '@/hooks/useHistory'
import { ErrorBlank, SuperModal } from '@/legacy/components'
import { BackButton, Badge, Blank, Section, TopNavbar } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { Icon } from '@/legacy/components/common/icons'
import { useStudentFieldtrip } from '@/legacy/container/student-fieldtrip'
import { UserContainer } from '@/legacy/container/user'
import { FieldtripStatus, Role } from '@/legacy/generated/model'
import { makeStartEndToString } from '@/legacy/util/time'
import { childState } from '@/stores'

import RightArrow from '@/assets/svg/mypage-right-arrow.svg'

export function FieldtripPage() {
  const [modalopen, setModalopen] = useState(false)

  const { me } = UserContainer.useContext()
  const child = useRecoilValue(childState)
  const { fieldtrips, isLoading, error, setRecalculateDays } = useStudentFieldtrip()

  const school = me?.school
  const { push } = useHistory()

  return (
    <>
      {isLoading && <Blank />}
      {error && <ErrorBlank />}
      <TopNavbar
        title=" 체험학습"
        left={
          <div className="h-15">
            <BackButton className="h-15" />
          </div>
        }
      />
      <div className="scroll-box h-screen-12 overflow-y-auto">
        <Section className="bg-[#F7F7F7]">
          <div className="flex justify-between">
            <div>
              <h1 className="text-sm font-bold">체험학습 잔여일</h1>
              {school?.fieldtripDays}일 중
              <span className="text-brand-1">
                {' '}
                {me?.role === Role.PARENT ? child?.remainDaysOfFieldtrip : me?.remainDaysOfFieldtrip || 0}일{' '}
              </span>
              남았습니다.
            </div>
            <Button.sm
              onClick={() => {
                setRecalculateDays(true)
              }}
              className="outlined-gray flex h-10 w-25 items-center"
            >
              <Icon.Refresh />
              <span className="text-bold text-brand-1 pl-2 text-sm">
                잔여일
                <br />
                재확인
              </span>
            </Button.sm>
          </div>
        </Section>
        <Section>
          {fieldtrips?.map((fieldtrip) => {
            let state
            switch (fieldtrip.fieldtripStatus) {
              case FieldtripStatus.DELETE_APPEAL:
                state = (
                  <div className="text-sm text-gray-600">
                    <span className="text-brand-1 font-bold">삭제 요청</span>
                  </div>
                )
                break
              case FieldtripStatus.RETURNED:
                state = (
                  <div className="text-sm text-gray-600">
                    <span className="text-brand-1 font-bold">반려됨</span>
                  </div>
                )
                break
              case FieldtripStatus.PROCESSED:
                state = '완료'
                break
              default:
                state = '승인 중'
                break
            }
            let resultState
            switch (fieldtrip.fieldtripResultStatus) {
              case FieldtripStatus.DELETE_APPEAL:
                resultState = (
                  <div className="text-sm text-gray-600">
                    <span className="text-brand-1 font-bold">삭제 요청</span>
                  </div>
                )
                break
              case FieldtripStatus.RETURNED:
                resultState = (
                  <div className="text-sm text-gray-600">
                    <span className="text-brand-1 font-bold">반려됨</span>
                  </div>
                )
                break
              case FieldtripStatus.PROCESSED:
                resultState = '완료'
                break
              default:
                resultState = '승인 중'
                break
            }
            return (
              <>
                <div>
                  <div className="text-md text-bold my-3 mb-3 flex">
                    <Badge
                      children={fieldtrip.type === 'HOME' ? '가정' : '교외'}
                      className="bg-light_orange text-brand-1"
                    />
                    {fieldtrip.type === 'HOME' ? '가정학습' : '교외 체험학습'}
                  </div>
                  <div className="text-sm text-gray-400">
                    {fieldtrip?.startAt && fieldtrip?.endAt && makeStartEndToString(fieldtrip.startAt, fieldtrip.endAt)}{' '}
                    ({fieldtrip.usedDays}일)
                  </div>
                </div>

                <div className="space-y-4 rounded-md bg-white p-4 shadow-lg">
                  <div
                    className="flex cursor-pointer items-center justify-between"
                    onClick={() => push(`/student/fieldtrip/${fieldtrip.id}`)}
                  >
                    <div className="font-sfpro font-bold text-gray-800">
                      <Badge children={state} /> 신청서 확인
                    </div>

                    <div className="flex">
                      {fieldtrip?.fieldtripStatus === FieldtripStatus.BEFORE_PARENT_CONFIRM &&
                        me?.role === Role.PARENT && (
                          <span className="text-brand-1 pt-1 text-sm font-bold">승인해주세요.</span>
                        )}
                      <RightArrow />
                    </div>
                  </div>
                  {fieldtrip?.fieldtripStatus === 'PROCESSED' && (
                    <div
                      className="border-grey-6 flex cursor-pointer items-center justify-between border-t border-b pt-4 pb-4"
                      onClick={() => push(`/student/fieldtrip/notice/${fieldtrip.id}`)}
                    >
                      <div className="font-sfpro font-bold text-gray-800">
                        <Badge children="완료" /> 통보서 확인
                      </div>
                      <RightArrow />
                    </div>
                  )}
                  {fieldtrip?.fieldtripStatus === 'PROCESSED' && (
                    <>
                      {fieldtrip?.fieldtripResultStatus !== FieldtripStatus.WAITING ? (
                        <div
                          className="flex cursor-pointer items-center justify-between"
                          onClick={() => push(`/student/fieldtrip/result/${fieldtrip.id}`)}
                        >
                          <div className="font-sfpro font-bold text-gray-800">
                            <Badge children={resultState} /> 결과보고서 확인
                          </div>
                          <div className="flex">
                            {fieldtrip?.fieldtripResultStatus === FieldtripStatus.BEFORE_PARENT_CONFIRM &&
                              me?.role === Role.PARENT && (
                                <span className="text-brand-1 pt-1 text-sm font-bold">승인해주세요.</span>
                              )}
                            <RightArrow />
                          </div>
                        </div>
                      ) : (
                        <div className="my-2 flex w-full items-center justify-center">
                          <Button.lg
                            children="결과보고서를 작성해주세요. 👆"
                            onClick={() =>
                              fieldtrip?.type === 'SUBURBS'
                                ? push(`/student/fieldtrip/add/report/suburbs/${fieldtrip.id}`)
                                : push(`/student/fieldtrip/add/report/home/${fieldtrip.id}`)
                            }
                            className="filled-gray w-full"
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="h-0.5 w-full bg-gray-100" />
              </>
            )
          })}
        </Section>
      </div>

      <div className="w-full px-4">
        <button
          children="체험학습 신청하기"
          className="bg-brand-1 h-14 w-full rounded-lg px-4 text-white"
          onClick={() => {
            //if (isPrimaryGuardian === -1) {
            if (me?.role === Role.USER && (!me?.nokName || !me?.nokPhone)) {
              alert('지정된 주 보호자가 존재하지 않습니다. [MY-내 정보]에서 주 보호자를 설정해 주세요.')
              return
            }
            // hasProcessing
            //   ? alert('이미 승인중인 신청건이 있습니다.\n신청서 승인완료 또는 삭제 후, 새 신청서를 작성할 수 있습니다.')
            //   : setModalopen(true);

            if (me?.school.fieldtripType.length === 1) {
              if (me?.school.fieldtripType.includes('suburb')) {
                push('/student/fieldtrip/add/suburbs')
              } else if (me?.school.fieldtripType.includes('home')) {
                push('/student/fieldtrip/add/home')
              }
            } else {
              setModalopen(true)
            }
          }}
        />
      </div>

      <SuperModal modalOpen={modalopen} setModalClose={() => setModalopen(false)}>
        <div className="mt-14 flex w-full items-center justify-center">
          <button
            children="🏔 교외 체험학습"
            onClick={() => push('/student/fieldtrip/add/suburbs')}
            className="border-brand-1 text-brand-1 w-4/5 rounded-lg border bg-white py-5 font-bold"
          />
        </div>
        <div className="my-5 mb-10 flex w-full items-center justify-center">
          <button
            children="🏠 가정학습"
            onClick={() => push('/student/fieldtrip/add/home')}
            className="border-brandblue-1 text-brandblue-1 w-4/5 rounded-lg border bg-white py-5 font-bold"
          />
        </div>
        <div className="my-2 mb-5 flex w-full items-center justify-center">
          <button
            children="닫기"
            onClick={() => setModalopen(false)}
            className="text-littleblack w-4/5 rounded-lg border border-gray-100 bg-gray-100 py-2 font-bold"
          />
        </div>
      </SuperModal>
    </>
  )
}
