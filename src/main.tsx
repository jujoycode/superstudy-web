import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from 'react-query'
import { ThemeProvider, type Theme } from '@/providers/ThemeProvider'
import { DialogProvider } from '@/legacy/container/DialogContext'
import { GroupContainer } from '@/legacy/container/group'
import { UserContainer } from '@/legacy/container/user'
import { queryClient } from '@/legacy/lib/query'
import { App } from './App'

import './legacy/util/i18n'

import './index.css'
import './calendar.css'

import 'tui-calendar/dist/tui-calendar.css'
import 'tui-date-picker/dist/tui-date-picker.css'
import 'tui-time-picker/dist/tui-time-picker.css'

export function Root() {
  const [theme, setTheme] = useState<Theme>('default')

  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme} setTheme={setTheme}>
          <UserContainer.ContextProvider>
            <GroupContainer.ContextProvider>
              <DialogProvider>
                <App />
              </DialogProvider>
            </GroupContainer.ContextProvider>
          </UserContainer.ContextProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>
  )
}

createRoot(document.getElementById('root')!).render(<Root />)
