import { Group } from '@/legacy/generated/model'

import { Checkbox } from './common/Checkbox'

interface AllSelectCheckboxProps {
  selectedGroups: Group[]
  setSelectedGroups: (groups: Group[]) => void
  groups: Group[]
}

export function AllSelectCheckbox({ selectedGroups, setSelectedGroups, groups }: AllSelectCheckboxProps) {
  return (
    <Checkbox
      checked={!groups.filter((el) => !selectedGroups.map((el) => el.id).includes(el.id)).length}
      onClick={() =>
        !groups.filter((el) => !selectedGroups.map((el) => el.id).includes(el.id)).length
          ? setSelectedGroups(selectedGroups.filter((el) => !groups.map((el) => el.id).includes(el.id)))
          : setSelectedGroups(
              selectedGroups.concat(groups.filter((el) => !selectedGroups.map((el) => el.id).includes(el.id))),
            )
      }
    />
  )
}
