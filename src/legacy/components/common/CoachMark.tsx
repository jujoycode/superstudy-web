import { useRef, useState, type JSX } from 'react'
import { ICoachProps } from 'react-coach-mark'
import { useLocation } from 'react-router'

import { useHistory } from '@/hooks/useHistory'
import { useLanguage } from '@/legacy/hooks/useLanguage'

import { Button } from './Button'

export enum CoachPosition {
  TOP = 'top',
  BOTTOM = 'bottom',
}

export interface Guide {
  comment: JSX.Element
  location?: CoachPosition
}

export function useCoachMark(pageName: string, guides: Guide[]) {
  const { pathname } = useLocation()
  const { push } = useHistory()
  const { t } = useLanguage()

  const [activatedNumber, setActivateNumber] = useState<number>(0)
  const hasNext = guides.length > activatedNumber
  const numberOfRefs = guides.length // 원하는 ref의 개수
  const refs = Array.from({ length: numberOfRefs }, () => useRef(null))

  const isFirst = localStorage.getItem(pageName + 'IsFirst') === null

  if (!hasNext) {
    localStorage.setItem(pageName + 'IsFirst', 'not')
  }

  const NextButton = (
    <div className="flex items-center justify-start space-x-3">
      <span>{hasNext && guides[activatedNumber].comment} </span>
      <Button
        onClick={() => setActivateNumber(activatedNumber + 1)}
        children={t('confirm')}
        className="filled-primary rounded-md"
      />
    </div>
  )

  const coach: ICoachProps = {
    activate: hasNext && isFirst,
    component: NextButton,
    reference: refs[activatedNumber],
    tooltip: { position: (hasNext && guides[activatedNumber].location) || CoachPosition.BOTTOM },
  }

  const reOpenCoach = () => {
    localStorage.removeItem(pageName + 'IsFirst')
    setActivateNumber(0)
    push(pathname)
  }

  return {
    coach,
    refs,
    reOpenCoach,
  }
}
