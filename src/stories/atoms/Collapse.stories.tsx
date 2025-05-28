import type { Meta, StoryObj } from '@storybook/react'
import { Collapse } from '@/atoms/Collapse'
import { useState } from 'react'
import { Button } from '@/atoms/Button'

const meta: Meta<typeof Collapse> = {
  title: 'Atoms/Collapse',
  component: Collapse,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof Collapse>

export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false)

    return (
      <div className="w-96">
        <Button onClick={() => setIsOpen(!isOpen)} className="mb-2">
          {isOpen ? '접기' : '펼치기'}
        </Button>

        <Collapse isOpen={isOpen}>
          <div className="rounded-md border p-4">
            <h3 className="font-medium">접을 수 있는 콘텐츠</h3>
            <p className="mt-2 text-sm text-gray-500">
              이것은 접기/펼치기 기능을 테스트하기 위한 예시 콘텐츠입니다. 버튼을 클릭하면 이 콘텐츠가 나타나거나
              사라집니다.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              접기 컴포넌트는 애니메이션 효과와 함께 콘텐츠를 보여주거나 숨기는 데 사용됩니다.
            </p>
          </div>
        </Collapse>
      </div>
    )
  },
}

export const CustomDuration: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false)

    return (
      <div className="w-96">
        <Button onClick={() => setIsOpen(!isOpen)} className="mb-2">
          느린 애니메이션 {isOpen ? '접기' : '펼치기'}
        </Button>

        <Collapse isOpen={isOpen} animationDuration={800}>
          <div className="rounded-md border p-4">
            <h3 className="font-medium">커스텀 애니메이션 속도</h3>
            <p className="mt-2 text-sm text-gray-500">
              이 콘텐츠는 800ms의 애니메이션 속도로 펼쳐지거나 접힙니다. 기본 애니메이션 속도보다 더 느리게 동작합니다.
            </p>
          </div>
        </Collapse>
      </div>
    )
  },
}
