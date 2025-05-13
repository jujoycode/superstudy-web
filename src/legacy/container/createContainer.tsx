import React from 'react'

interface ContextProviderProps {
  children: React.ReactNode
}

export function createContainer<T>(hooks: () => T) {
  const CurrentContext = React.createContext<T | null>(null)

  const useContext = () => {
    const contextValue = React.useContext(CurrentContext)
    if (!contextValue) {
      throw Error('ContextProvider 선언하지 않으면 사용 불가')
    }
    return contextValue
  }

  const ContextProvider = (props: ContextProviderProps) => {
    return <CurrentContext.Provider value={hooks()}>{props.children}</CurrentContext.Provider>
  }

  return { useContext, ContextProvider }
}
