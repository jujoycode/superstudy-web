import { PropsWithChildren } from 'react'

interface AlertProps {
  severity?: 'error' | 'warning' | 'info' | 'success'
  text?: string
  onClose: () => void
}

export function Alert({ children, severity = 'success', text, onClose }: PropsWithChildren<AlertProps>) {
  let color = 'green'
  if (severity === 'error') {
    color = 'red'
  } else if (severity === 'warning') {
    color = 'yellow'
  } else if (severity === 'info') {
    color = 'blue'
  }

  return (
    <div className={`flex rounded-md bg-${color}-50 p-4`}>
      <div className="flex-shrink-0">
        <svg
          className={`h-5 w-5 text-${color}-800`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      <div className="ml-3">
        <p className={`text-sm font-medium text-${color}-800`}>{text ?? children}</p>
      </div>

      <div className="ml-auto pl-3">
        <div className="-mx-1.5 -my-1.5">
          <button
            type="button"
            className={`inline-flex bg-${color}-50 rounded-md p-1.5 text-${color}-800 hover:bg-${color}-100 focus:ring-2 focus:ring-offset-2 focus:outline-none focus:ring-offset-${color}-50 focus:ring-${color}-600`}
            onClick={() => onClose()}
          >
            <span className="sr-only">Dismiss</span>
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
