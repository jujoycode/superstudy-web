import CacheBuster from 'react-cache-buster'
import { version } from '../package.json' with { type: 'json' }
import { RouterProvider } from 'react-router-dom'
import { Blank } from '@/legacy/components/common'
import { router } from '@/routers'

export function App() {
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
      <RouterProvider router={router} />
    </CacheBuster>
  )
}
