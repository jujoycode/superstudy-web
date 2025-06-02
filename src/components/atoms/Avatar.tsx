import { useState } from 'react'
import noProfileImg from '@/assets/images/no_profile.png'
import { cn } from '@/utils/commonUtil'

interface AvatarProps {
  src?: string
  alt?: string
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'full'
  rounded?: 'none' | 'sm' | 'md' | 'full'
}

export function Avatar({ src, alt = '', className, size = 'md', rounded = 'full' }: AvatarProps) {
  const [isLoading, setIsLoading] = useState(!!src)
  const [error, setError] = useState(false)

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setError(true)
    setIsLoading(false)
  }

  function getImageUrl(src: string) {
    return `${process.env.REACT_APP_API_URL}/api/images?url=${src}`
  }

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    full: 'w-full h-full',
  }

  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-lg',
    md: 'rounded-xl',
    full: 'rounded-full',
  }

  if (!src || error) {
    return (
      <div className={cn('relative overflow-hidden', sizeClasses[size], roundedClasses[rounded], className)}>
        <img src={noProfileImg} alt={alt} className="h-full w-full object-cover" />
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden', sizeClasses[size], roundedClasses[rounded], className)}>
      {isLoading && <div className={cn('absolute inset-0 animate-pulse bg-gray-200', roundedClasses[rounded])} />}
      <img
        src={getImageUrl(src)}
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
