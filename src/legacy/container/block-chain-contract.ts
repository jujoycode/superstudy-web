import { useBlockChainCreateContract } from '@/legacy/generated/endpoint'

export function useBlockChainContract() {
  const { mutate: createContract, isLoading: isCreating, isError, error } = useBlockChainCreateContract()

  return {
    createContract,
    isCreating,
    isError,
    error,
  }
}
