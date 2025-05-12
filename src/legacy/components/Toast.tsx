import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { toastState, warningState } from 'src/store';

// 사용법 :
// const setToastMsg = useSetRecoilState(toastState);
// setToastMsg("토스트 표시할 메시지");

interface ToastProps {
  setToast: (toast: boolean) => void;
  text: string;
}

export function Toast() {
  const [toastMsg, setToastMsg] = useRecoilState(toastState);
  const [warningMsg, setWarningMsg] = useRecoilState(warningState);

  useEffect(() => {
    const timer = setTimeout(
      () => {
        setToastMsg(undefined);
        setWarningMsg(undefined);
      },
      warningMsg ? 6000 : 3000,
    );
    return () => {
      clearTimeout(timer);
    };
  }, [toastMsg, warningMsg]);

  return (
    <>
      {(toastMsg || warningMsg) && (
        <div className="fixed bottom-2 left-1/2 z-[5000] w-3/4 -translate-x-1/2 transform p-4 text-white md:bottom-5 md:w-[600px]">
          <div
            className={`rounded-lg ${warningMsg ? 'bg-red-600' : 'bg-black'} bg-opacity-50 p-4 text-center backdrop-blur-sm`}
          >
            {warningMsg || toastMsg}
          </div>
        </div>
      )}
    </>
  );
}
