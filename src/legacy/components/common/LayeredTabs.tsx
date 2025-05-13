import clsx from 'clsx'
import React, { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

import { Typography } from './Typography'

interface TabProps<T> {
  value: T
  children: ReactNode
  className?: string
  childrenWrapperClassName?: string
}

export function Tab<T>({ children, className }: TabProps<T>) {
  return <div className={className}>{children}</div>
}

interface LayeredTabsProps<T> {
  children: React.ReactElement<TabProps<T>>[]
  value: T
  onChange: (value: T) => void
  fullWidth?: boolean
  className?: string
  inActiveClassName?: string
  size?: 'large' | 'small'
}

function OneDepth<T>({ children, value, onChange, className, inActiveClassName, size = 'large' }: LayeredTabsProps<T>) {
  const handleTabClick = (val: T) => {
    onChange(val)
  }
  return (
    <div className="flex h-12 w-max flex-row items-end gap-4">
      {children.map((tab) => (
        <div
          key={String(tab.props.value)}
          onClick={() => handleTabClick(tab.props.value)}
          className={twMerge(
            clsx(
              'flex min-w-[44px] cursor-pointer items-center justify-center px-2 py-2.5 text-base font-semibold',
              value === tab.props.value ? 'border-b-2 border-[#121316] text-[#121316]' : 'mb-[2px] text-[#898d94]',
            ),
            className,
            value === tab.props.value && inActiveClassName,
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

function TwoDepth<T>({ children, value, onChange, fullWidth = false, size = 'large' }: LayeredTabsProps<T>) {
  const handleTabClick = (val: T) => {
    onChange(val)
  }

  return (
    <div
      className={clsx(
        'flex items-center border border-[#e8eaec] bg-[#f4f6f8]',
        fullWidth && 'w-full',
        size === 'large' ? 'rounded-lg' : 'h-8 rounded-md',
      )}
    >
      {children.map((tab, index) => {
        const isActive = value === tab.props.value
        return (
          <div
            key={String(tab.props.value)}
            onClick={() => handleTabClick(tab.props.value)}
            className={clsx(
              'flex h-full cursor-pointer items-center justify-center',
              size === 'large' ? 'rounded-lg px-4 py-[9px]' : 'rounded-md px-3 py-1.5',
              isActive ? 'bg-white text-[#121316]' : 'bg-[#f4f6f8] text-[#898d94]',
              isActive && index === 0
                ? size === 'large'
                  ? 'border-r-primary-gray-200 rounded-l-lg border-r'
                  : 'border-r-primary-gray-200 rounded-l-md border-r'
                : isActive && index === children.length - 1
                  ? size === 'large'
                    ? 'border-l-primary-gray-200 rounded-r-lg border-l'
                    : 'border-l-primary-gray-200 rounded-r-md border-l'
                  : isActive
                    ? 'border-primary-gray-200 border-r border-l'
                    : '',
              fullWidth && 'flex-grow basis-0 text-center',
              tab.props.childrenWrapperClassName,
            )}
          >
            <div className="shrink grow basis-0 text-center text-[14px] leading-snug font-medium">
              {tab.props.children}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ThirdDepth<T>({ children, value, onChange }: LayeredTabsProps<T>) {
  const handleTabClick = (val: T) => {
    onChange(val)
  }

  return (
    <div className="flex w-max flex-row items-center gap-2">
      {children.map((tab) => {
        const isActive = value === tab.props.value
        return (
          <div
            key={String(tab.props.value)}
            onClick={() => handleTabClick(tab.props.value)}
            className={clsx(
              'flex cursor-pointer items-center justify-center rounded-lg px-4 py-[9px]',
              isActive
                ? 'bg-primary-gray-700 text-white'
                : 'bg-primary-gray-50 text-primary-gray-700 hover:bg-primary-gray-200',
            )}
          >
            <div className="text-center text-[15px] font-medium">{tab.props.children}</div>
          </div>
        )
      })}
    </div>
  )
}

function Title<T>({ children, className, value, onChange }: LayeredTabsProps<T>) {
  const handleTabClick = (val: T) => {
    onChange(val)
  }

  return (
    <div className={twMerge('flex w-max flex-row items-center gap-4', className)}>
      {children.map((tab) => {
        const isActive = value === tab.props.value
        return (
          <div key={String(tab.props.value)} onClick={() => handleTabClick(tab.props.value)}>
            <Typography
              variant="title1"
              className={clsx('cursor-pointer', isActive ? 'text-primary-gray-900' : 'text-primary-gray-400')}
            >
              {tab.props.children}
            </Typography>
          </div>
        )
      })}
    </div>
  )
}

export const LayeredTabs = {
  OneDepth,
  TwoDepth,
  ThirdDepth,
  Title,
  Tab,
}
