import { useCodeGetCodesByCategory } from '@/legacy/generated/endpoint'
import { Category } from '@/legacy/generated/model'

export function useCodeByCategoryName(categoryName: Category) {
  const { data } = useCodeGetCodesByCategory(categoryName)

  return {
    categoryData: data,
  }
}
