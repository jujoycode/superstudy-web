import { useEffect, useState } from 'react'
import { useRecoilValue } from 'recoil'

import { useFieldtripResultUpdateResult, useFieldtripsFindOne } from '@/legacy/generated/endpoint'
import { Role } from '@/legacy/generated/model'
import type { errorType } from '@/legacy/types'
import { childState } from '@/stores'

import { UserContainer } from './user'

type Props = {
  id: number
  sigPadData: string
}

type HomePlan = Array<{
  [key: string]: string
}>

export function useStudentFieldtripHomeReportAdd({ id, sigPadData }: Props) {
  const { me } = UserContainer.useContext()
  const child = useRecoilValue(childState)

  const [errorMessage, setErrorMessage] = useState('')

  const [parentsName, setParentsName] = useState((me?.role === Role.USER ? me?.nokName : child?.nokName) || '')
  const [parentsPhone, setParentsPhone] = useState((me?.role === Role.USER ? me?.nokPhone : child?.nokPhone) || '')
  const [homePlan, setHomePlan] = useState<HomePlan>()
  const [approverName, setApproverName] = useState<string>()

  const {
    data: fieldtrip,
    isLoading: isGetFieldtripLoading,
    error,
  } = useFieldtripsFindOne(id, {
    request: {
      headers: {
        'child-user-id': child?.id,
      },
    },
  })

  const {
    mutateAsync: updateFieldtripResultMutate,
    isLoading: isUpdateFieldtripLoading,
    isSuccess: isUpdateFieldtripSuccess,
  } = useFieldtripResultUpdateResult({
    mutation: {
      onSuccess: (data) => {
        if (!data) return

        const approver1Title = data?.approver1Title || ''
        const approver2Title = data?.approver2Title || ''
        const approver3Title = data?.approver3Title || ''
        const approver4Title = data?.approver4Title || ''
        const approver5Title = data?.approver5Title || ''

        let approvers =
          (approver1Title ? approver1Title + ', ' : '') +
          (approver2Title ? approver2Title + ', ' : '') +
          (approver3Title ? approver3Title + ', ' : '') +
          (approver4Title ? approver4Title + ', ' : '') +
          (approver5Title ? approver5Title + ', ' : '')

        if (approvers.endsWith(', ')) {
          approvers = approvers.substring(0, approvers.length - 2)
        }

        setApproverName(approvers || '담임')
      },
      onError: (e) => {
        const errorMsg: errorType | undefined = e?.response?.data ? (e?.response?.data as errorType) : undefined

        setErrorMessage(errorMsg?.message || '일시적 오류 입니다. 잠시 후 다시 시도해주세요.')
      },
    },
    request: {
      headers: {
        'child-user-id': child?.id,
      },
    },
  })

  const updateFieldtripResult = (signData: string[]) => {
    if (!fieldtrip) return

    const { id, type, destination, overseas, resultTitle } = fieldtrip
    updateFieldtripResultMutate({
      id,
      data: {
        type,
        resultText: JSON.stringify(homePlan),
        destination,
        overseas,
        resultFiles: [], // 가정학습은 input 파일 첨부하지 않기 때문에, 빈 배열로 세팅
        studentResultSignature: signData[0],
        parentResultSignature: me?.role === Role.PARENT ? signData[1] : '',
        resultTitle,
      },
    }).catch((e) => console.error(e))
  }

  const isLoading = isGetFieldtripLoading || isUpdateFieldtripLoading

  useEffect(() => {
    if (!homePlan && fieldtrip?.usedDays) {
      try {
        const _content = JSON.parse(fieldtrip?.content)
        setHomePlan(_content)
      } catch (err) {
        setHomePlan(
          new Array(fieldtrip.usedDays).fill(0).map(() => {
            return {}
          }),
        )
      }
    }
  }, [fieldtrip])

  return {
    fieldtrip,
    isLoading,
    error,
    errorMessage,
    updateFieldtripResult,
    isUpdateFieldtripSuccess,
    homePlan,
    parentsName,
    parentsPhone,

    setHomePlan,
    setParentsName,
    setParentsPhone,
    approverName,
  }
}
