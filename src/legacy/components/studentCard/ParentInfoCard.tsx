import { useState } from 'react'
import { useQueryClient } from 'react-query'

import { Button } from '@/legacy/components/common/Button'
import { TextInput } from '@/legacy/components/common/TextInput'
import { useTeacherStudentUpdateParent } from '@/legacy/container/teacher-student-update-parent'
import { useCounselingSendParentSignUpV2 } from '@/legacy/generated/endpoint'
import { ResponseParentUserDto } from '@/legacy/generated/model'
import type { errorType } from '@/legacy/types'
import { Validator } from '@/legacy/util/validator'

interface ParentInfoCard {
  studentId?: number
  parentInfo?: ResponseParentUserDto[] | null
}

export function ParentInfoCard({ studentId, parentInfo }: ParentInfoCard) {
  const queryClient = useQueryClient()
  const { updateStudentParent } = useTeacherStudentUpdateParent()
  // const [enableSendParentSignUp, setEnableSendParentSignUp] = useState(false);
  const [nokName, setNokName] = useState('')
  const [nokPhone, setNokPhone] = useState('')
  const [addBtnParent, setAddBtnParent] = useState(false)

  // useCounselingFindCounselingDetialStudentByStudentId<ResponseCounselingDetailStudentDto>(studentId || 0, {
  //   query: { enabled: !!studentId },
  // });

  let totalParent = 0

  const keyName = studentId || 0
  // 가입요청 알림톡 발신되었지만 미가입 상태일 경우 표시를 위함
  const reqParentName = localStorage.getItem(keyName.toString())?.split('|')[0]
  const id = Number(localStorage.getItem(keyName.toString())?.split('|')[1])

  if (Number(localStorage.getItem(keyName.toString())?.split('|')[1]) === studentId) {
    totalParent =
      parentInfo?.length === 2
        ? (localStorage.removeItem(keyName.toString()), parentInfo?.length)
        : reqParentName !== null
          ? Number(parentInfo?.length) + 1
          : parentInfo?.length || 0
  } else {
    totalParent = parentInfo?.length || 0
  }
  //const totalParent = parentInfo?.length || 0;
  const key = studentId || 0
  const { mutate: sendParentSignUpV2Mutate } = useCounselingSendParentSignUpV2({
    mutation: {
      onSuccess: () => {
        alert('보호자 회원가입 메시지 발송이 완료되었습니다.')

        localStorage.setItem(key.toString(), nokName + '|' + studentId)
      },
      onError: (error) => {
        const errorMsg: errorType | undefined = error?.response?.data as errorType
        localStorage.removeItem(key.toString())
        setAddBtnParent(false)
        alert(errorMsg?.message || '메시지 발송 중 오류가 발생하였습니다.')
      },
    },
  })

  return (
    <div className="mb-5">
      <div className="flex justify-between text-xl font-semibold">
        <p>보호자정보카드</p>
      </div>
      <div className="relative h-full rounded-lg border bg-white px-3 pt-3">
        {!parentInfo || parentInfo.length === 0 ? (
          <div className="mb-3 text-center">가입된 보호자가 없습니다.</div>
        ) : parentInfo.length === 1 ? (
          <>
            {parentInfo.map((item: ResponseParentUserDto) => (
              <div key={item.id} className="relative mb-3 h-full rounded-lg border bg-white px-3 pt-1 pb-3">
                {item.isPrimaryGuardian ? (
                  <div className="text-red-500">주 보호자</div>
                ) : (
                  <div className="flex justify-end">
                    <button
                      children="주 보호자 지정"
                      className="bg-light_orange text-brand-1 hover:bg-brand-1 hover:text-light_orange rounded-md px-2 py-1 text-sm focus:outline-none"
                      onClick={() => {
                        alert(
                          `학생정보의 보호자 전화번호가 ${item?.name} 님의 전화번호로 변경되며, 학생의 결재요청도 ${item?.name}님 에게 보내집니다.`,
                        )
                        studentId && updateStudentParent(studentId, item?.name, item?.phone)
                      }}
                    />
                  </div>
                )}
                <table className="w-full">
                  <tr>
                    <td className="w-32 border-b-2 font-semibold">이름</td>
                    <td className="border-b-2">{item?.name}</td>
                  </tr>
                  <tr>
                    <td className="border-b-2 font-semibold">전화번호</td>
                    <td className="border-b-2">{item?.phone}</td>
                  </tr>
                  <tr>
                    <td className="border-b-2 font-semibold">이메일</td>
                    <td className="border-b-2">{item?.email}</td>
                  </tr>
                </table>
              </div>
            ))}

            <div className="mx-2 my-2 w-full" />
            {reqParentName && id === studentId ? (
              <>
                <tr>{reqParentName} 보호자님, 가입요청 대기중입니다.</tr>
                <button
                  children="취소하기"
                  className="bg-light_orange text-brand-1 hover:text-light_orange my-1 rounded-md px-2 py-1 text-sm hover:bg-red-500 focus:outline-none"
                  onClick={() => {
                    alert('가입 요청을 취소합니다.')
                    localStorage.removeItem(studentId.toString())
                    queryClient.refetchQueries({ active: true })
                  }}
                />
              </>
            ) : (
              <div className="flex justify-end">
                {parentInfo.length < 2 && totalParent < 2 && (
                  <button
                    children="보호자 추가"
                    onClick={() => {
                      setNokName('')
                      setNokPhone('')
                      setAddBtnParent(true)
                    }}
                    className="bg-light_orange text-brand-1 hover:bg-brand-1 hover:text-light_orange mb-2 rounded-md px-2 py-1 text-sm focus:outline-none"
                  />
                )}
              </div>
            )}
            {addBtnParent && (
              <>
                <table className="w-full">
                  <div className="text-lg font-bold text-gray-800">보호자 추가 </div>

                  <tr>
                    <td className="w-32 border-b-2 font-semibold">이름</td>
                    <td className="border-b-2">
                      <TextInput
                        placeholder="이름 입력"
                        value={nokName}
                        onChange={(e) => setNokName(e.target.value)}
                        onKeyDown={(e) => {
                          if (Validator.onlyEngAndHan(e.key) === false) {
                            e.preventDefault()
                          }
                        }}
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
                <div className="text-gray-3 text-sm">
                  &nbsp; * 보호자가 이미 회원가입한 상태라면 위 보호자 정보로 자녀추가완료 알림톡이 발송됩니다.{' '}
                </div>
                <div className="flex justify-end pt-2">
                  {addBtnParent && (
                    <button
                      children="취소"
                      className="bg-light_orange text-brand-1 hover:text-light_orange mr-1 mb-2 rounded-md px-2 py-1 text-sm hover:bg-red-500 focus:outline-none"
                      onClick={() => {
                        setAddBtnParent(false)
                        setNokName('')
                        setNokPhone('')
                      }}
                    />
                  )}
                  {parentInfo.length < 2 && (
                    <>
                      <div className="flex">
                        <Button.sm
                          children={'저장 및 초대하기'}
                          onClick={() => {
                            const regExp = /^010(?:\d{4})\d{4}$/
                            if (nokPhone && !regExp.test(nokPhone.replace(/-/g, ''))) {
                              alert('보호자 연락처를 확인해 주세요.')
                              return
                            }
                            setAddBtnParent(false)
                            sendParentSignUpV2Mutate({
                              studentId: Number(studentId),
                              data: { name: nokName, phone: nokPhone },
                            })
                          }}
                          className="outlined-primary"
                        />
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </>
        ) : (
          parentInfo?.map((item: ResponseParentUserDto) => (
            <div key={item.id} className="relative mb-3 h-full rounded-lg border bg-white px-3 pt-1 pb-3">
              {item.isPrimaryGuardian ? (
                <div className="text-red-500">주 보호자</div>
              ) : (
                <div className="flex justify-end">
                  <button
                    children="주 보호자 지정"
                    className="bg-light_orange text-brand-1 hover:bg-brand-1 hover:text-light_orange rounded-md px-2 py-1 text-sm focus:outline-none"
                    onClick={() => {
                      alert(
                        `학생정보의 보호자 전화번호가 ${item?.name} 님의 전화번호로 변경되며, 학생의 결재요청도 ${item?.name}님 에게 보내집니다.`,
                      )
                      studentId && updateStudentParent(studentId, item?.name, item?.phone)
                    }}
                  />
                </div>
              )}

              <table className="w-full">
                <tr>
                  <td className="w-32 border-b-2 font-semibold">이름</td>
                  <td className="border-b-2">{item?.name}</td>
                </tr>
                <tr>
                  <td className="border-b-2 font-semibold">전화번호</td>
                  <td className="border-b-2">{item?.phone}</td>
                </tr>
                <tr>
                  <td className="border-b-2 font-semibold">이메일</td>
                  <td className="border-b-2">{item?.email}</td>
                </tr>
              </table>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
