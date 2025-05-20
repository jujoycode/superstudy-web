import { cn } from '@/utils/commonUtil'
import { use100vh } from 'react-div-100vh'

import { Icon } from './icons'

interface IBBlankProps {
  type?: 'main' | 'section' | 'opacity' | 'section-opacity'
}

export function IBBlank({ type = 'main' }: IBBlankProps) {
  if (type === 'main') {
    const vh = use100vh()
    const height = vh ? `${vh}px` : '100vh'

    return (
      <div
        style={{ height }}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        className={cn(
          'absolute top-0 right-0 z-100 m-0 flex h-screen w-[calc(100%-224px)] items-center justify-center',
          'bg-gray-50',
        )}
      >
        <Icon.LoaderOrangeCommon />
      </div>
    )
  } else if (type === 'opacity') {
    const vh = use100vh()
    const height = vh ? `${vh}px` : '100vh'

    return (
      <div
        style={{ height }}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        className={cn(
          'absolute top-0 right-0 z-100 m-0 flex h-screen w-[calc(100%-224px)] items-center justify-center opacity-60',
          'bg-gray-50',
        )}
      >
        <Icon.LoaderOrangeCommon />
      </div>
    )
  }

  return (
    <div
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
      className={cn(
        'z-100 flex h-full w-full items-center justify-center',
        'bg-white',
        type === 'section-opacity' &&
          'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform bg-gray-50 opacity-80',
      )}
    >
      <Icon.LoaderOrangeCommon />
    </div>
  )
}
