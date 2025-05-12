import clsx from 'clsx';
import React from 'react';
import { useHistory } from '@/hooks/useHistory';
import SolidSVGIcon from '../icon/SolidSVGIcon';
import SVGIcon from '../icon/SVGIcon';
import { Typography } from './Typography';

interface BreadcrumbProps {
  className?: string;
  data: Record<string, string>;
}

const notLastDepthStyle = 'text-primary-gray-700 hover:cursor-pointer';
const lastDepthStyle = 'font-medium cursor-default';

export default function Breadcrumb({ className, data }: BreadcrumbProps) {
  const { push } = useHistory();
  const keys = Object.keys(data);

  return (
    <div className={clsx('flex items-center justify-center gap-2', className)}>
      <SolidSVGIcon.Home weight="bold" color="gray400" onClick={() => push('/')} className="cursor-pointer" />
      {keys.map((depth, index) => {
        const isLastDepth = index === keys.length - 1;

        return (
          <React.Fragment key={depth}>
            <SVGIcon.Arrow color="gray400" size={8} rotate={180} />
            <Typography
              variant="caption"
              onClick={() => {
                if (!isLastDepth && data[depth]) push(data[depth]);
              }}
              className={clsx('text-primary-gray-900', isLastDepth ? lastDepthStyle : notLastDepthStyle)}
            >
              {depth}
            </Typography>
          </React.Fragment>
        );
      })}
    </div>
  );
}
