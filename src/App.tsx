import CacheBuster from 'react-cache-buster'
import { version } from '../package.json' with { type: 'json' }
import { createBrowserRouter, RouterProvider, type RouteObject } from 'react-router'

// 수정
import { Blank } from '@/legacy/components/common'

export function App() {
  const routes = createBrowserRouter([] as RouteObject[])

  return (
    <CacheBuster
      currentVersion={version}
      isEnabled // If false, the library is disabled.
      isVerboseMode={false} // If true, the library writes verbose logs to console.
      loadingComponent={<Blank />} // If not pass, nothing appears at the time of new version check.
      onCacheClear={() => {
        // TODO: 캐시 삭제 로직 추가
        console.log('cache cleared')
      }}
    >
      <RouterProvider router={routes} />
    </CacheBuster>
  )
}
