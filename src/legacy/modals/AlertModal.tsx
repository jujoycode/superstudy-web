interface AlertModalProps {
  head: string;
  message: string;  
  isOpen: boolean;
  onClose: () => void;  
}

function AlertModal({ isOpen, onClose, head, message}: AlertModalProps) {
  if (!isOpen) return null; // 모달이 열려있지 않으면 아무것도 렌더링하지 않음

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-4">
          {head}
        </h2>
        <p className=" mb-6">
          {message}
        </p>
        <div className="flex justify-between space-x-2">
          <button
            onClick={onClose}
            className="w-full py-2 bg-gray-200 text-black hover:text-white rounded-lg hover:bg-gray-600 transition"
          >
            확인
          </button>          
        </div>
      </div>
    </div>
  );
}

export default AlertModal;
