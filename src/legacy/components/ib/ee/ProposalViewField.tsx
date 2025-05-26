// ProposalInputField.tsx
import { PropsWithChildren, ReactElement } from 'react'
import { cn } from '@/utils/commonUtil'

import { Typography } from '@/legacy/components/common/Typography'

interface ProposalViewFieldProps {
  label: string
  value?: string | ReactElement
  className?: string
}

export const ProposalViewField = ({ label, value, className, children }: PropsWithChildren<ProposalViewFieldProps>) => {
  return (
    <section className="flex flex-col gap-4">
      <Typography variant="title2" className="text-gray-900">
        {label}
      </Typography>
      <Typography
        variant="body2"
        className={cn('text-15 rounded-lg border border-gray-200 p-4 text-gray-700', className)}
      >
        {value || children}
      </Typography>
    </section>
  )
}
