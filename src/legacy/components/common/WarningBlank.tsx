import clsx from 'clsx';
import { use100vh } from 'react-div-100vh';
import { Icon } from './icons';

export function WarningBlank() {
  const vh = use100vh();
  const height = vh ? `${vh}px` : '100vh';

  return (
    <div
      style={{ height }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      className={clsx(
        'fixed inset-0 z-100 m-0 flex h-screen w-full items-center justify-center bg-[#000000] opacity-60',
      )}
    >
      <div className="hidden text-white md:flex md:flex-col md:justify-center">
        <Icon.LoaderOrangePC />
        <p>작성한 내용을 제출 중입니다...</p>
        <p>페이지를 나가면 서류제출이 취소됩니다.</p>
      </div>
      <div className="flex flex-col items-center justify-center text-white md:hidden">
        <Icon.LoaderOrange />
        <p>작성한 내용을 제출 중입니다...</p>
        <p>페이지를 나가면 서류제출이 취소됩니다.</p>
      </div>
    </div>
  );
}
