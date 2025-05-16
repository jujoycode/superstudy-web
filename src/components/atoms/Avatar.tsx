import { useState } from 'react'
import { cn } from '@/utils/commonUtil'

interface AvatarProps {
  src: string
  alt?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  rounded?: 'none' | 'sm' | 'md' | 'full'
}

export function Avatar({ src, alt = '', className, size = 'md', rounded = 'full' }: AvatarProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setError(true)
    setIsLoading(false)
  }

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  }

  // Tailwind에서 w-12는 48px입니다 (12 * 4px = 48px)

  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded',
    md: 'rounded-lg',
    full: 'rounded-full',
  }

  if (error) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gray-200 text-gray-400',
          sizeClasses[size],
          roundedClasses[rounded],
          className,
        )}
        role="img"
        aria-label={alt || '프로필 이미지 로드 실패'}
      >
        {alt?.charAt(0) || '?'}
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden', sizeClasses[size], roundedClasses[rounded], className)}>
      {isLoading && <div className={cn('absolute inset-0 animate-pulse bg-gray-200', roundedClasses[rounded])} />}
      <img
        src={src}
        alt={alt || '프로필 이미지'}
        className={cn(
          'h-full w-full object-cover transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
        )}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  )
}
