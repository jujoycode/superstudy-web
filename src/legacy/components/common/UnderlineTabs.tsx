import clsx from 'clsx'
import React, { ReactNode } from 'react'

interface TabProps<T> {
  value: T
  children: ReactNode
}

export function Tab<T>({ children }: TabProps<T>) {
  return <div>{children}</div>
}

interface UnderlineTabsProps<T> {
  children: React.ReactElement<TabProps<T>>[]
  value: T
  onChange: (value: T) => void
}

export function UnderlineTabs<T>({ children, value, onChange }: UnderlineTabsProps<T>) {
  const handleTabClick = (val: T) => {
    onChange(val)
  }

  return (
    <div className="flex h-12 w-max items-end">
      {children.map((tab, index) => (
        <div
          key={String(tab.props.value)}
          onClick={() => handleTabClick(tab.props.value)}
          className={clsx(
            'flex cursor-pointer items-center justify-center px-4 py-[9px]',
            value === tab.props.value ? 'border-b-2 border-[#121316] text-[#121316]' : 'mb-[2px] text-[#898d94]',
          )}
        >
          <div className="shrink grow basis-0 text-center text-[16px] leading-[24px] font-semibold">
            {tab.props.children}
          </div>
        </div>
      ))}
    </div>
  )
}
