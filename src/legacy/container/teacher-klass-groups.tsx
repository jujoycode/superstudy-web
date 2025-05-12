import { useEffect, useState } from 'react'
import { useRecoilValue } from 'recoil'
import { meState } from '@/stores'
import { useGroupsFindAllKlassBySchool } from '@/legacy/generated/endpoint'
import { Role, type Group, type ResponseGroupDto } from '@/legacy/generated/model'

export function useTeacherKlassGroup(selectedYear?: number) {
  const me = useRecoilValue(meState)

  const [selectedGroup, setSelectedGroup] = useState<Group>()
  const [_, setAllKlassGroups] = useState<ResponseGroupDto[]>([])

  const { data: userGroupsData, isLoading: isUserGroupDataLoading } = useGroupsFindAllKlassBySchool(
    { year: selectedYear },
    {
      query: {
        enabled: !!me?.id && Role.PARENT !== me.role && Role.USER !== me.role,
        onSuccess: (res) => {
          if (!res?.length) {
            setAllKlassGroups([])
            return
          }

          const sorted = res
            .filter((el) => !!el.name)
            .sort((a, b) => {
              if (!a.name || !b.name) {
                return 0
              }
              const aData = a.name.match('([0-9]|[0-9][0-9])학년 ([0-9]|[0-9][0-9])반')
              const bData = b.name.match('([0-9]|[0-9][0-9])학년 ([0-9]|[0-9][0-9])반')

              if (aData?.[1] === bData?.[1]) {
                return Number(aData?.[2]) - Number(bData?.[2])
              } else {
                return Number(aData?.[1]) - Number(bData?.[1])
              }
            })

          setAllKlassGroups(sorted)
        },
      },
    },
  )

  const groups = userGroupsData?.sort((a, b) => {
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

  const homeKlass = groups?.find((group: ResponseGroupDto) => group.homeRoomTeacherId === me?.id)

  useEffect(() => {
    if (!selectedGroup && groups?.length) {
      if (homeKlass) {
        setSelectedGroup(homeKlass)
      } else {
        setSelectedGroup(groups[0])
      }
    }
  }, [groups, homeKlass])

  return {
    groups,
    allKlassGroupsUnique: groups?.reduce((acc: any[], current: any) => {
      if (!acc.find((item) => item.id === current.id)) {
        acc.push(current)
      }
      return acc
    }, []),
    selectedGroup,
    homeKlass,
    isUserGroupDataLoading,
    setSelectedGroup,
  }
}
