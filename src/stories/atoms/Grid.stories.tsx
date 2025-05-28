import type { Meta, StoryObj } from '@storybook/react'
import { Grid } from '@/atoms/Grid'
import { GridItem } from '@/atoms/GridItem'

const meta: Meta<typeof Grid> = {
  title: 'Atoms/Grid',
  component: Grid,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof Grid>

const GridItemBox = ({ children }: { children: React.ReactNode }) => (
  <div className="flex h-full items-center justify-center rounded-md border border-blue-300 bg-blue-100 p-4">
    {children}
  </div>
)

export const SimpleGrid: Story = {
  render: () => (
    <Grid col={3} gap={4} className="w-[600px]">
      <GridItem>
        <GridItemBox>항목 1</GridItemBox>
      </GridItem>
      <GridItem>
        <GridItemBox>항목 2</GridItemBox>
      </GridItem>
      <GridItem>
        <GridItemBox>항목 3</GridItemBox>
      </GridItem>
      <GridItem>
        <GridItemBox>항목 4</GridItemBox>
      </GridItem>
      <GridItem>
        <GridItemBox>항목 5</GridItemBox>
      </GridItem>
      <GridItem>
        <GridItemBox>항목 6</GridItemBox>
      </GridItem>
    </Grid>
  ),
}

export const ComplexGrid: Story = {
  render: () => (
    <Grid col={4} gap={4} className="h-[400px] w-[800px]">
      <GridItem colSpan={2} rowSpan={2}>
        <GridItemBox>넓은 항목 (2x2)</GridItemBox>
      </GridItem>
      <GridItem>
        <GridItemBox>항목 2</GridItemBox>
      </GridItem>
      <GridItem>
        <GridItemBox>항목 3</GridItemBox>
      </GridItem>
      <GridItem colSpan={2}>
        <GridItemBox>가로로 넓은 항목</GridItemBox>
      </GridItem>
      <GridItem>
        <GridItemBox>항목 5</GridItemBox>
      </GridItem>
      <GridItem rowSpan={2}>
        <GridItemBox>세로로 긴 항목</GridItemBox>
      </GridItem>
      <GridItem>
        <GridItemBox>항목 7</GridItemBox>
      </GridItem>
      <GridItem>
        <GridItemBox>항목 8</GridItemBox>
      </GridItem>
    </Grid>
  ),
}

export const DifferentGaps: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="mb-2 text-sm font-medium">작은 간격 (gap-2)</h3>
        <Grid col={4} gap={2} className="w-[600px]">
          {Array.from({ length: 8 }).map((_, i) => (
            <GridItem key={i}>
              <GridItemBox>항목 {i + 1}</GridItemBox>
            </GridItem>
          ))}
        </Grid>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium">큰 간격 (gap-8)</h3>
        <Grid col={4} gap={8} className="w-[600px]">
          {Array.from({ length: 8 }).map((_, i) => (
            <GridItem key={i}>
              <GridItemBox>항목 {i + 1}</GridItemBox>
            </GridItem>
          ))}
        </Grid>
      </div>
    </div>
  ),
}
