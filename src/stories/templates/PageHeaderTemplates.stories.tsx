import { PageHeaderTemplate } from '@/templates/PageHeaderTemplate'
import type { Meta, StoryObj } from '@storybook/react'

const meta = {
  title: 'Templates/PageHeaderTemplate',
  component: PageHeaderTemplate,
} satisfies Meta<typeof PageHeaderTemplate>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: '페이지 제목',
    description: '※ 어느정도 길이가 되는 그런 자잘한 설명 문구',
    config: {
      topBtn: [{ label: '테스트', variant: 'solid', color: 'secondary', action: () => {} }],
      dateSearchBar: {
        type: 'range',
        searchState: {
          value: {
            from: new Date(),
            to: new Date(),
          },
          setValue: () => {},
        },
      },
      filters: [
        {
          items: [
            { label: '전체', value: 'ALL' },
            { label: '승인 전', value: 'BEFORE_APPROVAL' },
            { label: '승인 완료', value: 'PROCESSED' },
            { label: '반려됨', value: 'RETURNED' },
          ],
          filterState: {
            value: 'BEFORE_APPROVAL',
            setValue: () => {},
          },
        },
        {
          items: [
            { label: '전체보기', value: 'ALL' },
            { label: '조퇴', value: '조퇴' },
            { label: '외출', value: '외출' },
            { label: '확인', value: '확인' },
          ],
          filterState: {
            value: 'ALL',
            setValue: () => {},
          },
        },
      ],
      searchBar: {
        placeholder: '무언가 검색',
        searchState: {
          value: '',
          setValue: () => {},
        },
      },
      bottomBtn: [
        { label: '다운로드1', variant: 'solid', color: 'tertiary', icon: { name: 'ssDownload' }, action: () => {} },
        { label: '다운로드2', variant: 'solid', color: 'tertiary', icon: { name: 'ssDownload' }, action: () => {} },
        { label: '승인', variant: 'solid', color: 'primary', action: () => {} },
      ],
    },
  },
}
