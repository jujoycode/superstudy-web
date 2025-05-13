import QueryString from 'qs'

import { useHistory } from '@/hooks/useHistory'

import { useQueryParams } from './useQueryParams'

export const useHandleGoBack = (path: string) => {
  const history = useHistory()
  const { getStoredQueryParams } = useQueryParams()
  const queryParams = getStoredQueryParams()

  const handleGoBack = () => {
    const queryStringified = QueryString.stringify(queryParams)

    if (Object.keys(queryParams).length > 0) {
      history.push(`${path}?${queryStringified}`)
    } else {
      history.push(path)
    }
  }

  return handleGoBack
}
