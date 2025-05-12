import { useBlockChainGetContract, useBlockChainGetWallet } from '@/legacy/generated/endpoint'

export function useBlockChain() {
  const { data: wallet, isLoading: isWalletLoading } = useBlockChainGetWallet({
    query: {
      queryKey: ['blockchain', 'wallet'],
    },
  })
  const { data: contract, isLoading: isContractLoading } = useBlockChainGetContract({
    query: {
      queryKey: ['blockchain', 'contract'],
    },
  })

  return {
    wallet,
    contract,
    // walletStatus,
    // contractStatus,
    isWalletLoading,
    isContractLoading,
  }
}
