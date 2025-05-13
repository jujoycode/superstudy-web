import { createContext, useContext, useState } from 'react'
import AlertModal from '@/legacy/modals/AlertModal'
import ConfirmModal from '@/legacy/modals/ConfirmModal'

type DialogType = 'confirm' | 'alert'

type DialogContextType = {
  alert(message: string): Promise<void>
  alert(title: string, message: string): Promise<void>
  confirm(message: string): Promise<boolean>
  confirm(title: string, message: string): Promise<boolean>
}

const DialogContext = createContext<DialogContextType | undefined>(undefined)

export const useDialog = () => {
  const context = useContext(DialogContext)
  if (!context) throw new Error('useDialog must be used within DialogProvider')
  return context
}

export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [dialogType, setDialogType] = useState<DialogType>('alert')
  const [message, setMessage] = useState('')
  const [title, setTitle] = useState('')
  const [resolver, setResolver] = useState<(value: any) => void>(() => () => {})

  const openDialog = (type: DialogType, title: string, message: string): Promise<any> => {
    setTitle(title)
    setMessage(message)
    setDialogType(type)
    setIsOpen(true)
    return new Promise((resolve) => setResolver(() => resolve))
  }

  const confirm = (arg1: string, arg2?: string): Promise<boolean> => {
    if (arg2 !== undefined) {
      return openDialog('confirm', arg1, arg2)
    } else {
      return openDialog('confirm', '확인', arg1)
    }
  }

  const alert = (arg1: string, arg2?: string): Promise<void> => {
    if (arg2 !== undefined) {
      return openDialog('alert', arg1, arg2)
    } else {
      return openDialog('alert', '알림', arg1)
    }
  }

  const handleConfirm = () => {
    setIsOpen(false)
    resolver(true)
  }

  const handleCancel = () => {
    setIsOpen(false)
    resolver(false)
  }

  const handleAlertClose = () => {
    setIsOpen(false)
    resolver(true)
  }

  return (
    <DialogContext.Provider value={{ confirm, alert }}>
      {children}
      {dialogType === 'alert' ? (
        <AlertModal isOpen={isOpen} head={title} message={message} onClose={handleAlertClose} />
      ) : (
        <ConfirmModal isOpen={isOpen} head={title} message={message} onConfirm={handleConfirm} onClose={handleCancel} />
      )}
    </DialogContext.Provider>
  )
}
