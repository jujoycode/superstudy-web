import { useBlockChainCreateWallet } from '@/legacy/generated/endpoint'

export function useBlockChainWallet() {
  const { mutate: createWallet, isLoading: isCreating, isError, error } = useBlockChainCreateWallet()

  return {
    createWallet,
    isCreating,
    isError,
    error,
  }
}
