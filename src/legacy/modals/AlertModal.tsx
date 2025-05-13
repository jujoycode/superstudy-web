interface AlertModalProps {
  head: string
  message: string
  isOpen: boolean
  onClose: () => void
}

function AlertModal({ isOpen, onClose, head, message }: AlertModalProps) {
  if (!isOpen) return null // 모달이 열려있지 않으면 아무것도 렌더링하지 않음

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="w-96 rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-semibold">{head}</h2>
        <p className="mb-6">{message}</p>
        <div className="flex justify-between space-x-2">
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-gray-200 py-2 text-black transition hover:bg-gray-600 hover:text-white"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  )
}

export default AlertModal
