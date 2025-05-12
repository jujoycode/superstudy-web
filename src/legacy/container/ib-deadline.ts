import { useIBDeadlineGetItems } from '@/legacy/generated/endpoint'
import { IBDeadlineGetItemsParams } from '@/legacy/generated/model'

interface useIBDeadlineProps {
  type: IBDeadlineGetItemsParams['type']
  model?: 'PROPOSAL' | 'ESSAY' | 'RPPF' | 'TKPPF'
}

export const useIBDeadline = ({ type, model }: useIBDeadlineProps) => {
  const { data, isLoading: isFetching, refetch } = useIBDeadlineGetItems({ type })

  let filteredDeadline

  if (model) {
    const modelToTypeMap: Record<typeof model, string[]> = {
      PROPOSAL: ['EE_PROPOSAL'],
      ESSAY: ['EE_ESSAY'],
      RPPF: ['EE_RPPF_1', 'EE_RPPF_2', 'EE_RPPF_3'],
      TKPPF: ['TOK_TKPPF_1', 'TOK_TKPPF_2', 'TOK_TKPPF_3'],
    }

    // 원하는 데이터만 필터링
    filteredDeadline = data?.items.filter((item) => modelToTypeMap[model].includes(item.type))
  }

  const deadline = filteredDeadline?.sort((a, b) => a.type.localeCompare(b.type))

  return {
    data,
    deadline,
    isFetching,
    refetch,
  }
}
