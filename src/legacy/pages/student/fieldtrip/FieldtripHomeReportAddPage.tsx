import clsx from 'clsx'
import { every, get } from 'lodash'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router'

import { useHistory } from '@/hooks/useHistory'
import { ErrorBlank, SuperModal } from '@/legacy/components'
import {
  BackButton,
  Blank,
  BottomFixed,
  Label,
  PhoneNumberField,
  Section,
  Textarea,
  TopNavbar,
} from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { Checkbox } from '@/legacy/components/common/Checkbox'
import { SignDataCheck, SignPad, ToSign } from '@/legacy/components/common/SignPad'
import { TextInput } from '@/legacy/components/common/TextInput'
import { Typography } from '@/legacy/components/common/Typography'
import { useStudentFieldtripHomeReportAdd } from '@/legacy/container/student-fieldtrip-home-report-add'
import { UserContainer } from '@/legacy/container/user'
import { FieldtripStatus, Role } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { useSignature } from '@/legacy/hooks/useSignature'
import { makeDateToString } from '@/legacy/util/time'

export function FieldtripHomeReportAddPage() {
  const { push } = useHistory()
  const { id } = useParams<{ id: string }>()
  const { sigPadData } = useSignature()
  const { me } = UserContainer.useContext()
  const [dayHomePlan, setDayHomePlan] = useState(false)
  const { t } = useLanguage()

  const {
    fieldtrip,
    isLoading,
    error,
    isUpdateFieldtripSuccess,
    errorMessage,
    updateFieldtripResult,
    homePlan,
    parentsName,
    parentsPhone,
    setHomePlan,
    approverName,
  } = useStudentFieldtripHomeReportAdd({
    id: Number(id),
    sigPadData,
  })

  const [agree, setAgree] = useState(false)
  const [modalopen, setModalopen] = useState(false)
  const [openSignModal, setSignModal] = useState(false)

  useEffect(() => {
    if (homePlan && homePlan[0] && homePlan[0].day) {
      if (!dayHomePlan) setDayHomePlan(true)
    } else {
      if (dayHomePlan) setDayHomePlan(false)
    }
  }, [homePlan])

  const _checkFillHomePlanContent = () => {
    let checkKeys = ['content1', 'subject1']
    if (dayHomePlan) {
      checkKeys = ['day', 'content']
    }

    return every(homePlan, (plan) => {
      return every(checkKeys, (key) => {
        const value = get(plan, key, null)
        return !!value
      })
    })
  }

  if (fieldtrip && isUpdateFieldtripSuccess) {
    if (fieldtrip?.fieldtripResultStatus === FieldtripStatus.WAITING) {
      return (
        <>
          <TopNavbar
            title="체험학습 결과보고서"
            left={
              <div className="h-15">
                <BackButton className="h-15" />
              </div>
            }
          />
          <div className="h-screen-15 flex w-full flex-col items-center justify-center text-center">
            <div className="text-xl font-bold text-gray-600">체험학습 결과보고서 제출 완료</div>
            <div className="mt-4 text-gray-400">
              결과보고서 제출이 완료되었습니다. {me?.role === Role.USER && '보호자, '}
              {approverName}의 서명 후 결재 승인이 완료됩니다.
            </div>
            <BottomFixed className="bottom-16 px-5">
              <Button.lg
                children="결과보고서 확인하기"
                onClick={() => push(`/student/fieldtrip/result/${fieldtrip.id}`)}
                className="filled-primary w-full"
              />
              <Button.lg
                children="목록으로 가기"
                onClick={() => push(`/student/fieldtrip`)}
                className="outlined-primary mt-4 w-full"
              />
            </BottomFixed>
          </div>
        </>
      )
    } else {
      push(`/student/fieldtrip/result/${fieldtrip.id}`)
    }
  }

  return (
    <>
      {isLoading && <Blank />}
      {error && <ErrorBlank />}
      <TopNavbar
        title="가정학습 결과 보고서"
        left={
          <div className="h-15">
            <BackButton className="h-15" />
          </div>
        }
      />
      <Section className="bg-[#F7F7F7]">
        <h1 className="text-xl font-semibold">가정학습 결과 보고서</h1>
        <label className="mb-1 text-sm text-gray-800">*기간</label>
        <div className="space-y-3 pb-6">
          <div>
            <div className="flex space-x-4">
              <div className="focus:border-brand-1 mb-5 flex h-12 w-80 items-center rounded-md border border-gray-200 px-4 placeholder-gray-400 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400 sm:text-sm">
                {fieldtrip && makeDateToString(fieldtrip?.startAt)}
              </div>
              <span className="pt-2">부터</span>
            </div>

            <div className="flex space-x-4">
              <div className="focus:border-brand-1 mb-5 flex h-12 w-80 items-center rounded-md border border-gray-200 px-4 placeholder-gray-400 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400 sm:text-sm">
                {fieldtrip && makeDateToString(fieldtrip?.endAt)}
              </div>
              <span className="pt-2">까지</span>
            </div>
          </div>
          <div className="mb-2 text-lg whitespace-pre-line">
            남은 일수{' '}
            <span className="text-brand-1 underline">
              {fieldtrip?.currentRemainDays}일 중 {fieldtrip?.usedDays}일을 신청
            </span>
            합니다.
          </div>
          <div className="mb-2 text-xs whitespace-pre-line text-gray-600">
            ※<span className="font-bold">토,일, 개교기념일 등 학교 휴업일</span>은 체험학습 신청 일수에 넣지 않음.
          </div>
          <Label.col>
            <Label.Text children="*체험학습 형태" />
            <TextInput value="가정학습" disabled />
          </Label.col>
          <Label.col>
            <Label.Text children="*목적지" />
            <TextInput value="자택" disabled />
          </Label.col>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-gray-800">*가정학습 결과 보고서 작성</div>
          <Button.lg children="예시보기" onClick={() => setModalopen(true)} className="filled-primary w-24" />
        </div>
        <div className="space-y-4 rounded-md border border-gray-100 bg-white p-4 shadow-sm">
          {homePlan?.map((plan, i) => (
            <div key={i} className="space-y-4 rounded-md border border-gray-100 bg-white p-4 shadow-sm">
              <div className="pt-10 pb-4 text-center text-lg font-bold text-gray-800">{i + 1}일차</div>
              {dayHomePlan ? (
                <Label.col>
                  <Label.Text
                    children={`*학습한 내용 (${JSON.parse(JSON.stringify(homePlan))[i]['content']?.length || 0}/140자)`}
                  />
                  <Textarea
                    placeholder="일차별 학습내용을 입력합니다."
                    rows={5}
                    value={plan['content'] || ''}
                    onChange={(e) => {
                      const maxLength = 140
                      if (e.target.value.length > maxLength) {
                        e.target.value = e.target.value.slice(0, maxLength)
                      }
                      const newHomePlan = JSON.parse(JSON.stringify(homePlan))
                      newHomePlan[i]['day'] = i + 1
                      newHomePlan[i]['content'] = e.target.value.replace(/\n/g, ' ')
                      setHomePlan(newHomePlan)
                    }}
                    className={clsx(
                      'h-auto border',
                      plan['content'] ? 'border border-gray-300' : 'border-2 border-red-700',
                    )}
                  />
                </Label.col>
              ) : (
                <>
                  <Label.col>
                    <Label.Text children="*1교시 교과명" />
                    <TextInput
                      placeholder="예시) 국어,영어,수학 등"
                      value={plan['subject1'] || ''}
                      className={clsx(plan['subject1'] ? 'border-gray-300' : 'border-red-700')}
                      onChange={(e) => {
                        const newHomePlan = JSON.parse(JSON.stringify(homePlan))
                        newHomePlan[i]['subject1'] = e.target.value
                        setHomePlan(newHomePlan)
                      }}
                    />
                  </Label.col>
                  <Label.col>
                    <Label.Text children="*학습할 내용" />
                    <TextInput
                      placeholder="예시) 3-1 훈민정음"
                      value={plan['content1'] || ''}
                      onChange={(e) => {
                        const newHomePlan = JSON.parse(JSON.stringify(homePlan))
                        newHomePlan[i]['content1'] = e.target.value
                        setHomePlan(newHomePlan)
                      }}
                      className={clsx(plan['content1'] ? 'border-gray-300' : 'border-red-700')}
                    />
                  </Label.col>
                  <Label.col>
                    <Label.Text children="*2교시 교과명" />
                    <TextInput
                      placeholder="예시) 국어,영어,수학 등"
                      value={plan['subject2'] || ''}
                      onChange={(e) => {
                        const newHomePlan = JSON.parse(JSON.stringify(homePlan))
                        newHomePlan[i]['subject2'] = e.target.value
                        setHomePlan(newHomePlan)
                      }}
                      className={clsx(plan['subject2'] ? 'border-gray-300' : 'border-red-700')}
                    />
                  </Label.col>
                  <Label.col>
                    <Label.Text children="*학습할 내용" />
                    <TextInput
                      placeholder="예시) 3-1 훈민정음"
                      value={plan['content2'] || ''}
                      onChange={(e) => {
                        const newHomePlan = JSON.parse(JSON.stringify(homePlan))
                        newHomePlan[i]['content2'] = e.target.value
                        setHomePlan(newHomePlan)
                      }}
                      className={clsx(plan['content2'] ? 'border-gray-300' : 'border-red-700')}
                    />
                  </Label.col>
                  <Label.col>
                    <Label.Text children="*3교시 교과명" />
                    <TextInput
                      placeholder="예시) 국어,영어,수학 등"
                      value={plan['subject3'] || ''}
                      onChange={(e) => {
                        const newHomePlan = JSON.parse(JSON.stringify(homePlan))
                        newHomePlan[i]['subject3'] = e.target.value
                        setHomePlan(newHomePlan)
                      }}
                      className={clsx(plan['subject3'] ? 'border-gray-300' : 'border-red-700')}
                    />
                  </Label.col>
                  <Label.col>
                    <Label.Text children="*학습할 내용" />
                    <TextInput
                      placeholder="예시) 3-1 훈민정음"
                      value={plan['content3'] || ''}
                      onChange={(e) => {
                        const newHomePlan = JSON.parse(JSON.stringify(homePlan))
                        newHomePlan[i]['content3'] = e.target.value
                        setHomePlan(newHomePlan)
                      }}
                      className={clsx(plan['content3'] ? 'border-gray-300' : 'border-red-700')}
                    />
                  </Label.col>
                  <Label.col>
                    <Label.Text children="*4교시 교과명" />
                    <TextInput
                      placeholder="예시) 국어,영어,수학 등"
                      value={plan['subject4'] || ''}
                      onChange={(e) => {
                        const newHomePlan = JSON.parse(JSON.stringify(homePlan))
                        newHomePlan[i]['subject4'] = e.target.value
                        setHomePlan(newHomePlan)
                      }}
                      className={clsx(plan['subject4'] ? 'border-gray-300' : 'border-red-700')}
                    />
                  </Label.col>
                  <Label.col>
                    <Label.Text children="*학습할 내용" />
                    <TextInput
                      placeholder="예시) 3-1 훈민정음"
                      value={plan['content4'] || ''}
                      onChange={(e) => {
                        const newHomePlan = JSON.parse(JSON.stringify(homePlan))
                        newHomePlan[i]['content4'] = e.target.value
                        setHomePlan(newHomePlan)
                      }}
                      className={clsx(plan['content4'] ? 'border-gray-300' : 'border-red-700')}
                    />
                  </Label.col>
                  <Label.col>
                    <Label.Text children="*5교시 교과명" />
                    <TextInput
                      placeholder="예시) 국어,영어,수학 등"
                      value={plan['subject5'] || ''}
                      onChange={(e) => {
                        const newHomePlan = JSON.parse(JSON.stringify(homePlan))
                        newHomePlan[i]['subject5'] = e.target.value
                        setHomePlan(newHomePlan)
                      }}
                      className={clsx(plan['subject5'] ? 'border-gray-300' : 'border-red-700')}
                    />
                  </Label.col>
                  <Label.col>
                    <Label.Text children="*학습할 내용" />
                    <TextInput
                      placeholder="예시) 3-1 훈민정음"
                      value={plan['content5'] || ''}
                      onChange={(e) => {
                        const newHomePlan = JSON.parse(JSON.stringify(homePlan))
                        newHomePlan[i]['content5'] = e.target.value
                        setHomePlan(newHomePlan)
                      }}
                      className={clsx(plan['content5'] ? 'border-gray-300' : 'border-red-700')}
                    />
                  </Label.col>
                  <Label.col>
                    <Label.Text children="*6교시 교과명" />
                    <TextInput
                      placeholder="예시) 국어,영어,수학 등"
                      value={plan['subject6'] || ''}
                      onChange={(e) => {
                        const newHomePlan = JSON.parse(JSON.stringify(homePlan))
                        newHomePlan[i]['subject6'] = e.target.value
                        setHomePlan(newHomePlan)
                      }}
                      className={clsx(plan['subject6'] ? 'border-gray-300' : 'border-red-700')}
                    />
                  </Label.col>
                  <Label.col>
                    <Label.Text children="*학습할 내용" />
                    <TextInput
                      placeholder="예시) 3-1 훈민정음"
                      value={plan['content6'] || ''}
                      onChange={(e) => {
                        const newHomePlan = JSON.parse(JSON.stringify(homePlan))
                        newHomePlan[i]['content6'] = e.target.value
                        setHomePlan(newHomePlan)
                      }}
                      className={clsx(plan['content6'] ? 'border-gray-300' : 'border-red-700')}
                    />
                  </Label.col>
                  <Label.col>
                    <Label.Text children="*7교시 교과명" />
                    <TextInput
                      placeholder="예시) 국어,영어,수학 등"
                      value={plan['subject7'] || ''}
                      onChange={(e) => {
                        const newHomePlan = JSON.parse(JSON.stringify(homePlan))
                        newHomePlan[i]['subject7'] = e.target.value
                        setHomePlan(newHomePlan)
                      }}
                      className={clsx(plan['subject7'] ? 'border-gray-300' : 'border-red-700')}
                    />
                  </Label.col>
                  <Label.col>
                    <Label.Text children="*학습할 내용" />
                    <TextInput
                      placeholder="예시) 3-1 훈민정음"
                      value={plan['content7'] || ''}
                      onChange={(e) => {
                        const newHomePlan = JSON.parse(JSON.stringify(homePlan))
                        newHomePlan[i]['content7'] = e.target.value
                        setHomePlan(newHomePlan)
                      }}
                      className={clsx(plan['content7'] ? 'border-gray-300' : 'border-red-700')}
                    />
                  </Label.col>
                </>
              )}
            </div>
          ))}
        </div>

        {me?.role === Role.USER && (
          <>
            {(parentsName === '' || parentsPhone === '') && (
              <Typography variant="body2" className="text-red-700">
                * 보호자 정보를 확인해주세요.
              </Typography>
            )}
            <Label.col>
              <Label.Text children="보호자 이름" />
              <TextInput
                placeholder="보호자 이름을 입력해주세요."
                value={parentsName}
                disabled={true}
                className="border-gray-300"
              />
            </Label.col>
            <Label.col>
              <Label.Text children="보호자 연락처" />
              <PhoneNumberField value={parentsPhone || '010'} disabled={true} />
              <div className="mt-2 mb-2 text-xs whitespace-pre-line text-gray-600">
                * {t('parent_info_edit_my_page', '보호자 정보 수정은 보호자의 MY페이지에서만 가능합니다.')}
              </div>
            </Label.col>
          </>
        )}

        <Label.row>
          <Checkbox checked={agree} onChange={() => setAgree(!agree)} />
          <p className="text-lg font-semibold">아래 내용을 체크하셨습니까?</p>
        </Label.row>
        <p className="mt-1 rounded-lg border border-gray-300 px-4 py-3 whitespace-pre-line">
          {me?.role === Role.USER ? '-신고자는 학생 본인입니다.' : '-보호자의 지도 하에 학생과 함께 신청합니다.'}
        </p>
        <Button.lg
          children="제출하기"
          disabled={!agree || !_checkFillHomePlanContent()}
          onClick={() => {
            const regExp = /^010(?:\d{4})\d{4}$/
            if (parentsPhone && !regExp.test(parentsPhone.replace(/-/g, ''))) {
              alert('보호자 연락처를 확인해 주세요.')
              return
            }

            // if (fieldtrip?.fieldtripResultStatus === FieldtripStatus.WAITING || fieldtrip?.fieldtripResultStatus === FieldtripStatus.RETURNED) {
            setSignModal(true)
            // } else {
            //   updateFieldtripResult(['', '']);
            // }
          }}
          className="filled-primary"
        />

        {errorMessage && <div className="text-red-600">{errorMessage}</div>}
      </Section>
      <SuperModal modalOpen={modalopen} setModalClose={() => setModalopen(false)}>
        <div className="font-smibold text-brand-1 mt-5 text-center text-lg">가정 학습 계획 예시</div>
        <div className="mt-6 mr-6 mb-6 ml-6 text-sm">
          작성 시 개인 시간표와 같게 작성해야 합니다.
          <br />
          1일 1장을 작성해야 합니다.
        </div>
        <div className="mt-4 mr-7 mb-7 ml-7 space-y-4 rounded-md border border-gray-100 bg-white p-4 shadow-xl">
          <div className="pt-10 pb-4 text-center text-lg font-bold text-gray-800">1일차</div>
          <Label.col>
            <Label.Text children="*1교시 교과명" />
            <TextInput placeholder="국어" />
          </Label.col>
          <Label.col>
            <Label.Text children="*학습할 내용" />
            <TextInput placeholder="3-1 훈민정음" />
          </Label.col>
        </div>

        <div className="my-2 mb-5 flex w-full items-center justify-center">
          <button
            children="닫기"
            onClick={() => setModalopen(false)}
            className="text-littleblack w-4/5 rounded-lg border border-gray-100 bg-gray-100 py-2 font-bold"
          />
        </div>
      </SuperModal>

      <div className={openSignModal ? '' : 'hidden'}>
        <Blank text="" />
        <SignPad
          ToSigns={me?.role === Role.USER ? [ToSign.STUDENT] : [ToSign.STUDENT, ToSign.PARENT]}
          onClose={() => setSignModal(false)}
          onComplete={(signData: string[]) => {
            setSignModal(false)

            if (SignDataCheck(me?.role, signData)) {
              updateFieldtripResult(signData)
            }
          }}
        ></SignPad>
      </div>
    </>
  )
}
