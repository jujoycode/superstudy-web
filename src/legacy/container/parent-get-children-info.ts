import { useEffect } from 'react'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { useUserDeleteChild, useUserMeWithChildren } from '@/legacy/generated/endpoint'
import { Role } from '@/legacy/generated/model'
import { meState, toastState } from '@/stores'
import { UserContainer } from './user'

export function useParentGetChildrenInfo() {
  const meRecoil = useRecoilValue(meState)
  const { refetchMe } = UserContainer.useContext()

  const setToastMsg = useSetRecoilState(toastState)

  const { data: childrenInfos, refetch } = useUserMeWithChildren({
    query: {
      enabled: meRecoil?.role === Role.PARENT,
      // onSuccess: (res) => {
      //   refetchMe();
      // },
    },
  })

  useEffect(() => {
    refetchMe()
  }, [childrenInfos])

  const { mutate: delChildMutate } = useUserDeleteChild({
    mutation: {
      onSuccess: () => {
        if (childrenInfos?.children) {
          localStorage.setItem('child-user-id', JSON.stringify(childrenInfos?.children[0].id))
        }
        refetch()
        setToastMsg('유효하지 않은 자녀를 삭제했습니다 ')
      },
      onError: () => {
        setToastMsg('자녀를 삭제하지 못했습니다 ')
      },
    },
  })

  const deleteChild = (childId: number) => {
    if (meRecoil?.id) {
      delChildMutate({
        data: {
          parentId: meRecoil?.id,
          childId: childId,
        },
      })
    }
  }

  return { childrenInfoList: childrenInfos?.children || [], refetch, deleteChild }
}
