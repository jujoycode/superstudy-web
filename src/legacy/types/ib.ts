import type { ResponseIBDto } from '@/legacy/generated/model'

// location
export interface LocationState {
  data: ResponseIBDto
  student: { klassNum: string; name: string }
}
