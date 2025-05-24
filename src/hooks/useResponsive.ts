import { useMediaQuery } from 'react-responsive'

export const useResponsive = () => {
  const isMobile = useMediaQuery({ query: '(max-width: 770px)' })
  const isTablet = useMediaQuery({ query: '(max-width: 1024px)' })
  const isDesktop = useMediaQuery({ query: '(min-width: 1025px)' })

  return { isMobile, isTablet, isDesktop }
}

