import type { Meta, StoryObj } from '@storybook/react'
import { Popover, PopoverContent, PopoverTrigger } from '@/atoms/Popover'
import { Button } from '@/atoms/Button'

const meta: Meta<typeof Popover> = {
  title: 'Atoms/Popover',
  component: Popover,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof Popover>

export const DefaultPopover: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button>팝오버 열기</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col gap-2">
          <h3 className="font-medium">팝오버 제목</h3>
          <p className="text-sm text-gray-500">
            이것은 팝오버 컴포넌트의 예시 내용입니다. 사용자가 트리거를 클릭하면 이 내용이 표시됩니다.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  ),
}

export const AlignedPopover: Story = {
  render: () => (
    <div className="flex gap-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button>왼쪽 정렬</Button>
        </PopoverTrigger>
        <PopoverContent align="start">
          <p>왼쪽으로 정렬된 팝오버</p>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button>중앙 정렬</Button>
        </PopoverTrigger>
        <PopoverContent align="center">
          <p>중앙으로 정렬된 팝오버</p>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button>오른쪽 정렬</Button>
        </PopoverTrigger>
        <PopoverContent align="end">
          <p>오른쪽으로 정렬된 팝오버</p>
        </PopoverContent>
      </Popover>
    </div>
  ),
}
