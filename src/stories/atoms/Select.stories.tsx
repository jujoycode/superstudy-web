import type { Meta, StoryObj } from '@storybook/react'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/atoms/Select'
import { Grid } from '@/atoms/Grid'
import { GridItem } from '@/atoms/GridItem'

const meta: Meta<typeof Select> = {
  title: 'Atoms/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof Select>

export const DefaultSelect: Story = {
  render: () => (
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="선택하세요" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>과일</SelectLabel>
          <SelectItem value="apple">사과</SelectItem>
          <SelectItem value="banana">바나나</SelectItem>
          <SelectItem value="orange">오렌지</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
}

export const SelectWidth: Story = {
  render: () => (
    <Grid col={2} gap={4}>
      <GridItem colSpan={1}>
        <Select>
          <SelectTrigger size="sm">
            <SelectValue placeholder="선택하세요" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>과일</SelectLabel>
              <SelectItem value="apple">사과</SelectItem>
              <SelectItem value="banana">바나나</SelectItem>
              <SelectItem value="orange">오렌지</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </GridItem>
      <GridItem colSpan={1}>
        <Select>
          <SelectTrigger size="default">
            <SelectValue placeholder="선택하세요" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>과일</SelectLabel>
              <SelectItem value="apple">사과</SelectItem>
              <SelectItem value="banana">바나나</SelectItem>
              <SelectItem value="orange">오렌지</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </GridItem>
    </Grid>
  ),
}

export const MaxHeightSelect: Story = {
  render: () => (
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="7개 이상인 경우" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">옵션 1</SelectItem>
        <SelectItem value="option2">옵션 2</SelectItem>
        <SelectItem value="option3">옵션 3</SelectItem>
        <SelectItem value="option4">옵션 4</SelectItem>
        <SelectItem value="option5">옵션 5</SelectItem>
        <SelectItem value="option6">옵션 6</SelectItem>
        <SelectItem value="option7">옵션 7</SelectItem>
        <SelectItem value="option8">옵션 8</SelectItem>
        <SelectItem value="option9">옵션 9</SelectItem>
      </SelectContent>
    </Select>
  ),
}
