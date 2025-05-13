import { useEffect, useRef, useState } from 'react'
import SignaturePad from 'signature_pad'

let signaturePad: SignaturePad | null = null

export function useSignature() {
  const [sigPadData, setSigPadData] = useState('')
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const clearSignature = () => {
    signaturePad && signaturePad.clear()
    setSigPadData('')
  }

  const handleSign = () => {
    if (signaturePad) {
      setSigPadData(signaturePad.toDataURL())
    }
  }

  useEffect(() => {
    if (canvasRef.current) {
      signaturePad = new SignaturePad(canvasRef.current, {
        penColor: 'black', // 선의 색상 설정
        minWidth: 3, // 최소 선의 너비
        maxWidth: 7, // 최대 선의 너비
      })
      signaturePad.addEventListener('endStroke', handleSign)
    }
  }, [canvasRef.current])

  return {
    canvasRef,
    sigPadData,
    clearSignature,
  }
}
