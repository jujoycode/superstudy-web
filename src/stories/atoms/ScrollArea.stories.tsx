import type { Meta, StoryObj } from '@storybook/react'
import { ScrollArea } from '@/atoms/ScrollArea'

const meta: Meta<typeof ScrollArea> = {
  title: 'Atoms/ScrollArea',
  component: ScrollArea,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof ScrollArea>

const LongContent = () => (
  <div>
    {Array.from({ length: 20 }).map((_, i) => (
      <div key={i} className="border-b py-4">
        <h3 className="font-medium">항목 {i + 1}</h3>
        <p className="text-sm text-gray-500">이것은 스크롤 영역을 테스트하기 위한 샘플 콘텐츠입니다.</p>
      </div>
    ))}
  </div>
)

export const DefaultScrollArea: Story = {
  render: () => (
    <div style={{ height: '300px', width: '300px' }}>
      <ScrollArea className="h-full">
        <LongContent />
      </ScrollArea>
    </div>
  ),
}

export const ThinScrollbar: Story = {
  render: () => (
    <div style={{ height: '300px', width: '300px' }}>
      <ScrollArea className="h-full" scrollbarWidth="thin">
        <LongContent />
      </ScrollArea>
    </div>
  ),
}

export const NoScrollbar: Story = {
  render: () => (
    <div style={{ height: '300px', width: '300px' }}>
      <ScrollArea className="h-full" scrollbarWidth="none">
        <LongContent />
      </ScrollArea>
    </div>
  ),
}
