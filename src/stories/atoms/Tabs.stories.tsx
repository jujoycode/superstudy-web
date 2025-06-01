import type { Meta, StoryObj } from '@storybook/react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/atoms/Tabs'

const meta: Meta<typeof Tabs> = {
  title: 'Atoms/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Tabs>

export const DefaultTabs: Story = {
  render: () => (
    <Tabs defaultValue="tab1" className="w-96">
      <TabsList className="w-full">
        <TabsTrigger value="tab1">탭 1</TabsTrigger>
        <TabsTrigger value="tab2">탭 2</TabsTrigger>
        <TabsTrigger value="tab3">탭 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1" className="mt-2 rounded-md bg-gray-50 p-4">
        <h3 className="text-lg font-medium">탭 1 내용</h3>
        <p className="text-sm text-gray-500">첫 번째 탭의 내용입니다.</p>
      </TabsContent>
      <TabsContent value="tab2" className="mt-2 rounded-md bg-gray-50 p-4">
        <h3 className="text-lg font-medium">탭 2 내용</h3>
        <p className="text-sm text-gray-500">두 번째 탭의 내용입니다.</p>
      </TabsContent>
      <TabsContent value="tab3" className="mt-2 rounded-md bg-gray-50 p-4">
        <h3 className="text-lg font-medium">탭 3 내용</h3>
        <p className="text-sm text-gray-500">세 번째 탭의 내용입니다.</p>
      </TabsContent>
    </Tabs>
  ),
}

export const DisabledTab: Story = {
  render: () => (
    <Tabs defaultValue="tab1" className="w-96">
      <TabsList className="w-full">
        <TabsTrigger value="tab1">활성화 탭</TabsTrigger>
        <TabsTrigger value="tab2" disabled>
          비활성화 탭
        </TabsTrigger>
        <TabsTrigger value="tab3">활성화 탭</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1" className="mt-2 rounded-md bg-gray-50 p-4">
        <h3 className="text-lg font-medium">활성화 탭 내용</h3>
        <p className="text-sm text-gray-500">이 탭은 클릭할 수 있습니다.</p>
      </TabsContent>
      <TabsContent value="tab2" className="mt-2 rounded-md bg-gray-50 p-4">
        <h3 className="text-lg font-medium">비활성화 탭 내용</h3>
        <p className="text-sm text-gray-500">이 탭은 비활성화 되어 있습니다.</p>
      </TabsContent>
      <TabsContent value="tab3" className="mt-2 rounded-md bg-gray-50 p-4">
        <h3 className="text-lg font-medium">활성화 탭 내용</h3>
        <p className="text-sm text-gray-500">이 탭도 클릭할 수 있습니다.</p>
      </TabsContent>
    </Tabs>
  ),
}

export const CustomStyleTabs: Story = {
  render: () => (
    <Tabs defaultValue="tab1" className="w-96">
      <TabsList className="w-full bg-blue-100">
        <TabsTrigger value="tab1" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
          커스텀 탭 1
        </TabsTrigger>
        <TabsTrigger value="tab2" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
          커스텀 탭 2
        </TabsTrigger>
      </TabsList>
      <TabsContent value="tab1" className="mt-2 rounded-md border border-blue-200 bg-blue-50 p-4">
        <h3 className="text-lg font-medium text-blue-800">커스텀 스타일 탭 1</h3>
        <p className="text-sm text-blue-600">커스텀 스타일이 적용된 탭 내용입니다.</p>
      </TabsContent>
      <TabsContent value="tab2" className="mt-2 rounded-md border border-blue-200 bg-blue-50 p-4">
        <h3 className="text-lg font-medium text-blue-800">커스텀 스타일 탭 2</h3>
        <p className="text-sm text-blue-600">커스텀 스타일이 적용된 두 번째 탭 내용입니다.</p>
      </TabsContent>
    </Tabs>
  ),
}
