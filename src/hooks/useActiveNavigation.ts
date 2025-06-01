import { useMemo } from 'react'
import { useLocation } from 'react-router'

interface UseActiveNavigationProps {
  path: string
  exact?: boolean
  isDynamicRoute?: boolean
}

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
   * @param isDynamicRoute 동적 라우트 여부 (true: 쿼리 파라미터나 추가 경로 세그먼트가 있어도 매칭)
   * @returns 활성화 여부 (boolean)
   */
  const isActive = useMemo(() => {
    return ({ path, exact = false, isDynamicRoute = false }: UseActiveNavigationProps): boolean => {
      if (exact) {
        return location.pathname === path
      }

      // 특수 케이스: 홈 경로 ('/')
      if (path === '/') {
        return location.pathname === '/'
      }

      // 동적 라우트 처리
      if (isDynamicRoute) {
        // 쿼리 파라미터 제거
        const baseUrl = path.split('?')[0]
        const currentPathWithoutQuery = location.pathname.split('?')[0]

        if (currentPathWithoutQuery.startsWith(baseUrl)) {
          // 정확히 일치하는 경우
          if (currentPathWithoutQuery === baseUrl) {
            return true
          }

          // baseUrl 다음에 오는 세그먼트 체크
          const remainingPath = currentPathWithoutQuery.slice(baseUrl.length)

          // baseUrl 다음에 '/'로 시작하는지 확인 (경로 구조가 맞는지)
          if (remainingPath.startsWith('/')) {
            // 다음 세그먼트 추출 (ID 또는 다른 경로명)
            const nextSegment = remainingPath.split('/')[1]

            // 다음 세그먼트가 숫자인 경우 (ID로 추정) -> 활성화
            // 또는 다음 세그먼트가 없는 경우 (끝에 '/'만 있는 경우) -> 활성화
            // 또는 다음 세그먼트가 날짜 형식(YYYY-MM-DD)인 경우 -> 활성화
            if (
              !nextSegment ||
              /^\d+$/.test(nextSegment) ||
              /^\d{4}-\d{2}-\d{2}$/.test(nextSegment) ||
              /^\d{4}-\d{1,2}-\d{1,2}$/.test(nextSegment)
            ) {
              return true
            }
          }

          // 그 외의 경우는 비활성화
          return false
        }

        return false
      }

      return location.pathname.startsWith(path)
    }
  }, [location.pathname])

  return { isActive }
}
