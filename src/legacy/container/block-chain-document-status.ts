import { useRecoilValue } from 'recoil'
import { useBlockChainGetDocumentStatus } from '@/legacy/generated/endpoint'
import { BlockChainGetDocumentStatusParams } from '@/legacy/generated/model'
import { useUserStore } from '@/stores2/user'

export function useBlockChainDocument({ referenceTable, referenceId }: BlockChainGetDocumentStatusParams) {
  const { me } = useUserStore()
  const { data, isLoading } = useBlockChainGetDocumentStatus(
    { referenceTable, referenceId },
    { query: { enabled: me?.school.useBlockChain } },
  )

  return {
    data,
    isLoading,
  }
}
