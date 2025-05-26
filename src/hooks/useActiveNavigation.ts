import { useMemo } from 'react'
import { useLocation } from 'react-router'

/**
 * 현재 라우트 경로와 메뉴 경로를 비교하여 활성화 상태를 확인하는 훅
 * @returns 현재 경로가 주어진 경로와 일치하는지 확인하는 함수
 */
export function useActiveNavigation() {
  const location = useLocation()

  /**
   * 현재 경로가 주어진 경로와 일치하는지 확인
   * @param path 비교할 메뉴 경로
   * @param exact 정확히 일치하는지 여부 (true: 정확히 일치, false: 경로가 포함되면 일치)
   * @returns 활성화 여부 (boolean)
   */
  const isActive = useMemo(() => {
    return (path: string, exact: boolean = false): boolean => {
      if (exact) {
        return location.pathname === path
      }

      // 특수 케이스: 홈 경로 ('/')
      if (path === '/') {
        return location.pathname === '/'
      }

      return location.pathname.startsWith(path)
    }
  }, [location.pathname])

  return { isActive }
}
