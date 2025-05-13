import axios, { AxiosError, type AxiosRequestConfig } from 'axios'

import { queryClient } from './query'

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipRefetch?: boolean
  }
}

export const api = axios.create({ baseURL: process.env.REACT_APP_API_URL })

export async function mutator<T>(config: AxiosRequestConfig, options?: AxiosRequestConfig) {
  return api<T>({ ...config, ...options }).then(({ data }) => data)
}

let isRefreshing = false
const getStorage = (key: string) => sessionStorage.getItem(key) || localStorage.getItem(key)
const setStorage = (key: string, value: string) => localStorage.setItem(key, value)
const removeStorage = (key: string) => {
  localStorage.removeItem(key)
  sessionStorage.removeItem(key)
}

const refreshAccessToken = async () => {
  const { data } = await api.post('/api/users/refresh-login', {})
  const { token, refresh_token } = data

  if (token && refresh_token) {
    setStorage('token', token)
    setStorage('refreshToken', refresh_token)
    setStorage('tokenIssue', new Date().toISOString())
    return token
  }
}

api.interceptors.request.use(async (config) => {
  // TODO: 리프레쉬 토큰 발급요청 임시방편으로 주석처리
  // const refreshToken = getStorage('refreshToken');
  // const tokenIssue = getStorage('tokenIssue');
  // const now = new Date().toISOString();
  // const tokenExpiration = tokenIssue
  //   ? new Date(new Date(tokenIssue).getTime() + 23 * 60 * 60 * 1000).toISOString()
  //   : now;

  // if (refreshToken && tokenExpiration <= now && config.url != '/api/users/refresh-login') {
  //   // refresh 요청중 들어오는 요청들은 취소처리
  //   const source = CancelToken.source();
  //   config.cancelToken = source.token;
  //   source.cancel('리프레시 발급 요청중입니다.');

  //   if (!isRefreshing) {
  //     isRefreshing = true;
  //     try {
  //       const newToken = await refreshAccessToken();
  //       if (newToken) {
  //         window.location.reload();
  //       }
  //     } catch (error) {
  //       logout();
  //       return Promise.reject(error);
  //     } finally {
  //       isRefreshing = false;
  //     }
  //   }
  // }

  const token = getStorage(config.url === '/api/users/refresh-login' ? 'refreshToken' : 'token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => {
    const method = response.config.method ?? ''
    const skipRefetch = response.config.skipRefetch ?? false
    if (!skipRefetch && ['post', 'patch', 'put', 'delete'].includes(method)) {
      queryClient.refetchQueries({ active: true })
    }
    return response
  },
  async (error) => {
    handleErrorResponse(error)
    return Promise.reject(error)
  },
)

async function handleErrorResponse(error: any) {
  const errorResponse = error.response?.data
  const statusCode = errorResponse?.code ?? errorResponse?.statusCode ?? 400
  const checkCode = [
    401,
    '1001200', // 토큰이 만료되었습니다.
    '1001201', // 토큰을 찾을 수 없습니다.
    '1001103', // 2차 인증이 통과되지 않았습니다.
  ]

  // FIXME: hooks.ts 의 logout 함수 구조 변경이 필요
  if (checkCode.includes(statusCode)) {
    setStorage('two-factor', 'false')

    if (statusCode === 401) {
      // Unauthorized

      if (!isRefreshing) {
        isRefreshing = true
        try {
          const newToken = await refreshAccessToken()
          if (newToken) {
            window.location.reload()
          }
        } catch (error) {
          removeStorage('token')
          removeStorage('refreshToken')
          setStorage('two-factor', 'false')
          window.location.reload()
        } finally {
          isRefreshing = false
        }
      } else {
        logout()
      }
    } else if (errorResponse.code !== '1001103') {
      logout()
    }
  }
}

function logout() {
  setStorage('two-factor', 'false')
  removeStorage('token')
  removeStorage('refreshToken')
  // const history = useHistory();
  // history.push('/login');
  window.location.reload()
}

export type ErrorType<Error> = AxiosError<Error>
