import { useEffect, useState } from 'react'

// ! 개선 필요
import { useRecoilValue, useSetRecoilState } from 'recoil'

import { useHistory } from '@/hooks/useHistory'
import {
  useOtpSendPost,
  useOtpSendPostAuth,
  useOtpUserSearchPost,
  useOtpUserSearchPostAuth,
} from '@/legacy/generated/endpoint'
import { useBrowserStorage } from '@/legacy/hooks/useBrowserStorage'
import type { errorType } from '@/legacy/types'
import { toastState, tokenState, twoFactorState } from '@/stores'

export function useOtp() {
  const [otpSendResult, setOtpSendResult] = useState(false)
  const [otpCheckResult, setOtpCheckResult] = useState(false)
  const [seconds, setSeconds] = useState(0) // 3분은 180초입니다.
  const [remainSecString, setRemainSecString] = useState('')
  const { setStorage } = useBrowserStorage()
  const setToastMsg = useSetRecoilState(toastState)
  const setTwoFactorState = useSetRecoilState(twoFactorState)
  const token = useRecoilValue(tokenState)
  const { push } = useHistory()

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1) // 1초씩 감소시킵니다.
        // 초를 분과 초로 변환합니다.
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60

        // 분과 초를 2자리 숫자로 표시합니다.
        const formattedTime = `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`
        setRemainSecString(formattedTime)
      } else {
        setRemainSecString('')
      }
    }, 1000) // 1초마다 업데이트합니다.

    return () => clearInterval(intervalId) // 컴포넌트가 언마운트되면 인터벌을 정리합니다.
  }, [seconds])

  const { mutateAsync: sendMutate } = useOtpSendPost({
    mutation: {
      onSuccess: (_) => {
        setOtpSendResult(true)
        setSeconds(180)
        setToastMsg('입력하신 전화번호로 인증번호를 발송했습니다.')
      },
      onError: (error) => {
        setOtpSendResult(false)
        const errorMsg: errorType | undefined = error?.response?.data as errorType
        setToastMsg(errorMsg?.message || '인증번호 발송 중 오류가 발생하였습니다.')
      },
    },
  })

  const { mutateAsync: sendAuthMutate } = useOtpSendPostAuth({
    mutation: {
      onSuccess: (_) => {
        setOtpSendResult(true)
        setSeconds(180)
        setToastMsg('입력하신 전화번호로 2차 인증번호가 발송되었습니다.')
      },
      onError: (error) => {
        setOtpSendResult(false)
        const errorMsg: errorType | undefined = error?.response?.data as errorType
        setToastMsg(errorMsg?.message || '2차 인증번호 발송 중 오류가 발생하였습니다.')
      },
    },
  })

  const sendOtp = (phone: string, sendMethod?: string) => {
    setOtpCheckResult(false)
    if (token) {
      sendAuthMutate({ data: { phone, sendMethod } })
    } else {
      sendMutate({ data: { phone, sendMethod } })
    }
  }

  const { mutateAsync: searchMutate } = useOtpUserSearchPost({
    mutation: {
      onSuccess: (res) => {
        if (res) {
          setOtpCheckResult(true)
          setSeconds(0)
          setToastMsg('인증번호가 확인되었습니다.')
        } else {
          setToastMsg('인증번호가 일치하지 않습니다.')
        }
      },
      onError: (error) => {
        setOtpCheckResult(false)
        const errorMsg: errorType | undefined = error?.response?.data as errorType
        setToastMsg(errorMsg?.message || '인증번호 확인 중 오류가 발생하였습니다.')
      },
    },
  })

  const { mutateAsync: searchAuthMutate } = useOtpUserSearchPostAuth({
    mutation: {
      onSuccess: (res) => {
        if (res) {
          setOtpCheckResult(true)
          setSeconds(0)
          setToastMsg('인증번호가 확인되었습니다.')
          setStorage('two-factor', 'true')
          setTwoFactorState('true')
          push('/')
        } else {
          setToastMsg('인증번호가 일치하지 않습니다.')
        }
      },
      onError: (error) => {
        setOtpCheckResult(false)
        const errorMsg: errorType | undefined = error?.response?.data as errorType
        setToastMsg(errorMsg?.message || '인증번호 확인 중 오류가 발생하였습니다.')
      },
    },
  })

  const checkOtp = (phone: string, otpCode: string) => {
    if (token) {
      searchAuthMutate({ data: { phone, otpCode } })
    } else {
      searchMutate({ data: { phone, otpCode } })
    }
  }

  return {
    otpSendResult,
    sendOtp,
    checkOtp,
    remainSecString,
    otpCheckResult,
  }
}
