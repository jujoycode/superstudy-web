import { Navigate } from 'react-router-dom'
import { useRecoilValue } from 'recoil'

import { meState, childState } from '@/stores'

export const StudentRedirect = () => {
  const me = useRecoilValue(meState)
  const myChild = useRecoilValue(childState)
  return (
    <Navigate
      to={me?.school.isCourseActive || myChild?.school.isCourseActive ? '/student/courseentrance' : '/student/canteen'}
      replace
    />
  )
}
