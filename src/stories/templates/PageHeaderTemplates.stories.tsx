import { PageHeaderTemplate } from '@/templates/PageHeaderTemplate'
import type { Meta, StoryObj } from '@storybook/react'

const meta = {
  title: 'Templates/PageHeaderTemplate',
  component: PageHeaderTemplate,
} satisfies Meta<typeof PageHeaderTemplate>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}
