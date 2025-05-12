import clsx from 'clsx';
import { use100vh } from 'react-div-100vh';
import { Icon } from './icons';

interface IBBlankProps {
  type?: 'main' | 'section' | 'opacity' | 'section-opacity';
}

export function IBBlank({ type = 'main' }: IBBlankProps) {
  if (type === 'main') {
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
          'absolute right-0 top-0 z-100 m-0 flex h-screen w-[calc(100%-224px)] items-center justify-center',
          'bg-primary-gray-50',
        )}
      >
        <Icon.LoaderOrangeCommon />
      </div>
    );
  } else if (type === 'opacity') {
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
          'absolute right-0 top-0 z-100 m-0 flex h-screen w-[calc(100%-224px)] items-center justify-center opacity-60',
          'bg-primary-gray-50',
        )}
      >
        <Icon.LoaderOrangeCommon />
      </div>
    );
  }

  return (
    <div
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      className={clsx(
        'z-100 flex h-full w-full items-center justify-center',
        'bg-white',
        type === 'section-opacity' &&
          'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform bg-primary-gray-50 opacity-80',
      )}
    >
      <Icon.LoaderOrangeCommon />
    </div>
  );
}
