import { useState } from 'react'

// ! 개선 필요
import { useHistory } from '@/hooks/useHistory'

import { useRecoilValue } from 'recoil'
import { QueryKey } from '@/legacy/constants/query-key'
import { useStudentMyPage } from '@/legacy/container/student-my-page'
import { useStudentParentMyInfoUpdate } from '@/legacy/container/student-parent-my-info-update'
import { useStudentSendParentSignUp } from '@/legacy/container/student-send-parent-sign-up'
import { useUserSendParentSignUpV2, useUserUpdateMe } from '@/legacy/generated/endpoint'
import { queryClient } from '@/legacy/lib/query'
import { meState } from '@/stores'
import type { ResponseUserDto, UpdateUserDto } from '@/legacy/generated/model'
import type { errorType } from '@/legacy/types'

import { Validator } from '@/legacy/util/validator'
import { Button } from '@/legacy/components/common/Button'
import { TextInput } from '@/legacy/components/common/TextInput'

interface ParentInfoCardProps {
  isNotParent: boolean
  me: ResponseUserDto
}

export function ParentInfoCard({ me, isNotParent }: ParentInfoCardProps) {
  const { cntParent, isPrimaryGuardian, setIsPrimaryGuardian, setNokName, setNokPhone, nokName, nokPhone } =
    useStudentMyPage()

  const { push } = useHistory()
  const { handleSendParentSignUp } = useStudentSendParentSignUp()

  const [nokName1, setNokName1] = useState(me?.parents?.[0]?.name || '')
  const [nokPhone1, setNokPhone1] = useState(me?.parents?.[0]?.phone || '')
  const [nokName2, setNokName2] = useState(me?.parents?.[1]?.name || '')
  const [nokPhone2, setNokPhone2] = useState(me?.parents?.[1]?.phone || '')
  const [addBtnParent, setAddBtnParent] = useState(false)
  const { handleParentMyInfoUpdate } = useStudentParentMyInfoUpdate()

  const meRecoil = useRecoilValue(meState)

  const handleSubmit = (nokName: string, nokPhone: string) => {
    if (isNotParent) {
      handleParentMyInfoUpdate({ nokName, nokPhone })
    }
  }

  const { mutate: updateMeMutate, isLoading: isUpdateMeLoading } = useUserUpdateMe({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries(QueryKey.me)
      },
    },
  })

  // 가입요청 알림톡 발신되었지만 미가입 상태일 경우 표시를 위함
  const reqParentName = localStorage.getItem('reqParent_userInfo')

  if (me?.parents?.some((parent) => parent.name === reqParentName)) {
    localStorage.removeItem('reqParent_userInfo')
  }

  const totalParent = reqParentName !== null ? (meRecoil?.parents?.length ?? 0) + 1 : (meRecoil?.parents?.length ?? 0)

  const { mutate: sendParentSignUpV2Mutate } = useUserSendParentSignUpV2({
    mutation: {
      onSuccess: () => {
        alert('보호자 회원가입 메시지 발송이 완료되었습니다.')
        localStorage.setItem('reqParent_userInfo', nokName)
        updateMeMutate({ data: {} as UpdateUserDto })
      },
      onError: (error) => {
        const errorMsg: errorType | undefined = error?.response?.data as errorType
        setAddBtnParent(false)
        localStorage.removeItem('reqParent_userInfo')
        alert(errorMsg?.message || '메시지 발송 중 오류가 발생하였습니다.')
      },
    },
  })

  const checkParentJoin = () => {
    let rst = false

    if (me?.parents?.some((parent) => parent.name === nokPhone)) {
      rst = true
    }
    return rst
  }

  return (
    <>
      {isNotParent && (
        <div className="flex justify-between pt-3 text-lg font-semibold">
          <p>보호자정보카드</p>
        </div>
      )}
      {isNotParent && isPrimaryGuardian === -1 && (
        <>
          <div className="text-sm text-red-500">
            <b>(필수)</b> ※ 지정된 주 보호자가 없습니다. 보호자 추가 후 지정해 주세요.
          </div>
          <div>
            {me?.nokName && me?.nokPhone && (
              <>
                <table>
                  <tr>
                    <td className="w-full border-b-2 font-semibold">이름</td>
                    <td className="border-b-2">{me?.nokName}</td>
                  </tr>
                  <tr>
                    <td className="w-full border-b-2 font-semibold">연락처</td>
                    <td className="border-b-2">{me?.nokPhone}</td>
                  </tr>
                </table>
                {checkParentJoin() === false && (
                  <div className="flex justify-end">
                    <Button.sm
                      children="보호자 가입 알림톡 발송하기"
                      onClick={handleSendParentSignUp}
                      className="outlined-primary"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
      {isNotParent && totalParent > 0 && (
        <>
          <div className="relative mb-3 h-full w-full rounded-lg border bg-white px-3 pt-1 pb-3">
            {me?.nokName && me?.nokPhone && (
              <>
                <table>
                  <div className={`text-lg font-bold ${isPrimaryGuardian === 0 ? 'text-blue-500' : 'text-gray-800'}`}>
                    <input
                      type="radio"
                      value={0}
                      checked={isPrimaryGuardian === 0}
                      onClick={() => {
                        const isConfirmed = window.confirm(
                          `학생정보의 보호자 전화번호가 ${nokName1} 님의 전화번호로 변경되며, 학생의 결재요청도 ${nokName1}님 ${nokPhone1}에게 보내집니다. 계속하시겠습니까?`,
                        )

                        if (isConfirmed) {
                          setIsPrimaryGuardian(0)
                          setNokName(nokName1)
                          setNokPhone(nokPhone1)
                          me?.id && handleSubmit(nokName1, nokPhone1)
                        }
                      }}
                    />{' '}
                    {isPrimaryGuardian === 0 ? '주 보호자' : '보호자 1'}
                  </div>

                  <tr>
                    <td className="w-full border-b-2 font-semibold">이름</td>
                    <td className="border-b-2">{me?.parents?.[0]?.name}</td>
                  </tr>
                  <tr>
                    <td className="w-full border-b-2 font-semibold">연락처</td>
                    <td className="border-b-2">{me?.parents?.[0]?.phone}</td>
                  </tr>
                  <tr>
                    <td className="w-full border-b-2 font-semibold">이메일</td>
                    <td className="border-b-2">{me?.parents?.[0]?.email}</td>
                  </tr>
                </table>
                {me?.parents?.[0]?.firstVisit === true && (
                  <div className="flex justify-end">
                    <Button.sm
                      children="보호자 가입 알림톡 발송하기"
                      onClick={handleSendParentSignUp}
                      className="outlined-primary"
                    />
                  </div>
                )}
              </>
            )}
            {/* {meRecoil?.parents?.length === 1 && (
              <>
                <table>
                  <div className={`text-lg font-bold ${isPrimaryGuardian === 0 ? 'text-blue-500' : 'text-gray-800'}`}>
                    <input
                      type="radio"
                      value={0}
                      checked={isPrimaryGuardian === 0}
                      onClick={() => {
                        const isConfirmed = window.confirm(
                          `학생정보의 보호자 전화번호가 ${nokName1} 님의 전화번호로 변경되며, 학생의 결재요청도 ${nokName1}님 ${nokPhone1}에게 보내집니다. 계속하시겠습니까?`,
                        );

                        if (isConfirmed) {
                          setIsPrimaryGuardian(0);
                          setNokName(nokName1);
                          setNokPhone(nokPhone1);
                          me?.id && handleSubmit(nokName1, nokPhone1);
                        }
                      }}
                    />{' '}
                    {isPrimaryGuardian === 0 ? '주 보호자' : '보호자 1'}
                  </div>

                  <tr>
                    <td className="w-full border-b-2 font-semibold">이름</td>
                    <td className="border-b-2">{me?.parents?.[0]?.name}</td>
                  </tr>
                  <tr>
                    <td className="w-full border-b-2 font-semibold">연락처</td>
                    <td className="border-b-2">{me?.parents?.[0]?.phone}</td>
                  </tr>
                  <tr>
                    <td className="w-full border-b-2 font-semibold">이메일</td>
                    <td className="border-b-2">{me?.parents?.[0]?.email}</td>
                  </tr>
                </table>
                {me?.parents?.[0]?.firstVisit === true && (
                  <div className="flex justify-end ">
                    <Button.sm
                      children="보호자 가입 알림톡 발송하기"
                      onClick={handleSendParentSignUp}
                      className="outlined-primary"
                    />
                  </div>
                )}
              </>
            )} */}
            {/* {totalParent === 2 && (
              <> */}
            <div className="h-10 w-full" />
            {reqParentName && (
              <>
                <tr>{reqParentName} 보호자님, 가입요청 대기중입니다.</tr>
                <button
                  children="취소하기"
                  className="bg-light_orange text-brand-1 hover:text-light_orange rounded-md px-2 py-1 text-sm hover:bg-red-500 focus:outline-none"
                  onClick={() => {
                    alert('가입 요청을 취소합니다.')
                    localStorage.removeItem('reqParent_userInfo')
                    push(`/student/info`)
                  }}
                />
              </>
            )}
            {!reqParentName && totalParent === 2 && (
              <table>
                <label>
                  <div className={`text-lg font-bold ${isPrimaryGuardian === 1 ? 'text-blue-500' : 'text-gray-800'}`}>
                    <input
                      type="radio"
                      value={1}
                      checked={isPrimaryGuardian === 1}
                      onClick={() => {
                        const isConfirmed = window.confirm(
                          `학생정보의 보호자 전화번호가 ${nokName2} 님의 전화번호로 변경되며, 학생의 결재요청도 ${nokName2}님 ${nokPhone2}에게 보내집니다. 계속하시겠습니까?`,
                        )

                        if (isConfirmed) {
                          setIsPrimaryGuardian(1)
                          setNokName(nokName2)
                          setNokPhone(nokPhone2)
                          me?.id && handleSubmit(nokName2, nokPhone2)
                        }
                      }}
                    />{' '}
                    {isPrimaryGuardian === 1 ? '주 보호자' : '보호자 2'}
                  </div>
                </label>

                <tr>
                  <td className="w-full border-b-2 font-semibold">이름</td>
                  <td className="border-b-2">{me?.parents?.[1]?.name}</td>
                </tr>
                <tr>
                  <td className="w-full border-b-2 font-semibold">연락처</td>
                  <td className="border-b-2">{me?.parents?.[1]?.phone}</td>
                </tr>
                <tr>
                  <td className="w-full border-b-2 font-semibold">이메일</td>
                  <td className="border-b-2">{me?.parents?.[1]?.email}</td>
                </tr>
              </table>
            )}
            {/* </>
            )} */}
          </div>
        </>
      )}
      {isNotParent && totalParent < 2 && (
        <Button.lg
          children="보호자 추가"
          onClick={() => {
            setNokName('')
            setNokPhone('')

            if (reqParentName) {
              alert('이미 가입 대기중인 보호자가 있습니다.')
              return
            } else {
              setAddBtnParent(true)
            }
          }}
          className="filled-primary w-full"
        />
      )}
      {isNotParent && addBtnParent && (
        <>
          <div className="relative my-3 h-full w-full rounded-lg border bg-white px-3 pt-1 pb-3">
            <table>
              <tr>
                <td className="w-full border-b-2 font-semibold">이름</td>
                <td className="border-b-2">
                  <TextInput
                    placeholder="이름 입력"
                    value={nokName}
                    onChange={(e) => setNokName(e.target.value)}
                    // onKeyDown={(e) => {
                    //   if (Validator.onlyEngAndHan(e.key) === false) {
                    //     e.preventDefault();
                    //   }
                    // }}
                    className="border-brand-1 h-5 w-48"
                  />
                </td>
              </tr>
              <tr>
                <td className="border-b-2 font-semibold">연락처</td>
                <td className="border-b-2">
                  <TextInput
                    placeholder="연락처 입력"
                    value={nokPhone}
                    onChange={(e) => setNokPhone(e.target.value)}
                    className="border-brand-1 h-5 w-48"
                  />
                </td>
              </tr>
            </table>
            <div className="text-grey-3 text-sm">
              &nbsp; * 보호자가 이미 회원가입한 상태라면 위 보호자 정보로 자녀추가완료 알림톡이 발송됩니다.{' '}
            </div>
            <div className="flex justify-end py-2">
              <button
                children="취소"
                className="bg-light_orange text-brand-1 hover:text-light_orange rounded-md px-2 py-1 text-sm hover:bg-red-500 focus:outline-none"
                onClick={() => {
                  setAddBtnParent(false)
                  setNokName('')
                  setNokPhone('')
                }}
              />
              <div className="flex px-1">
                <Button.sm
                  children={'저장 및 초대하기'}
                  onClick={() => {
                    const regExp = /^010(?:\d{4})\d{4}$/

                    if (me?.nokName === nokName && me?.nokPhone === nokPhone) {
                      alert('이미 등록된 보호자 입니다. 보호자 이름과 연락처를 확인해 주세요.')
                      return
                    }
                    if (!nokName) {
                      alert('보호자 이름을 확인해 주세요.')
                      return
                    }

                    if (!Validator.onlyEngAndHan(nokName)) {
                      alert('보호자 이름은 한글과 영어만 입력 가능합니다.')
                      return
                    }

                    if (!nokPhone || !regExp.test(nokPhone.replace(/-/g, ''))) {
                      alert('보호자 연락처를 확인해 주세요.')
                      return
                    }
                    setAddBtnParent(false)
                    sendParentSignUpV2Mutate({
                      data: { name: nokName, phone: nokPhone },
                    })
                    //handleSendParentSignUpV2(nokName, nokPhone);
                  }}
                  className="outlined-primary"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
