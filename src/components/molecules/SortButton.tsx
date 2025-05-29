import { Button } from '@/atoms/Button'
import { Select, SelectTrigger } from '@/atoms/Select'

interface SortButtonProps {}

/**
 * SortButton
 * @desc 정렬 버튼
 * @author jujoycode
 */
export function SortButton() {
  return (
    <Select>
      <SelectTrigger>
        <Button variant="ghost" size="sm">
          정렬
        </Button>
      </SelectTrigger>
    </Select>
  )
}
