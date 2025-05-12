import type { Group } from '@/legacy/generated/model'

export function sortTeacherGroups(userGroupsData: Group[]) {
  const result = userGroupsData?.sort((a, b) => {
    const aData = a?.name?.match(`([0-9]|[0-9][0-9])학년 ([0-9]|[0-9][0-9])반`)
    const bData = b?.name?.match(`([0-9]|[0-9][0-9])학년 ([0-9]|[0-9][0-9])반`)

    if (!aData || !bData) {
      return 0
    }

    if (aData[1] && bData[1]) {
      if (aData[1] === bData[1]) {
        return Number(aData[2]) - Number(bData[2])
      } else {
        return Number(aData[1]) - Number(bData[1])
      }
    } else {
      return 0
    }
  })

  const myClassIndex = result?.findIndex((group) => group?.teacherGroups[0]?.subject?.includes('우리반'))
  if (myClassIndex !== -1) {
    return [result[myClassIndex], ...result.slice(0, myClassIndex), ...result.slice(myClassIndex + 1)]
  }
  return result
}
