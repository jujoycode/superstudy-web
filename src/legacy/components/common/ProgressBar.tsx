import { Box, LinearProgress, LinearProgressProps } from '@mui/material';
import clsx from 'clsx';
import { PropsWithChildren } from 'react';
import { use100vh } from 'react-div-100vh';

interface ProgressBarProps {
  text: string;
  progress: number;
}

interface LinearProgressWithLabelProps extends LinearProgressProps {
  value: number;
}

function LinearProgressWithLabel(props: LinearProgressWithLabelProps) {
  const { value, ...rest } = props;
  return (
    <Box width="100%">
      <LinearProgress
        variant="determinate"
        value={value}
        {...rest}
        sx={{
          height: 12,
          borderRadius: '100px',
          backgroundColor: '#e0e0e0',
          '& .MuiLinearProgress-bar': {
            backgroundColor: '#ff600c',
            borderRadius: '100px',
          },
        }}
      />
    </Box>
  );
}

export function ProgressBar({ text, progress }: PropsWithChildren<ProgressBarProps>) {
  const vh = use100vh();
  const height = vh ? `${vh}px` : '100vh';
  return (
    <div
      style={{ height }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      className={clsx('fixed inset-0 z-100 m-0 flex h-screen w-full items-center justify-center bg-black/60 px-6')}
    >
      <div className="flex w-full flex-col rounded-lg bg-white px-5 py-6">
        <p
          className="pb-4 text-center text-sm leading-normal text-[#121316]"
          dangerouslySetInnerHTML={{ __html: text.replace(/\n/g, '<br />') }}
        ></p>
        <LinearProgressWithLabel value={progress} />
        <p className="flex flex-row justify-end pt-1 text-xs">
          <p className="text-[#ff600c]">{progress}</p>&nbsp;/&nbsp;100%
        </p>
      </div>
    </div>
  );
}
