import React from 'react'
import { twMerge } from 'tailwind-merge'
import { cn } from '@/utils/commonUtil'

interface Step {
  title: string
  description: string
  actions: Action[]
}

interface Action {
  text: string
  onClick: () => void
}

interface CoachmarkProps {
  steps: Step[]
  currentStep: number
  position?: 'top' | 'bottom'
  arrowDirection?: 'top' | 'bottom'
  positionClass?: string
  arrowClass?: string
}

export const Coachmark2: React.FC<CoachmarkProps> = ({
  steps,
  currentStep,
  position = 'top',
  arrowDirection = 'bottom',
  positionClass,
  arrowClass,
}) => {
  const step = steps[currentStep - 1]

  const positionClasses = cn(
    'absolute right-0 flex w-72 transform flex-col gap-3 rounded-lg border-2 border-primary-400 bg-primary-400 p-4 text-14 translate-x-full z-10 text-white',

    {
      'bottom-full mb-2': position === 'top',
      'top-full mt-2': position === 'bottom',
    },
    positionClass,
  )

  const arrowClasses = cn(
    'after:absolute after:left-4 after:block after:-translate-x-1/2 after:border-8 after:border-transparent',
    {
      'after:bottom-full after:border-b-primary-400': arrowDirection === 'top',
      'after:top-full after:border-t-primary-400': arrowDirection === 'bottom',
    },
    arrowClass,
  )

  return (
    <span className={twMerge(positionClasses, arrowClasses)}>
      <h1 className="text-12 font-normal text-gray-900">{step.title}</h1>
      <p className="text-14 flex leading-6 font-normal whitespace-normal">{step.description}</p>
      <div className="text-12 flex items-center justify-between font-normal">
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
                'text-primary-400 rounded-md border border-white bg-white px-2 py-1'
              }`}
              onClick={action.onClick}
            >
              {action.text}
            </button>
          ))}
        </nav>
      </div>
    </span>
  )
}
