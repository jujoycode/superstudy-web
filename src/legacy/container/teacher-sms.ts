import moment from 'moment'
import { useState } from 'react'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { useSmsGetFieldtripsByTeacher, useSmsRemainSmsCredit, useSmsSendMessage } from '@/legacy/generated/endpoint'
import { RequestCreateSmsMessageDto } from '@/legacy/generated/model'
import { errorType } from '@/legacy/types'
import { makeDateToString } from '@/legacy/util/time'
import { useNotificationStore } from '@/stores2/notification'
import { useUserStore } from '@/stores2/user'

export function useTeacherSms() {
  const { me } = useUserStore()
  const { setToast: setToastMsg } = useNotificationStore()

  const [wait, setWait] = useState(false)
  const [isSendPage, setIsSendPage] = useState(true)
  const [startDate, setStartDate] = useState<string | undefined>(makeDateToString(new Date()))
  const [endDate, setEndDate] = useState<string | undefined>(makeDateToString(new Date()))
  const [page, setPage] = useState(1)
  const limit = 10

  const [listResultType, setListResultType] = useState(0)

  // const [currentIndex, setCurrentIndex] = useState(0);
  // const [totalIndex, setTotalIndex] = useState(0);

  const { data: remainCredit, isLoading: creditLoading } = useSmsRemainSmsCredit()

  const { data: smsHistoryList, refetch: refetchHistory } = useSmsGetFieldtripsByTeacher(
    {
      startDate: startDate || '',
      endDate: endDate || '',
      withSuccess: listResultType !== 2,
      withFail: listResultType !== 1,
      page: page,
      limit: limit,
      senderId: me?.id,
    },
    {
      query: {
        enabled: !!startDate && !!endDate,
      },
    },
  )

  const { mutate: createNewMessageMutate } = useSmsSendMessage({
    mutation: {
      onSuccess: (_) => {
        setWait(false)
        // const responsefail = rst?.find((response) => response.result === false);

        setIsSendPage(false)
        setStartDate(moment(new Date()).subtract(30, 'seconds').toISOString())
        setEndDate(moment(new Date()).add(30, 'seconds').toISOString())
      },
      onError: (error) => {
        const errorMsg: errorType | undefined = error?.response?.data as errorType

        alert(errorMsg?.message || '메시지를 보내지 못했습니다.')
        setWait(false)
      },
    },
  })

  const createNewMessage = (smsMsg: RequestCreateSmsMessageDto[]) => {
    let currentIndex = 0
    // setCurrentIndex(current);
    // setTotalIndex(smsMsg.length);
    const intervalId = setInterval(() => {
      const slicedMessages = smsMsg.slice(currentIndex, currentIndex + 5)
      currentIndex += slicedMessages.length
      //setCurrentIndex(current);

      if (slicedMessages.length > 0) {
        setWait(true)
        createNewMessageMutate({
          data: slicedMessages,
        })
      }

      if (currentIndex >= smsMsg.length) {
        clearInterval(intervalId) // 배열의 끝에 도달하면 interval 중단
        setToastMsg(`문자메시지 전송 요청을 완료했습니다.`)
      } else {
        setToastMsg(`문자메시지 전송 요청 ( ${currentIndex} / ${smsMsg.length} 완료)`)
      }
    }, 1000)
  }

  return {
    wait,
    creditLoading,
    remainCredit,
    isSendPage,
    setIsSendPage,
    createNewMessage,
    smsHistoryList,
    refetchHistory,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    page,
    setPage,
    limit,
    listResultType,
    setListResultType,
  }
}
