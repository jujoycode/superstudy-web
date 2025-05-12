import { atom, type AtomEffect } from 'recoil'
import type { ResponseSchoolPropertyDto, ResponseUserDto } from '@/legacy/generated/model'
import type { Languages } from '@/legacy/util/i18n'

const storageEffect =
  (key: string): AtomEffect<string | null> =>
  ({ setSelf }) => {
    setSelf(localStorage.getItem(key) || sessionStorage.getItem(key))
  }

const localStorageEffect =
  (key: string): AtomEffect<any> =>
  ({ setSelf, onSet }) => {
    const savedValue = localStorage.getItem(key)
    if (savedValue !== null) {
      setSelf(JSON.parse(savedValue))
    }
    onSet((newValue, _, isReset) => {
      isReset ? localStorage.removeItem(key) : localStorage.setItem(key, JSON.stringify(newValue))
    })
  }

export const tokenState = atom<string | null>({ key: 'token', default: null, effects: [storageEffect('token')] })

export const refreshTokenState = atom<string | null>({
  key: 'refreshToken',
  default: null,
  effects: [storageEffect('refreshToken')],
})

export const twoFactorState = atom<string | null>({
  key: 'two-factor',
  default: 'false',
  effects: [storageEffect('two-factor')],
})

export const meState = atom<ResponseUserDto | undefined>({ key: 'me', default: undefined })

export const childState = atom<ResponseUserDto | undefined>({ key: 'child', default: undefined })

export const selectedGroupIdState = atom<number | undefined>({ key: 'selectedGroupId', default: 0 })

export const isUpdateMeState = atom({ key: 'isUpdateMe', default: false })

export const isUpdateNoticeState = atom({ key: 'isUpdateNotice', default: false })

export const isStayLoggedInState = atom<boolean>({
  key: 'isStayLoggedIn',
  default: true,
  effects: [localStorageEffect('isStayLoggedIn')],
})

export const newsletterOpenedGroupState = atom<string[]>({ key: 'newsletterOpenedGroup', default: [] })

export const newMsgCntState = atom({ key: 'newMsgCnt', default: 0 })

export const toastState = atom<string | undefined>({ key: 'toastMsg', default: undefined })
export const warningState = atom<string | undefined>({ key: 'warningMsg', default: undefined })

export const languageState = atom<Languages>({
  key: 'languageState',
  default: 'ko',
  effects: [localStorageEffect('languageState')],
})

export const schoolPropertiesState = atom<ResponseSchoolPropertyDto[] | undefined>({
  key: 'schoolProperties',
  default: undefined,
})
