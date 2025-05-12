import { useState, useEffect, type RefObject } from 'react'

const useIntersectionObserver = (elementRef: RefObject<HTMLElement>, options: IntersectionObserverInit): boolean => {
  const [isIntersecting, setIsIntersecting] = useState<boolean>(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
    }, options)

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current)
      }
    }
  }, [elementRef, options])

  return isIntersecting
}

export default useIntersectionObserver
