import { Navigate, Route } from 'react-router-dom'
import { useUserStore } from '@/stores/user'

export const StudentRedirect = () => {
  const { me, child: myChild } = useUserStore()

  return (
    <Route
      element={
        <Navigate
          to={
            me?.school.isCourseActive || myChild?.school.isCourseActive ? '/student/courseentrance' : '/student/canteen'
          }
          replace
        />
      }
    />
  )
}
