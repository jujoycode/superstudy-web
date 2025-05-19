import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from 'react-query'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { GroupContainer } from '@/legacy/container/group'
import { UserContainer } from '@/legacy/container/user'
import { queryClient } from '@/legacy/lib/query'
import { App } from './App'

import './legacy/util/i18n'

import './index.css'
import './calendar.css'
// import 'swiper/swiper.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme="default" setTheme={() => {}}>
        <UserContainer.ContextProvider>
          <GroupContainer.ContextProvider>
            <App />
          </GroupContainer.ContextProvider>
        </UserContainer.ContextProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
