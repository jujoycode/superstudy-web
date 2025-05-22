import { HTMLAttributes } from 'react'

import { cn } from '@/legacy/lib/tailwind-merge'

import { CloseButton } from './common'

interface SuperModalProps extends HTMLAttributes<HTMLDivElement> {
  modalOpen: boolean
  setModalClose?: () => void
  hasClose?: boolean
  ablePropragation?: boolean
}

export function SuperModal({
  modalOpen,
  setModalClose,
  ablePropragation = false,
  hasClose = true,
  className,
  children,
  ...props
}: SuperModalProps) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-60 flex h-screen w-full items-center justify-center bg-neutral-500/50',
        !modalOpen && 'hidden',
      )}
      onClick={(e) => {
        if (!ablePropragation) {
          e.preventDefault()
          e.stopPropagation()
        }
      }}
    >
      <div className={cn('relative w-80 rounded-lg bg-white', className)} {...props}>
        {hasClose && setModalClose && (
          <div className="absolute top-3 right-3">
            <CloseButton onClick={() => setModalClose()} />
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
