import { useEffect, useState } from 'react'
import { useQueryClient } from 'react-query'
import { useRecoilValue } from 'recoil'

import {
  useGroupsFindAllKlassBySchool,
  useGroupsFindKlassByUser,
  useGroupsFindKlubBySchoolIdAndUserId,
  useGroupsFindSubjectByUser,
} from '@/legacy/generated/endpoint'
import { Role, type ResponseGroupDto, type ResponseSubjectGroupDto } from '@/legacy/generated/model'
import { getThisYear } from '@/legacy/util/time'
import { meState, tokenState } from '@/stores'

import { createContainer } from './createContainer'

export function groupHook() {
  const me = useRecoilValue(meState)
  const token = useRecoilValue(tokenState)
  const queryClient = useQueryClient()

  const [teacherKlubGroups, setTeacherKlubGroups] = useState<ResponseGroupDto[]>([])
  const [teacherKlassGroups, setTeacherKlassGroups] = useState<ResponseGroupDto[]>([])
  const [allKlassGroups, setAllKlassGroups] = useState<ResponseGroupDto[]>([])
  const [teacherSubjects, setTeacherSubjects] = useState<ResponseSubjectGroupDto[]>([])

  const { error: errorAllKlassGroups, isLoading } = useGroupsFindAllKlassBySchool(
    { year: Number(getThisYear()) },
    {
      query: {
        enabled: !!token && !!me?.id && Role.PARENT !== me.role && Role.USER !== me.role,
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

  const { error: errorTeacherKlubGroups, isLoading: isLoadingTeacherKlubGroups } = useGroupsFindKlubBySchoolIdAndUserId<
    ResponseGroupDto[]
  >({
    query: {
      enabled: !!token && !!me?.id && Role.PARENT !== me.role && Role.USER !== me.role,
      onSuccess: (res) => {
        if (!res?.length) {
          setTeacherKlubGroups([])
          return
        }

        const sorted = res
          .filter((el) => !!el.name)
          .sort((a, b) => {
            if (a?.name && b?.name) {
              return a?.name < b?.name ? -1 : 1
            }
            return 0
          })

        setTeacherKlubGroups(sorted)
      },
    },
  })

  const { error: errorTeacherKlassGroups, isLoading: isLoadingTeacherKlassGroups } = useGroupsFindKlassByUser<
    ResponseGroupDto[]
  >({
    query: {
      enabled: !!token && !!me?.id && Role.PARENT !== me.role && Role.USER !== me.role,
      onSuccess: (res) => {
        if (!res?.length) {
          setTeacherKlassGroups([])
          return
        }

        const sorted = res
          .filter((el) => !!el.name)
          .sort((a, b) => {
            if (a?.name && b?.name) {
              return a?.name < b?.name ? -1 : 1
            }
            return 0
          })

        setTeacherKlassGroups(sorted)
      },
    },
  })

  const { error: errorTeacherSubjects, isLoading: isLoadingTeacherSubjects } = useGroupsFindSubjectByUser(
    { year: getThisYear() },
    {
      query: {
        enabled: !!token && !!me?.id && Role.PARENT !== me.role && Role.USER !== me.role,
        onSuccess: (res) => {
          if (!res?.length) {
            setTeacherSubjects([])
            return
          }

          const sorted = res.sort((a, b) => {
            if (a?.group.name && b?.group.name) {
              return a?.group.name < b?.group.name ? -1 : 1
            }
            return 0
          })

          setTeacherSubjects(sorted)
        },
      },
    },
  )

  const allTeacherGroups = [...teacherKlassGroups, ...teacherKlubGroups]
  const uniqueGroupNames = allTeacherGroups.reduce(
    (acc, cur) => {
      if (!cur.name) {
        return acc
      }
      const isExist = acc.find((el) => el.name === cur.name)
      if (!isExist) {
        acc.push({ id: cur.id, name: cur.name })
      }
      return acc
    },
    [] as { id: number; name: string }[],
  )

  useEffect(() => {
    if (!me || me?.role === Role.PARENT || me?.role === Role.USER) {
      return
    }
    queryClient.refetchQueries({ active: true })
  }, [me?.id, me?.name])

  return {
    teacherKlubGroups,
    teacherKlassGroups,
    allTeacherGroups,
    teacherSubjects,
    uniqueGroupNames,
    errorGroups: errorTeacherKlubGroups || errorAllKlassGroups || errorTeacherKlassGroups || errorTeacherSubjects,
    isLoadingGroups: isLoadingTeacherKlubGroups || isLoadingTeacherKlassGroups || isLoadingTeacherSubjects || isLoading,
    allKlassGroups: allKlassGroups || [],
    allKlassGroupsUnique: allKlassGroups?.reduce((acc: any[], current: any) => {
      if (!acc.find((item) => item.id === current.id)) {
        acc.push(current)
      }
      return acc
    }, []),
  }
}

export const GroupContainer = createContainer(groupHook)
