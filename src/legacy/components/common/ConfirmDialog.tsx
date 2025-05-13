import React from 'react'

interface ConfirmDialogProps {
  message: string
  description: string
  confirmText: string
  cancelText: string
  onConfirm: () => void
  onCancel: () => void
  theme?: 'primary' | 'secondary' | 'delete'
}

/**
 * ConfirmDialog 컴포넌트는 사용자에게 확인을 요청하는 다이얼로그를 렌더링합니다.
 *
 * @property {string} message - 다이얼로그에 표시할 주요 메시지.
 * @property {string} description - 주요 메시지 아래에 표시할 설명 텍스트.
 * @property {string} confirmText - 확인 버튼에 표시할 텍스트.
 * @property {string} cancelText - 취소 버튼에 표시할 텍스트.
 * @property {function} onConfirm - 확인 버튼이 클릭될 때 호출할 함수.
 * @property {function} onCancel - 취소 버튼이 클릭될 때 호출할 함수.
 * @returns {JSX.Element} 렌더링된 ConfirmDialog 컴포넌트.
 */

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  message,
  description,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  theme = 'primary',
}) => {
  return (
    <div className="bg-opacity-50 fixed inset-0 z-100 flex h-screen w-full items-center justify-center bg-black">
      <div className="mx-4 flex h-[278px] w-full flex-col items-center justify-center gap-2 bg-white p-6 md:mx-0 md:w-[480px]">
        <h2 className="mb-2 text-center text-2xl font-semibold">{message}</h2>
        <p
          className="mb-4 text-center text-sm text-gray-600"
          dangerouslySetInnerHTML={{ __html: description.replace(/\n/g, '<br />') }}
        ></p>
        <div className="flex items-center justify-center space-x-2">
          <button
            className="box-border h-12 w-28 rounded-md border border-neutral-500 px-2 text-lg text-gray-700 transition-all hover:bg-gray-700 hover:text-white"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className={`box-border h-12 w-28 rounded-md ${
              theme === 'primary' ? 'bg-brand-1' : theme === 'secondary' ? 'bg-brandblue-1' : 'bg-[#ff2525]'
            } px-2 text-lg text-white transition-all`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
