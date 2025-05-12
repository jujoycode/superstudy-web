// ! 개선 필요
import { useHistory, useLocation } from 'react-router-dom'

export const useQueryParams = () => {
  const location = useLocation()
  const history = useHistory()

  const setQueryParams = (params: Record<string, string>) => {
    const queryString = new URLSearchParams(params).toString()
    history.push(`${location.pathname}?${queryString}`)
  }

  const addQueryParams = (newParams: Record<string, string>) => {
    const currentParams = getQueryParams()
    const mergedParams = { ...currentParams, ...newParams }
    const queryString = new URLSearchParams(mergedParams).toString()
    history.replace(`${location.pathname}?${queryString}`)
  }

  const getQueryParams = () => {
    return Object.fromEntries(new URLSearchParams(location.search).entries())
  }

  const pushWithQueryParams = (path: string) => {
    const queryParams = getQueryParams()
    const queryString = new URLSearchParams(queryParams).toString()
    history.push(`${path}?${queryString}`)
  }

  const replaceWithQueryParams = (path: string, newParams: Record<string, string>) => {
    const currentParams = getQueryParams()
    const mergedParams = { ...currentParams, ...newParams }
    const queryString = new URLSearchParams(mergedParams).toString()
    history.replace(`${path}?${queryString}`)
  }

  const setQueryParamsWithStorage = (params: Record<string, string>) => {
    sessionStorage.setItem('queryParams', JSON.stringify(params))
  }

  const getStoredQueryParams = () => {
    const storedParams = sessionStorage.getItem('queryParams')
    return storedParams ? JSON.parse(storedParams) : {}
  }

  const removeStoredQueryParams = () => {
    sessionStorage.removeItem('queryParams')
  }

  return {
    setQueryParams,
    addQueryParams,
    getQueryParams,
    pushWithQueryParams,
    replaceWithQueryParams,
    setQueryParamsWithStorage,
    getStoredQueryParams,
    removeStoredQueryParams,
  }
}
