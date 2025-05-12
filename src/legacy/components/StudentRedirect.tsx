import { meState, childState } from '@/stores'
import { Navigate } from 'react-router-dom'
import { useRecoilValue } from 'recoil'

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
