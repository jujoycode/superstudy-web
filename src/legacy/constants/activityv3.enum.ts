import { ActivityType, SubjectType } from '@/legacy/generated/model'

export const ACTIVITYV3_TYPE_KOR: Record<SubjectType, string> = {
  [SubjectType.LECTURE]: '교과',
  [SubjectType.ACTIVITY]: '창체',
  [SubjectType.ETC]: '기타',
}

export const ACTIVITY_SESSION_TYPE_KOR: Record<ActivityType, string> = {
  [ActivityType.POST]: '과제',
  [ActivityType.SURVEY]: '설문',
  [ActivityType.NOTICE]: '공지',
}

export const NOTICE_TYPE_ENG: Record<ActivityType, string> = {
  [ActivityType.POST]: '과제',
  [ActivityType.SURVEY]: '설문',
  [ActivityType.NOTICE]: '공지',
}
