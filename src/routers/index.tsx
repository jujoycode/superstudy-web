import { createBrowserRouter, type RouteObject } from 'react-router'

/**
 * Router
 * @desc Super School 전체 라우터
 * @author Suh Jihun
 */
export const routers: RouteObject[] = [
  {
    path: '/',
    element: <>Render Check</>,
    index: true,
  },
]

export const router = createBrowserRouter(routers)
