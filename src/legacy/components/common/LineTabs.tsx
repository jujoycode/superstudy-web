import clsx from 'clsx';
import React, { ReactNode } from 'react';

interface TabProps<T> {
  value: T;
  children: ReactNode;
}

export function Tab<T>({ children }: TabProps<T>) {
  return <div>{children}</div>;
}

interface LineTabsProps<T> {
  children: React.ReactElement<TabProps<T>>[];
  value: T;
  onChange: (value: T) => void;
}

export function LineTabs<T>({ children, value, onChange }: LineTabsProps<T>) {
  const handleTabClick = (val: T) => {
    onChange(val);
  };

  return (
    <div className="flex w-max items-center gap-4 border-b border-[#e8eaec]">
      {children.map((tab) => (
        <div
          key={String(tab.props.value)}
          onClick={() => handleTabClick(tab.props.value)}
          className={clsx(
            'flex min-w-[44px] cursor-pointer items-center justify-center bg-white px-2 py-2.5',
            value === tab.props.value
              ? 'border-b-2 border-[#121316] font-semibold text-[#121316]'
              : 'font-semibold text-[#898d94]',
          )}
        >
          <div className="shrink grow basis-0 text-center font-['Pretendard'] text-base leading-normal">
            {tab.props.children}
          </div>
        </div>
      ))}
    </div>
  );
}
