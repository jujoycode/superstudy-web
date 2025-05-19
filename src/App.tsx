import { RouterProvider } from 'react-router'
import { router } from '@/routers'

export function App() {
  return <RouterProvider router={router} />
}
