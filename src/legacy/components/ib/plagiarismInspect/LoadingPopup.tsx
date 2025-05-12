import { useState, useEffect } from 'react'
import { SuperModal } from '@/legacy/components/SuperModal'
import { Typography } from '@/legacy/components/common/Typography'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import CheckFile from '@/legacy/assets/images/check-file.png'

interface LoadingPopupProps {
  modalOpen: boolean
  setModalClose: () => void
  status: 'Y' | 'N' | 'F' // 에러인 경우도 판단해야 하므로 문자열로 받음
  cause?: string
  type?: 'loading' | 'cause'
}

export default function LoadingPopup({
  modalOpen,
  setModalClose,
  status = 'N',
  cause,
  type = 'loading',
}: LoadingPopupProps) {
  const [progressText, setProgressText] = useState('표절률 검사 진행 중')
  const [dotCount, setDotCount] = useState(0)

  const handleClick = () => {
    if (type === 'loading') {
      window.location.reload()
    } else if (type === 'cause') {
      setModalClose()
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setDotCount((prevCount) => (prevCount + 1) % 5)
    }, 600)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // 수학적 패턴 활용: 3개 → 2개 →1개 →2개 →3개 점 표시
    const dotLength = Math.abs((dotCount % 5) - 2) + 1
    const dots = '.'.repeat(dotLength)

    setProgressText(`표절률 검사 진행 중${dots}`)
  }, [dotCount])

  return (
    <SuperModal
      modalOpen={modalOpen}
      setModalClose={setModalClose}
      hasClose={false}
      className="flex h-[286px] w-[416px] flex-col items-center justify-center p-8"
    >
      <div className="flex w-full flex-col items-center justify-center">
        <img src={CheckFile} alt="checkFile" className="mb-6 h-12 w-12" />
        <Typography variant="title2" className="text-primary-gray-900 mb-2 font-semibold">
          {status === 'N' ? progressText : '표절 검사에 실패하였습니다.'}
        </Typography>
        <Typography variant="body2" className="text-primary-gray-700 mb-6 text-center">
          {status === 'N' ? '검사가 완료되면 검사결과 화면으로 이동합니다.\n잠시만 기다려주세요.' : cause}
        </Typography>
        <ButtonV2 variant="solid" color="gray100" size={48} className="w-full" onClick={handleClick}>
          {type === 'loading' ? '검사결과 목록 이동하기' : '확인'}
        </ButtonV2>
      </div>
    </SuperModal>
  )
}
