import { PropsWithChildren, useEffect, useState } from 'react'

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

export function NoticePopup2({
  noticeOpen,
  setNoticeClose,
  ablePropragation = false,
}: PropsWithChildren<NoticePopupProps>) {
  const [showNever, setShowNever] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    const noticeShow = localStorage.getItem('noticeShow3')
    if (noticeShow) {
      setNoticeClose()
    }
  }, [setNoticeClose])

  const handleClose = () => {
    if (showNever) {
      localStorage.setItem('noticeShow3', 'not')
    }
    setNoticeClose()
  }

  const imageSrc = 'https://kr.object.gov-ncloudstorage.com/superschool/storage/notice/loginpopup3.jpg'
  return (
    <div
      className={`fixed inset-0 z-60 flex h-screen w-full items-center justify-center bg-neutral-500/50 ${
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
        {/* <div className="text-center text-2xl font-bold">{title}</div>
        <div className="h-4"></div> */}

        {/* 이미지 및 상호작용 가능한 버튼 영역 */}
        <div className="relative">
          <img src={imageSrc} alt="Security Notice" className="rounded-lg" />
        </div>

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
