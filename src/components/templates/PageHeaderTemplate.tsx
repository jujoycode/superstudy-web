import type { buttonVariant } from '@/atoms/Button'

interface PageHeaderTemplateProps {
  title: string
  description?: string
  config: {
    headerBtn: {
      label: string
      variant: typeof buttonVariant
      action: () => void
    }
  }
}

/**
 * PageHeaderTemplate
 * @desc 페이지 헤더 표준화 및 간편화 템플릿
 * @author jujoycode
 */
export function PageHeaderTemplate() {
  return <div>PageHeaderTemplate</div>
}
