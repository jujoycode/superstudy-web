import { useState } from 'react'

import { useBlockChainRequestCheck } from '@/legacy/generated/endpoint'
import { BlockChainRequestCheckParams } from '@/legacy/generated/model'
import { queryClient } from '@/legacy/lib/query'

export function useBlockChainRequest() {
  const [requestParam, setRequestParam] = useState<BlockChainRequestCheckParams>({
    referenceTable: 'BLOCK_CHAIN_EOAKEY',
    referenceId: 0,
  })
  useBlockChainRequestCheck(requestParam, {
    query: {
      enabled: !!requestParam.referenceTable && !!requestParam.referenceId,
      onSuccess: () => {
        queryClient.invalidateQueries(['blockchain', 'wallet'])
        queryClient.invalidateQueries(['blockchain', 'contract'])
      },
      onError: (error) => {
        console.error(error.message)
      },
    },
  })

  const requestId = ({ referenceTable, referenceId }: BlockChainRequestCheckParams) => {
    setRequestParam({ referenceTable, referenceId })
  }

  return {
    requestId,
  }
}
