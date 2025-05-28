import type { Meta, StoryObj } from '@storybook/react'
import { GridItem } from '@/atoms/GridItem'
import { Grid } from '@/atoms/Grid'

const meta: Meta<typeof GridItem> = {
  title: 'Atoms/GridItem',
  component: GridItem,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof GridItem>

const GridItemContent = ({ children }: { children: React.ReactNode }) => (
  <div className="flex h-full items-center justify-center rounded-md border border-blue-300 bg-blue-100 p-4">
    {children}
  </div>
)

export const DefaultGridItem: Story = {
  render: () => (
    <Grid col={1} className="w-64">
      <GridItem>
        <GridItemContent>기본 그리드 아이템</GridItemContent>
      </GridItem>
    </Grid>
  ),
}

export const ColSpanGridItems: Story = {
  render: () => (
    <Grid col={4} gap={4} className="w-[600px]">
      <GridItem colSpan={1}>
        <GridItemContent>colSpan 1</GridItemContent>
      </GridItem>
      <GridItem colSpan={3}>
        <GridItemContent>colSpan 3</GridItemContent>
      </GridItem>
      <GridItem colSpan={2}>
        <GridItemContent>colSpan 2</GridItemContent>
      </GridItem>
      <GridItem colSpan={2}>
        <GridItemContent>colSpan 2</GridItemContent>
      </GridItem>
      <GridItem colSpan={4}>
        <GridItemContent>colSpan 4 (full)</GridItemContent>
      </GridItem>
    </Grid>
  ),
}

export const RowSpanGridItems: Story = {
  render: () => (
    <Grid col={3} gap={4} className="h-[400px] w-[400px]" row={3}>
      <GridItem rowSpan={3}>
        <GridItemContent>rowSpan 3</GridItemContent>
      </GridItem>
      <GridItem rowSpan={1}>
        <GridItemContent>rowSpan 1</GridItemContent>
      </GridItem>
      <GridItem rowSpan={1}>
        <GridItemContent>rowSpan 1</GridItemContent>
      </GridItem>
      <GridItem rowSpan={2}>
        <GridItemContent>rowSpan 2</GridItemContent>
      </GridItem>
      <GridItem>
        <GridItemContent>기본</GridItemContent>
      </GridItem>
    </Grid>
  ),
}

export const EmptyGridItem: Story = {
  render: () => (
    <Grid col={3} gap={4} className="w-[400px]">
      <GridItem>
        <GridItemContent>내용 있음</GridItemContent>
      </GridItem>
      <GridItem empty />
      <GridItem>
        <GridItemContent>내용 있음</GridItemContent>
      </GridItem>
      <GridItem>
        <GridItemContent>내용 있음</GridItemContent>
      </GridItem>
      <GridItem empty />
      <GridItem>
        <GridItemContent>내용 있음</GridItemContent>
      </GridItem>
    </Grid>
  ),
}
