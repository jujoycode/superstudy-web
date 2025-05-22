import { useEffect, useState } from 'react'

import { Role } from '@/legacy/generated/model'
import { useSignature } from '@/legacy/hooks/useSignature'

import { BottomFixed } from './BottomFixed'
import { Button } from './Button'
import { CloseButton } from './icon-buttons'
import { Section } from './Section'

export enum ToSign {
  STUDENT = 'STUDENT',
  PARENT = 'PARENT',
}

interface SignPadProp {
  ToSigns: ToSign[]
  onClose: () => void // 사인패드 닫음
  onComplete: (signData: string[]) => void // 서명 배열
}

// ref - ListItem.tsx
export function SignPad({ ToSigns, onClose, onComplete }: SignPadProp) {
  const { canvasRef, sigPadData, clearSignature } = useSignature()
  const [signOrder, setSignOrder] = useState<number>(0)
  const [signData, setSignData] = useState<string[]>([])

  useEffect(() => {
    setSignOrder(0)
    setSignData([])
  }, [ToSigns])

  const addSignData = () => {
    setSignOrder(signOrder + 1)
    setSignData([...signData, sigPadData])
    clearSignature()

    if (signOrder + 1 === ToSigns.length) {
      // 모두 서명 완료
      onComplete([...signData, sigPadData])
    }
  }

  return (
    <BottomFixed className="z-100 rounded-t-xl">
      <div className="absolute top-2 right-3" onClick={() => onClose()}>
        <CloseButton
          onClick={() => {
            onClose()
            clearSignature()
          }}
        />
      </div>
      <Section>
        {ToSigns[signOrder] === ToSign.STUDENT && (
          <div>
            <div className="text-xl font-bold text-gray-700">학생 서명란</div>
            <div className="text-gray-500">
              {signOrder + 1 < ToSigns.length
                ? '아래 네모칸에 학생이 직접 이름을 적을 수 있도록 지도해주세요.'
                : '아래 네모칸에 이름을 바르게 적어주세요.'}
            </div>
          </div>
        )}
        {ToSigns[signOrder] === ToSign.PARENT && (
          <div>
            <div className="text-xl font-bold text-gray-700">보호자 서명란</div>
            <div className="text-gray-500">아래 네모칸에 이름을 바르게 적어주세요.</div>
          </div>
        )}

        <canvas
          ref={canvasRef}
          //width={window.innerWidth * 0.6 > 420 ? 420 : window.innerWidth * 0.6}
          width={window.innerWidth * 0.9 > 800 ? 800 : window.innerWidth * 0.9}
          height={window.innerWidth * 0.4 > 280 ? 280 : window.innerWidth * 0.4}
          className="m-auto rounded-[30px] bg-[#F2F2F2]"
        />
        <div className="flex items-center justify-between space-x-2 pb-1">
          <Button.xl
            children="다시하기"
            onClick={() => clearSignature()}
            className="border-primary-800 w-full border bg-white text-current"
          />
          <Button.xl
            children="서명 제출하기"
            className="bg-primary-800 w-full text-white"
            onClick={() => {
              if (!sigPadData) {
                alert('서명이 없습니다. 아래 네모칸에 다시 서명을 해주세요.')
                return
              }
              addSignData()
            }}
          />
        </div>
      </Section>
    </BottomFixed>
  )
}

export function SignDataCheck(role: Role | undefined, signData: string[]) {
  let signOK = false
  if (role === Role.USER) {
    if (signData[0] && signData[0] !== '') {
      signOK = true
    }
  } else if (role === Role.PARENT) {
    if (signData[0] && signData[0] !== '' && signData[1] && signData[1] !== '') {
      signOK = true
    }
  }
  if (!signOK) {
    alert('서명이 유효하지 않습니다. 다시 제출하기 버튼을 눌러 서명해주세요.')
  }

  return signOK
}
