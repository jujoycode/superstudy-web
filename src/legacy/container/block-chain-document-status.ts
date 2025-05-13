import { useRecoilValue } from 'recoil'

import { useBlockChainGetDocumentStatus } from '@/legacy/generated/endpoint'
import { BlockChainGetDocumentStatusParams } from '@/legacy/generated/model'
import { meState } from '@/stores'

export function useBlockChainDocument({ referenceTable, referenceId }: BlockChainGetDocumentStatusParams) {
  const me = useRecoilValue(meState)
  const { data, isLoading } = useBlockChainGetDocumentStatus(
    { referenceTable, referenceId },
    { query: { enabled: me?.school.useBlockChain } },
  )

  return {
    data,
    isLoading,
  }
}
