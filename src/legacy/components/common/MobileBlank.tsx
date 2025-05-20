import { cn } from '@/utils/commonUtil'
import { PropsWithChildren } from 'react'
import { use100vh } from 'react-div-100vh'

import { Icon } from './icons'

interface BlankProps {
  text?: string
  reversed?: boolean
}

export function MobileBlank({ text, reversed, children }: PropsWithChildren<BlankProps>) {
  const vh = use100vh()
  const height = vh ? `${vh}px` : '100vh'

  return (
    <div
      style={{ height }}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
      className={cn('fixed inset-0 z-100 m-0 flex h-screen w-full items-center justify-center bg-gray-50 opacity-60')}
    >
      {text || children || reversed ? (
        <div className="text-2xl">
          {text} {children}
        </div>
      ) : (
        <Icon.LoaderOrange />
      )}
    </div>
  )
}
