import React from 'react'

interface AlertDialogProps {
  message: string
  description: string
  confirmText: string
  onConfirm: () => void
  theme?: 'primary' | 'secondary'
}

/**
 * AlertDialog 컴포넌트는 사용자에게 메시지를 출력하는 다이얼로그를 렌더링합니다.
 *
 * @property {string} message - 다이얼로그에 표시할 주요 메시지.
 * @property {string} description - 주요 메시지 아래에 표시할 설명 텍스트.
 * @property {string} confirmText - 확인 버튼에 표시할 텍스트.
 * @property {function} onConfirm - 확인 버튼이 클릭될 때 호출할 함수.
 * @property {string} theme - 확인 버튼 색상 (primary = '주황', secondary = '파랑').
 * @returns {JSX.Element} 렌더링된 AlertDialog 컴포넌트.
 */

const AlertDialog: React.FC<AlertDialogProps> = ({
  message,
  description,
  confirmText,
  onConfirm,
  theme = 'primary',
}) => {
  return (
    <div className="bg-opacity-50 fixed inset-0 z-100 flex h-screen w-full items-center justify-center bg-black">
      <div className="mx-4 flex h-[278px] w-full flex-col items-center justify-center gap-2 bg-white p-6 md:mx-0 md:w-[480px]">
        <h2
          className="mb-2 text-center text-lg font-semibold md:text-2xl"
          dangerouslySetInnerHTML={{ __html: message.replace(/\n/g, '<br />') }}
        ></h2>
        <p
          className="text-12 mb-4 text-center text-gray-600 md:text-base"
          dangerouslySetInnerHTML={{ __html: description.replace(/\n/g, '<br />') }}
        ></p>
        <div className="flex items-center justify-center space-x-2">
          <button
            className={`box-border h-12 w-28 rounded-md ${
              theme === 'primary' ? 'bg-primary-800' : 'bg-brandblue-1'
            } px-5 text-lg text-white transition-all`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AlertDialog
