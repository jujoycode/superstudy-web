import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from 'react-query'

import { GroupContainer } from '@/legacy/container/group'
import { UserContainer } from '@/legacy/container/user'
import { queryClient } from '@/legacy/lib/query'

import { App } from './App'

import '@/legacy/util/i18n'
import '@/legacy/styles/CalendarPage.css'
import 'swiper/css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <UserContainer.ContextProvider>
        <GroupContainer.ContextProvider>
          <App />
        </GroupContainer.ContextProvider>
      </UserContainer.ContextProvider>
    </QueryClientProvider>
  </StrictMode>,
)
