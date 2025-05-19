import { PropsWithChildren, useState } from 'react'

import { Typography } from './Typography'
import SVGIcon from '../icon/SVGIcon'

// 아코디언 Props 인터페이스
interface AccordionProps {
  title: string
  count?: number
  isFirst?: boolean
}

const Accordion = ({ title, count = 0, isFirst = false, children }: PropsWithChildren<AccordionProps>) => {
  const [isOpen, setIsOpen] = useState(true)

  const toggleAccordion = () => {
    if (count > 0) {
      setIsOpen(!isOpen)
    }
  }

  return (
    <div className={`border-b-primary-gray-200 border-b ${isFirst ? 'pt-5 pb-10' : 'py-10'}`}>
      <div
        className={`flex items-center justify-between gap-4 ${count > 0 ? 'cursor-pointer' : ''}`}
        onClick={count > 0 ? toggleAccordion : undefined}
      >
        <span className="flex flex-row items-center gap-1">
          <Typography variant="title3">{title}</Typography>
          <Typography variant="title3" className="text-primary-800">
            {count}
          </Typography>
        </span>
        {count !== 0 && (
          <span>
            {isOpen ? (
              <SVGIcon.Arrow color="gray700" rotate={90} size={16} weight="bold" />
            ) : (
              <SVGIcon.Arrow color="gray700" rotate={270} size={16} weight="bold" />
            )}
          </span>
        )}
      </div>

      {/* 하단의 내용 */}
      {isOpen && count > 0 && <div className="pt-6">{children}</div>}
    </div>
  )
}

export default Accordion
