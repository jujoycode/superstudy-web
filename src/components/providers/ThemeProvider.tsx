import { createContext, useEffect, useContext, type ReactNode } from 'react'
import { ThemeConstant, THEME_ENUM } from '@/constants/themeConstant'

interface ThemeContextType {
  theme: THEME_ENUM
  setTheme: (theme: THEME_ENUM) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
  theme: THEME_ENUM
  setTheme: (theme: THEME_ENUM) => void
}

export function ThemeProvider({ children, theme, setTheme }: ThemeProviderProps) {
  useEffect(() => {
    const currentTheme = ThemeConstant.Themes[theme]
    const root = document.documentElement

    // CSS 변수 설정
    Object.entries(currentTheme).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value as string)
    })
  }, [theme])

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return context
}
