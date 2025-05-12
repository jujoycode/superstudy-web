import clsx from 'clsx';
import React from 'react';
import { twMerge } from 'tailwind-merge';

interface Step {
  title: string;
  description: string;
  actions: Action[];
}

interface Action {
  text: string;
  onClick: () => void;
}

interface CoachmarkProps {
  steps: Step[];
  currentStep: number;
  position?: 'top' | 'bottom';
  arrowDirection?: 'top' | 'bottom';
  positionClass?: string;
  arrowClass?: string;
}

export const Coachmark2: React.FC<CoachmarkProps> = ({
  steps,
  currentStep,
  position = 'top',
  arrowDirection = 'bottom',
  positionClass,
  arrowClass,
}) => {
  const step = steps[currentStep - 1];

  const positionClasses = clsx(
    'absolute right-0 flex w-72 transform flex-col gap-3 rounded-lg border-2 border-coach_orange bg-coach_orange p-4 text-14 translate-x-full z-10 text-white',

    {
      'bottom-full mb-2': position === 'top',
      'top-full mt-2': position === 'bottom',
    },
    positionClass,
  );

  const arrowClasses = clsx(
    'after:absolute after:left-4 after:block after:-translate-x-1/2 after:border-8 after:border-transparent',
    {
      'after:bottom-full after:border-b-coach_orange': arrowDirection === 'top',
      'after:top-full after:border-t-coach_orange': arrowDirection === 'bottom',
    },
    arrowClass,
  );

  return (
    <span className={twMerge(positionClasses, arrowClasses)}>
      <h1 className="text-12 font-normal text-text_black">{step.title}</h1>
      <p className="flex whitespace-normal text-14 font-normal leading-6">{step.description}</p>
      <div className="flex items-center justify-between text-12 font-normal">
        <div className="flex gap-0.5">
          <strong>{currentStep}</strong>
          <span>/</span>
          <span>{steps.length}</span>
        </div>
        <nav className="flex gap-3">
          {step.actions.map((action, index) => (
            <button
              key={index}
              className={`${
                index === step.actions.length - 1 &&
                'rounded-md border border-white bg-white px-2 py-1 text-coach_orange'
              }`}
              onClick={action.onClick}
            >
              {action.text}
            </button>
          ))}
        </nav>
      </div>
    </span>
  );
};
