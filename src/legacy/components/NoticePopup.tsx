import { PropsWithChildren, useState, useEffect } from 'react'

import { useLanguage } from '@/legacy/hooks/useLanguage'

import { Label } from './common'
import { Button } from './common/Button'
import { Checkbox } from './common/Checkbox'

interface NoticePopupProps {
  noticeOpen: boolean
  setNoticeClose: () => void
  width?: string
  ablePropragation?: boolean
}

export function NoticePopup({
  noticeOpen,
  setNoticeClose,
  ablePropragation = false,
}: PropsWithChildren<NoticePopupProps>) {
  const [showNever, setShowNever] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    const noticeShow = localStorage.getItem('noticeShow')
    if (noticeShow) {
      setNoticeClose()
    }
  }, [setNoticeClose])

  // const title = t('new_to_superschool');
  // const contents = ` 회원가입 및 로그인은 해당 학교의 안내를 받은 후에만 가능합니다. 학교의 안내를 기다려주세요.

  // - 학생은 학교에서 안내한 '이메일'을 통해 전달된 비밀번호 확인 후 회원가입이 가능합니다.
  // - 보호자님은 학생 가입 후 '카카오톡'으로 받은 회원가입요청 알림톡을 통해 회원가입이 가능합니다. `

  // const image =
  //   currentLang === 'ko'
  //     ? 'https://kr.object.gov-ncloudstorage.com/superschool/storage/notice/loginInfo.JPG'
  //     : 'https://kr.object.gov-ncloudstorage.com/superschool/storage/notice/logininfoen.jpg';
  const image = 'https://kr.object.gov-ncloudstorage.com/superschool/storage/notice/문의하기_공지_팝업_수정.jpg'

  const handleClose = () => {
    if (showNever) {
      localStorage.setItem('noticeShow', 'not')
    }
    setNoticeClose()
  }

  return (
    <div
      className={`bg-littleblack fixed inset-0 z-60 flex h-screen w-full items-center justify-center ${
        !noticeOpen && 'hidden'
      }`}
      onClick={(e) => {
        if (!ablePropragation) {
          e.preventDefault()
          e.stopPropagation()
        }
      }}
    >
      <div className="relative w-4/5 rounded-lg bg-white p-4 opacity-100 md:w-[400px]">
        {/* <div className="absolute right-3 top-3">
          <CloseButton onClick={() => setNoticeClose()} />
        </div> */}
        {/* <div className="text-center text-2xl font-bold">{title}</div> */}
        {/* <div className="h-4"></div> */}
        {/* <div className="whitespace-pre-line text-lg">{contents}</div> */}
        <img src={image} className="rounded-lg" />
        <button
          className="absolute bottom-[110px] left-1/2 h-[30px] w-[150px] -translate-x-1/2"
          onClick={() => window.open('https://superstudy.channel.io/home', '_blank')}
        ></button>
        <div className="bg-primary-800 my-3 h-0.5"></div>
        <div className="flex items-center justify-between">
          <div className="flex space-x-3">
            <Checkbox checked={showNever} onChange={() => setShowNever(!showNever)} />
            <Label.Text children={t('do_not_show_again')} />
          </div>
          <Button.lg children={t('close')} onClick={() => handleClose()} className="filled-gray-300" />
        </div>
      </div>
    </div>
  )
}
