import { useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router'

type ReplaceOptions = {
  pathname?: string
  search?: string
}

export function useHistory() {
  const navigate = useNavigate()
  const location = useLocation()

  const push = useCallback(
    (path: string, state?: any) => {
      navigate(path, { state })
    },
    [navigate],
  )

  const replace = useCallback(
    (pathOrOptions: string | ReplaceOptions, search?: string) => {
      if (typeof pathOrOptions === 'string') {
        navigate(search ? `${pathOrOptions}${search}` : pathOrOptions, { replace: true })
      } else {
        const { pathname = location.pathname, search = '' } = pathOrOptions
        navigate(
          {
            pathname,
            search: search.startsWith('?') ? search : `?${search}`,
          },
          { replace: true },
        )
      }
    },
    [navigate, location.pathname],
  )

  const goBack = useCallback(() => {
    navigate(-1)
  }, [navigate])

  return {
    push,
    replace,
    goBack,
    location,
  }
}
