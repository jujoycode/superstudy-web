import { useUserRefreshToken } from '@/legacy/generated/endpoint'
import { useBrowserStorage } from '@/legacy/hooks/useBrowserStorage'

export function useRefreshToken() {
  const { setStorage } = useBrowserStorage()

  const tokenIssue = localStorage.getItem('tokenIssue')
  const tokenIssueDate = tokenIssue ? new Date(tokenIssue) : new Date()
  tokenIssueDate.setDate(tokenIssueDate.getDate() + 1)

  const needRenew = tokenIssue ? tokenIssueDate < new Date() : true

  useUserRefreshToken({
    query: {
      enabled: needRenew,
      onSuccess: (res) => {
        if (res?.token) {
          setStorage('token', res?.token)
        }
      },
    },
  })

  return {}
}
