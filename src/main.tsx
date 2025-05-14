import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from 'react-query'
import { GroupContainer } from '@/legacy/container/group'
import { UserContainer } from '@/legacy/container/user'
import { queryClient } from '@/legacy/lib/query'
import './legacy/util/i18n'

import { App } from './App'

import './index.css'
// import './calendar.css'
// import 'swiper/swiper.css'

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
