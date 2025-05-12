import { useThemeQuestionGetThemeQuestionItemsByType } from '@/legacy/generated/endpoint'
import { ThemeQuestionGetThemeQuestionItemsByTypeType } from '@/legacy/generated/model'
export const useThemeQuestionFindAll = (type: ThemeQuestionGetThemeQuestionItemsByTypeType) => {
  const { data, isLoading, refetch } = useThemeQuestionGetThemeQuestionItemsByType({ type })

  return {
    data,
    isLoading,
    refetch,
  }
}
