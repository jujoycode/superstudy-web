import { useState } from 'react'
import { Button } from '@/atoms/Button'
import { ThemeProvider, type Theme } from '@/providers/ThemeProvider'
import { Container } from '@/atoms/Container'
import { Text } from '@/atoms/Text'
import { Meta, StoryObj } from '@storybook/react'
import { themes } from '@/constants/themeConstant'

const meta: Meta<typeof Button> = {
  title: 'Themes/Theme',
  component: Button,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof Button>

// 테마 전환 데코레이터 스토리
export const ThemeToggleButton: Story = {
  render: () => {
    return <ThemeToggleButtonComponent />
  },
}

const ThemeToggleButtonComponent = () => {
  const [theme, setTheme] = useState<Theme>('default')
  const [count, setCount] = useState(1)

  const handleToggleTheme = () => {
    const themeIndex = count % Object.keys(themes).length
    setTheme(Object.keys(themes)[themeIndex] as Theme)
    setCount(count + 1)
  }

  return (
    <ThemeProvider theme={theme} setTheme={setTheme}>
      <Container flex direction="col" items="center" gap="4">
        <Text weight="lg" size="lg">
          현재 테마: {theme}
        </Text>

        <Container flex direction="row" gap="4">
          <Button variant="solid" size="md" onClick={handleToggleTheme}>
            테마 전환하기
          </Button>

          <Button variant="outline" size="md">
            현재 테마 확인용 버튼
          </Button>
        </Container>
      </Container>
    </ThemeProvider>
  )
}
