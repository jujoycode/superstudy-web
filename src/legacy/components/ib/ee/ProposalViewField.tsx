// ProposalInputField.tsx
import clsx from 'clsx';
import { PropsWithChildren, ReactElement } from 'react';
import { Typography } from 'src/components/common/Typography';

interface ProposalViewFieldProps {
  label: string;
  value?: string | ReactElement;
  className?: string;
}

export const ProposalViewField = ({ label, value, className, children }: PropsWithChildren<ProposalViewFieldProps>) => {
  return (
    <section className="flex flex-col gap-4">
      <Typography variant="title2" className="text-primary-gray-900">
        {label}
      </Typography>
      <Typography
        variant="body2"
        className={clsx('rounded-lg border border-primary-gray-200 p-4 text-15 text-primary-gray-700', className)}
      >
        {value || children}
      </Typography>
    </section>
  );
};
