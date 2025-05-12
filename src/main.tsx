import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from 'react-query'
import { RecoilRoot } from 'recoil'
import { GroupContainer } from '@/legacy/container/group'
import { UserContainer } from '@/legacy/container/user'
import { queryClient } from '@/legacy/lib/query'
import { App } from './App'
import './legacy/util/i18n'
import './legacy/calendar.css'
import './legacy/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        <UserContainer.ContextProvider>
          <GroupContainer.ContextProvider>
            <App />
          </GroupContainer.ContextProvider>
        </UserContainer.ContextProvider>
      </QueryClientProvider>
    </RecoilRoot>
  </StrictMode>,
)
