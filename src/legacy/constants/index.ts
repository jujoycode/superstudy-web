import { globalEnv } from '@/legacy/util/global-env'

export const Constants = {
  imageUrl: `${globalEnv.apiBaseUrl}/api/images?url=`,
} as const
