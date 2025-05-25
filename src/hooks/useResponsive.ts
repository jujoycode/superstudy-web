import { useMediaQuery } from 'react-responsive'

interface ResponsiveConfig {
  mobile?: number
  tablet?: number
  desktop?: number
  custom?: number
}

const DEFAULT_CONFIG: ResponsiveConfig = {
  mobile: 770,
  tablet: 1024,
  desktop: 1025,
  custom: 0
}

export const useResponsive = (config: ResponsiveConfig = {}) => {
  const { mobile, tablet, desktop, custom = [] } = { ...DEFAULT_CONFIG, ...config }

  const isMobile = useMediaQuery({ query: `(max-width: ${mobile}px)` })
  const isTablet = useMediaQuery({ query: `(max-width: ${tablet}px)` })
  const isDesktop = useMediaQuery({ query: `(min-width: ${desktop}px)` })
  const isCustom = useMediaQuery({ query: `(min-width: ${custom}px)` })

  return { isMobile, isTablet, isDesktop, isCustom }
}

