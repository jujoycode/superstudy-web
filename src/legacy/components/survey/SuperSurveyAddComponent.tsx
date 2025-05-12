import { cloneDeep } from 'lodash'
import { Question } from '@/legacy/types'
import { twMerge } from 'tailwind-merge'
import { Section } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { SuperSurveyQuestion } from './SuperSurveyQuestion'

interface SuperSurveyAddComponentProps {
  setContent: (content: any) => void
  content: string | any[]
  className?: string
}

export function SuperSurveyAddComponent({ setContent, content, className }: SuperSurveyAddComponentProps) {
  let parsedContent: any[] = []
  try {
    if (typeof content === 'string') {
      parsedContent = JSON.parse(content)
    } else if (Array.isArray(content)) {
      parsedContent = content
    }
  } catch (err) {}
  const addContent = () => {
    const _content = cloneDeep(parsedContent)
    let id = 1
    _content.forEach((c: any) => (c.id >= id ? (id = c.id + 1) : ''))
    _content.push({ type: 'text', title: '', id, required: true })
    setContent(_content)
  }

  return (
    <Section className={twMerge('min-h-screen-48 rounded border border-neutral-400 bg-white', className)}>
      <div className="flex items-center justify-between">
        <div className="text-lg font-bold">설문 등록</div>
      </div>
      {parsedContent?.map((question: Question, i: number) => (
        <SuperSurveyQuestion question={question} i={i} content={parsedContent} setContent={setContent} />
      ))}

      <Button.lg onClick={addContent} className="filled-primary">
        <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full border-2 pb-0.5 text-2xl">+</div>
        <div>질문 추가</div>
      </Button.lg>
    </Section>
  )
}
