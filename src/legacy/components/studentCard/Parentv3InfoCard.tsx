import { useState } from 'react'
import { useQueryClient } from 'react-query'
import icon from '@/legacy/assets/icons/more-vertical.svg'
import { useTeacherStudentUpdateParent } from '@/legacy/container/teacher-student-update-parent'
import { useCounselingSendParentSignUpV2 } from '@/legacy/generated/endpoint'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import type { ResponseParentUserDto } from '@/legacy/generated/model'
import type { errorType } from '@/legacy/types'

import { Validator } from '@/legacy/util/validator'
import { TextInput } from '@/legacy/components/common/TextInput'
import { Icon } from '@/legacy/components/common/icons'
import { DropdownMenu } from './DropdownMenu'

interface ParentInfoCard {
  parentInfo?: ResponseParentUserDto[] | null
  studentId?: number
  nokName?: string
  nokPhone?: string
}

export default function Parentv3InfoCard({
  parentInfo,
  studentId,
  nokName: nokNameArg,
  nokPhone: nokPhoneArg,
}: ParentInfoCard) {
  const queryClient = useQueryClient()
  const { updateStudentParent } = useTeacherStudentUpdateParent()
  const [nokName, setNokName] = useState('')
  const [nokPhone, setNokPhone] = useState('')
  const [addBtnParent, setAddBtnParent] = useState(false)
  const { t } = useLanguage()

  // useCounselingFindCounselingDetialStudentByStudentId<ResponseCounselingDetailStudentDto>(studentId || 0, {
  //   query: { enabled: !!studentId },
  // });

  const keyName = studentId || 0
  const reqParentName = localStorage.getItem(keyName.toString())?.split('|')[0]
  const id = Number(localStorage.getItem(keyName.toString())?.split('|')[1])
  const reqParentPhone = localStorage.getItem(keyName.toString())?.split('|')[2]

  // 가입요청중인 보호자가 있는 지
  const isParentJoinPending = reqParentName && id === studentId
  // 가입대기중인 보호자가 있는 지
  const isParentAlreadyAdded = parentInfo?.some((parent) => parent.phone === nokPhoneArg)
  const totalParent = parentInfo?.length || 0
  const totalPendingParents = isParentJoinPending ? 1 : 0
  const totalPendingParents2 = !isParentAlreadyAdded ? 1 : 0
  const canAddParent = totalParent + totalPendingParents + totalPendingParents2 < 2

  const key = studentId || 0
  const { mutate: sendParentSignUpV2Mutate } = useCounselingSendParentSignUpV2({
    mutation: {
      onSuccess: () => {
        alert('보호자 회원가입 메시지 발송이 완료되었습니다.')

        localStorage.setItem(key.toString(), nokName + '|' + studentId + '|' + nokPhone)
      },
      onError: (error) => {
        const errorMsg: errorType | undefined = error?.response?.data as errorType
        localStorage.removeItem(key.toString())
        setAddBtnParent(false)
        alert(errorMsg?.message || '메시지 발송 중 오류가 발생하였습니다.')
      },
    },
  })

  const cancel = () => {
    setAddBtnParent(false)
    setNokName('')
    setNokPhone('')
  }

  const checkParentJoin = () => {
    let rst = false

    if (nokPhoneArg) {
      parentInfo?.map((item: ResponseParentUserDto) => {
        if (nokPhoneArg === item.phone) {
          rst = true
        }
      })
    } else {
      rst = true
    }
    return rst
  }

  return (
    <section className="relative mt-4 flex h-full flex-col rounded-md border-2 bg-white p-4 md:mt-0">
      <div className="flex flex-wrap items-center justify-between py-3 md:pt-0">
        <div className="flex w-full flex-col">
          <section className="flex w-full flex-row items-center justify-between">
            <h6 className="text-lg font-bold">{t('guardian_information', '보호자 정보')}</h6>
            {canAddParent && (
              <button
                onClick={() => setAddBtnParent(!addBtnParent)}
                className={`border-darkgray hover:bg-darkgray block h-8 rounded-md border px-4 font-semibold transition-all hover:text-white ${
                  addBtnParent && 'hidden'
                }`}
              >
                {t('add', '추가')}
              </button>
            )}
          </section>

          <p className="text-13 text-brand-1 font-semibold">
            {t('parent_info_edit_my_page', '보호자 정보 수정은 보호자의 MY페이지에서만 가능합니다.')}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        {checkParentJoin() === false && (
          <div className="flex flex-col gap-1 rounded-md border p-4 md:p-2">
            <div className="flex w-full items-center justify-between">
              <p className="font-bold">{t('pending_signup', '가입대기')}</p>
            </div>
            <p>{nokNameArg}</p>
            <p>{nokPhoneArg?.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')}</p>
          </div>
        )}
        {parentInfo?.map((parent) => (
          <div className="flex flex-col gap-1 rounded-md border p-4 md:p-2" key={parent.id}>
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                <h6 className="font-bold">{parent.name}</h6>
                <span
                  className={`text-white ${
                    (parent.isPrimaryGuardian && 'bg-orange-400') || 'bg-[#CCCCCC]'
                  } rounded-md px-2`}
                >
                  {(parent.isPrimaryGuardian && t('primary_guaridan', '주 보호자')) || t('guardian', '보호자')}
                </span>
              </div>
              <DropdownMenu
                icon={icon}
                parent={parent}
                studentId={studentId || 0}
                key={parent.id}
                updateStudentParent={updateStudentParent}
              />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <p className="text-gray-500">{parent.phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')}</p>
              <p className="text-sm text-gray-500">{parent.email}</p>
            </div>
          </div>
        ))}
      </div>
      {addBtnParent && (
        <>
          <div className="mt-4 flex flex-col rounded-md border p-2">
            <div className="flex flex-row items-center justify-between pb-4">
              <h6 className="text-xl font-semibold">{t('add_parent', '보호자 추가')}</h6>
              <nav className="flex items-center justify-between space-x-2">
                <button
                  onClick={() => cancel()}
                  className="border-darkgray hover:bg-darkgray flex w-16 items-center rounded-md border font-semibold transition-all hover:text-white"
                >
                  <Icon.Close />
                  {t('cancel', '취소')}
                </button>
                <button
                  onClick={() => {
                    const regExp = /^010(?:\d{4})\d{4}$/
                    if (nokPhone && !regExp.test(nokPhone.replace(/-/g, ''))) {
                      alert('보호자 연락처를 확인해 주세요.')
                      return
                    }
                    sendParentSignUpV2Mutate({
                      studentId: Number(studentId),
                      data: { name: nokName, phone: nokPhone },
                    })
                    cancel()
                  }}
                  className="border-darkgray hover:bg-darkgray w-12 rounded-md border font-semibold transition-all hover:text-white"
                >
                  {t('add', '추가')}
                </button>
              </nav>
            </div>
            <div className="flex flex-col gap-1 space-y-2">
              <div className="flex items-center space-x-2">
                <label className="w-16 font-semibold">{t('name', '이름')}</label>
                <TextInput
                  placeholder="이름 입력"
                  value={nokName}
                  onChange={(e) => setNokName(e.target.value)}
                  onKeyDown={(e) => {
                    if (Validator.onlyEngAndHan(e.key) === false) {
                      e.preventDefault()
                    }
                  }}
                  className="h-5 w-full rounded-none border-0 border-b border-gray-400 focus:border-b-2 focus:border-black focus:ring-0"
                />
              </div>
              <div className="flex items-center space-x-2">
                <label className="w-16 font-semibold">{t('contact_information', '연락처')}</label>
                <TextInput
                  placeholder="연락처 입력"
                  value={nokPhone}
                  onChange={(e) => setNokPhone(e.target.value)}
                  className="h-5 w-full rounded-none border-0 border-b border-gray-400 focus:border-b-2 focus:border-black focus:ring-0"
                />
              </div>
            </div>
          </div>
        </>
      )}
      {reqParentName && id === studentId ? (
        <div className="mt-2 flex flex-col gap-1 rounded-md border p-4 md:p-2">
          <div className="flex w-full items-center justify-between">
            <p className="font-bold">{t('signup_request_in_progress', '가입요청중')}</p>
            <button
              onClick={() => {
                alert('가입 요청을 취소합니다.')
                localStorage.removeItem(studentId.toString())
                queryClient.refetchQueries({ active: true })
              }}
              className="border-darkgray hover:bg-darkgray h-6 rounded-md border px-2 py-px text-sm font-semibold transition-all hover:text-white"
            >
              {t('cancel', '취소')}
            </button>
          </div>
          <p>{reqParentName}</p>
          <p>{reqParentPhone?.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')}</p>
        </div>
      ) : (
        <></>
      )}
    </section>
  )
}
